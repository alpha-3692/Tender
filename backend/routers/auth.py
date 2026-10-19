
import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database.session import get_db
from models.user import UserModel
from schemas.auth import (
    SignupRequest,
    LoginRequest,
    UserResponse,
    TokenResponse,
)

load_dotenv()

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)

bearer_scheme = HTTPBearer(auto_error=False)
password_hash = PasswordHash.recommended()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SECRET_KEY or SECRET_KEY == "replace_this_with_a_generated_secret":
    raise RuntimeError(
        "JWT_SECRET_KEY is missing. Set it in backend/.env."
    )

ACCESS_TOKEN_MINUTES = 30
ALGORITHM = "HS256"


def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_MINUTES),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
) -> UserModel:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please log in to access this resource.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token.",
            )

        user_id = int(user_id)

    except (jwt.InvalidTokenError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your token is invalid or expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(UserModel).filter(
        UserModel.id == user_id
    ).first()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is inactive.",
        )

    return user


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    data: SignupRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).strip().lower()

    existing_user = db.query(UserModel).filter(
        UserModel.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = UserModel(
        full_name=data.full_name.strip(),
        email=email,
        company_name=data.company_name.strip(),
        hashed_password=password_hash.hash(data.password),
        is_active=True,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    return user


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).strip().lower()

    user = db.query(UserModel).filter(
        UserModel.email == email
    ).first()

    if user is None or not password_hash.verify(
        data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    token = create_access_token(user.id)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: UserModel = Depends(get_current_user),
):
    return current_user

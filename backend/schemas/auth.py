
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    company_name: str = Field(min_length=2, max_length=200)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    company_name: str
    is_active: bool

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

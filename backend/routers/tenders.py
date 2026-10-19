from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.session import get_db
from models.tender import TenderModel
from models.user import UserModel
from routers.auth import get_current_user
from schemas.tender import Tender, TenderCreate

router = APIRouter(
    prefix="/api/v1/tenders",
    tags=["Tenders"],
)


@router.post("/", response_model=Tender, status_code=status.HTTP_201_CREATED)
def create_tender(
    tender: TenderCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    # Check whether this tender reference already exists for this company.
    existing_tender = (
        db.query(TenderModel)
        .filter(
            TenderModel.tender_reference == tender.tender_reference,
            TenderModel.company_name == current_user.company_name,
        )
        .first()
    )

    if existing_tender:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A tender with this reference already exists for your company.",
        )

    tender_data = tender.model_dump()

    new_tender = TenderModel(
        **tender_data,
        company_name=current_user.company_name,
    )

    db.add(new_tender)
    db.commit()
    db.refresh(new_tender)

    return new_tender


@router.get("/", response_model=list[Tender])
def get_tenders(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    # Return only tenders belonging to the logged-in user's company.
    tenders = (
        db.query(TenderModel)
        .filter(TenderModel.company_name == current_user.company_name)
        .order_by(TenderModel.id.desc())
        .all()
    )

    return tenders


@router.get("/{tender_id}", response_model=Tender)
def get_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    # Find the tender only if it belongs to the user's company.
    tender = (
        db.query(TenderModel)
        .filter(
            TenderModel.id == tender_id,
            TenderModel.company_name == current_user.company_name,
        )
        .first()
    )

    if tender is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found.",
        )

    return tender

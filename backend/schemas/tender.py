
from datetime import date
from enum import Enum

from pydantic import BaseModel, Field


class TenderStatus(str, Enum):
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    QUALIFIED = "qualified"
    NOT_QUALIFIED = "not_qualified"


class TenderCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    organization: str = Field(min_length=2, max_length=200)
    tender_reference: str = Field(min_length=2, max_length=100)
    deadline: date
    estimated_value: float | None = Field(default=None, ge=0)
    description: str = Field(default="", max_length=5000)


class Tender(TenderCreate):
    id: int
    status: TenderStatus = TenderStatus.OPEN

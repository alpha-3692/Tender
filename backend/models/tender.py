
from datetime import date

from sqlalchemy import Date, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.connection import Base


class TenderModel(Base):
    __tablename__ = "tenders"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    title: Mapped[str] = mapped_column(
        String(200), nullable=False
    )

    organization: Mapped[str] = mapped_column(
        String(200), nullable=False
    )

    tender_reference: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False
    )

    deadline: Mapped[date] = mapped_column(
        Date, nullable=False
    )

    estimated_value: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )

    description: Mapped[str] = mapped_column(
        Text, default="", nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30), default="open", nullable=False
    )

    # Company that owns this tender
    company_name: Mapped[str | None] = mapped_column(
        String(200), nullable=True, index=True
    )

import datetime as dt

from sqlalchemy import DateTime, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    phone: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    address: Mapped[str] = mapped_column(Text, nullable=False, default="")
    company: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    total_purchases: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    credit_balance: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False)

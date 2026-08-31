import datetime as dt

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sale_id: Mapped[int | None] = mapped_column(
        ForeignKey("sales.id", ondelete="SET NULL"), nullable=True
    )
    invoice_number: Mapped[str] = mapped_column(String(30), nullable=False, default="")
    customer_id: Mapped[int | None] = mapped_column(
        ForeignKey("customers.id", ondelete="SET NULL"), nullable=True
    )
    customer_name: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    method: Mapped[str] = mapped_column(String(20), nullable=False, default="cash")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="completed")
    reference: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False)

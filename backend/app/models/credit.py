import datetime as dt

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Credit(Base):
    __tablename__ = "credits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False
    )
    initial_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    paid_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    remaining_balance: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    due_date: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    sale_id: Mapped[int | None] = mapped_column(
        ForeignKey("sales.id", ondelete="SET NULL"), nullable=True
    )
    invoice_number: Mapped[str] = mapped_column(String(30), nullable=False, default="")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False)

    payments: Mapped[list["CreditPayment"]] = relationship(
        back_populates="credit", cascade="all, delete-orphan", order_by="CreditPayment.payment_date"
    )
    customer: Mapped["Customer"] = relationship()  # noqa: F821

    @property
    def customer_name(self) -> str:
        return self.customer.name


class CreditPayment(Base):
    __tablename__ = "credit_payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    credit_id: Mapped[int] = mapped_column(
        ForeignKey("credits.id", ondelete="CASCADE"), nullable=False
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(20), nullable=False, default="cash")
    payment_date: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")

    credit: Mapped[Credit] = relationship(back_populates="payments")

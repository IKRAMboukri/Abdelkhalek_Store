import datetime as dt
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.schemas.common import ApiModel, Page


class CreditCreate(BaseModel):
    customerId: int
    customerName: str = ""
    initialAmount: float = Field(..., gt=0)
    paidAmount: float = Field(default=0, ge=0)
    remainingBalance: float = Field(default=0, ge=0)
    dueDate: str
    status: str = "active"
    notes: str = ""
    payments: list = []
    saleId: int | None = None
    invoiceNumber: str = ""


class CreditUpdate(BaseModel):
    initialAmount: float | None = Field(default=None, gt=0)
    dueDate: str | None = None
    status: str | None = None
    notes: str | None = None


class CreditPaymentCreate(BaseModel):
    amount: float = Field(..., gt=0)
    paymentMethod: Literal["cash", "bank_transfer"] = "cash"
    paymentDate: str
    notes: str = ""


class CreditPaymentRead(ApiModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

    id: int
    amount: float
    payment_method: str
    payment_date: dt.datetime
    notes: str


class CreditRead(ApiModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

    id: int
    customer_id: int
    customer_name: str
    initial_amount: float
    paid_amount: float
    remaining_balance: float
    due_date: dt.datetime
    status: str
    notes: str
    payments: list[CreditPaymentRead]
    sale_id: int | None
    invoice_number: str
    created_at: dt.datetime
    updated_at: dt.datetime


CreditPage = Page[CreditRead]

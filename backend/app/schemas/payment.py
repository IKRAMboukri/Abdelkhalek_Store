import datetime as dt
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.schemas.common import ApiModel, Page


class PaymentCreate(BaseModel):
    saleId: int | None = None
    invoiceNumber: str = ""
    customerId: int | None = None
    customerName: str = ""
    amount: float = Field(default=0, ge=0)
    method: Literal["cash", "bank_transfer"] = "cash"
    status: str = "completed"
    reference: str = ""
    notes: str = ""


class PaymentUpdate(BaseModel):
    amount: float | None = Field(default=None, ge=0)
    method: Literal["cash", "bank_transfer"] | None = None
    status: str | None = None
    reference: str | None = None
    notes: str | None = None


class PaymentRead(ApiModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

    id: int
    sale_id: int | None
    invoice_number: str
    customer_id: int | None
    customer_name: str
    amount: float
    method: str
    status: str
    reference: str
    notes: str
    created_at: dt.datetime


PaymentPage = Page[PaymentRead]

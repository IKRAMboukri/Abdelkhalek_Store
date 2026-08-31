import datetime as dt
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.schemas.common import ApiModel, Page


class SaleItemCreate(BaseModel):
    productId: int
    productName: str = ""
    quantity: int = Field(..., ge=1)
    unitPrice: float = 0
    total: float = 0


class SaleCreate(BaseModel):
    customerId: int | None = None
    customerName: str = ""
    items: list[SaleItemCreate] = Field(min_length=1)
    subtotal: float = 0
    discount: float = Field(default=0, ge=0)
    total: float = 0
    paymentMethod: Literal["cash", "bank_transfer"] = "cash"
    notes: str = ""
    status: str = "completed"


class SaleUpdate(BaseModel):
    customerId: int | None = None
    paymentMethod: Literal["cash", "bank_transfer"] | None = None
    status: str | None = None
    discount: float | None = Field(default=None, ge=0)
    notes: str | None = None


class SaleItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

    id: int
    product_id: int | None
    product_name: str
    quantity: int
    unit_price: float
    total: float


class SaleRead(ApiModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

    id: int
    invoice_number: str
    customer_id: int | None
    customer_name: str
    items: list[SaleItemRead]
    subtotal: float
    discount: float
    total: float
    payment_method: str
    status: str
    notes: str
    created_at: dt.datetime


SalePage = Page[SaleRead]

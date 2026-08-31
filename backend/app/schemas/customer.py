import datetime as dt

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.schemas.common import ApiModel, Page


class CustomerCreate(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    address: str = ""
    company: str = ""
    notes: str = ""
    status: str = "active"


class CustomerUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    company: str | None = None
    notes: str | None = None
    status: str | None = None
    totalPurchases: int | None = Field(default=None, ge=0)
    creditBalance: float | None = Field(default=None, ge=0)


class CustomerRead(ApiModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

    id: int
    name: str
    email: str
    phone: str
    address: str
    company: str
    notes: str
    total_purchases: int
    credit_balance: float
    status: str
    created_at: dt.datetime
    updated_at: dt.datetime


CustomerPage = Page[CustomerRead]

import datetime as dt
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.schemas.common import ApiModel, Page

ProductAvailability = Literal["sur_commande", "sur_place"]


class ProductCreate(BaseModel):
    name: str
    description: str = ""
    categoryId: int
    subCategoryId: int | None = None
    options: dict[str, str] = {}
    purchasePrice: float = Field(default=0, ge=0)
    sellingPrice: float = Field(default=0, ge=0)
    availability: ProductAvailability = "sur_commande"
    unit: str = "piece"
    image: str = ""
    status: str = "active"
    barcode: str = ""


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    categoryId: int | None = None
    subCategoryId: int | None = None
    options: dict[str, str] | None = None
    purchasePrice: float | None = Field(default=None, ge=0)
    sellingPrice: float | None = Field(default=None, ge=0)
    availability: ProductAvailability | None = None
    unit: str | None = None
    image: str | None = None
    status: str | None = None
    barcode: str | None = None


class ProductRead(ApiModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

    id: int
    name: str
    description: str
    category_id: int | None
    category_name: str
    subcategory_id: int | None
    subcategory_name: str | None
    options: dict = Field(default_factory=dict)
    purchase_price: float
    selling_price: float
    availability: ProductAvailability
    unit: str
    image: str
    status: str
    barcode: str
    created_at: dt.datetime
    updated_at: dt.datetime


ProductPage = Page[ProductRead]

from pydantic import BaseModel, ConfigDict

from app.core.time import to_iso
from app.schemas.common import Page


class CategoryCreate(BaseModel):
    name: str
    description: str = ""
    image: str = ""


class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    image: str | None = None


class CategoryOptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    values: list[dict]


class SubCategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    options: list[CategoryOptionRead] | None = None


class SubCategoryCreate(BaseModel):
    name: str


class CategoryRead(BaseModel):
    id: int
    name: str
    description: str = ""
    productCount: int = 0
    image: str = ""
    createdAt: str
    subcategories: list[SubCategoryRead] | None = None

    @classmethod
    def from_category(cls, category, product_count: int = 0) -> "CategoryRead":
        subs = None
        if category.subcategories:
            subs = [SubCategoryRead.model_validate(sub) for sub in category.subcategories]
        return cls(
            id=category.id,
            name=category.name,
            description=category.description,
            productCount=product_count,
            image=category.image,
            createdAt=to_iso(category.created_at),
            subcategories=subs,
        )


CategoryPage = Page[CategoryRead]

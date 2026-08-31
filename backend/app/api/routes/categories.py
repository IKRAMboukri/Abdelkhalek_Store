from typing import Annotated

from fastapi import APIRouter, Query, status
from sqlalchemy import update

from app.api.deps import DbSession, conflict, not_found
from app.core.time import utcnow
from app.models import Category, Product
from app.repositories import CategoryRepository
from app.schemas.category import (
    CategoryCreate,
    CategoryPage,
    CategoryRead,
    CategoryUpdate,
    SubCategoryCreate,
    SubCategoryRead,
)
from app.schemas.common import FilterParams

router = APIRouter(prefix="/categories", tags=["categories"])


def to_read(category: Category, count: int = 0) -> CategoryRead:
    return CategoryRead.from_category(category, count)


@router.get("", response_model=CategoryPage)
def list_categories(db: DbSession, params: Annotated[FilterParams, Query()]):
    repo = CategoryRepository(db)
    rows, total, page, limit, total_pages = repo.list_page(params)
    counts = repo.product_counts([c.id for c in rows])
    return CategoryPage(
        data=[to_read(c, counts.get(c.id, 0)) for c in rows],
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages,
    )


@router.get("/all", response_model=list[CategoryRead])
def all_categories(db: DbSession):
    repo = CategoryRepository(db)
    categories = repo.list_all_with_relations()
    counts = repo.product_counts([c.id for c in categories])
    return [to_read(c, counts.get(c.id, 0)) for c in categories]


@router.get("/{category_id}", response_model=CategoryRead)
def get_category(category_id: int, db: DbSession):
    repo = CategoryRepository(db)
    category = repo.get_with_relations(category_id)
    if category is None:
        raise not_found("Category not found")
    count = repo.product_counts([category.id]).get(category.id, 0)
    return to_read(category, count)


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(data: CategoryCreate, db: DbSession):
    repo = CategoryRepository(db)
    category = repo.create(
        {
            "name": data.name,
            "description": data.description,
            "image": data.image,
            "created_at": utcnow(),
        }
    )
    try:
        db.flush()
    except Exception as exc:
        db.rollback()
        raise conflict("A category with this name may already exist") from exc
    return to_read(category)


@router.put("/{category_id}", response_model=CategoryRead)
def update_category(category_id: int, data: CategoryUpdate, db: DbSession):
    repo = CategoryRepository(db)
    category = repo.get(category_id)
    if category is None:
        raise not_found("Category not found")
    repo.update(category, data.model_dump(exclude_unset=True))
    db.flush()
    count = repo.product_counts([category.id]).get(category.id, 0)
    return to_read(category, count)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: DbSession):
    repo = CategoryRepository(db)
    category = repo.get(category_id)
    if category is None:
        raise not_found("Category not found")
    db.execute(
        update(Product)
        .where(Product.category_id == category.id)
        .values(category_id=None)
    )
    db.flush()
    repo.delete(category)
    db.flush()


@router.post(
    "/{category_id}/subcategories",
    response_model=SubCategoryRead,
    status_code=status.HTTP_201_CREATED,
)
def add_subcategory(category_id: int, data: SubCategoryCreate, db: DbSession):
    repo = CategoryRepository(db)
    category = repo.get_with_relations(category_id)
    if category is None:
        raise not_found("Category not found")
    sub = repo.add_subcategory(category, data.name)
    db.flush()
    return SubCategoryRead.model_validate(sub)

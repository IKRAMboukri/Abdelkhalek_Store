from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import DbSession, conflict, not_found
from app.models import Product
from app.repositories import ProductRepository
from app.schemas.common import FilterParams
from app.schemas.product import ProductCreate, ProductPage, ProductRead, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=ProductPage)
def list_products(db: DbSession, params: Annotated[FilterParams, Query()]):
    repo = ProductRepository(db)
    rows, total, page, limit, total_pages = repo.paginate(repo.base_query(), params)
    return ProductPage(
        data=[ProductRead.model_validate(row) for row in rows],
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages,
    )


@router.get("/by-category/{category_id}", response_model=list[ProductRead])
def by_category(category_id: int, db: DbSession):
    repo = ProductRepository(db)
    return [ProductRead.model_validate(p) for p in repo.get_by_category(category_id)]


@router.get("/all", response_model=list[ProductRead])
def all_products(db: DbSession):
    repo = ProductRepository(db)
    rows = list(
        repo.db.scalars(repo.base_query().order_by(Product.name)).unique().all()
    )
    return [ProductRead.model_validate(p) for p in rows]


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: DbSession):
    repo = ProductRepository(db)
    product = repo.get(product_id)
    if product is None:
        raise not_found("Product not found")
    return ProductRead.model_validate(product)


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductCreate, db: DbSession):
    from app.core.time import utcnow

    repo = ProductRepository(db)
    product = repo.create(
        {
            "name": data.name,
            "description": data.description,
            "category_id": data.categoryId,
            "subcategory_id": data.subCategoryId,
            "options_json": data.options,
            "purchase_price": data.purchasePrice,
            "selling_price": data.sellingPrice,
            "availability": data.availability,
            "unit": data.unit,
            "image": data.image,
            "status": data.status,
            "barcode": data.barcode,
            "created_at": utcnow(),
            "updated_at": utcnow(),
        }
    )
    try:
        db.flush()
    except Exception as exc:
        db.rollback()
        raise conflict("Could not create product") from exc
    return ProductRead.model_validate(product)


@router.put("/{product_id}", response_model=ProductRead)
def update_product(product_id: int, data: ProductUpdate, db: DbSession):
    from app.core.time import utcnow

    repo = ProductRepository(db)
    product = repo.get(product_id)
    if product is None:
        raise not_found("Product not found")
    payload = data.model_dump(exclude_unset=True)
    rename = {
        "categoryId": "category_id",
        "subCategoryId": "subcategory_id",
        "options": "options_json",
        "purchasePrice": "purchase_price",
        "sellingPrice": "selling_price",
    }
    for key, value in payload.items():
        setattr(product, rename.get(key, key), value)
    product.updated_at = utcnow()
    db.flush()
    return ProductRead.model_validate(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: DbSession):
    repo = ProductRepository(db)
    product = repo.get(product_id)
    if product is None:
        raise not_found("Product not found")
    repo.delete(product)
    db.flush()

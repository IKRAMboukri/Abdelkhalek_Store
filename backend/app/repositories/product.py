from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models import Category, Product
from app.repositories.base import BaseRepository
from app.schemas.common import FilterParams

SORT_MAP = {
    "name": Product.name,
    "sellingPrice": Product.selling_price,
    "createdAt": Product.created_at,
    "updatedAt": Product.updated_at,
    "status": Product.status,
}


class ProductRepository(BaseRepository):
    model = Product

    def base_query(self):
        return select(Product).outerjoin(Product.category).options(
            selectinload(Product.category), selectinload(Product.subcategory)
        )

    def _apply_search(self, query, term: str):
        like = f"%{term}%"
        return query.where(
            Product.name.like(like) | Product.barcode.like(like) | Category.name.like(like)
        )

    def _apply_filters(self, query, params: FilterParams):
        if params.status:
            query = query.where(Product.status == params.status)
        if params.category:
            query = query.where(Product.category_id == int(params.category))
        return query

    def _apply_sort(self, query, sort_by: str, sort_order: str):
        column = (
            Category.name if sort_by == "categoryName" else SORT_MAP.get(sort_by)
        )
        if column is not None:
            column = column.desc() if sort_order == "desc" else column.asc()
            query = query.order_by(column)
        return query

    def get_by_category(self, category_id: int):
        stmt = self.base_query().where(Product.category_id == category_id)
        return list(self.db.scalars(stmt).unique().all())

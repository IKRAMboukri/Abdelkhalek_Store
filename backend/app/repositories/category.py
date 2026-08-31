from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.models import Category, Product, SubCategory
from app.repositories.base import BaseRepository
from app.schemas.common import FilterParams

SORT_MAP = {
    "name": Category.name,
    "createdAt": Category.created_at,
}


class CategoryRepository(BaseRepository):
    model = Category

    def base_query(self):
        return select(Category).options(
            selectinload(Category.subcategories).selectinload(SubCategory.options)
        )

    def _apply_search(self, query, term: str):
        like = f"%{term}%"
        return query.where(Category.name.like(like) | Category.description.like(like))

    def _apply_sort(self, query, sort_by: str, sort_order: str):
        column = SORT_MAP.get(sort_by)
        if column is not None:
            column = column.desc() if sort_order == "desc" else column.asc()
            query = query.order_by(column)
        return query

    def list_page(self, params: FilterParams):
        return self.paginate(self.base_query(), params)

    def list_all_with_relations(self):
        stmt = self.base_query().order_by(Category.name)
        return list(self.db.scalars(stmt).unique().all())

    def get_with_relations(self, category_id: int):
        stmt = self.base_query().where(Category.id == category_id)
        return self.db.scalars(stmt).first()

    def product_counts(self, category_ids: list[int]) -> dict[int, int]:
        if not category_ids:
            return {}
        rows = self.db.execute(
            select(Product.category_id, func.count())
            .where(Product.category_id.in_(category_ids))
            .group_by(Product.category_id)
        ).all()
        return {category_id: count for category_id, count in rows}

    def add_subcategory(self, category: Category, name: str) -> SubCategory:
        sub = SubCategory(category_id=category.id, name=name)
        self.db.add(sub)
        return sub

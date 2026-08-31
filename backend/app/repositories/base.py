from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.schemas.common import FilterParams


class BaseRepository:
    """Generic repository base providing common persistence helpers."""

    model = None

    def __init__(self, db: Session) -> None:
        self.db = db

    def get(self, obj_id: int):
        return self.db.get(self.model, obj_id)

    def list_all(self):
        return list(self.db.scalars(select(self.model)).all())

    def create(self, data: dict):
        obj = self.model(**data)
        self.db.add(obj)
        return obj

    def update(self, obj, data: dict):
        for key, value in data.items():
            setattr(obj, key, value)
        return obj

    def delete(self, obj) -> None:
        self.db.delete(obj)

    def _apply_filters(self, query, params: FilterParams):
        return query

    def _apply_search(self, query, term: str):
        return query

    def _apply_sort(self, query, sort_by: str, sort_order: str):
        return query

    def paginate(self, query, params: FilterParams):
        if params.search:
            query = self._apply_search(query, params.search.strip())
        query = self._apply_filters(query, params)
        query = self._apply_sort(query, params.sortBy, params.sortOrder)

        total = self.db.scalar(select(func.count()).select_from(query.subquery())) or 0
        offset = (params.page - 1) * params.limit
        rows = list(
            self.db.scalars(query.offset(offset).limit(params.limit)).unique().all()
        )
        return rows, total, params.page, params.limit, (total + params.limit - 1) // params.limit

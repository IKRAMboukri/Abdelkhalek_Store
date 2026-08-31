from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload

from app.models import Customer, Sale
from app.repositories.base import BaseRepository
from app.schemas.common import FilterParams

SORT_MAP = {
    "createdAt": Sale.created_at,
    "total": Sale.total,
    "status": Sale.status,
    "invoiceNumber": Sale.invoice_number,
}


class SaleRepository(BaseRepository):
    model = Sale

    def base_query(self):
        return (
            select(Sale)
            .outerjoin(Sale.customer)
            .options(selectinload(Sale.items), selectinload(Sale.customer))
        )

    def _apply_search(self, query, term: str):
        like = f"%{term}%"
        return query.where(
            or_(Sale.invoice_number.like(like), Customer.name.like(like))
        )

    def _apply_filters(self, query, params: FilterParams):
        if params.status:
            query = query.where(Sale.status == params.status)
        if params.category:
            query = query.where(Sale.payment_method == params.category)
        return query

    def _apply_sort(self, query, sort_by: str, sort_order: str):
        column = Customer.name if sort_by == "customerName" else SORT_MAP.get(sort_by)
        if column is not None:
            column = column.desc() if sort_order == "desc" else column.asc()
            query = query.order_by(column)
        return query

    def get_by_customer(self, customer_id: int):
        stmt = (
            self.base_query()
            .where(Sale.customer_id == customer_id)
            .order_by(Sale.created_at.desc())
        )
        return list(self.db.scalars(stmt).unique().all())

    def get_recent(self, limit: int):
        stmt = self.base_query().order_by(Sale.created_at.desc()).limit(limit)
        return list(self.db.scalars(stmt).unique().all())

    def by_date_range(self, start: str, end: str):
        stmt = (
            self.base_query()
            .where(Sale.created_at >= start, Sale.created_at <= f"{end}T23:59:59")
            .order_by(Sale.created_at.desc())
        )
        return list(self.db.scalars(stmt).unique().all())

    def next_invoice_number(self, year: int) -> str:
        prefix = f"INV-{year}-"
        stmt = (
            select(func.max(Sale.invoice_number))
            .where(Sale.invoice_number.like(f"{prefix}%"))
        )
        max_number = self.db.scalar(stmt) or ""
        seq = 0
        if max_number:
            try:
                seq = int(max_number.rsplit("-", 1)[1])
            except (ValueError, IndexError):
                seq = 0
        return f"{prefix}{seq + 1:04d}"

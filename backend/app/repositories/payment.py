from sqlalchemy import or_, select

from app.models import Payment
from app.repositories.base import BaseRepository
from app.schemas.common import FilterParams

SORT_MAP = {
    "createdAt": Payment.created_at,
    "amount": Payment.amount,
    "method": Payment.method,
    "status": Payment.status,
}


class PaymentRepository(BaseRepository):
    model = Payment

    def _apply_search(self, query, term: str):
        like = f"%{term}%"
        return query.where(
            or_(
                Payment.invoice_number.like(like),
                Payment.customer_name.like(like),
                Payment.reference.like(like),
            )
        )

    def _apply_filters(self, query, params: FilterParams):
        if params.status:
            query = query.where(Payment.status == params.status)
        if params.category:
            query = query.where(Payment.method == params.category)
        return query

    def _apply_sort(self, query, sort_by: str, sort_order: str):
        column = (
            Payment.customer_name if sort_by == "customerName" else SORT_MAP.get(sort_by)
        )
        if column is not None:
            column = column.desc() if sort_order == "desc" else column.asc()
            query = query.order_by(column)
        return query

    def by_date_range(self, start: str, end: str):
        stmt = select(Payment).where(
            Payment.created_at >= start, Payment.created_at <= f"{end}T23:59:59"
        )
        return list(self.db.scalars(stmt).all())

    def by_method(self, method: str):
        stmt = select(Payment).where(Payment.method == method)
        return list(self.db.scalars(stmt).all())

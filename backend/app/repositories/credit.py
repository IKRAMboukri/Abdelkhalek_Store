from sqlalchemy import or_, select
from sqlalchemy.orm import selectinload

from app.models import Credit, Customer
from app.repositories.base import BaseRepository
from app.schemas.common import FilterParams

SORT_MAP = {
    "createdAt": Credit.created_at,
    "dueDate": Credit.due_date,
    "initialAmount": Credit.initial_amount,
    "remainingBalance": Credit.remaining_balance,
    "status": Credit.status,
}


class CreditRepository(BaseRepository):
    model = Credit

    def base_query(self):
        return (
            select(Credit)
            .join(Credit.customer)
            .options(selectinload(Credit.payments), selectinload(Credit.customer))
        )

    def _apply_search(self, query, term: str):
        like = f"%{term}%"
        return query.where(or_(Customer.name.like(like), Credit.invoice_number.like(like)))

    def _apply_filters(self, query, params: FilterParams):
        if params.status:
            query = query.where(Credit.status == params.status)
        if params.customerId is not None:
            query = query.where(Credit.customer_id == params.customerId)
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
            .where(Credit.customer_id == customer_id)
            .order_by(Credit.created_at.desc())
        )
        return list(self.db.scalars(stmt).unique().all())

    def get_overdue(self):
        from datetime import datetime

        now = datetime.utcnow()
        stmt = self.base_query().where(
            (Credit.status == "overdue")
            | (
                (Credit.remaining_balance > 0)
                & (Credit.due_date < now)
                & (Credit.status.not_in(["paid", "cancelled"]))
            )
        )
        return list(self.db.scalars(stmt).unique().all())

    def get_pending(self):
        stmt = self.base_query().where(Credit.status == "active")
        return list(self.db.scalars(stmt).unique().all())

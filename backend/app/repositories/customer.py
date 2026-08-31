from sqlalchemy import or_, select

from app.models import Customer
from app.repositories.base import BaseRepository
from app.schemas.common import FilterParams

SORT_MAP = {
    "name": Customer.name,
    "email": Customer.email,
    "totalPurchases": Customer.total_purchases,
    "creditBalance": Customer.credit_balance,
    "createdAt": Customer.created_at,
}


class CustomerRepository(BaseRepository):
    model = Customer

    def _apply_search(self, query, term: str):
        like = f"%{term}%"
        return query.where(
            or_(
                Customer.name.like(like),
                Customer.email.like(like),
                Customer.phone.like(like),
                Customer.company.like(like),
            )
        )

    def _apply_filters(self, query, params: FilterParams):
        if params.status:
            query = query.where(Customer.status == params.status)
        return query

    def _apply_sort(self, query, sort_by: str, sort_order: str):
        column = SORT_MAP.get(sort_by)
        if column is not None:
            column = column.desc() if sort_order == "desc" else column.asc()
            query = query.order_by(column)
        return query

    def get_by_email(self, email: str):
        stmt = select(Customer).where(Customer.email == email).limit(1)
        return self.db.scalar(stmt)

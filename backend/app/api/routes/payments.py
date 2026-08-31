from typing import Annotated

from fastapi import APIRouter, Query, status
from sqlalchemy import select

from app.api.deps import DbSession, not_found
from app.core.time import utcnow
from app.models import Payment
from app.repositories import PaymentRepository
from app.schemas.common import FilterParams
from app.schemas.payment import PaymentCreate, PaymentPage, PaymentRead, PaymentUpdate

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("", response_model=PaymentPage)
def list_payments(db: DbSession, params: Annotated[FilterParams, Query()]):
    repo = PaymentRepository(db)
    rows, total, page, limit, total_pages = repo.paginate(select(Payment), params)
    return PaymentPage(
        data=[PaymentRead.model_validate(r) for r in rows],
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages,
    )


@router.get("/date-range", response_model=list[PaymentRead])
def payments_by_date_range(start: str, end: str, db: DbSession):
    repo = PaymentRepository(db)
    return [PaymentRead.model_validate(p) for p in repo.by_date_range(start, end)]


@router.get("/by-method/{method}", response_model=list[PaymentRead])
def payments_by_method(method: str, db: DbSession):
    repo = PaymentRepository(db)
    return [PaymentRead.model_validate(p) for p in repo.by_method(method)]


@router.get("/{payment_id}", response_model=PaymentRead)
def get_payment(payment_id: int, db: DbSession):
    repo = PaymentRepository(db)
    payment = repo.get(payment_id)
    if payment is None:
        raise not_found("Payment not found")
    return PaymentRead.model_validate(payment)


@router.post("", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(data: PaymentCreate, db: DbSession):
    repo = PaymentRepository(db)
    payment = repo.create(
        {
            "sale_id": data.saleId,
            "invoice_number": data.invoiceNumber,
            "customer_id": data.customerId,
            "customer_name": data.customerName,
            "amount": data.amount,
            "method": data.method,
            "status": data.status,
            "reference": data.reference,
            "notes": data.notes,
            "created_at": utcnow(),
        }
    )
    db.flush()
    return PaymentRead.model_validate(payment)


@router.put("/{payment_id}", response_model=PaymentRead)
def update_payment(payment_id: int, data: PaymentUpdate, db: DbSession):
    repo = PaymentRepository(db)
    payment = repo.get(payment_id)
    if payment is None:
        raise not_found("Payment not found")
    repo.update(payment, data.model_dump(exclude_unset=True))
    db.flush()
    return PaymentRead.model_validate(payment)


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, db: DbSession):
    repo = PaymentRepository(db)
    payment = repo.get(payment_id)
    if payment is None:
        raise not_found("Payment not found")
    repo.delete(payment)
    db.flush()

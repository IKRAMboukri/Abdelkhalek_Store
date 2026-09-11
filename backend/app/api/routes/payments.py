from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from app.api.deps import DbSession, not_found
from app.core.time import utcnow
from app.models import Payment, Sale
from app.repositories import PaymentRepository
from app.schemas.common import FilterParams
from app.schemas.payment import PaymentCreate, PaymentPage, PaymentRead, PaymentUpdate

router = APIRouter(prefix="/payments", tags=["payments"])


def _remaining_balance(db: DbSession, sale: Sale) -> float:
    """Remaining balance of a sale: total minus advance minus follow-up payments."""
    total_payments = 0.0
    if sale.id is not None:
        total_payments = float(
            sum(db.scalars(select(Payment.amount).where(Payment.sale_id == sale.id)).all())
            or 0.0
        )
    paid = float(sale.advance_amount) + total_payments
    return round(max(float(sale.total) - paid, 0.0), 2)


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


@router.get("/by-sale/{sale_id}", response_model=list[PaymentRead])
def payments_by_sale(sale_id: int, db: DbSession):
    stmt = select(Payment).where(Payment.sale_id == sale_id).order_by(Payment.created_at)
    return [PaymentRead.model_validate(p) for p in db.scalars(stmt).all()]


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
    amount = round(float(data.amount), 2)
    sale = None

    if data.saleId is not None:
        sale = db.get(Sale, data.saleId)
        if sale is None:
            raise not_found("Sale not found")
        remaining = _remaining_balance(db, sale)
        if amount > remaining:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Amount {amount} exceeds remaining balance {remaining}",
            )
        if not data.invoiceNumber and sale.invoice_number:
            data.invoiceNumber = sale.invoice_number
        if data.customerId is None and sale.customer_id is not None:
            data.customerId = sale.customer_id
        if not data.customerName and sale.customer_name:
            data.customerName = sale.customer_name

    payment = repo.create(
        {
            "sale_id": data.saleId,
            "invoice_number": data.invoiceNumber,
            "customer_id": data.customerId,
            "customer_name": data.customerName,
            "amount": amount,
            "method": data.method,
            "status": data.status,
            "reference": data.reference,
            "notes": data.notes,
            "created_at": utcnow(),
        }
    )
    db.flush()

    if sale is not None and _remaining_balance(db, sale) == 0:
        sale.status = "completed"
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

from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import DbSession, bad_request, not_found
from app.schemas.common import FilterParams
from app.schemas.credit import (
    CreditCreate,
    CreditPage,
    CreditPaymentCreate,
    CreditRead,
    CreditUpdate,
)
from app.services import CreditService

router = APIRouter(prefix="/credits", tags=["credits"])


@router.get("", response_model=CreditPage)
def list_credits(db: DbSession, params: Annotated[FilterParams, Query()]):
    service = CreditService(db)
    rows, total, page, limit, total_pages = service.list_page(params)
    return CreditPage(
        data=[CreditRead.model_validate(r) for r in rows],
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages,
    )


@router.get("/overdue", response_model=list[CreditRead])
def overdue_credits(db: DbSession):
    service = CreditService(db)
    return [CreditRead.model_validate(c) for c in service.overdue()]


@router.get("/pending", response_model=list[CreditRead])
def pending_credits(db: DbSession):
    service = CreditService(db)
    return [CreditRead.model_validate(c) for c in service.pending()]


@router.get("/by-customer/{customer_id}", response_model=list[CreditRead])
def credits_by_customer(customer_id: int, db: DbSession):
    service = CreditService(db)
    return [CreditRead.model_validate(c) for c in service.by_customer(customer_id)]


@router.get("/{credit_id}", response_model=CreditRead)
def get_credit(credit_id: int, db: DbSession):
    service = CreditService(db)
    credit = service.get(credit_id)
    if credit is None:
        raise not_found("Credit not found")
    return CreditRead.model_validate(credit)


@router.post("", response_model=CreditRead, status_code=status.HTTP_201_CREATED)
def create_credit(data: CreditCreate, db: DbSession):
    service = CreditService(db)
    try:
        credit = service.create(data)
    except ValueError as exc:
        raise bad_request(exc) from exc
    db.flush()
    return CreditRead.model_validate(credit)


@router.put("/{credit_id}", response_model=CreditRead)
def update_credit(credit_id: int, data: CreditUpdate, db: DbSession):
    service = CreditService(db)
    credit = service.get(credit_id)
    if credit is None:
        raise not_found("Credit not found")
    service.update(credit, data)
    db.flush()
    return CreditRead.model_validate(credit)


@router.post("/{credit_id}/payments", response_model=CreditRead)
def add_credit_payment(credit_id: int, data: CreditPaymentCreate, db: DbSession):
    service = CreditService(db)
    credit = service.get(credit_id)
    if credit is None:
        raise not_found("Credit not found")
    service.add_payment(credit, data)
    db.flush()
    return CreditRead.model_validate(credit)


@router.delete("/{credit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_credit(credit_id: int, db: DbSession):
    service = CreditService(db)
    credit = service.get(credit_id)
    if credit is None:
        raise not_found("Credit not found")
    service.delete(credit)
    db.flush()

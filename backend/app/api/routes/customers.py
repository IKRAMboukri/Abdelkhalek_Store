from typing import Annotated

from fastapi import APIRouter, Query, status
from sqlalchemy import select

from app.api.deps import DbSession, conflict, not_found
from app.core.time import utcnow
from app.models import Customer
from app.repositories import CustomerRepository
from app.schemas.common import FilterParams
from app.schemas.customer import CustomerCreate, CustomerPage, CustomerRead, CustomerUpdate

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=CustomerPage)
def list_customers(db: DbSession, params: Annotated[FilterParams, Query()]):
    repo = CustomerRepository(db)
    rows, total, page, limit, total_pages = repo.paginate(select(Customer), params)
    return CustomerPage(
        data=[CustomerRead.model_validate(r) for r in rows],
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages,
    )


@router.get("/all", response_model=list[CustomerRead])
def all_customers(db: DbSession):
    repo = CustomerRepository(db)
    return [CustomerRead.model_validate(c) for c in repo.list_all()]


@router.get("/by-email/{email}", response_model=CustomerRead)
def customer_by_email(email: str, db: DbSession):
    repo = CustomerRepository(db)
    customer = repo.get_by_email(email)
    if customer is None:
        raise not_found("Customer not found")
    return CustomerRead.model_validate(customer)


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: int, db: DbSession):
    repo = CustomerRepository(db)
    customer = repo.get(customer_id)
    if customer is None:
        raise not_found("Customer not found")
    return CustomerRead.model_validate(customer)


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(data: CustomerCreate, db: DbSession):
    repo = CustomerRepository(db)
    if data.email and repo.get_by_email(data.email.strip().lower()):
        raise conflict("A customer with this email already exists")
    customer = repo.create(
        {
            "name": data.name,
            "email": data.email.strip().lower(),
            "phone": data.phone,
            "address": data.address,
            "company": data.company,
            "notes": data.notes,
            "total_purchases": 0,
            "credit_balance": 0,
            "status": data.status,
            "created_at": utcnow(),
            "updated_at": utcnow(),
        }
    )
    db.flush()
    return CustomerRead.model_validate(customer)


@router.put("/{customer_id}", response_model=CustomerRead)
def update_customer(customer_id: int, data: CustomerUpdate, db: DbSession):
    repo = CustomerRepository(db)
    customer = repo.get(customer_id)
    if customer is None:
        raise not_found("Customer not found")
    payload = data.model_dump(exclude_unset=True)
    if "email" in payload and payload["email"]:
        email = payload["email"].strip().lower()
        existing = repo.get_by_email(email)
        if existing and existing.id != customer.id:
            raise conflict("A customer with this email already exists")
        payload["email"] = email
    repo.update(customer, payload)
    customer.updated_at = utcnow()
    db.flush()
    return CustomerRead.model_validate(customer)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: DbSession):
    repo = CustomerRepository(db)
    customer = repo.get(customer_id)
    if customer is None:
        raise not_found("Customer not found")
    repo.delete(customer)
    db.flush()

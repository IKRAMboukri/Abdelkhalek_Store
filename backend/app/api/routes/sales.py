from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import DbSession, bad_request, not_found
from app.schemas.common import FilterParams
from app.schemas.sale import SaleCreate, SalePage, SaleRead, SaleUpdate
from app.services import SaleService

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("", response_model=SalePage)
def list_sales(db: DbSession, params: Annotated[FilterParams, Query()]):
    service = SaleService(db)
    rows, total, page, limit, total_pages = service.list_page(params)
    return SalePage(
        data=[SaleRead.model_validate(r) for r in rows],
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages,
    )


@router.get("/recent", response_model=list[SaleRead])
def recent_sales(db: DbSession, limit: int = 5):
    service = SaleService(db)
    return [SaleRead.model_validate(s) for s in service.recent(limit)]


@router.get("/by-customer/{customer_id}", response_model=list[SaleRead])
def sales_by_customer(customer_id: int, db: DbSession):
    service = SaleService(db)
    return [SaleRead.model_validate(s) for s in service.by_customer(customer_id)]


@router.get("/date-range", response_model=list[SaleRead])
def sales_by_date_range(start: str, end: str, db: DbSession):
    service = SaleService(db)
    return [SaleRead.model_validate(s) for s in service.by_date_range(start, end)]


@router.get("/{sale_id}", response_model=SaleRead)
def get_sale(sale_id: int, db: DbSession):
    service = SaleService(db)
    sale = service.get(sale_id)
    if sale is None:
        raise not_found("Sale not found")
    return SaleRead.model_validate(sale)


@router.post("", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
def create_sale(data: SaleCreate, db: DbSession):
    service = SaleService(db)
    try:
        sale = service.create(data)
    except ValueError as exc:
        raise bad_request(exc) from exc
    db.flush()
    return SaleRead.model_validate(sale)


@router.put("/{sale_id}", response_model=SaleRead)
def update_sale(sale_id: int, data: SaleUpdate, db: DbSession):
    service = SaleService(db)
    sale = service.get(sale_id)
    if sale is None:
        raise not_found("Sale not found")
    service.update(sale, data)
    db.flush()
    return SaleRead.model_validate(sale)


@router.delete("/{sale_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sale(sale_id: int, db: DbSession):
    service = SaleService(db)
    sale = service.get(sale_id)
    if sale is None:
        raise not_found("Sale not found")
    service.delete(sale)
    db.flush()

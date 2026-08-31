from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import DbSession, not_found
from app.schemas.common import FilterParams
from app.schemas.invoice import InvoicePage, InvoiceRead
from app.services import InvoiceService

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.get("", response_model=InvoicePage)
def list_invoices(db: DbSession, params: Annotated[FilterParams, Query()]):
    service = InvoiceService(db)
    data, total, page, limit, total_pages = service.list_page(params)
    return InvoicePage(
        data=data,
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages,
    )


@router.get("/by-sale/{sale_id}", response_model=InvoiceRead)
def invoice_by_sale(sale_id: int, db: DbSession):
    service = InvoiceService(db)
    invoice = service.by_sale_id(sale_id)
    if invoice is None:
        raise not_found("Invoice not found")
    return invoice


@router.get("/by-customer/{customer_id}", response_model=list[InvoiceRead])
def invoices_by_customer(customer_id: int, db: DbSession):
    service = InvoiceService(db)
    return service.by_customer(customer_id)


@router.get("/date-range", response_model=list[InvoiceRead])
def invoices_by_date_range(start: str, end: str, db: DbSession):
    service = InvoiceService(db)
    return service.by_date_range(start, end)


@router.get("/{invoice_id}", response_model=InvoiceRead)
def get_invoice(invoice_id: int, db: DbSession):
    service = InvoiceService(db)
    invoice = service.get(invoice_id)
    if invoice is None:
        raise not_found("Invoice not found")
    return invoice

from sqlalchemy.orm import Session

from app.core.time import to_iso
from app.models import Customer, Sale, StoreSettings
from app.repositories.customer import CustomerRepository
from app.repositories.misc import StoreSettingsRepository
from app.repositories.sale import SaleRepository
from app.schemas.common import FilterParams
from app.schemas.invoice import InvoiceItemRead, InvoiceRead


def build_invoice(sale: Sale, settings: StoreSettings, customer: Customer | None) -> InvoiceRead:
    return InvoiceRead(
        id=sale.id,
        saleId=sale.id,
        invoiceNumber=sale.invoice_number,
        storeName=settings.store_name or "Furniture Store",
        storeAddress=settings.store_address or "",
        storePhone=settings.store_phone or "",
        storeEmail=settings.store_email or "",
        storeLogo=settings.logo or "",
        customerId=sale.customer_id,
        customerName=sale.customer_name,
        customerPhone=customer.phone if customer else "",
        customerAddress=customer.address if customer else "",
        items=[
            InvoiceItemRead(
                productName=item.product_name,
                quantity=item.quantity,
                unitPrice=float(item.unit_price),
                total=float(item.total),
            )
            for item in sale.items
        ],
        subtotal=float(sale.subtotal),
        discount=float(sale.discount),
        total=float(sale.total),
        paymentMethod=sale.payment_method,
        amountPaid=float(sale.total),
        remainingBalance=0,
        status=sale.status,
        notes=sale.notes,
        createdAt=to_iso(sale.created_at),
    )


class InvoiceService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.sale_repo = SaleRepository(db)
        self.customer_repo = CustomerRepository(db)
        self.settings_repo = StoreSettingsRepository(db)

    def _customer_map(self) -> dict[int, Customer]:
        return {c.id: c for c in self.customer_repo.list_all()}

    def list_page(self, params: FilterParams):
        rows, total, page, limit, total_pages = self.sale_repo.paginate(
            self.sale_repo.base_query(), params
        )
        settings = self.settings_repo.get_single()
        customers = self._customer_map()
        data = [build_invoice(sale, settings, customers.get(sale.customer_id)) for sale in rows]
        return data, total, page, limit, total_pages

    def get(self, invoice_id: int) -> InvoiceRead | None:
        stmt = self.sale_repo.base_query().where(Sale.id == invoice_id)
        sale = self.db.scalars(stmt).first()
        if sale is None:
            return None
        settings = self.settings_repo.get_single()
        customer = self.db.get(Customer, sale.customer_id) if sale.customer_id else None
        return build_invoice(sale, settings, customer)

    def by_sale_id(self, sale_id: int) -> InvoiceRead | None:
        return self.get(sale_id)

    def by_customer(self, customer_id: int) -> list[InvoiceRead]:
        settings = self.settings_repo.get_single()
        customer = self.db.get(Customer, customer_id)
        sales = self.sale_repo.get_by_customer(customer_id)
        return [build_invoice(sale, settings, customer) for sale in sales]

    def by_date_range(self, start: str, end: str) -> list[InvoiceRead]:
        settings = self.settings_repo.get_single()
        customers = self._customer_map()
        sales = self.sale_repo.by_date_range(start, end)
        return [
            build_invoice(sale, settings, customers.get(sale.customer_id)) for sale in sales
        ]

from sqlalchemy.orm import Session

from app.core.time import utcnow
from app.models import Customer, Product, Sale, SaleItem
from app.repositories.product import ProductRepository
from app.repositories.sale import SaleRepository
from app.schemas.common import FilterParams
from app.schemas.sale import SaleCreate, SaleUpdate


class SaleService:
    """Sale lifecycle. Totals are always recalculated server-side from the
    current product prices; availability is informational only and never
    blocks a sale."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = SaleRepository(db)
        self.product_repo = ProductRepository(db)

    def list_page(self, params: FilterParams):
        return self.repo.paginate(self.repo.base_query(), params)

    def get(self, sale_id: int) -> Sale | None:
        stmt = self.repo.base_query().where(Sale.id == sale_id)
        return self.db.scalars(stmt).first()

    def by_customer(self, customer_id: int):
        return self.repo.get_by_customer(customer_id)

    def recent(self, limit: int):
        return self.repo.get_recent(limit)

    def by_date_range(self, start: str, end: str):
        return self.repo.by_date_range(start, end)

    def create(self, data: SaleCreate) -> Sale:
        customer = self.db.get(Customer, data.customerId) if data.customerId else None
        if data.customerId and customer is None:
            raise ValueError("Customer not found")

        now = utcnow()

        subtotal = 0.0
        items: list[SaleItem] = []
        for item in data.items:
            product = self.db.get(Product, item.productId)
            if product is None:
                raise ValueError(f"Product {item.productId} not found")
            quantity = int(item.quantity)
            if quantity <= 0:
                raise ValueError(f"Invalid quantity for {product.name}")
            unit_price = float(product.selling_price)
            total = round(unit_price * quantity, 2)
            subtotal += total
            items.append(
                SaleItem(
                    product_id=product.id,
                    product_name=product.name,
                    quantity=quantity,
                    unit_price=unit_price,
                    total=total,
                )
            )

        discount = round(min(float(data.discount), subtotal), 2)
        total = round(subtotal - discount, 2)
        invoice_number = self.repo.next_invoice_number(now.year)

        sale = Sale(
            invoice_number=invoice_number,
            customer_id=customer.id if customer else None,
            subtotal=subtotal,
            discount=discount,
            total=total,
            payment_method=data.paymentMethod,
            status=data.status,
            notes=data.notes,
            created_at=now,
            items=items,
        )
        self.db.add(sale)
        self.db.flush()

        if customer:
            customer.total_purchases += 1

        self.db.flush()
        return sale

    def update(self, sale: Sale, data: SaleUpdate) -> Sale:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(sale, key, value)
        return sale

    def delete(self, sale: Sale) -> None:
        if sale.customer_id:
            customer = self.db.get(Customer, sale.customer_id)
            if customer and customer.total_purchases > 0:
                customer.total_purchases -= 1
        self.repo.delete(sale)

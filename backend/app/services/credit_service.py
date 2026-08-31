import datetime as dt

from sqlalchemy.orm import Session

from app.core.time import utcnow
from app.models import Credit, CreditPayment, Customer, Sale
from app.repositories.credit import CreditRepository
from app.repositories.customer import CustomerRepository
from app.repositories.sale import SaleRepository
from app.schemas.common import FilterParams
from app.schemas.credit import CreditCreate, CreditPaymentCreate, CreditUpdate


def parse_date(value: str) -> dt.datetime:
    return dt.datetime.strptime(value[:10], "%Y-%m-%d")


class CreditService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = CreditRepository(db)
        self.customer_repo = CustomerRepository(db)
        self.sale_repo = SaleRepository(db)

    def list_page(self, params: FilterParams):
        return self.repo.paginate(self.repo.base_query(), params)

    def get(self, credit_id: int) -> Credit | None:
        stmt = self.repo.base_query().where(Credit.id == credit_id)
        return self.db.scalars(stmt).first()

    def by_customer(self, customer_id: int):
        return self.repo.get_by_customer(customer_id)

    def overdue(self):
        return self.repo.get_overdue()

    def pending(self):
        return self.repo.get_pending()

    def create(self, data: CreditCreate) -> Credit:
        customer = self.db.get(Customer, data.customerId)
        if customer is None:
            raise ValueError("Customer not found")

        remaining = round(float(data.initialAmount) - float(data.paidAmount), 2)
        now = utcnow()

        credit = Credit(
            customer_id=customer.id,
            initial_amount=data.initialAmount,
            paid_amount=data.paidAmount,
            remaining_balance=max(remaining, 0),
            due_date=parse_date(data.dueDate),
            status="paid" if remaining <= 0 else "active",
            notes=data.notes,
            sale_id=data.saleId,
            invoice_number=data.invoiceNumber,
            created_at=now,
            updated_at=now,
        )
        self.db.add(credit)
        customer.credit_balance = round(float(customer.credit_balance) + remaining, 2)
        return credit

    def update(self, credit: Credit, data: CreditUpdate) -> Credit:
        payload = data.model_dump(exclude_unset=True)
        if "initialAmount" in payload:
            initial = payload.pop("initialAmount")
            credit.initial_amount = initial
            remaining = round(float(initial) - float(credit.paid_amount), 2)
            credit.remaining_balance = max(remaining, 0)
            if remaining <= 0:
                credit.status = "paid"
        if "dueDate" in payload:
            credit.due_date = parse_date(payload.pop("dueDate"))
        for key, value in payload.items():
            setattr(credit, key, value)
        credit.updated_at = utcnow()
        return credit

    def add_payment(self, credit: Credit, data: CreditPaymentCreate) -> CreditPayment:
        amount = round(float(data.amount), 2)
        payment = CreditPayment(
            amount=amount,
            payment_method=data.paymentMethod,
            payment_date=parse_date(data.paymentDate),
            notes=data.notes,
        )
        payment.credit_id = credit.id
        credit.payments.append(payment)

        credit.paid_amount = round(float(credit.paid_amount) + amount, 2)
        credit.remaining_balance = round(float(credit.remaining_balance) - amount, 2)
        if credit.remaining_balance <= 0:
            credit.remaining_balance = 0
            credit.status = "paid"
        credit.updated_at = utcnow()

        customer = self.db.get(Customer, credit.customer_id)
        if customer:
            customer.credit_balance = round(
                max(float(customer.credit_balance) - amount, 0), 2
            )
        return payment

    def delete(self, credit: Credit) -> None:
        customer = self.db.get(Customer, credit.customer_id)
        if customer:
            customer.credit_balance = round(
                max(float(customer.credit_balance) - float(credit.remaining_balance), 0), 2
            )
        self.repo.delete(credit)

    def create_for_sale(self, sale: Sale) -> Credit | None:
        """Convert a sale's unpaid portion into a credit when paid partially."""
        if float(sale.total) <= 0:
            return None
        now = utcnow()
        due = now + dt.timedelta(days=30)
        credit = Credit(
            customer_id=sale.customer_id,
            initial_amount=float(sale.total),
            paid_amount=0,
            remaining_balance=float(sale.total),
            due_date=due,
            status="active",
            notes=f"Credit from sale {sale.invoice_number}",
            sale_id=sale.id,
            invoice_number=sale.invoice_number,
            created_at=now,
            updated_at=now,
        )
        self.db.add(credit)
        if sale.customer_id:
            customer = self.db.get(Customer, sale.customer_id)
            if customer:
                customer.credit_balance = round(
                    float(customer.credit_balance) + float(sale.total), 2
                )
        return credit

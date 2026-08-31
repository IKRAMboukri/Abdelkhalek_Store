from sqlalchemy import extract, func, select
from sqlalchemy.orm import Session

from app.models import Category, Credit, Customer, Product, Sale, SaleItem
from app.repositories.customer import CustomerRepository
from app.repositories.product import ProductRepository
from app.repositories.sale import SaleRepository
from app.schemas.dashboard import (
    BestSellingProduct,
    DashboardStats,
    MonthlySales,
    RecentCustomer,
    RecentSale,
)

PROFIT_MARGIN = 0.42


class DashboardService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.product_repo = ProductRepository(db)
        self.sale_repo = SaleRepository(db)
        self.customer_repo = CustomerRepository(db)

    def get_stats(self) -> DashboardStats:
        def count(model) -> int:
            return self.db.scalar(select(func.count()).select_from(model)) or 0

        total_revenue = float(self.db.scalar(select(func.coalesce(func.sum(Sale.total), 0))) or 0)
        total_products = count(Product)
        total_sales = count(Sale)

        active_credits = list(
            self.db.scalars(select(Credit).where(Credit.status == "active")).all()
        )
        overdue_credits = list(
            self.db.scalars(select(Credit).where(Credit.status == "overdue")).all()
        )

        return DashboardStats(
            totalProducts=total_products,
            totalCategories=count(Category),
            totalCustomers=count(Customer),
            totalSuppliers=0,
            totalSales=total_sales,
            totalRevenue=round(total_revenue, 2),
            totalProfit=round(total_revenue * PROFIT_MARGIN, 2),
            totalOrders=total_sales,
            pendingCredits=len(active_credits) + len(overdue_credits),
            overdueCredits=len(overdue_credits),
            pendingCreditAmount=round(
                sum(float(c.remaining_balance) for c in active_credits), 2
            ),
            overdueCreditAmount=round(
                sum(float(c.remaining_balance) for c in overdue_credits), 2
            ),
        )

    def get_monthly_sales(self, year: int) -> list[MonthlySales]:
        year_expr = extract("year", Sale.created_at)
        month_expr = extract("month", Sale.created_at)
        rows = self.db.execute(
            select(
                year_expr.label("year"),
                month_expr.label("month"),
                func.coalesce(func.sum(Sale.total), 0).label("revenue"),
                func.count(Sale.id).label("orders"),
            )
            .where(
                year_expr == year,
                Sale.status.in_(["completed", "pending"]),
            )
            .group_by(year_expr, month_expr)
            .order_by(year_expr, month_expr)
        ).all()

        month_map = {(int(row.year), int(row.month)): row for row in rows}
        result: list[MonthlySales] = []
        for month in range(1, 13):
            row = month_map.get((year, month))
            revenue = float(row.revenue) if row else 0.0
            orders = row.orders if row else 0
            result.append(
                MonthlySales(
                    month=f"{year}-{month:02d}",
                    sales=round(revenue, 2),
                    revenue=round(revenue, 2),
                    profit=round(revenue * PROFIT_MARGIN, 2),
                    orders=orders,
                )
            )
        return result

    def get_best_selling(self, limit: int) -> list[BestSellingProduct]:
        rows = self.db.execute(
            select(
                SaleItem.product_id.label("product_id"),
                SaleItem.product_name.label("product_name"),
                func.coalesce(func.sum(SaleItem.quantity), 0).label("quantity"),
                func.coalesce(func.sum(SaleItem.total), 0).label("revenue"),
            )
            .group_by(SaleItem.product_id, SaleItem.product_name)
            .order_by(func.sum(SaleItem.quantity).desc())
            .limit(limit)
        ).all()

        return [
            BestSellingProduct(
                productId=int(row.product_id) if row.product_id else 0,
                productName=row.product_name,
                quantity=int(row.quantity),
                revenue=round(float(row.revenue), 2),
            )
            for row in rows
        ]

    def get_recent_sales(self, limit: int) -> list[RecentSale]:
        sales = self.sale_repo.get_recent(limit)
        return [
            RecentSale(
                id=sale.id,
                invoice_number=sale.invoice_number,
                customer_name=sale.customer_name,
                total=float(sale.total),
                status=sale.status,
                created_at=sale.created_at,
            )
            for sale in sales
        ]

    def get_recent_customers(self, limit: int) -> list[RecentCustomer]:
        stmt = select(Customer).order_by(Customer.created_at.desc()).limit(limit)
        customers = list(self.db.scalars(stmt).all())
        return [
            RecentCustomer(
                id=customer.id,
                name=customer.name,
                email=customer.email,
                created_at=customer.created_at,
            )
            for customer in customers
        ]

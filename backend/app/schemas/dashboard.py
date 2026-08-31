import datetime as dt

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.schemas.common import ApiModel


class DashboardStats(BaseModel):
    totalProducts: int
    totalCategories: int
    totalCustomers: int
    totalSuppliers: int
    totalSales: int
    totalRevenue: float
    totalProfit: float
    totalOrders: int
    pendingCredits: int
    overdueCredits: int
    pendingCreditAmount: float
    overdueCreditAmount: float


class MonthlySales(BaseModel):
    month: str
    sales: float
    revenue: float
    profit: float
    orders: int


class BestSellingProduct(BaseModel):
    productId: int
    productName: str
    quantity: int
    revenue: float


class RecentSale(ApiModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

    id: int
    invoice_number: str
    customer_name: str
    total: float
    status: str
    created_at: dt.datetime


class RecentCustomer(ApiModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

    id: int
    name: str
    email: str
    created_at: dt.datetime

from fastapi import APIRouter, Query

from app.api.deps import DbSession
from app.schemas.dashboard import (
    BestSellingProduct,
    DashboardStats,
    MonthlySales,
    RecentCustomer,
    RecentSale,
)
from app.services import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def stats(db: DbSession):
    return DashboardService(db).get_stats()


@router.get("/monthly-sales", response_model=list[MonthlySales])
def monthly_sales(db: DbSession, year: int = Query(default=2025)):
    return DashboardService(db).get_monthly_sales(year)


@router.get("/best-selling", response_model=list[BestSellingProduct])
def best_selling(db: DbSession, limit: int = 5):
    return DashboardService(db).get_best_selling(limit)


@router.get("/recent-sales", response_model=list[RecentSale])
def recent_sales(db: DbSession, limit: int = 5):
    return DashboardService(db).get_recent_sales(limit)


@router.get("/recent-customers", response_model=list[RecentCustomer])
def recent_customers(db: DbSession, limit: int = 5):
    return DashboardService(db).get_recent_customers(limit)

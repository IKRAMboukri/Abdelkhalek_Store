from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.api.routes import (
    auth,
    categories,
    credits,
    customers,
    dashboard,
    invoices,
    notifications,
    payments,
    products,
    sales,
    settings,
)
from app.api.routes.settings import uploads_router

api_router = APIRouter()
api_router.include_router(auth.router)
# Every admin API requires an authenticated user; /auth is the only exception.
protected = [Depends(get_current_user)]
api_router.include_router(dashboard.router, dependencies=protected)
api_router.include_router(products.router, dependencies=protected)
api_router.include_router(categories.router, dependencies=protected)
api_router.include_router(customers.router, dependencies=protected)
api_router.include_router(sales.router, dependencies=protected)
api_router.include_router(credits.router, dependencies=protected)
api_router.include_router(payments.router, dependencies=protected)
api_router.include_router(invoices.router, dependencies=protected)
api_router.include_router(notifications.router, dependencies=protected)
api_router.include_router(settings.router, dependencies=protected)
# Static logo files are served without auth (see routes/settings.py).
api_router.include_router(uploads_router)

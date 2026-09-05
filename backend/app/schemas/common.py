import datetime as dt
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field, field_serializer

T = TypeVar("T")

DATETIME_FIELDS = (
    "created_at",
    "updated_at",
    "due_date",
    "payment_date",
)


class ApiModel(BaseModel):
    """Base for read schemas; serializes naive-UTC datetimes with a Z suffix."""

    @field_serializer(*DATETIME_FIELDS, check_fields=False)
    def _serialize_dt(self, value: dt.datetime) -> str:
        if isinstance(value, dt.datetime):
            if value.tzinfo is None:
                value = value.replace(tzinfo=dt.UTC)
            return value.astimezone(dt.UTC).isoformat().replace("+00:00", "Z")
        return value


class FilterParams(BaseModel):
    """Shared query parameters for list endpoints.

    Mirrors the frontend FilterOptions type. ``category`` is reused by some
    resources (sales/invoices/payments) to filter by payment method.
    """

    search: str = ""
    status: str = ""
    category: str = ""
    customerId: int | None = None
    sortBy: str = ""
    sortOrder: str = "desc"
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=1000)


class Page(BaseModel, Generic[T]):
    data: list[T]
    total: int
    page: int
    limit: int
    totalPages: int


def camel_model_config() -> ConfigDict:
    return ConfigDict(from_attributes=True, populate_by_name=True)

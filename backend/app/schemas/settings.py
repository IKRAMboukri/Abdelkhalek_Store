from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class StoreSettingsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

    id: int
    store_name: str
    store_email: str
    store_phone: str
    store_address: str
    currency: str
    currency_symbol: str
    logo: str
    fiscal_year: str
    timezone: str
    date_format: str


class StoreSettingsUpdate(BaseModel):
    storeName: str | None = None
    storeEmail: str | None = None
    storePhone: str | None = None
    storeAddress: str | None = None
    currency: str | None = None
    currencySymbol: str | None = None
    logo: str | None = None
    fiscalYear: str | None = None
    timezone: str | None = None
    dateFormat: str | None = None

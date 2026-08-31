from pydantic import BaseModel

from app.schemas.common import Page


class InvoiceItemRead(BaseModel):
    productName: str
    quantity: int
    unitPrice: float
    total: float


class InvoiceRead(BaseModel):
    id: int
    saleId: int
    invoiceNumber: str
    storeName: str
    storeLogo: str
    storePhone: str
    storeAddress: str
    storeEmail: str
    customerId: int | None
    customerName: str
    customerPhone: str
    customerAddress: str
    items: list[InvoiceItemRead]
    subtotal: float
    discount: float
    total: float
    amountPaid: float
    remainingBalance: float
    paymentMethod: str
    status: str
    notes: str
    createdAt: str


InvoicePage = Page[InvoiceRead]

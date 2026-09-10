import type { Invoice, Sale, Customer, StoreSettings } from '@/types';

export function buildInvoice(sale: Sale, settings: StoreSettings, customer?: Customer): Invoice {
  return {
    id: sale.id.replace('sale-', 'inv-'),
    saleId: sale.id,
    invoiceNumber: sale.invoiceNumber,
    storeName: settings.storeName || 'Furniture Store',
    storeAddress: settings.storeAddress || '',
    storePhone: settings.storePhone || '',
    storeEmail: settings.storeEmail || '',
    storeLogo: settings.logo || '',
    customerId: sale.customerId,
    customerName: sale.customerName || 'Walk-in Customer',
    customerPhone: customer?.phone || '',
    customerAddress: customer?.address || '',
    items: sale.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.total,
      availability: i.availability,
    })),
    subtotal: sale.subtotal,
    discount: sale.discount,
    total: sale.total,
    paymentMethod: sale.paymentMethod,
    amountPaid: sale.advanceAmount ?? 0,
    remainingBalance: Math.round((sale.total - (sale.advanceAmount ?? 0)) * 100) / 100,
    status: sale.status,
    notes: sale.notes,
    createdAt: sale.createdAt,
  };
}

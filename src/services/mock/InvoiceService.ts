import type { Invoice, Sale, Customer, StoreSettings, FilterOptions, PaginatedResult } from '@/types';
import type { IInvoiceService } from '@/services/interfaces/IInvoiceService';
import { SaleService } from './SaleService';
import { CustomerService } from './CustomerService';
import { SettingsService } from './SettingsService';

function delay(): number {
  return Math.floor(Math.random() * 221) + 80;
}

function buildInvoice(sale: Sale, settings: StoreSettings, customer?: Customer): Invoice {
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
    })),
    subtotal: sale.subtotal,
    discount: sale.discount,
    total: sale.total,
    paymentMethod: sale.paymentMethod,
    amountPaid: sale.total,
    remainingBalance: 0,
    status: sale.status,
    notes: sale.notes,
    createdAt: sale.createdAt,
  };
}

export class InvoiceService implements IInvoiceService {
  private saleService = new SaleService();
  private customerService = new CustomerService();
  private settingsService = new SettingsService();

  private async getAllInvoices(): Promise<Invoice[]> {
    const settings = await this.settingsService.getStoreSettings();
    const saleOpts: FilterOptions = {
      search: '',
      status: '',
      category: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10000,
    };
    const salesResult = await this.saleService.getSales(saleOpts);
    const allSales = salesResult.data;
    const customers = await this.customerService.getAllCustomers();
    const customerMap = new Map(customers.map((c: Customer) => [c.id, c]));

    return allSales.map((s) => buildInvoice(s, settings, customerMap.get(s.customerId)));
  }

  async getInvoices(options: FilterOptions): Promise<PaginatedResult<Invoice>> {
    const invoices = await this.getAllInvoices();

    let filtered = [...invoices];

    if (options.search) {
      const s = options.search.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(s) ||
          inv.customerName.toLowerCase().includes(s) ||
          inv.createdAt.toLowerCase().includes(s),
      );
    }

    if (options.status) {
      filtered = filtered.filter((inv) => inv.status === options.status);
    }

    if (options.category) {
      filtered = filtered.filter((inv) => inv.paymentMethod === options.category);
    }

    if (options.sortBy) {
      filtered.sort((a, b) => {
        let cmp = 0;
        switch (options.sortBy) {
          case 'createdAt':
            cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'total':
            cmp = a.total - b.total;
            break;
        }
        return options.sortOrder === 'desc' ? -cmp : cmp;
      });
    }

    const total = filtered.length;
    const page = options.page || 1;
    const limit = options.limit || 10;
    const totalPages = Math.ceil(total / limit);
    const data = filtered.slice((page - 1) * limit, page * limit);

    await new Promise((resolve) => setTimeout(resolve, delay()));
    return { data, total, page, limit, totalPages };
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    await new Promise((resolve) => setTimeout(resolve, delay()));
    const invoices = await this.getAllInvoices();
    return invoices.find((inv) => inv.id === id) || null;
  }

  async getInvoiceBySaleId(saleId: string): Promise<Invoice | null> {
    const invoices = await this.getAllInvoices();
    return invoices.find((inv) => inv.saleId === saleId) || null;
  }

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    const invoices = await this.getAllInvoices();
    return invoices.filter((inv) => inv.customerId === customerId);
  }

  async getInvoicesByDateRange(startDate: string, endDate: string): Promise<Invoice[]> {
    const invoices = await this.getAllInvoices();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return invoices.filter((inv) => {
      const t = new Date(inv.createdAt).getTime();
      return t >= start && t <= end;
    });
  }
}

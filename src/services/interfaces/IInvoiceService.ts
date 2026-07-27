import type { Invoice, FilterOptions, PaginatedResult } from '@/types';

export interface IInvoiceService {
  getInvoices(options: FilterOptions): Promise<PaginatedResult<Invoice>>;
  getInvoiceById(id: string): Promise<Invoice | null>;
  getInvoiceBySaleId(saleId: string): Promise<Invoice | null>;
  getInvoicesByCustomer(customerId: string): Promise<Invoice[]>;
  getInvoicesByDateRange(startDate: string, endDate: string): Promise<Invoice[]>;
}

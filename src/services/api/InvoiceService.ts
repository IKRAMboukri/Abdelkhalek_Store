import type { IInvoiceService } from '@/services/interfaces';
import type { FilterOptions, Invoice, PaginatedResult } from '@/types';
import { buildQuery, get, getOrNull } from './client';
import { mapInvoice, type RawInvoice, type RawPage } from './mappers';

const BASE = '/api/v1/invoices';

export class InvoiceService implements IInvoiceService {
  async getInvoices(options: FilterOptions): Promise<PaginatedResult<Invoice>> {
    const page = await get<RawPage<RawInvoice>>(`${BASE}${buildQuery({ ...options })}`);
    return { ...page, data: page.data.map(mapInvoice) };
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const raw = await getOrNull<RawInvoice>(`${BASE}/${id}`);
    return raw ? mapInvoice(raw) : null;
  }

  async getInvoiceBySaleId(saleId: string): Promise<Invoice | null> {
    const raw = await getOrNull<RawInvoice>(`${BASE}/by-sale/${saleId}`);
    return raw ? mapInvoice(raw) : null;
  }

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    const raws = await get<RawInvoice[]>(`${BASE}/by-customer/${customerId}`);
    return raws.map(mapInvoice);
  }

  async getInvoicesByDateRange(startDate: string, endDate: string): Promise<Invoice[]> {
    const raws = await get<RawInvoice[]>(`${BASE}/date-range?start=${startDate}&end=${endDate}`);
    return raws.map(mapInvoice);
  }
}

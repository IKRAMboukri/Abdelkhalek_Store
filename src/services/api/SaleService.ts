import type { ISaleService } from '@/services/interfaces';
import type { FilterOptions, PaginatedResult, Sale } from '@/types';
import { buildQuery, del, get, getOrNull, post, put } from './client';
import { mapSale, type RawPage, type RawSale } from './mappers';

const BASE = '/api/v1/sales';

export class SaleService implements ISaleService {
  async getSales(options: FilterOptions): Promise<PaginatedResult<Sale>> {
    const page = await get<RawPage<RawSale>>(`${BASE}${buildQuery({ ...options })}`);
    return { ...page, data: page.data.map(mapSale) };
  }

  async getSaleById(id: string): Promise<Sale | null> {
    const raw = await getOrNull<RawSale>(`${BASE}/${id}`);
    return raw ? mapSale(raw) : null;
  }

  async createSale(sale: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale> {
    const raw = await post<RawSale>(BASE, {
      customerId: sale.customerId ? Number(sale.customerId) : null,
      customerName: sale.customerName,
      items: sale.items.map((item) => ({
        productId: Number(item.productId),
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      subtotal: sale.subtotal,
      discount: sale.discount,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      notes: sale.notes,
      status: sale.status,
    });
    return mapSale(raw);
  }

  async updateSale(id: string, sale: Partial<Sale>): Promise<Sale | null> {
    const payload: Record<string, unknown> = { ...sale };
    if (payload.customerId != null) payload.customerId = Number(payload.customerId);
    const raw = await put<RawSale>(`${BASE}/${id}`, payload);
    return raw ? mapSale(raw) : null;
  }

  async deleteSale(id: string): Promise<boolean> {
    return del(`${BASE}/${id}`);
  }

  async getSalesByCustomer(customerId: string): Promise<Sale[]> {
    const raws = await get<RawSale[]>(`${BASE}/by-customer/${customerId}`);
    return raws.map(mapSale);
  }

  async getRecentSales(limit: number): Promise<Sale[]> {
    const raws = await get<RawSale[]>(`${BASE}/recent?limit=${limit}`);
    return raws.map(mapSale);
  }

  async getSalesByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    const raws = await get<RawSale[]>(`${BASE}/date-range?start=${startDate}&end=${endDate}`);
    return raws.map(mapSale);
  }
}

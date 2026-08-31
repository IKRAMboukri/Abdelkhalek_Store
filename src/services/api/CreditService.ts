import type { ICreditService } from '@/services/interfaces';
import type { Credit, CreditPayment, FilterOptions, PaginatedResult } from '@/types';
import { buildQuery, del, get, getOrNull, post, put } from './client';
import { mapCredit, type RawCredit, type RawPage } from './mappers';

const BASE = '/api/v1/credits';

export class CreditService implements ICreditService {
  async getCredits(options: FilterOptions): Promise<PaginatedResult<Credit>> {
    const page = await get<RawPage<RawCredit>>(`${BASE}${buildQuery({ ...options })}`);
    return { ...page, data: page.data.map(mapCredit) };
  }

  async getCreditById(id: string): Promise<Credit | null> {
    const raw = await getOrNull<RawCredit>(`${BASE}/${id}`);
    return raw ? mapCredit(raw) : null;
  }

  async createCredit(
    credit: Omit<Credit, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Credit> {
    const raw = await post<RawCredit>(BASE, {
      ...credit,
      customerId: Number(credit.customerId),
      saleId: credit.saleId ? Number(credit.saleId) : null,
      payments: [],
    });
    return mapCredit(raw);
  }

  async updateCredit(id: string, credit: Partial<Credit>): Promise<Credit | null> {
    const raw = await put<RawCredit>(`${BASE}/${id}`, credit);
    return raw ? mapCredit(raw) : null;
  }

  async deleteCredit(id: string): Promise<boolean> {
    return del(`${BASE}/${id}`);
  }

  async addPayment(
    creditId: string,
    payment: Omit<CreditPayment, 'id'>,
  ): Promise<Credit | null> {
    const raw = await post<RawCredit>(`${BASE}/${creditId}/payments`, payment);
    return raw ? mapCredit(raw) : null;
  }

  async getCreditsByCustomer(customerId: string): Promise<Credit[]> {
    const raws = await get<RawCredit[]>(`${BASE}/by-customer/${customerId}`);
    return raws.map(mapCredit);
  }

  async getOverdueCredits(): Promise<Credit[]> {
    const raws = await get<RawCredit[]>(`${BASE}/overdue`);
    return raws.map(mapCredit);
  }

  async getPendingCredits(): Promise<Credit[]> {
    const raws = await get<RawCredit[]>(`${BASE}/pending`);
    return raws.map(mapCredit);
  }
}

import type { IPaymentService } from '@/services/interfaces';
import type { FilterOptions, PaginatedResult, Payment } from '@/types';
import { buildQuery, del, get, getOrNull, post, put } from './client';
import { mapPayment, type RawPage, type RawPayment } from './mappers';

const BASE = '/api/v1/payments';

export class PaymentService implements IPaymentService {
  async getPayments(options: FilterOptions): Promise<PaginatedResult<Payment>> {
    const page = await get<RawPage<RawPayment>>(`${BASE}${buildQuery({ ...options })}`);
    return { ...page, data: page.data.map(mapPayment) };
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    const raw = await getOrNull<RawPayment>(`${BASE}/${id}`);
    return raw ? mapPayment(raw) : null;
  }

  async createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const raw = await post<RawPayment>(BASE, {
      ...payment,
      saleId: payment.saleId ? Number(payment.saleId) : null,
      customerId: payment.customerId ? Number(payment.customerId) : null,
    });
    return mapPayment(raw);
  }

  async updatePayment(id: string, payment: Partial<Payment>): Promise<Payment | null> {
    const payload: Record<string, unknown> = { ...payment };
    if (payload.saleId != null) payload.saleId = Number(payload.saleId);
    if (payload.customerId != null) payload.customerId = Number(payload.customerId);
    const raw = await put<RawPayment>(`${BASE}/${id}`, payload);
    return raw ? mapPayment(raw) : null;
  }

  async deletePayment(id: string): Promise<boolean> {
    return del(`${BASE}/${id}`);
  }

  async getPaymentsByDateRange(startDate: string, endDate: string): Promise<Payment[]> {
    const raws = await get<RawPayment[]>(`${BASE}/date-range?start=${startDate}&end=${endDate}`);
    return raws.map(mapPayment);
  }

  async getPaymentsByMethod(method: Payment['method']): Promise<Payment[]> {
    const raws = await get<RawPayment[]>(`${BASE}/by-method/${method}`);
    return raws.map(mapPayment);
  }
}

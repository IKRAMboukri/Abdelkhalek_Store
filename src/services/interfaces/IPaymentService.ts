import type { Payment, FilterOptions, PaginatedResult } from '@/types';

export interface IPaymentService {
  getPayments(options: FilterOptions): Promise<PaginatedResult<Payment>>;
  getPaymentById(id: string): Promise<Payment | null>;
  createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment>;
  updatePayment(id: string, payment: Partial<Payment>): Promise<Payment | null>;
  deletePayment(id: string): Promise<boolean>;
  getPaymentsByDateRange(startDate: string, endDate: string): Promise<Payment[]>;
  getPaymentsByMethod(method: Payment['method']): Promise<Payment[]>;
}

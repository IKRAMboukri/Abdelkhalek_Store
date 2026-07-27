import type { Credit, FilterOptions, PaginatedResult } from '@/types';

export interface ICreditService {
  getCredits(options: FilterOptions): Promise<PaginatedResult<Credit>>;
  getCreditById(id: string): Promise<Credit | null>;
  createCredit(credit: Omit<Credit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Credit>;
  updateCredit(id: string, credit: Partial<Credit>): Promise<Credit | null>;
  deleteCredit(id: string): Promise<boolean>;
  addPayment(creditId: string, payment: Omit<Credit['payments'][0], 'id'>): Promise<Credit | null>;
  getCreditsByCustomer(customerId: string): Promise<Credit[]>;
  getOverdueCredits(): Promise<Credit[]>;
  getPendingCredits(): Promise<Credit[]>;
}

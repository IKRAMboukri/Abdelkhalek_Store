import type { Sale, FilterOptions, PaginatedResult } from '@/types';

export interface ISaleService {
  getSales(options: FilterOptions): Promise<PaginatedResult<Sale>>;
  getSaleById(id: string): Promise<Sale | null>;
  createSale(sale: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale>;
  updateSale(id: string, sale: Partial<Sale>): Promise<Sale | null>;
  deleteSale(id: string): Promise<boolean>;
  getSalesByCustomer(customerId: string): Promise<Sale[]>;
  getRecentSales(limit: number): Promise<Sale[]>;
  getSalesByDateRange(startDate: string, endDate: string): Promise<Sale[]>;
}

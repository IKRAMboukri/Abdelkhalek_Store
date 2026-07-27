import type { DashboardStats, MonthlySales, BestSellingProduct, RecentSale, RecentCustomer } from '@/types';

export interface IDashboardService {
  getStats(): Promise<DashboardStats>;
  getMonthlySales(year: number): Promise<MonthlySales[]>;
  getBestSellingProducts(limit: number): Promise<BestSellingProduct[]>;
  getRecentSales(limit: number): Promise<RecentSale[]>;
  getRecentCustomers(limit: number): Promise<RecentCustomer[]>;
}

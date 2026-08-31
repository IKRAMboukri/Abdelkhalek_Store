import type { IDashboardService } from '@/services/interfaces';
import type {
  BestSellingProduct,
  DashboardStats,
  MonthlySales,
  RecentCustomer,
  RecentSale,
} from '@/types';
import { get } from './client';
import {
  mapBestSellingProduct,
  mapDashboardStats,
  mapMonthlySales,
  mapRecentCustomer,
  mapRecentSale,
  type RawBestSellingProduct,
  type RawRecentCustomer,
  type RawRecentSale,
} from './mappers';

const BASE = '/api/v1/dashboard';

export class DashboardService implements IDashboardService {
  async getStats(): Promise<DashboardStats> {
    return mapDashboardStats(await get<DashboardStats>(`${BASE}/stats`));
  }

  async getMonthlySales(year: number): Promise<MonthlySales[]> {
    return (await get<MonthlySales[]>(`${BASE}/monthly-sales?year=${year}`)).map(mapMonthlySales);
  }

  async getBestSellingProducts(limit: number): Promise<BestSellingProduct[]> {
    const raws = await get<RawBestSellingProduct[]>(`${BASE}/best-selling?limit=${limit}`);
    return raws.map(mapBestSellingProduct);
  }

  async getRecentSales(limit: number): Promise<RecentSale[]> {
    const raws = await get<RawRecentSale[]>(`${BASE}/recent-sales?limit=${limit}`);
    return raws.map(mapRecentSale);
  }

  async getRecentCustomers(limit: number): Promise<RecentCustomer[]> {
    const raws = await get<RawRecentCustomer[]>(`${BASE}/recent-customers?limit=${limit}`);
    return raws.map(mapRecentCustomer);
  }
}

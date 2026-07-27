import type { DashboardStats, MonthlySales, BestSellingProduct, RecentSale, RecentCustomer, Product, Sale, Customer, Credit } from '@/types';
import type { IDashboardService } from '@/services/interfaces/IDashboardService';
import { mockProducts } from '@/mocks/products';
import { mockCategories } from '@/mocks/categories';
import { mockCustomers } from '@/mocks/customers';
import { mockSales } from '@/mocks/sales';
import { mockCredits } from '@/mocks/credits';

function delay(): number {
  return Math.floor(Math.random() * 221) + 80;
}

export class DashboardService implements IDashboardService {
  private products: Product[] = [...mockProducts];
  private categories: typeof mockCategories = [...mockCategories];
  private customers: Customer[] = [...mockCustomers];
  private sales: Sale[] = [...mockSales];
  private credits: Credit[] = [...mockCredits];

  async getStats(): Promise<DashboardStats> {
    const lowStockCount = this.products.filter(p => p.stock <= p.minStock).length;
    const activeCredits = this.credits.filter(c => c.status === 'active');
    const overdueCredits = this.credits.filter(c => c.status === 'overdue');
    const totalRevenue = this.sales.reduce((sum, s) => sum + s.total, 0);

    await new Promise(resolve => setTimeout(resolve, delay()));
    return {
      totalProducts: this.products.length,
      totalCategories: this.categories.length,
      totalCustomers: this.customers.length,
      totalSuppliers: 0,
      totalSales: this.sales.length,
      totalRevenue,
      totalProfit: Math.round(totalRevenue * 0.42),
      totalOrders: this.sales.length,
      lowStockProducts: lowStockCount,
      pendingCredits: activeCredits.length + overdueCredits.length,
      overdueCredits: overdueCredits.length,
      pendingCreditAmount: activeCredits.reduce((sum, c) => sum + c.remainingBalance, 0),
      overdueCreditAmount: overdueCredits.reduce((sum, c) => sum + c.remainingBalance, 0)
    };
  }

  async getMonthlySales(year: number): Promise<MonthlySales[]> {
    const yearStr = String(year);
    const monthMap = new Map<string, { sales: number; revenue: number; profit: number; orders: number }>();

    for (let m = 1; m <= 12; m++) {
      const key = `${yearStr}-${String(m).padStart(2, '0')}`;
      monthMap.set(key, { sales: 0, revenue: 0, profit: 0, orders: 0 });
    }

    for (const sale of this.sales) {
      const month = sale.createdAt.substring(0, 7);
      if (month.startsWith(yearStr) && monthMap.has(month)) {
        const entry = monthMap.get(month)!;
        entry.sales += sale.total;
        entry.revenue += sale.total;
        entry.profit += Math.round(sale.total * 0.42);
        entry.orders += 1;
      }
    }

    const result: MonthlySales[] = [];
    for (const [month, data] of monthMap) {
      result.push({
        month,
        sales: Math.round(data.sales),
        revenue: Math.round(data.revenue),
        profit: Math.round(data.profit),
        orders: data.orders
      });
    }

    await new Promise(resolve => setTimeout(resolve, delay()));
    return result;
  }

  async getBestSellingProducts(limit: number): Promise<BestSellingProduct[]> {
    const productMap = new Map<string, { productName: string; quantity: number; revenue: number }>();

    for (const sale of this.sales) {
      for (const item of sale.items) {
        const existing = productMap.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.total;
        } else {
          productMap.set(item.productId, {
            productName: item.productName,
            quantity: item.quantity,
            revenue: item.total
          });
        }
      }
    }

    const sorted = Array.from(productMap.entries())
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);

    await new Promise(resolve => setTimeout(resolve, delay()));
    return sorted;
  }

  async getRecentSales(limit: number): Promise<RecentSale[]> {
    const sorted = [...this.sales]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(s => ({
        id: s.id,
        invoiceNumber: s.invoiceNumber,
        customerName: s.customerName,
        total: s.total,
        status: s.status,
        createdAt: s.createdAt
      }));

    await new Promise(resolve => setTimeout(resolve, delay()));
    return sorted;
  }

  async getRecentCustomers(limit: number): Promise<RecentCustomer[]> {
    const sorted = [...this.customers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        totalSpent: c.totalSpent,
        createdAt: c.createdAt
      }));

    await new Promise(resolve => setTimeout(resolve, delay()));
    return sorted;
  }
}

import type { Sale, FilterOptions, PaginatedResult } from '@/types';
import type { ISaleService } from '@/services/interfaces/ISaleService';
import { mockSales } from '@/mocks/sales';
import { mockProducts } from '@/mocks/products';
import { mockInventoryMovements } from '@/mocks/inventory';

function delay(): number {
  return Math.floor(Math.random() * 221) + 80;
}

export class SaleService implements ISaleService {
  private sales: Sale[] = [...mockSales];
  private products: typeof mockProducts = [...mockProducts];
  private movements: InventoryMovement[] = [...mockInventoryMovements];

  async getSales(options: FilterOptions): Promise<PaginatedResult<Sale>> {
    let filtered = [...this.sales];

    if (options.search) {
      const s = options.search.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.invoiceNumber.toLowerCase().includes(s) ||
        sale.customerName.toLowerCase().includes(s)
      );
    }

    if (options.status) {
      filtered = filtered.filter(s => s.status === options.status);
    }

    if (options.category) {
      filtered = filtered.filter(s => s.paymentMethod === options.category);
    }

    if (options.sortBy) {
      filtered.sort((a, b) => {
        let cmp = 0;
        switch (options.sortBy) {
          case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
          case 'total': cmp = a.total - b.total; break;
        }
        return options.sortOrder === 'desc' ? -cmp : cmp;
      });
    }

    const total = filtered.length;
    const page = options.page || 1;
    const limit = options.limit || 10;
    const totalPages = Math.ceil(total / limit);
    const data = filtered.slice((page - 1) * limit, page * limit);

    await new Promise(resolve => setTimeout(resolve, delay()));
    return { data, total, page, limit, totalPages };
  }

  async getSaleById(id: string): Promise<Sale | null> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.sales.find(s => s.id === id) || null;
  }

  async createSale(sale: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale> {
    const maxId = this.sales.reduce((max, s) => Math.max(max, parseInt(s.id.split('-')[1])), 0);
    const maxInv = this.sales.reduce((max, s) => {
      const num = parseInt(s.invoiceNumber.split('-')[2]);
      return Math.max(max, isNaN(num) ? 0 : num);
    }, 0);
    const now = new Date().toISOString();
    const newSale: Sale = {
      ...sale,
      id: `sale-${maxId + 1}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(maxInv + 1).padStart(4, '0')}`,
      createdAt: now
    };
    this.sales.push(newSale);

    for (const item of newSale.items) {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod) {
        const prevStock = prod.stock;
        prod.stock -= item.quantity;
        const movement: InventoryMovement = {
          id: `inv-${this.movements.length + 1}`,
          productId: item.productId,
          productName: item.productName,
          type: 'out',
          quantity: item.quantity,
          previousStock: prevStock,
          newStock: prod.stock,
          reference: newSale.invoiceNumber,
          notes: `Sale to ${newSale.customerName}.`,
          createdAt: now
        };
        this.movements.push(movement);
      }
    }

    await new Promise(resolve => setTimeout(resolve, delay()));
    return newSale;
  }

  async updateSale(id: string, sale: Partial<Sale>): Promise<Sale | null> {
    const idx = this.sales.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.sales[idx] = { ...this.sales[idx], ...sale };
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.sales[idx];
  }

  async deleteSale(id: string): Promise<boolean> {
    const idx = this.sales.findIndex(s => s.id === id);
    if (idx === -1) return false;
    const sale = this.sales[idx];
    for (const item of sale.items) {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
      }
    }
    this.sales.splice(idx, 1);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return true;
  }

  async getSalesByCustomer(customerId: string): Promise<Sale[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.sales.filter(s => s.customerId === customerId);
  }

  async getRecentSales(limit: number): Promise<Sale[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return [...this.sales]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getSalesByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return this.sales.filter(s => {
      const t = new Date(s.createdAt).getTime();
      return t >= start && t <= end;
    });
  }
}

import type { InventoryMovement, FilterOptions, PaginatedResult } from '@/types';
import type { IInventoryService } from '@/services/interfaces/IInventoryService';
import { mockInventoryMovements } from '@/mocks/inventory';

function delay(): number {
  return Math.floor(Math.random() * 221) + 80;
}

export class InventoryService implements IInventoryService {
  private movements: InventoryMovement[] = [...mockInventoryMovements];

  async getMovements(options: FilterOptions): Promise<PaginatedResult<InventoryMovement>> {
    let filtered = [...this.movements];

    if (options.search) {
      const s = options.search.toLowerCase();
      filtered = filtered.filter(m =>
        m.productName.toLowerCase().includes(s) ||
        m.reference.toLowerCase().includes(s)
      );
    }

    if (options.status) {
      filtered = filtered.filter(m => m.type === options.status);
    }

    if (options.category) {
      filtered = filtered.filter(m => m.productId === options.category);
    }

    if (options.sortBy) {
      filtered.sort((a, b) => {
        let cmp = 0;
        switch (options.sortBy) {
          case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
          case 'quantity': cmp = a.quantity - b.quantity; break;
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

  async getMovementsByProduct(productId: string): Promise<InventoryMovement[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.movements.filter(m => m.productId === productId);
  }

  async addMovement(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<InventoryMovement> {
    const maxId = this.movements.reduce((max, m) => Math.max(max, parseInt(m.id.split('-')[1])), 0);
    const newMovement: InventoryMovement = {
      ...movement,
      id: `inv-${maxId + 1}`,
      createdAt: new Date().toISOString()
    };
    this.movements.unshift(newMovement);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return newMovement;
  }

  async getLowStockProducts(): Promise<InventoryMovement[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.movements.filter(m => m.type === 'out' && m.quantity > 0);
  }

  async getStockHistory(productId: string, startDate: string, endDate: string): Promise<InventoryMovement[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return this.movements.filter(m => {
      const t = new Date(m.createdAt).getTime();
      return m.productId === productId && t >= start && t <= end;
    });
  }
}

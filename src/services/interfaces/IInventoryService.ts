import type { InventoryMovement, FilterOptions, PaginatedResult } from '@/types';

export interface IInventoryService {
  getMovements(options: FilterOptions): Promise<PaginatedResult<InventoryMovement>>;
  getMovementsByProduct(productId: string): Promise<InventoryMovement[]>;
  addMovement(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<InventoryMovement>;
  getLowStockProducts(): Promise<InventoryMovement[]>;
  getStockHistory(productId: string, startDate: string, endDate: string): Promise<InventoryMovement[]>;
}

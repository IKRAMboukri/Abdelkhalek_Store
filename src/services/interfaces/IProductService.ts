import type { Product, FilterOptions, PaginatedResult } from '@/types';

export interface IProductService {
  getProducts(options: FilterOptions): Promise<PaginatedResult<Product>>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
}

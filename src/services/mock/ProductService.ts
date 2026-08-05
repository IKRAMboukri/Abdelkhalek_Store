import type { Product, FilterOptions, PaginatedResult } from '@/types';
import type { IProductService } from '@/services/interfaces/IProductService';
import { mockProducts } from '@/mocks/products';

function delay(): number {
  return Math.floor(Math.random() * 221) + 80;
}

export class ProductService implements IProductService {
  private products: Product[] = [...mockProducts];

  async getProducts(options: FilterOptions): Promise<PaginatedResult<Product>> {
    let filtered = [...this.products];

    if (options.search) {
      const s = options.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.barcode.toLowerCase().includes(s) ||
        p.categoryName.toLowerCase().includes(s)
      );
    }

    if (options.status) {
      filtered = filtered.filter(p => p.status === options.status);
    }

    if (options.category) {
      filtered = filtered.filter(p => p.categoryId === options.category);
    }

    if (options.sortBy) {
      filtered.sort((a, b) => {
        let cmp = 0;
        switch (options.sortBy) {
          case 'name': cmp = a.name.localeCompare(b.name); break;
          case 'sellingPrice': cmp = a.sellingPrice - b.sellingPrice; break;
          case 'stock': cmp = a.stock - b.stock; break;
          case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
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

  async getProductById(id: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.products.find(p => p.id === id) || null;
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const maxId = this.products.reduce((max, p) => Math.max(max, parseInt(p.id.split('-')[1])), 0);
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: `prod-${maxId + 1}`,
      createdAt: now,
      updatedAt: now
    };
    this.products.unshift(newProduct);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.products[idx] = { ...this.products[idx], ...product, updatedAt: new Date().toISOString() };
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.products[idx];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.products.splice(idx, 1);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return true;
  }

  async getLowStockProducts(): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.products.filter(p => p.stock <= p.minStock);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.products.filter(p => p.categoryId === categoryId);
  }

  async getAllProducts(): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return [...this.products];
  }
}

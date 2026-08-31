import type { IProductService } from '@/services/interfaces';
import type { FilterOptions, PaginatedResult, Product } from '@/types';
import { buildQuery, del, get, getOrNull, post, put } from './client';
import { mapProduct, type RawPage, type RawProduct } from './mappers';

const BASE = '/api/v1/products';

export class ProductService implements IProductService {
  async getProducts(options: FilterOptions): Promise<PaginatedResult<Product>> {
    const page = await get<RawPage<RawProduct>>(`${BASE}${buildQuery({ ...options })}`);
    return { ...page, data: page.data.map(mapProduct) };
  }

  async getProductById(id: string): Promise<Product | null> {
    const raw = await getOrNull<RawProduct>(`${BASE}/${id}`);
    return raw ? mapProduct(raw) : null;
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const raw = await post<RawProduct>(BASE, {
      ...product,
      categoryId: Number(product.categoryId),
      subCategoryId: product.subCategoryId ? Number(product.subCategoryId) : null,
    });
    return mapProduct(raw);
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
    const payload: Record<string, unknown> = { ...product };
    if (payload.categoryId != null) payload.categoryId = Number(payload.categoryId);
    if (payload.subCategoryId != null) payload.subCategoryId = Number(payload.subCategoryId);
    const raw = await put<RawProduct>(`${BASE}/${id}`, payload);
    return raw ? mapProduct(raw) : null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return del(`${BASE}/${id}`);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const raws = await get<RawProduct[]>(`${BASE}/by-category/${categoryId}`);
    return raws.map(mapProduct);
  }

  async getAllProducts(): Promise<Product[]> {
    const raws = await get<RawProduct[]>(`${BASE}/all`);
    return raws.map(mapProduct);
  }
}

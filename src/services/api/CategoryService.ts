import type { ICategoryService } from '@/services/interfaces';
import type { Category, FilterOptions, PaginatedResult, SubCategory } from '@/types';
import { buildQuery, del, get, getOrNull, post, put } from './client';
import { mapCategory, mapSubCategory, type RawCategory, type RawPage, type RawSubCategory } from './mappers';

const BASE = '/api/v1/categories';

export class CategoryService implements ICategoryService {
  async getCategories(options: FilterOptions): Promise<PaginatedResult<Category>> {
    const page = await get<RawPage<RawCategory>>(`${BASE}${buildQuery({ ...options })}`);
    return { ...page, data: page.data.map(mapCategory) };
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const raw = await getOrNull<RawCategory>(`${BASE}/${id}`);
    return raw ? mapCategory(raw) : null;
  }

  async createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const raw = await post<RawCategory>(BASE, {
      name: category.name,
      description: category.description ?? '',
      image: category.image ?? '',
    });
    return mapCategory(raw);
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category | null> {
    const payload: Record<string, unknown> = {};
    if (category.name !== undefined) payload.name = category.name;
    if (category.description !== undefined) payload.description = category.description;
    if (category.image !== undefined) payload.image = category.image;
    const raw = await put<RawCategory>(`${BASE}/${id}`, payload);
    return raw ? mapCategory(raw) : null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return del(`${BASE}/${id}`);
  }

  async getAllCategories(): Promise<Category[]> {
    const raws = await get<RawCategory[]>(`${BASE}/all`);
    return raws.map(mapCategory);
  }

  async addSubcategory(categoryId: string, name: string): Promise<SubCategory | null> {
    const raw = await post<RawSubCategory>(`${BASE}/${categoryId}/subcategories`, { name });
    return raw ? mapSubCategory(raw) : null;
  }
}

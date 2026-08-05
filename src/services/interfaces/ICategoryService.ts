import type { Category, SubCategory, FilterOptions, PaginatedResult } from '@/types';

export interface ICategoryService {
  getCategories(options: FilterOptions): Promise<PaginatedResult<Category>>;
  getCategoryById(id: string): Promise<Category | null>;
  createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>): Promise<Category | null>;
  deleteCategory(id: string): Promise<boolean>;
  getAllCategories(): Promise<Category[]>;
  addSubcategory(categoryId: string, name: string): Promise<SubCategory | null>;
}

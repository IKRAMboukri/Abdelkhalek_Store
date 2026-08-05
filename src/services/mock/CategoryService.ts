import type { Category, FilterOptions, PaginatedResult } from '@/types';
import type { ICategoryService } from '@/services/interfaces/ICategoryService';
import { mockCategories } from '@/mocks/categories';

function delay(): number {
  return Math.floor(Math.random() * 221) + 80;
}

export class CategoryService implements ICategoryService {
  private categories: Category[] = [...mockCategories];

  async getCategories(options: FilterOptions): Promise<PaginatedResult<Category>> {
    let filtered = [...this.categories];

    if (options.search) {
      const s = options.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s)
      );
    }

    if (options.sortBy) {
      filtered.sort((a, b) => {
        let cmp = 0;
        switch (options.sortBy) {
          case 'name': cmp = a.name.localeCompare(b.name); break;
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

  async getCategoryById(id: string): Promise<Category | null> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.categories.find(c => c.id === id) || null;
  }

  async createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const maxId = this.categories.reduce((max, c) => Math.max(max, parseInt(c.id.split('-')[1])), 0);
    const newCategory: Category = {
      ...category,
      id: `cat-${maxId + 1}`,
      createdAt: new Date().toISOString()
    };
    this.categories.unshift(newCategory);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category | null> {
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.categories[idx] = { ...this.categories[idx], ...category };
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.categories[idx];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.categories.splice(idx, 1);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return true;
  }

  async getAllCategories(): Promise<Category[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return [...this.categories];
  }
}

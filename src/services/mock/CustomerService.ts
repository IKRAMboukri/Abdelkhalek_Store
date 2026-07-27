import type { Customer, FilterOptions, PaginatedResult } from '@/types';
import type { ICustomerService } from '@/services/interfaces/ICustomerService';
import { mockCustomers } from '@/mocks/customers';

function delay(): number {
  return Math.floor(Math.random() * 221) + 80;
}

export class CustomerService implements ICustomerService {
  private customers: Customer[] = [...mockCustomers];

  async getCustomers(options: FilterOptions): Promise<PaginatedResult<Customer>> {
    let filtered = [...this.customers];

    if (options.search) {
      const s = options.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.phone.toLowerCase().includes(s) ||
        c.company.toLowerCase().includes(s)
      );
    }

    if (options.status) {
      filtered = filtered.filter(c => c.status === options.status);
    }

    if (options.sortBy) {
      filtered.sort((a, b) => {
        let cmp = 0;
        switch (options.sortBy) {
          case 'name': cmp = a.name.localeCompare(b.name); break;
          case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
          case 'totalSpent': cmp = a.totalSpent - b.totalSpent; break;
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

  async getCustomerById(id: string): Promise<Customer | null> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.customers.find(c => c.id === id) || null;
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const maxId = this.customers.reduce((max, c) => Math.max(max, parseInt(c.id.split('-')[1])), 0);
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      ...customer,
      id: `cust-${maxId + 1}`,
      createdAt: now,
      updatedAt: now
    };
    this.customers.push(newCustomer);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | null> {
    const idx = this.customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.customers[idx] = { ...this.customers[idx], ...customer, updatedAt: new Date().toISOString() };
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.customers[idx];
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const idx = this.customers.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.customers.splice(idx, 1);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return true;
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.customers.find(c => c.email === email) || null;
  }

  async getAllCustomers(): Promise<Customer[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return [...this.customers];
  }
}

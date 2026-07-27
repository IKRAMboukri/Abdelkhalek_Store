import type { Customer, FilterOptions, PaginatedResult } from '@/types';

export interface ICustomerService {
  getCustomers(options: FilterOptions): Promise<PaginatedResult<Customer>>;
  getCustomerById(id: string): Promise<Customer | null>;
  createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | null>;
  deleteCustomer(id: string): Promise<boolean>;
  getCustomerByEmail(email: string): Promise<Customer | null>;
  getAllCustomers(): Promise<Customer[]>;
}

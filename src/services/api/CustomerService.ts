import type { ICustomerService } from '@/services/interfaces';
import type { Customer, FilterOptions, PaginatedResult } from '@/types';
import { buildQuery, del, get, getOrNull, post, put } from './client';
import { mapCustomer, type RawCustomer, type RawPage } from './mappers';

const BASE = '/api/v1/customers';

export class CustomerService implements ICustomerService {
  async getCustomers(options: FilterOptions): Promise<PaginatedResult<Customer>> {
    const page = await get<RawPage<RawCustomer>>(`${BASE}${buildQuery({ ...options })}`);
    return { ...page, data: page.data.map(mapCustomer) };
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const raw = await getOrNull<RawCustomer>(`${BASE}/${id}`);
    return raw ? mapCustomer(raw) : null;
  }

  async createCustomer(
    customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Customer> {
    const raw = await post<RawCustomer>(BASE, {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      company: customer.company,
      notes: customer.notes,
      status: customer.status,
    });
    return mapCustomer(raw);
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | null> {
    const raw = await put<RawCustomer>(`${BASE}/${id}`, customer);
    return raw ? mapCustomer(raw) : null;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return del(`${BASE}/${id}`);
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    const raw = await getOrNull<RawCustomer>(`${BASE}/by-email/${encodeURIComponent(email)}`);
    return raw ? mapCustomer(raw) : null;
  }

  async getAllCustomers(): Promise<Customer[]> {
    const raws = await get<RawCustomer[]>(`${BASE}/all`);
    return raws.map(mapCustomer);
  }
}

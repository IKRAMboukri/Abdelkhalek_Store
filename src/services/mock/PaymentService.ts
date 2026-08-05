import type { Payment, FilterOptions, PaginatedResult } from '@/types';
import type { IPaymentService } from '@/services/interfaces/IPaymentService';
import { mockPayments } from '@/mocks/payments';

function delay(): number {
  return Math.floor(Math.random() * 221) + 80;
}

export class PaymentService implements IPaymentService {
  private payments: Payment[] = [...mockPayments];

  async getPayments(options: FilterOptions): Promise<PaginatedResult<Payment>> {
    let filtered = [...this.payments];

    if (options.search) {
      const s = options.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.invoiceNumber.toLowerCase().includes(s) ||
        p.customerName.toLowerCase().includes(s) ||
        p.reference.toLowerCase().includes(s)
      );
    }

    if (options.status) {
      filtered = filtered.filter(p => p.status === options.status);
    }

    if (options.category) {
      filtered = filtered.filter(p => p.method === options.category);
    }

    if (options.sortBy) {
      filtered.sort((a, b) => {
        let cmp = 0;
        switch (options.sortBy) {
          case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
          case 'amount': cmp = a.amount - b.amount; break;
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

  async getPaymentById(id: string): Promise<Payment | null> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.payments.find(p => p.id === id) || null;
  }

  async createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const maxId = this.payments.reduce((max, p) => Math.max(max, parseInt(p.id.split('-')[1])), 0);
    const newPayment: Payment = {
      ...payment,
      id: `pay-${maxId + 1}`,
      createdAt: new Date().toISOString()
    };
    this.payments.unshift(newPayment);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return newPayment;
  }

  async updatePayment(id: string, payment: Partial<Payment>): Promise<Payment | null> {
    const idx = this.payments.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.payments[idx] = { ...this.payments[idx], ...payment };
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.payments[idx];
  }

  async deletePayment(id: string): Promise<boolean> {
    const idx = this.payments.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.payments.splice(idx, 1);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return true;
  }

  async getPaymentsByDateRange(startDate: string, endDate: string): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return this.payments.filter(p => {
      const t = new Date(p.createdAt).getTime();
      return t >= start && t <= end;
    });
  }

  async getPaymentsByMethod(method: Payment['method']): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.payments.filter(p => p.method === method);
  }
}

import type { Credit, FilterOptions, PaginatedResult, CreditPayment } from '@/types';
import type { ICreditService } from '@/services/interfaces/ICreditService';
import { mockCredits } from '@/mocks/credits';

function delay(): number {
  return Math.floor(Math.random() * 221) + 80;
}

export class CreditService implements ICreditService {
  private credits: Credit[] = [...mockCredits];

  async getCredits(options: FilterOptions): Promise<PaginatedResult<Credit>> {
    let filtered = [...this.credits];

    if (options.search) {
      const s = options.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.customerName.toLowerCase().includes(s) ||
        c.invoiceNumber?.toLowerCase().includes(s)
      );
    }

    if (options.status) {
      filtered = filtered.filter(c => c.status === options.status);
    }

    if (options.sortBy) {
      filtered.sort((a, b) => {
        let cmp = 0;
        switch (options.sortBy) {
          case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
          case 'remainingBalance': cmp = a.remainingBalance - b.remainingBalance; break;
          case 'dueDate': cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); break;
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

  async getCreditById(id: string): Promise<Credit | null> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.credits.find(c => c.id === id) || null;
  }

  async createCredit(credit: Omit<Credit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Credit> {
    const maxId = this.credits.reduce((max, c) => Math.max(max, parseInt(c.id.split('-')[1])), 0);
    const now = new Date().toISOString();
    const newCredit: Credit = {
      ...credit,
      id: `cred-${maxId + 1}`,
      createdAt: now,
      updatedAt: now
    };
    this.credits.unshift(newCredit);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return newCredit;
  }

  async updateCredit(id: string, credit: Partial<Credit>): Promise<Credit | null> {
    const idx = this.credits.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.credits[idx] = { ...this.credits[idx], ...credit, updatedAt: new Date().toISOString() };
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.credits[idx];
  }

  async deleteCredit(id: string): Promise<boolean> {
    const idx = this.credits.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.credits.splice(idx, 1);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return true;
  }

  async addPayment(creditId: string, payment: Omit<Credit['payments'][0], 'id'>): Promise<Credit | null> {
    const idx = this.credits.findIndex(c => c.id === creditId);
    if (idx === -1) return null;
    const credit = this.credits[idx];
    const maxPaymentId = credit.payments.reduce((max, p) => Math.max(max, parseInt(p.id.split('-')[1])), 0);
    const newPayment: CreditPayment = {
      ...payment,
      id: `cp-${maxPaymentId + 1}`
    };
    credit.payments.push(newPayment);
    credit.paidAmount += payment.amount;
    credit.remainingBalance = Math.max(0, credit.initialAmount - credit.paidAmount);
    credit.updatedAt = new Date().toISOString();
    if (credit.remainingBalance === 0) {
      credit.status = 'paid';
    }
    await new Promise(resolve => setTimeout(resolve, delay()));
    return credit;
  }

  async getCreditsByCustomer(customerId: string): Promise<Credit[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.credits.filter(c => c.customerId === customerId);
  }

  async getOverdueCredits(): Promise<Credit[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    const now = new Date().getTime();
    return this.credits.filter(c =>
      c.status === 'overdue' || (c.remainingBalance > 0 && new Date(c.dueDate).getTime() < now && c.status !== 'paid' && c.status !== 'cancelled')
    );
  }

  async getPendingCredits(): Promise<Credit[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.credits.filter(c => c.status === 'active');
  }
}

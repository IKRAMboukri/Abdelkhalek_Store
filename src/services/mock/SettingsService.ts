import type { StoreSettings, UserSettings } from '@/types';
import type { ISettingsService } from '@/services/interfaces/ISettingsService';

function delay(): number {
  return Math.floor(Math.random() * 221) + 80;
}

const defaultStoreSettings: StoreSettings = {
  storeName: 'Furniture Store',
  storeEmail: 'info@furniturestore.com',
  storePhone: '+1 (555) 000-0000',
  storeAddress: '123 Main Street, New York, NY 10001',
  currency: 'MAD',
  currencySymbol: 'DH',
  logo: '',
  fiscalYear: '2025',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY'
};

const defaultUsers: UserSettings[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@furniturestore.com', role: 'admin', avatar: '', active: true },
  { id: 'user-2', name: 'Store Manager', email: 'manager@furniturestore.com', role: 'manager', avatar: '', active: true },
  { id: 'user-3', name: 'Sales Representative', email: 'sales@furniturestore.com', role: 'sales', avatar: '', active: true },
  { id: 'user-4', name: 'Viewer Account', email: 'viewer@furniturestore.com', role: 'viewer', avatar: '', active: false }
];

export class SettingsService implements ISettingsService {
  private settings: StoreSettings = { ...defaultStoreSettings };
  private users: UserSettings[] = defaultUsers.map(u => ({ ...u }));

  async getStoreSettings(): Promise<StoreSettings> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return { ...this.settings };
  }

  async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    this.settings = { ...this.settings, ...settings };
    await new Promise(resolve => setTimeout(resolve, delay()));
    return { ...this.settings };
  }

  async getUsers(): Promise<UserSettings[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return [...this.users];
  }

  async createUser(user: Omit<UserSettings, 'id'>): Promise<UserSettings> {
    const maxId = this.users.reduce((max, u) => Math.max(max, parseInt(u.id.split('-')[1])), 0);
    const newUser: UserSettings = {
      ...user,
      id: `user-${maxId + 1}`
    };
    this.users.unshift(newUser);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return newUser;
  }

  async updateUser(id: string, user: Partial<UserSettings>): Promise<UserSettings | null> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...user };
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.users[idx];
  }

  async deleteUser(id: string): Promise<boolean> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return true;
  }
}

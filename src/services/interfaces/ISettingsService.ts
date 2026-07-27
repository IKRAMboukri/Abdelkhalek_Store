import type { StoreSettings, UserSettings } from '@/types';

export interface ISettingsService {
  getStoreSettings(): Promise<StoreSettings>;
  updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings>;
  getUsers(): Promise<UserSettings[]>;
  createUser(user: Omit<UserSettings, 'id'>): Promise<UserSettings>;
  updateUser(id: string, user: Partial<UserSettings>): Promise<UserSettings | null>;
  deleteUser(id: string): Promise<boolean>;
}

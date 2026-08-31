import type { ISettingsService } from '@/services/interfaces';
import type { StoreSettings, UserSettings } from '@/types';
import { del, get, post, put } from './client';
import { mapStoreSettings, mapUserSettings, type RawStoreSettings, type RawUserSettings } from './mappers';

const BASE = '/api/v1/settings';

export class SettingsService implements ISettingsService {
  async getStoreSettings(): Promise<StoreSettings> {
    return mapStoreSettings(await get<RawStoreSettings>(BASE));
  }

  async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    return mapStoreSettings(await put<RawStoreSettings>(BASE, settings));
  }

  async uploadLogo(file: File): Promise<StoreSettings> {
    const form = new FormData();
    form.append('file', file);
    const raw = await post<RawStoreSettings>(`${BASE}/logo`, form);
    return mapStoreSettings(raw);
  }

  async getUsers(): Promise<UserSettings[]> {
    const raws = await get<RawUserSettings[]>(`${BASE}/users`);
    return raws.map(mapUserSettings);
  }

  async createUser(user: Omit<UserSettings, 'id'>): Promise<UserSettings> {
    const raw = await post<RawUserSettings>(`${BASE}/users`, user);
    return mapUserSettings(raw);
  }

  async updateUser(id: string, user: Partial<UserSettings>): Promise<UserSettings | null> {
    const raw = await put<RawUserSettings>(`${BASE}/users/${id}`, user);
    return raw ? mapUserSettings(raw) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    return del(`${BASE}/users/${id}`);
  }
}

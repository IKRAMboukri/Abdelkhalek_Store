import type { INotificationService } from '@/services/interfaces';
import type { Notification } from '@/types';
import { del, get, post, put } from './client';
import { mapNotification, type RawNotification } from './mappers';

const BASE = '/api/v1/notifications';

export class NotificationService implements INotificationService {
  async getNotifications(): Promise<Notification[]> {
    const raws = await get<RawNotification[]>(BASE);
    return raws.map(mapNotification);
  }

  async markAsRead(id: string): Promise<boolean> {
    await put<RawNotification>(`${BASE}/${id}/read`);
    return true;
  }

  async markAllAsRead(): Promise<boolean> {
    await put<{ count: number }>(`${BASE}/read-all`);
    return true;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return del(`${BASE}/${id}`);
  }

  async getUnreadCount(): Promise<number> {
    const result = await get<{ count: number }>(`${BASE}/unread-count`);
    return result.count;
  }

  async createNotification(
    notification: Omit<Notification, 'id' | 'createdAt'>,
  ): Promise<Notification> {
    const raw = await post<RawNotification>(BASE, notification);
    return mapNotification(raw);
  }
}

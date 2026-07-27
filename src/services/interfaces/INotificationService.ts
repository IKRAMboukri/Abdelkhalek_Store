import type { Notification } from '@/types';

export interface INotificationService {
  getNotifications(): Promise<Notification[]>;
  markAsRead(id: string): Promise<boolean>;
  markAllAsRead(): Promise<boolean>;
  deleteNotification(id: string): Promise<boolean>;
  getUnreadCount(): Promise<number>;
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
}

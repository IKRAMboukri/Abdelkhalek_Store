import type { Notification } from '@/types';
import type { INotificationService } from '@/services/interfaces/INotificationService';
import { mockNotifications } from '@/mocks/notifications';

function delay(): number {
  return Math.floor(Math.random() * 221) + 80;
}

export class NotificationService implements INotificationService {
  private notifications: Notification[] = [...mockNotifications];

  async getNotifications(): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return [...this.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async markAsRead(id: string): Promise<boolean> {
    const idx = this.notifications.findIndex(n => n.id === id);
    if (idx === -1) return false;
    this.notifications[idx].read = true;
    await new Promise(resolve => setTimeout(resolve, delay()));
    return true;
  }

  async markAllAsRead(): Promise<boolean> {
    this.notifications.forEach(n => { n.read = true; });
    await new Promise(resolve => setTimeout(resolve, delay()));
    return true;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const idx = this.notifications.findIndex(n => n.id === id);
    if (idx === -1) return false;
    this.notifications.splice(idx, 1);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return true;
  }

  async getUnreadCount(): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, delay()));
    return this.notifications.filter(n => !n.read).length;
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const maxId = this.notifications.reduce((max, n) => Math.max(max, parseInt(n.id.split('-')[1])), 0);
    const newNotification: Notification = {
      ...notification,
      id: `notif-${maxId + 1}`,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(newNotification);
    await new Promise(resolve => setTimeout(resolve, delay()));
    return newNotification;
  }
}

import { Injectable } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications: Notification[] = [];

  show(notification: Omit<Notification, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const fullNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    this.notifications.push(fullNotification);

    setTimeout(() => {
      this.remove(id);
    }, fullNotification.duration);

    return id;
  }

  success(title: string, message: string, duration?: number) {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number) {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number) {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number) {
    return this.show({ type: 'info', title, message, duration });
  }

  remove(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  getNotifications() {
    return this.notifications;
  }

  clear() {
    this.notifications = [];
  }
}

import { memory, Notification } from '../state/memory';

interface ListNotificationsParams {
  userId: string;
  unreadOnly?: boolean;
  type?: Notification['type'];
  limit?: number;
}

export const listNotifications = (params: ListNotificationsParams): Notification[] => {
  let notifications = Array.from(memory.notifications.values()).filter(
    (n) => n.userId === params.userId
  );

  if (params.unreadOnly) {
    notifications = notifications.filter((n) => !n.isRead);
  }

  if (params.type) {
    notifications = notifications.filter((n) => n.type === params.type);
  }

  // Sort by createdAt descending (newest first)
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (params.limit) {
    notifications = notifications.slice(0, params.limit);
  }

  return notifications;
};

export const getUnreadCount = (userId: string): number => {
  return Array.from(memory.notifications.values()).filter((n) => n.userId === userId && !n.isRead)
    .length;
};

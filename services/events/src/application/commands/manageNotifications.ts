import { memory } from '../state/memory';

export const markNotificationRead = (notificationId: string, userId: string): boolean => {
  const notification = memory.notifications.get(notificationId);
  if (!notification || notification.userId !== userId) return false;

  memory.notifications.set(notificationId, {
    ...notification,
    isRead: true,
  });

  return true;
};

export const markAllNotificationsRead = (userId: string): number => {
  let count = 0;

  for (const [id, notification] of memory.notifications.entries()) {
    if (notification.userId === userId && !notification.isRead) {
      memory.notifications.set(id, {
        ...notification,
        isRead: true,
      });
      count++;
    }
  }

  return count;
};

export const deleteNotification = (notificationId: string, userId: string): boolean => {
  const notification = memory.notifications.get(notificationId);
  if (!notification || notification.userId !== userId) return false;

  memory.notifications.delete(notificationId);
  return true;
};

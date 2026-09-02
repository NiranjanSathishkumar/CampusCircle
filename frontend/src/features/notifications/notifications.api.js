/**
 * notifications.api.js — In-app notification bell client.
 *
 * Backed by /api/notifications (see backend notifications.routes.js &
 * notifications.controller.js). Student-only: reading is all this exposes —
 * notifications are created server-side by notification.service.js, never
 * from a client call.
 */
import { apiFetch } from '@/shared/api/httpClient';

/**
 * List the signed-in student's notifications, most recent first.
 * @param {{ page?: number, limit?: number, unreadOnly?: boolean, type?: string }} params
 */
export const fetchNotifications = ({ page = 1, limit = 20, unreadOnly, type } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (unreadOnly) params.set('unreadOnly', 'true');
  if (type) params.set('type', type);
  return apiFetch(`/notifications?${params.toString()}`, {
    method: 'GET',
    role: 'student',
  });
};

export const fetchUnreadCount = () =>
  apiFetch('/notifications/unread-count', { method: 'GET', role: 'student' });

export const markNotificationRead = (notificationId) =>
  apiFetch(`/notifications/${notificationId}/read`, { method: 'PATCH', role: 'student' });

export const markAllNotificationsRead = () =>
  apiFetch('/notifications/read-all', { method: 'PATCH', role: 'student' });

export const deleteNotification = (notificationId) =>
  apiFetch(`/notifications/${notificationId}`, { method: 'DELETE', role: 'student' });

export const clearReadNotifications = () =>
  apiFetch('/notifications/clear-read', { method: 'DELETE', role: 'student' });

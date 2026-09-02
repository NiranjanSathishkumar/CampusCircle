/**
 * organizerNotifications.api.js — Organizer topbar bell client.
 *
 * Backed by the same /api/notifications routes as the student bell (see
 * backend notifications.routes.js/notifications.controller.js) — the
 * `role: 'organizer'` tag below is what scopes reads to this community's
 * own notifications (recipientType: "Community" server-side). Reading is
 * all this exposes; notifications are created server-side by
 * notification.service.js, never from a client call.
 */
import { apiFetch } from '@/shared/api/httpClient';

/**
 * List the signed-in organizer's notifications, most recent first.
 * @param {{ page?: number, limit?: number, unreadOnly?: boolean, type?: string }} params
 */
export const fetchOrganizerNotifications = ({ page = 1, limit = 20, unreadOnly, type } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (unreadOnly) params.set('unreadOnly', 'true');
  if (type) params.set('type', type);
  return apiFetch(`/notifications?${params.toString()}`, {
    method: 'GET',
    role: 'organizer',
  });
};

export const fetchOrganizerUnreadCount = () =>
  apiFetch('/notifications/unread-count', { method: 'GET', role: 'organizer' });

export const markOrganizerNotificationRead = (notificationId) =>
  apiFetch(`/notifications/${notificationId}/read`, { method: 'PATCH', role: 'organizer' });

export const markAllOrganizerNotificationsRead = () =>
  apiFetch('/notifications/read-all', { method: 'PATCH', role: 'organizer' });

export const deleteOrganizerNotification = (notificationId) =>
  apiFetch(`/notifications/${notificationId}`, { method: 'DELETE', role: 'organizer' });

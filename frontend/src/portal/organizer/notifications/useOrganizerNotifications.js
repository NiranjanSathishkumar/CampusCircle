/**
 * useOrganizerNotifications.js — Live state for the organizer topbar bell.
 * Mirrors frontend/src/features/notifications/useNotifications.js (the
 * student navbar bell) exactly, swapped to the organizer-scoped API client
 * and useOrganizerAuth. Polls the unread badge count while an organizer is
 * logged in; fetches the list lazily (call refreshList when the dropdown
 * opens). Read/dismiss actions update local state optimistically and
 * re-sync from the server only if the request fails.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
import {
  fetchOrganizerNotifications,
  fetchOrganizerUnreadCount,
  markOrganizerNotificationRead,
  markAllOrganizerNotificationsRead,
  deleteOrganizerNotification,
} from './organizerNotifications.api';
import { mapOrganizerNotification } from './organizerNotifications.utils';

const POLL_INTERVAL_MS = 60000;

export function useOrganizerNotifications() {
  const { isOrganizerLoggedIn } = useOrganizerAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const loadedRef = useRef(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { count } = await fetchOrganizerUnreadCount();
      setUnreadCount(count);
    } catch {
      // Transient failure — keep the last-known badge count.
    }
  }, []);

  const refreshList = useCallback(async () => {
    setLoading(true);
    try {
      const { notifications: raw } = await fetchOrganizerNotifications({ limit: 20 });
      setNotifications(raw.map(mapOrganizerNotification));
      loadedRef.current = true;
    } catch {
      // Transient failure — keep whatever list is already rendered.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOrganizerLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      loadedRef.current = false;
      return;
    }
    refreshUnreadCount();
    const id = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isOrganizerLoggedIn, refreshUnreadCount]);

  const ensureListLoaded = useCallback(() => {
    if (!loadedRef.current) refreshList();
  }, [refreshList]);

  const markRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    markOrganizerNotificationRead(id).catch(() => {
      refreshList();
      refreshUnreadCount();
    });
  }, [refreshList, refreshUnreadCount]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
    markAllOrganizerNotificationsRead().catch(() => {
      refreshList();
      refreshUnreadCount();
    });
  }, [refreshList, refreshUnreadCount]);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target?.unread) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.filter((n) => n.id !== id);
    });
    deleteOrganizerNotification(id).catch(() => {
      refreshList();
      refreshUnreadCount();
    });
  }, [refreshList, refreshUnreadCount]);

  return { notifications, unreadCount, loading, ensureListLoaded, markRead, markAllRead, dismiss };
}

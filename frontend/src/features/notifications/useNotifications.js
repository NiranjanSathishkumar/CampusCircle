/**
 * useNotifications.js — Live state for the navbar bell dropdown.
 * Polls the unread badge count while a student is logged in; fetches the
 * list lazily (call refreshList when the dropdown opens). Read/dismiss
 * actions update local state optimistically and re-sync from the server
 * only if the request fails.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/shared/auth/useAuth';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from './notifications.api';
import { mapNotification } from './notifications.utils';

const POLL_INTERVAL_MS = 60000;

export function useNotifications() {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const loadedRef = useRef(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { count } = await fetchUnreadCount();
      setUnreadCount(count);
    } catch {
      // Transient failure — keep the last-known badge count.
    }
  }, []);

  const refreshList = useCallback(async () => {
    setLoading(true);
    try {
      const { notifications: raw } = await fetchNotifications({ limit: 20 });
      setNotifications(raw.map(mapNotification));
      loadedRef.current = true;
    } catch {
      // Transient failure — keep whatever list is already rendered.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      loadedRef.current = false;
      return;
    }
    refreshUnreadCount();
    const id = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isLoggedIn, refreshUnreadCount]);

  const ensureListLoaded = useCallback(() => {
    if (!loadedRef.current) refreshList();
  }, [refreshList]);

  const markRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    markNotificationRead(id).catch(() => {
      refreshList();
      refreshUnreadCount();
    });
  }, [refreshList, refreshUnreadCount]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
    markAllNotificationsRead().catch(() => {
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
    deleteNotification(id).catch(() => {
      refreshList();
      refreshUnreadCount();
    });
  }, [refreshList, refreshUnreadCount]);

  return { notifications, unreadCount, loading, ensureListLoaded, markRead, markAllRead, dismiss };
}

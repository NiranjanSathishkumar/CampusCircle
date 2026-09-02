/**
 * AdminAuthContext.jsx — session for the single platform-owner Admin account.
 * Structurally mirrors OrganizerAuthContext (a real Context, not a plain
 * hook, so exactly one refresh-on-mount runs per app load — see that file's
 * header comment for why concurrent hook instances were a bug).
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { setSession, clearSession } from '@/shared/api/tokenStore';
import { registerRefreshHandler, unregisterRefreshHandler, refreshFor } from '@/shared/api/refreshCoordinator';
import { canAttemptRefreshAs, setActiveRole, clearActiveRole } from './activeRole';
import { adminLogin, adminRefresh, adminLogout, getAdminProfile } from './auth.api';

const STORAGE_KEY = 'campuscircle_admin_session';

function readCachedAdmin() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }
  return null;
}

function cacheAdmin(adminData) {
  try {
    if (adminData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(readCachedAdmin);
  const [initializing, setInitializing] = useState(true);

  const isAdminLoggedIn = Boolean(admin);

  // Just the token exchange, shared by the startup silent-refresh and by
  // httpClient's on-demand refresh when a protected call 401s mid-session.
  const performRefresh = useCallback(async () => {
    const { accessToken } = await adminRefresh();
    setSession(accessToken, 'admin');
    setActiveRole('admin');
    return accessToken;
  }, []);

  // Registered with httpClient so an expired access token gets refreshed
  // and the original request retried automatically instead of just failing
  // (access tokens live 15 minutes; nothing else was renewing them).
  const handleUnauthorized = useCallback(async () => {
    try {
      return await performRefresh();
    } catch (err) {
      clearSession('admin');
      clearActiveRole('admin');
      cacheAdmin(null);
      setAdmin(null);
      throw err;
    }
  }, [performRefresh]);

  useEffect(() => {
    registerRefreshHandler('admin', handleUnauthorized);
    return () => unregisterRefreshHandler('admin');
  }, [handleUnauthorized]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!canAttemptRefreshAs('admin')) {
        // No known admin session on this browser (or it was explicitly
        // logged out of) — any admin data seeded from localStorage at mount
        // is stale and must not be trusted as "logged in", or
        // RequireAdminAuth would wave through a request-less visitor with
        // whatever access token happens to be sitting in tokenStore.
        cacheAdmin(null);
        setAdmin(null);
        setInitializing(false);
        return;
      }

      try {
        // Goes through the shared per-role coordinator, not performRefresh()
        // directly: React 18 StrictMode double-invokes this effect on mount
        // in dev, and the refresh token is single-use (rotated atomically
        // server-side) — two direct concurrent calls would race, and the
        // loser's 403 response clears the httpOnly cookie the winner had
        // just set, wiping out the very session this effect just restored.
        // refreshFor coalesces the second invocation onto the first's
        // in-flight promise instead of firing a duplicate request.
        await refreshFor('admin');
      } catch {
        clearSession('admin');
        clearActiveRole('admin');
        cacheAdmin(null);
        if (!cancelled) setAdmin(null);
        if (!cancelled) setInitializing(false);
        return;
      }

      try {
        const { admin: profile } = await getAdminProfile();
        if (!cancelled) {
          setAdmin(profile);
          cacheAdmin(profile);
        }
      } catch {
        // Refresh succeeded — session is valid — the profile fetch itself
        // just failed for some unrelated reason. Don't discard a good token.
      }
      if (!cancelled) setInitializing(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [performRefresh]);

  const loginAsAdmin = useCallback(async (email, password) => {
    const { accessToken } = await adminLogin({ email, password });
    setSession(accessToken, 'admin');
    setActiveRole('admin');
    const { admin: profile } = await getAdminProfile();
    setAdmin(profile);
    cacheAdmin(profile);
    return profile;
  }, []);

  const logoutAdmin = useCallback(async () => {
    try {
      await adminLogout();
    } finally {
      clearSession('admin');
      clearActiveRole('admin');
      cacheAdmin(null);
      setAdmin(null);
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, isAdminLoggedIn, initializing, loginAsAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth() must be used within <AdminAuthProvider>');
  }
  return context;
}

export default useAdminAuth;

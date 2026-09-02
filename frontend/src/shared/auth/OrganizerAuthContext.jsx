/**
 * OrganizerAuthContext.jsx — shared-login session for the Organiser Portal.
 * Deliberately separate from AuthContext (student identity) since a
 * community login represents a shared credential, not a single person.
 *
 * A real Context (not a plain hook) on purpose: every consumer used to get
 * its own independent state and its own mount-time silent-refresh effect,
 * which meant every organizer page fired 2-3 concurrent
 * POST /api/organizer/refresh calls (OrganizerLayout + OrganizerFooter + the
 * routed page all call useOrganizerAuth()). Refresh tokens are single-use —
 * rotated in the DB on each call — so only the first of those concurrent
 * calls to land actually succeeds; the rest come back "Refresh Token
 * Revoked" and wiped the in-memory session the winner had just set. A single
 * Provider instance means the refresh only ever runs once per portal visit.
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { setSession, clearSession } from '@/shared/api/tokenStore';
import { registerRefreshHandler, unregisterRefreshHandler, refreshFor } from '@/shared/api/refreshCoordinator';
import { canAttemptRefreshAs, setActiveRole, clearActiveRole } from './activeRole';
import { organizerLogin, organizerRefresh, organizerLogout, getCommunityProfile } from './auth.api';

const STORAGE_KEY = 'campuscircle_organizer_session';

function readCachedCommunity() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }
  return null;
}

function cacheCommunity(communityData) {
  try {
    if (communityData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(communityData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

const OrganizerAuthContext = createContext(null);

export function OrganizerAuthProvider({ children }) {
  const [community, setCommunity] = useState(readCachedCommunity);
  const [initializing, setInitializing] = useState(true);

  const isOrganizerLoggedIn = Boolean(community);

  // Just the token exchange, shared by the startup silent-refresh and by
  // httpClient's on-demand refresh when a protected call 401s mid-session.
  const performRefresh = useCallback(async () => {
    const { accessToken } = await organizerRefresh();
    setSession(accessToken, 'organizer');
    setActiveRole('organizer');
    return accessToken;
  }, []);

  // Registered with httpClient so an expired access token gets refreshed
  // and the original request retried automatically instead of just failing
  // (access tokens live 15 minutes; nothing else was renewing them).
  const handleUnauthorized = useCallback(async () => {
    try {
      return await performRefresh();
    } catch (err) {
      clearSession('organizer');
      clearActiveRole('organizer');
      cacheCommunity(null);
      setCommunity(null);
      throw err;
    }
  }, [performRefresh]);

  useEffect(() => {
    registerRefreshHandler('organizer', handleUnauthorized);
    return () => unregisterRefreshHandler('organizer');
  }, [handleUnauthorized]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!canAttemptRefreshAs('organizer')) {
        // No known organizer session on this browser (or it was explicitly
        // logged out of) — any community data seeded from localStorage at
        // mount is stale and must not be trusted as "logged in", or
        // RequireOrganizerAuth would wave through a request-less visitor
        // with whatever access token happens to be sitting in tokenStore.
        cacheCommunity(null);
        setCommunity(null);
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
        await refreshFor('organizer');
      } catch {
        clearSession('organizer');
        clearActiveRole('organizer');
        cacheCommunity(null);
        if (!cancelled) setCommunity(null);
        if (!cancelled) setInitializing(false);
        return;
      }

      try {
        const { community: profile } = await getCommunityProfile();
        if (!cancelled) {
          setCommunity(profile);
          cacheCommunity(profile);
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

  const loginAsOrganizer = useCallback(async (email, password) => {
    const { accessToken } = await organizerLogin({ email, password });
    setSession(accessToken, 'organizer');
    setActiveRole('organizer');
    const { community: profile } = await getCommunityProfile();
    setCommunity(profile);
    cacheCommunity(profile);
    return profile;
  }, []);

  const logoutOrganizer = useCallback(async () => {
    try {
      await organizerLogout();
    } finally {
      clearSession('organizer');
      clearActiveRole('organizer');
      cacheCommunity(null);
      setCommunity(null);
    }
  }, []);

  // Lets pages that mutate the community doc (settings, roster, ...) push
  // the server's fresh copy back into the shared session instead of every
  // page independently re-fetching or drifting from what's actually saved.
  const updateCommunity = useCallback((profile) => {
    setCommunity(profile);
    cacheCommunity(profile);
  }, []);

  return (
    <OrganizerAuthContext.Provider
      value={{ community, isOrganizerLoggedIn, initializing, loginAsOrganizer, logoutOrganizer, updateCommunity }}
    >
      {children}
    </OrganizerAuthContext.Provider>
  );
}

export function useOrganizerAuth() {
  const context = useContext(OrganizerAuthContext);
  if (!context) {
    throw new Error('useOrganizerAuth() must be used within <OrganizerAuthProvider>');
  }
  return context;
}

export default useOrganizerAuth;

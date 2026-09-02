import { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { setSession, clearSession } from '@/shared/api/tokenStore';
import { registerRefreshHandler, unregisterRefreshHandler, refreshFor } from '@/shared/api/refreshCoordinator';
import { canAttemptRefreshAs, setActiveRole, clearActiveRole } from './activeRole';
import { studentSignup, studentLogin, studentRefresh, studentLogout, getStudentProfile } from './auth.api';

export const AuthContext = createContext();

// Thrown by signup() specifically when account creation succeeded but the
// automatic follow-up login didn't (rate limit, transient error, etc.) — so
// callers can tell "you're not registered" apart from "you're registered,
// just not signed in yet" instead of showing the same generic failure for
// both and leaving the user to resubmit into a confusing "User Already
// Exists" on their next attempt.
export class AutoLoginAfterSignupError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AutoLoginAfterSignupError';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True until the silent-refresh-on-load attempt (using the httpOnly refresh
  // cookie) resolves, so pages can avoid flashing a "logged out" state.
  const [initializing, setInitializing] = useState(true);

  const isLoggedIn = Boolean(user);

  const hydrateProfile = useCallback(async () => {
    const { user: profile } = await getStudentProfile();
    setUser(profile);
    return profile;
  }, []);

  // Just the token exchange, shared by the startup silent-refresh and by
  // httpClient's on-demand refresh when a protected call 401s mid-session.
  const performRefresh = useCallback(async () => {
    const { accessToken } = await studentRefresh();
    setSession(accessToken, 'student');
    setActiveRole('student');
    return accessToken;
  }, []);

  // Registered with httpClient so an expired access token gets refreshed
  // and the original request retried automatically instead of just failing
  // (access tokens live 15 minutes; nothing else was renewing them).
  const handleUnauthorized = useCallback(async () => {
    try {
      return await performRefresh();
    } catch (err) {
      clearSession('student');
      clearActiveRole('student');
      setUser(null);
      throw err;
    }
  }, [performRefresh]);

  useEffect(() => {
    registerRefreshHandler('student', handleUnauthorized);
    return () => unregisterRefreshHandler('student');
  }, [handleUnauthorized]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Another role (organizer/admin) is known to hold the browser's one
      // shared refresh cookie — attempting our own refresh would just get
      // it cleared out from under them (see activeRole.js).
      if (!canAttemptRefreshAs('student')) {
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
        await refreshFor('student');
      } catch {
        // No valid student session — this is the ordinary logged-out state,
        // not an error.
        clearSession('student');
        clearActiveRole('student');
        if (!cancelled) setUser(null);
        if (!cancelled) setInitializing(false);
        return;
      }

      try {
        if (!cancelled) await hydrateProfile();
      } catch {
        // The refresh itself succeeded — the session is genuinely valid —
        // this is just the profile fetch failing for some unrelated reason
        // (network blip, transient 500). Don't discard a token that's still
        // good; leave it for the next profile read to retry.
      }
      if (!cancelled) setInitializing(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [performRefresh, hydrateProfile]);

  const login = useCallback(
    async (email, password) => {
      const { accessToken } = await studentLogin({ email, password });
      setSession(accessToken, 'student');
      setActiveRole('student');
      return hydrateProfile();
    },
    [hydrateProfile]
  );

  const signup = useCallback(
    async (name, email, password, extra = {}) => {
      await studentSignup({ name, email, password, ...extra });
      try {
        return await login(email, password);
      } catch (err) {
        throw new AutoLoginAfterSignupError(
          "Your account was created, but we couldn't sign you in automatically. Please sign in."
        );
      }
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await studentLogout();
    } finally {
      clearSession('student');
      clearActiveRole('student');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, initializing, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth };

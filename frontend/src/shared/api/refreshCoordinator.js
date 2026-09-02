/**
 * refreshCoordinator.js — lets each role's auth Context register how to
 * silently refresh its own access token, and lets httpClient trigger that
 * refresh when a protected call comes back 401 (access tokens expire after
 * 15 minutes with nothing else renewing them).
 *
 * One in-flight promise per role (not a single shared one) is enforced
 * here: if several protected requests 401 around the same moment (several
 * components' data fetches firing together right after the token expires),
 * each would otherwise call that role's refresh endpoint independently.
 * Refresh tokens are single-use/rotated server-side, so only the first of
 * those concurrent calls succeeds and the rest come back "Refresh Token
 * Revoked" — the same class of bug that concurrent mount-time refreshes had
 * (see OrganizerAuthContext.jsx). Coalescing into one shared promise per
 * role means every caller for that role awaits the same outcome instead of
 * racing — keyed by role (not a single global slot) because a student,
 * organizer, and admin session can now genuinely coexist in the same
 * browser (role-specific refresh cookies — see
 * backend/src/utils/refreshAuth.js), so a concurrent 401 from two different
 * roles must not make the second one piggyback on the first role's
 * in-flight refresh.
 */
const handlers = new Map(); // role -> () => Promise<accessToken>
const inFlightByRole = new Map(); // role -> Promise<accessToken>

export function registerRefreshHandler(role, handler) {
  handlers.set(role, handler);
}

export function unregisterRefreshHandler(role) {
  handlers.delete(role);
}

// Returns a shared in-flight refresh promise for `role`, starting one if
// none is running for that role. Returns null if no handler is registered
// (e.g. the app never logged in as that role this session) — nothing to
// retry with.
export function refreshFor(role) {
  const handler = handlers.get(role);
  if (!handler) return null;
  if (!inFlightByRole.has(role)) {
    const promise = handler().finally(() => {
      inFlightByRole.delete(role);
    });
    inFlightByRole.set(role, promise);
  }
  return inFlightByRole.get(role);
}

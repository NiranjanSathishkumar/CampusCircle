/**
 * tokenStore.js — in-memory access-token holder, one slot per role.
 * Deliberately not React state and not persisted: each role's refresh token
 * (an httpOnly, role-specific cookie — see backend/src/utils/refreshAuth.js)
 * is the durable session; the slot here is rebuilt via that role's own
 * silent refresh whenever the page reloads.
 *
 * Keyed by role rather than a single shared slot: role-specific refresh
 * cookies mean a student, organizer, and admin session can genuinely
 * coexist in the same browser now. A single global slot would have
 * whichever role's silent refresh happened to resolve last silently
 * clobber the access token every other role's requests were relying on.
 */
const tokens = new Map(); // role -> accessToken

export function setSession(token, role) {
  tokens.set(role, token);
}

export function clearSession(role) {
  tokens.delete(role);
}

export function getAccessToken(role) {
  return tokens.get(role) || null;
}

/**
 * activeRole.js — tracks which role(s) this browser is known to have an
 * active session for, so each role's silent-refresh-on-load only fires when
 * there's an actual reason to expect a cookie for it.
 *
 * A set, not a single value: the backend now writes one cookie per role
 * (refreshToken_student / _organizer / _admin — see
 * backend/src/utils/refreshAuth.js) instead of a single shared name, so a
 * student, organizer, and admin session can genuinely coexist in the same
 * browser (e.g. across tabs) without one overwriting another's cookie. This
 * is just a hint, not a credential — the httpOnly cookies are the real
 * source of truth and can't be read from JS anyway — but it lets each
 * role's Provider skip its refresh call entirely when there's no reason to
 * believe that role is logged in, instead of every role blindly pinging its
 * refresh endpoint on every single page load (wasteful, and burns through
 * that endpoint's rate limit for visitors who were never using it).
 */
const STORAGE_KEY = 'campuscircle_active_roles';

function readRoles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRoles(roles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
  } catch {
    /* ignore */
  }
}

export function setActiveRole(role) {
  const roles = readRoles();
  if (!roles.includes(role)) {
    writeRoles([...roles, role]);
  }
}

export function clearActiveRole(role) {
  writeRoles(readRoles().filter((r) => r !== role));
}

// Only attempt `role`'s silent refresh when this browser has previously
// logged in as that role and hasn't explicitly logged out of it since.
export function canAttemptRefreshAs(role) {
  return readRoles().includes(role);
}

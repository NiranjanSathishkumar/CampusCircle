/**
 * useOrganizerAuth.js — re-export so existing imports keep working.
 * The hook and its Provider now live in OrganizerAuthContext.jsx; see that
 * file's header comment for why this became a real Context.
 */
export { useOrganizerAuth, OrganizerAuthProvider } from './OrganizerAuthContext';
export { default } from './OrganizerAuthContext';

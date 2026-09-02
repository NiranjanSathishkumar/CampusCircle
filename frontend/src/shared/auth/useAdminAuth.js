/**
 * useAdminAuth.js — re-export so existing imports keep working.
 * The hook and its Provider now live in AdminAuthContext.jsx; see
 * OrganizerAuthContext.jsx's header comment for why this became a real
 * Context.
 */
export { useAdminAuth, AdminAuthProvider } from './AdminAuthContext';
export { default } from './AdminAuthContext';

/**
 * dashboard.api.js — Organizer dashboard overview (stats, next event
 * spotlight, active recruitment drive, partial activity feed).
 * Mounted at /api/community/dashboard (see backend communities.routes.js) —
 * organizer-authenticated, scoped to the logged-in community.
 */
import { apiFetch } from '@/shared/api/httpClient';

export const getDashboardOverview = (timeframe = 'week') =>
  apiFetch(`/community/dashboard?timeframe=${timeframe}`, { method: 'GET', role: 'organizer' });

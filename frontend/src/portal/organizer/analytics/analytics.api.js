/**
 * analytics.api.js — Organizer's own community analytics overview.
 * Mounted at /api/community/analytics (see backend communities.routes.js) —
 * organizer-authenticated, scoped to the logged-in community.
 *
 * Per-event analytics deliberately has no dedicated endpoint/client here —
 * it's built client-side (see analyticsMapper.js) from the existing
 * getEvent/listEventRegistrations calls in
 * @/portal/organizer/events/events.api.js, the same way
 * OrganizerEventDetailPage.jsx already computes its own Analytics tab.
 */
import { apiFetch } from '@/shared/api/httpClient';

export const getOverviewAnalytics = () =>
  apiFetch('/community/analytics/overview', { method: 'GET', role: 'organizer' });

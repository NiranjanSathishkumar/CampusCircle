/**
 * admin.api.js — Platform-wide admin actions: organizer/community management
 * and the cross-community shared-login audit trail. Mounted at /api/admin
 * (see backend routes.js) — every call here is admin-authenticated.
 */
import { apiFetch } from '@/shared/api/httpClient';

export const listOrganizers = ({ page = 1, limit = 100, search, category, isActive } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (isActive !== undefined) params.set('isActive', String(isActive));
  return apiFetch(`/admin/organizers?${params.toString()}`, { method: 'GET', role: 'admin' });
};

export const createOrganizer = (data) =>
  apiFetch('/admin/organizers', { method: 'POST', body: data, role: 'admin' });

export const updateOrganizerStatus = (organizerId, isActive) =>
  apiFetch(`/admin/organizers/${organizerId}/status`, { method: 'PATCH', body: { isActive }, role: 'admin' });

export const listAuditLogs = ({ community, page = 1, limit = 100 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (community) params.set('community', community);
  return apiFetch(`/admin/audit-logs?${params.toString()}`, { method: 'GET', role: 'admin' });
};

export const getDashboardOverview = () =>
  apiFetch('/admin/dashboard', { method: 'GET', role: 'admin' });

export const listStudents = ({ page = 1, limit = 500, search, branch } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  if (branch) params.set('branch', branch);
  return apiFetch(`/admin/students?${params.toString()}`, { method: 'GET', role: 'admin' });
};

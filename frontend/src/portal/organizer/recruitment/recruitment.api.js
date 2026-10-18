/**
 * recruitment.api.js — Recruitment drives (CommunityRecruitment) and their
 * applications, mounted at /api/recruitment (see backend recruitment.routes.js).
 *
 * NOTE: selecting an applicant (updateApplicationStatus with status:
 * "selected") creates a CommunityMembership record server-side — a
 * different model from Community.coreTeam, which is what the Committee
 * Roster page (roster.api.js, /organizer/roster) reads. The two member
 * lists are independent; this file doesn't touch coreTeam at all.
 */
import { apiFetch } from '@/shared/api/httpClient';

export const listCommunityDrives = (communityId, { isOpen, page = 1, limit = 100 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (isOpen !== undefined) params.set('isOpen', String(isOpen));
  return apiFetch(`/recruitment/communities/${communityId}/drives?${params.toString()}`, { method: 'GET', role: 'organizer' });
};

export const getDrive = (recruitmentId) =>
  apiFetch(`/recruitment/drives/${recruitmentId}`, { method: 'GET', role: 'organizer' });

export const createDrive = (data) =>
  apiFetch('/recruitment/drives', { method: 'POST', body: data, role: 'organizer' });

export const updateDrive = (recruitmentId, data) =>
  apiFetch(`/recruitment/drives/${recruitmentId}`, { method: 'PATCH', body: data, role: 'organizer' });

export const deleteDrive = (recruitmentId) =>
  apiFetch(`/recruitment/drives/${recruitmentId}`, { method: 'DELETE', role: 'organizer' });

export const listDriveApplications = (recruitmentId, { status, page = 1, limit = 100 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return apiFetch(`/recruitment/drives/${recruitmentId}/applications?${params.toString()}`, { method: 'GET', role: 'organizer' });
};

export const updateApplicationStatus = (applicationId, status) =>
  apiFetch(`/recruitment/applications/${applicationId}`, { method: 'PATCH', body: { status }, role: 'organizer' });

// ── Membership roster (CommunityMembership) ─────────────────────────
// Populated automatically when an applicant is selected above, but also
// directly manageable here — this is the "Recruitment Roster" page, not
// the separate Committee Roster (Community.coreTeam, roster.api.js).
export const listRecruitmentRoster = ({ page = 1, limit = 100 } = {}) =>
  apiFetch(`/recruitment/members?page=${page}&limit=${limit}`, { method: 'GET', role: 'organizer' });

export const addRosterMember = (data) =>
  apiFetch('/recruitment/members', { method: 'POST', body: data, role: 'organizer' });

export const updateRosterMemberLabel = (membershipId, label, wing) =>
  apiFetch(`/recruitment/members/${membershipId}`, {
    method: 'PATCH',
    body: wing !== undefined ? { label, wing } : { label },
    role: 'organizer',
  });

export const removeRosterMember = (membershipId) =>
  apiFetch(`/recruitment/members/${membershipId}`, { method: 'DELETE', role: 'organizer' });

export const bulkRemoveRosterMembers = (membershipIds) =>
  apiFetch('/recruitment/members/bulk-remove', { method: 'POST', body: { membershipIds }, role: 'organizer' });

/**
 * events.api.js — Student-facing Events (Event/Registration/Bookmark models).
 * Mounted at /api/events (see backend events.routes.js) — every call here is
 * student-authenticated ('mine' routes, register/cancel, bookmark, like) or
 * usable by any authenticated role (browse/detail), so `role: 'student'`
 * throughout matches this page's own session.
 */
import { apiFetch } from '@/shared/api/httpClient';

export const listEvents = ({ tag, search, page = 1, limit = 100 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (tag) params.set('tag', tag);
  if (search) params.set('search', search);
  return apiFetch(`/events?${params.toString()}`, { method: 'GET', role: 'student' });
};

export const getEvent = (eventId) =>
  apiFetch(`/events/${eventId}`, { method: 'GET', role: 'student' });

export const listCommunityEvents = (communityId, { page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch(`/events/communities/${communityId}/events?${params.toString()}`, { method: 'GET', role: 'student' });
};

// teamMembers: [{ studentId, answers }]; answers/teamName only apply as the
// event's registrationType requires — see events.validators.js on the
// backend for the exact shape.
export const registerForEvent = (eventId, { teamName, answers, teamMembers } = {}) =>
  apiFetch(`/events/${eventId}/register`, {
    method: 'POST',
    body: { teamName, answers, teamMembers },
    role: 'student',
  });

export const listMyRegistrations = ({ status, page = 1, limit = 100 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return apiFetch(`/events/registrations/mine?${params.toString()}`, { method: 'GET', role: 'student' });
};

export const getRegistration = (registrationId) =>
  apiFetch(`/events/registrations/${registrationId}`, { method: 'GET', role: 'student' });

export const cancelRegistration = (registrationId, reason) =>
  apiFetch(`/events/registrations/${registrationId}`, {
    method: 'DELETE',
    body: { reason: reason || '' },
    role: 'student',
  });

export const listTeamMembers = (registrationId) =>
  apiFetch(`/events/registrations/${registrationId}/team-members`, { method: 'GET', role: 'student' });

export const addTeamMember = (registrationId, { studentId, answers }) =>
  apiFetch(`/events/registrations/${registrationId}/team-members`, {
    method: 'POST',
    body: { studentId, answers },
    role: 'student',
  });

export const removeTeamMember = (registrationId, teamMemberId) =>
  apiFetch(`/events/registrations/${registrationId}/team-members/${teamMemberId}`, { method: 'DELETE', role: 'student' });

// A team leader's add is really an invite — the student must accept before
// they're a real roster spot. See listMyTeamInvites/respondToTeamInvite below.
export const listMyTeamInvites = () =>
  apiFetch('/events/team-invites/mine', { method: 'GET', role: 'student' });

export const respondToTeamInvite = (registrationId, teamMemberId, action) =>
  apiFetch(`/events/registrations/${registrationId}/team-members/${teamMemberId}/respond`, {
    method: 'PATCH',
    body: { action },
    role: 'student',
  });

// Engagement-funnel beacons for organizer analytics — fire-and-forget, safe
// to call repeatedly (no per-student dedupe on the backend).
export const trackEventView = (eventId) =>
  apiFetch(`/events/${eventId}/view`, { method: 'POST', role: 'student' });

export const trackRegistrationStarted = (eventId) =>
  apiFetch(`/events/${eventId}/registration-started`, { method: 'POST', role: 'student' });

export const bookmarkEvent = (eventId) =>
  apiFetch(`/events/${eventId}/bookmark`, { method: 'POST', role: 'student' });

export const unbookmarkEvent = (eventId) =>
  apiFetch(`/events/${eventId}/bookmark`, { method: 'DELETE', role: 'student' });

export const listMyBookmarks = ({ page = 1, limit = 100 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch(`/events/bookmarks/mine?${params.toString()}`, { method: 'GET', role: 'student' });
};

// Looks up a registered student by their CampusCircle email — how a team
// leader adds a real teammate (the backend needs an actual studentId, not a
// free-text name). Same /profile/lookup endpoint the organizer roster's
// AddMemberModal already uses; requireAuth only, any role.
export const lookupStudentByEmail = (email) =>
  apiFetch(`/profile/lookup?${new URLSearchParams({ email }).toString()}`, { method: 'GET', role: 'student' });

export const uploadPaymentProof = (registrationId, file) => {
  const formData = new FormData();
  formData.append('paymentProof', file);
  return apiFetch(`/events/registrations/${registrationId}/payment-proof`, {
    method: 'POST',
    body: formData,
    role: 'student',
  });
};

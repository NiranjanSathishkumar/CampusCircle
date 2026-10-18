/**
 * events.api.js — Organizer's own Events (Event model): CRUD, banner upload.
 * Mounted at /api/events (see backend events.routes.js) — every call here is
 * organizer-authenticated.
 */
import { apiFetch } from '@/shared/api/httpClient';

// The owning organizer sees every event regardless of isActive/status
// (draft + archived included) — see events.controller.js's
// listCommunityEvents isOwner branch.
export const listCommunityEvents = (communityId, { page = 1, limit = 100 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch(`/events/communities/${communityId}/events?${params.toString()}`, { method: 'GET', role: 'organizer' });
};

export const getEvent = (eventId) =>
  apiFetch(`/events/${eventId}`, { method: 'GET', role: 'organizer' });

export const createEvent = (data) =>
  apiFetch('/events', { method: 'POST', body: data, role: 'organizer' });

export const updateEvent = (eventId, data) =>
  apiFetch(`/events/${eventId}`, { method: 'PATCH', body: data, role: 'organizer' });

export const deleteEvent = (eventId) =>
  apiFetch(`/events/${eventId}`, { method: 'DELETE', role: 'organizer' });

export const uploadEventBanner = (eventId, file) => {
  const formData = new FormData();
  formData.append('banner', file);
  return apiFetch(`/events/${eventId}/banner`, { method: 'PUT', body: formData, role: 'organizer' });
};

export const removeEventBanner = (eventId) =>
  apiFetch(`/events/${eventId}/banner`, { method: 'DELETE', role: 'organizer' });

export const listEventRegistrations = (eventId, { status, page = 1, limit = 100 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return apiFetch(`/events/${eventId}/registrations?${params.toString()}`, { method: 'GET', role: 'organizer' });
};

export const listTeamMembers = (registrationId) =>
  apiFetch(`/events/registrations/${registrationId}/team-members`, { method: 'GET', role: 'organizer' });

// qrToken is scanned off a leader's or team member's ticket — the backend
// checks both collections, so the organizer doesn't need to know which kind
// it is ahead of time.
export const checkInEvent = (eventId, qrToken) =>
  apiFetch(`/events/${eventId}/check-in`, { method: 'POST', body: { qrToken }, role: 'organizer' });

export const uploadEventPaymentQr = (eventId, file) => {
  const formData = new FormData();
  formData.append('paymentQr', file);
  return apiFetch(`/events/${eventId}/payment-qr`, { method: 'PUT', body: formData, role: 'organizer' });
};

export const removeEventPaymentQr = (eventId) =>
  apiFetch(`/events/${eventId}/payment-qr`, { method: 'DELETE', role: 'organizer' });

export const listEventPaymentVerifications = (eventId, { status, page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status && status !== 'all') params.set('status', status);
  return apiFetch(`/events/${eventId}/payment-verifications?${params.toString()}`, { method: 'GET', role: 'organizer' });
};

export const verifyPayment = (
  registrationId,
  { action, reason, cancelRegistration, transactionId, paymentNotes } = {}
) =>
  apiFetch(`/events/registrations/${registrationId}/verify-payment`, {
    method: 'PATCH',
    body: { action, reason, cancelRegistration, transactionId, paymentNotes },
    role: 'organizer',
  });

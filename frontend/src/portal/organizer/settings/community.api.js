/**
 * community.api.js — Organizer's own community profile: info, logo/banner
 * media, core team, tags, social links, and FAQs. Mounted at /api/community
 * (see backend routes.js) — every call here is organizer-authenticated.
 */
import { apiFetch } from '@/shared/api/httpClient';

export const getCommunity = () => apiFetch('/community', { method: 'GET', role: 'organizer' });

export const updateCommunityInfo = (data) =>
  apiFetch('/community', { method: 'PATCH', body: data, role: 'organizer' });

export const uploadCommunityLogo = (file) => {
  const formData = new FormData();
  formData.append('logo', file, 'logo.jpg');
  return apiFetch('/community/logo', { method: 'PUT', body: formData, role: 'organizer' });
};

export const removeCommunityLogo = () => apiFetch('/community/logo', { method: 'DELETE', role: 'organizer' });

export const uploadCommunityBanner = (file) => {
  const formData = new FormData();
  formData.append('banner', file, 'banner.jpg');
  return apiFetch('/community/banner', { method: 'PUT', body: formData, role: 'organizer' });
};

export const removeCommunityBanner = () => apiFetch('/community/banner', { method: 'DELETE', role: 'organizer' });

// Core team
export const addCoreTeamMember = (studentIdOrPayload, role) => {
  const body = typeof studentIdOrPayload === 'object'
    ? studentIdOrPayload
    : { studentId: studentIdOrPayload, role };
  return apiFetch('/community/core-team', { method: 'POST', body, role: 'organizer' });
};

export const updateCoreTeamMemberRole = (studentId, role, wing) =>
  apiFetch(`/community/core-team/${studentId}`, {
    method: 'PATCH',
    body: wing !== undefined ? { role, wing } : { role },
    role: 'organizer',
  });

export const removeCoreTeamMember = (studentId) =>
  apiFetch(`/community/core-team/${studentId}`, { method: 'DELETE', role: 'organizer' });

export const bulkRemoveCoreTeamMembers = (studentIds) =>
  apiFetch('/community/core-team/bulk-remove', { method: 'POST', body: { studentIds }, role: 'organizer' });

// Tags
export const addTag = (tag) => apiFetch('/community/tags', { method: 'POST', body: { tag }, role: 'organizer' });

export const removeTag = (tag) =>
  apiFetch(`/community/tags/${encodeURIComponent(tag)}`, { method: 'DELETE', role: 'organizer' });

// Social links — platform is one of: github, linkedin, discord, instagram, twitter
export const setSocialLink = (platform, url) =>
  apiFetch('/community/social-links', { method: 'PUT', body: { platform, url }, role: 'organizer' });

export const removeSocialLink = (platform) =>
  apiFetch(`/community/social-links/${encodeURIComponent(platform)}`, { method: 'DELETE', role: 'organizer' });

// FAQs
export const addFaq = (question, answer) =>
  apiFetch('/community/faqs', { method: 'POST', body: { question, answer }, role: 'organizer' });

export const updateFaq = (faqId, data) =>
  apiFetch(`/community/faqs/${faqId}`, { method: 'PATCH', body: data, role: 'organizer' });

export const removeFaq = (faqId) =>
  apiFetch(`/community/faqs/${faqId}`, { method: 'DELETE', role: 'organizer' });

// Audit log — own community's shared-login history only
export const getAuditLogs = ({ page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch(`/community/audit-logs?${params.toString()}`, { method: 'GET', role: 'organizer' });
};

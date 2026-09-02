/**
 * communities.api.js — Public community discovery.
 * List/detail are mounted at /api/communities (see backend
 * discovery.routes.js) - readable by any authenticated role, students
 * included. Both responses embed each community's nearest upcoming events
 * server-side, so there's no separate per-community events call here.
 * Follow/unfollow reuse the generic /api/follows endpoints (Follow is
 * polymorphic over User/Community). Recruitment drives and applications
 * reuse /api/recruitment, the same surface the organizer side manages
 * drives through.
 */
import { apiFetch } from '@/shared/api/httpClient';

export const fetchCommunities = ({ category, search, recruiting, page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  if (recruiting !== undefined) params.set('recruiting', String(recruiting));
  return apiFetch(`/communities?${params.toString()}`, { method: 'GET', role: 'student' });
};

export const fetchCommunityById = (communityId) =>
  apiFetch(`/communities/${communityId}`, { method: 'GET', role: 'student' });

export const fetchCommunityDrives = (communityId) =>
  apiFetch(`/recruitment/communities/${communityId}/drives`, { method: 'GET', role: 'student' });

export const submitDriveApplication = (recruitmentId, answers = []) =>
  apiFetch(`/recruitment/drives/${recruitmentId}/applications`, { method: 'POST', body: { answers }, role: 'student' });

// The signed-in student's own application/membership history across every
// community — backs the "Applied"/"Selected"/"Rejected" state on
// CommunityDetailPanel's drive cards (hydrated on load, not just held in
// memory for the current session) and the profile "Recruitment" tab.
export const fetchMyApplications = ({ page = 1, limit = 100 } = {}) =>
  apiFetch(`/recruitment/applications/mine?page=${page}&limit=${limit}`, { method: 'GET', role: 'student' });

export const fetchMyMemberships = ({ page = 1, limit = 100 } = {}) =>
  apiFetch(`/recruitment/members/mine?page=${page}&limit=${limit}`, { method: 'GET', role: 'student' });

export const fetchMyFollowedCommunityIds = async () => {
  const { following } = await apiFetch('/follows/following?followingType=Community&limit=100', { method: 'GET', role: 'student' });
  return following.map((f) => String(f.following._id ?? f.following));
};

export const followCommunity = (communityId) =>
  apiFetch('/follows', { method: 'POST', body: { followingType: 'Community', followingId: communityId }, role: 'student' });

export const unfollowCommunity = (communityId) =>
  apiFetch(`/follows/Community/${communityId}`, { method: 'DELETE', role: 'student' });

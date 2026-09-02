/**
 * buddies.api.js — Public peer & student network discovery.
 *
 * List/detail are mounted at /api/buddies (and /api/profile/:studentId).
 * Follow/unfollow reuse the polymorphic /api/follows endpoints.
 */
import { apiFetch } from '@/shared/api/httpClient';

export const fetchBuddies = ({
  search,
  branch,
  year,
  skill,
  page = 1,
  limit = 30,
  excludeSelf = false,
} = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search && search.trim()) params.set('search', search.trim());
  if (branch && branch !== 'All Branches' && branch !== 'All') params.set('branch', branch);
  if (year && year !== 'All Years' && year !== 'All') params.set('year', year);
  if (skill && skill !== 'All') params.set('skill', skill);
  if (excludeSelf) params.set('excludeSelf', 'true');

  return apiFetch(`/buddies?${params.toString()}`, { method: 'GET', role: 'student' });
};

export const fetchBuddyById = (buddyId) =>
  apiFetch(`/profile/${buddyId}`, { method: 'GET', role: 'student' });

export const fetchMyFollowedBuddyIds = async () => {
  const res = await apiFetch('/follows/following?followingType=User&limit=100', {
    method: 'GET',
    role: 'student',
  });
  const list = res?.following || [];
  return list
    .map((f) => {
      const target = f?.following;
      return String(target?._id || target?.id || target || '');
    })
    .filter(Boolean);
};

export const followBuddy = (buddyId) =>
  apiFetch('/follows', {
    method: 'POST',
    body: { followingType: 'User', followingId: buddyId },
    role: 'student',
  });

export const unfollowBuddy = (buddyId) =>
  apiFetch(`/follows/User/${buddyId}`, { method: 'DELETE', role: 'student' });

/**
 * follows.api.js — Polymorphic follow graph client.
 *
 * Backed by /api/follows (see backend follows.routes.js & follows.controller.js).
 * Supports following/unfollowing both 'User' (student peers) and 'Community' (clubs/chapters).
 * All write and own-feed read calls require student authentication (`role: 'student'`).
 */
import { apiFetch } from '@/shared/api/httpClient';

/**
 * Follow a target (User or Community).
 * @param {'User' | 'Community'} followingType
 * @param {string} followingId
 */
export const followTarget = (followingType, followingId) =>
  apiFetch('/follows', {
    method: 'POST',
    body: { followingType, followingId },
    role: 'student',
  });

/**
 * Unfollow a target (User or Community).
 * @param {'User' | 'Community'} followingType
 * @param {string} followingId
 */
export const unfollowTarget = (followingType, followingId) =>
  apiFetch(`/follows/${followingType}/${followingId}`, {
    method: 'DELETE',
    role: 'student',
  });

/**
 * List what the signed-in student is currently following.
 * @param {{ followingType?: 'User' | 'Community', page?: number, limit?: number }} params
 */
export const fetchFollowing = ({ followingType, page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (followingType) params.set('followingType', followingType);
  return apiFetch(`/follows/following?${params.toString()}`, {
    method: 'GET',
    role: 'student',
  });
};

/**
 * List followers for a specific target (User or Community).
 * @param {'User' | 'Community'} followingType
 * @param {string} followingId
 * @param {{ page?: number, limit?: number }} options
 */
export const fetchFollowers = (followingType, followingId, { page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch(`/follows/followers/${followingType}/${followingId}?${params.toString()}`, {
    method: 'GET',
    role: 'student',
  });
};

/* ── Convenience Helpers ── */

export const followUser = (userId) => followTarget('User', userId);
export const unfollowUser = (userId) => unfollowTarget('User', userId);

export const followCommunity = (communityId) => followTarget('Community', communityId);
export const unfollowCommunity = (communityId) => unfollowTarget('Community', communityId);

export const fetchMyFollowedBuddyIds = async () => {
  const { following } = await fetchFollowing({ followingType: 'User', limit: 100 });
  return following.map((f) => String(f.following?._id ?? f.following));
};

export const fetchMyFollowedCommunityIds = async () => {
  const { following } = await fetchFollowing({ followingType: 'Community', limit: 100 });
  return following.map((f) => String(f.following?._id ?? f.following));
};

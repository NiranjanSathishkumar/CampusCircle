/**
 * feed.api.js — Discover feed: posts, comments, and likes.
 * Mounted at /api/feed (see backend feed.routes.js). Every call here is
 * student-authenticated, so `role: 'student'` is passed throughout.
 */
import { apiFetch } from '@/shared/api/httpClient';

export const getDiscoverFeed = ({ page = 1, limit = 20, tag, search, followedOnly } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (tag) params.set('tag', tag);
  if (search) params.set('search', search);
  if (followedOnly) params.set('followedOnly', 'true');
  return apiFetch(`/feed/posts?${params.toString()}`, { method: 'GET', role: 'student' });
};

export const getPost = (postId) =>
  apiFetch(`/feed/posts/${postId}`, { method: 'GET', role: 'student' });

export const likePost = (postId) =>
  apiFetch(`/feed/posts/${postId}/like`, { method: 'POST', role: 'student' });

export const unlikePost = (postId) =>
  apiFetch(`/feed/posts/${postId}/like`, { method: 'DELETE', role: 'student' });

export const listComments = (postId, { page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch(`/feed/posts/${postId}/comments?${params.toString()}`, { method: 'GET', role: 'student' });
};

export const addComment = (postId, content) =>
  apiFetch(`/feed/posts/${postId}/comments`, { method: 'POST', body: { content }, role: 'student' });

export const deleteComment = (commentId) =>
  apiFetch(`/feed/comments/${commentId}`, { method: 'DELETE', role: 'student' });

/**
 * posts.api.js — Organizer's own Discover posts: create/edit/delete, list
 * (drafts + published), and cover image attachment.
 * Mounted at /api/feed (see backend feed.routes.js) — every call here is
 * organizer-authenticated.
 */
import { apiFetch } from '@/shared/api/httpClient';

// Reuses the community-post-history endpoint: the backend includes drafts
// in the response when the caller is the owning organizer (see
// posts.controller.js's listCommunityPosts), so this doubles as "my posts".
export const listMyPosts = (communityId, { page = 1, limit = 100 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch(`/feed/communities/${communityId}/posts?${params.toString()}`, { method: 'GET', role: 'organizer' });
};

export const createPost = (data) =>
  apiFetch('/feed/posts', { method: 'POST', body: data, role: 'organizer' });

export const updatePost = (postId, data) =>
  apiFetch(`/feed/posts/${postId}`, { method: 'PATCH', body: data, role: 'organizer' });

export const deletePost = (postId) =>
  apiFetch(`/feed/posts/${postId}`, { method: 'DELETE', role: 'organizer' });

export const addPostAttachments = (postId, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('attachments', file));
  return apiFetch(`/feed/posts/${postId}/attachments`, { method: 'PUT', body: formData, role: 'organizer' });
};

export const removePostAttachment = (postId, attachmentId) =>
  apiFetch(`/feed/posts/${postId}/attachments/${attachmentId}`, { method: 'DELETE', role: 'organizer' });

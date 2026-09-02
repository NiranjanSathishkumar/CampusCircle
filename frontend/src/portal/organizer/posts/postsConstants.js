/**
 * Post type styling and the empty draft shape. Mirrors the Discover feed's
 * Post.type enum (backend/src/models/Post.js) exactly, since these are the
 * same posts shown to students.
 */
import { Megaphone, Calendar, Trophy, Chalkboard, Bell, Warning } from '@phosphor-icons/react';

export const TYPE_CONFIG = {
  Announcement: { label: 'Announcement', icon: Megaphone, color: '#991B1B', bg: 'rgba(153, 27, 27, 0.1)' },
  Event: { label: 'Event', icon: Calendar, color: '#1A3A2A', bg: 'rgba(26, 58, 42, 0.1)' },
  Achievement: { label: 'Achievement', icon: Trophy, color: '#B45309', bg: 'rgba(180, 83, 9, 0.1)' },
  Workshop: { label: 'Workshop', icon: Chalkboard, color: '#4C1D95', bg: 'rgba(76, 29, 149, 0.1)' },
  Update: { label: 'Update', icon: Bell, color: '#1E3A5F', bg: 'rgba(30, 58, 95, 0.1)' },
  Notice: { label: 'Notice', icon: Warning, color: '#134E4A', bg: 'rgba(19, 78, 74, 0.1)' },
};

// Mirrors backend/src/middleware/upload.js's POST_MEDIA_TYPES exactly, so a
// file gets rejected client-side with a clear reason instead of round-tripping
// to the server first.
export const ACCEPTED_ATTACHMENT_TYPES = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'ppt',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xls',
};

export const ACCEPTED_ATTACHMENT_EXT =
  '.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx';

// Mirrors backend/src/features/feed/posts.controller.js's MAX_ATTACHMENTS.
export const MAX_ATTACHMENTS = 10;

// Mirrors backend/src/middleware/upload.js's POST_MAX_FILE_SIZE.
export const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024;

export const EMPTY_DRAFT = {
  id: null,
  type: 'Announcement',
  title: '',
  body: '',
  isPublished: false,
  // Attachments already saved on the post being edited (empty for a new draft).
  // Shape: { _id, url, type: 'image'|'video'|'document', filename }.
  existingAttachments: [],
  // _ids from existingAttachments the organizer removed - deleted on save.
  removedAttachmentIds: [],
  // Newly picked files pending upload on save.
  // Shape: { id, file, previewUrl (images only), kind }.
  newFiles: [],
};

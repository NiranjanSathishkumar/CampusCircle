/**
 * Formatting and filter predicates used across the Discover feed.
 */
/* ─────────────────────────────────────────────────────────────
   UTILITY HELPERS
   ───────────────────────────────────────────────────────────── */

export function relativeTime(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function absoluteTime(date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getInitials(name) {
  if (!name) return 'CC';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Community has no color/icon field in the backend (just name + logo image),
// so the Discover UI's per-community accent color/emoji is derived
// deterministically from the community id — cosmetic only, stable across
// reloads, never persisted.
const COMMUNITY_COLORS = ['#991B1B', '#1A3A2A', '#7C2D12', '#1E3A5F', '#4C1D95', '#134E4A', '#7E1D5F', '#3B5E2B', '#78350F'];
const COMMUNITY_ICONS = ['⚡', '🎭', '🏆', '🎵', '💬', '🎨', '🌱', '📈', '✦', '🔬', '📚', '🎬'];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

export function communityVisuals(communityId) {
  const h = hashString(communityId || '');
  return {
    color: COMMUNITY_COLORS[h % COMMUNITY_COLORS.length],
    icon: COMMUNITY_ICONS[h % COMMUNITY_ICONS.length],
  };
}

// Community.logo / User.profilePicture are both {filename, cloudinaryUrl,
// cloudinaryId} — filename holds the default placeholder URL when no
// custom image has been uploaded, cloudinaryUrl when one has.
export function pickImageUrl(media) {
  return media?.cloudinaryUrl || media?.filename || null;
}

// Maps a Post document (backend/src/features/feed) to the shape the
// Discover UI components expect. Attachments of type video/document aren't
// rendered yet — only images. pinned has no backend field, so it's always
// false. bookmarked/shares have no backend support for posts and were
// dropped from the UI entirely.
export function mapPost(apiPost) {
  const community = apiPost.community || {};
  const communityId = typeof community === 'string' ? community : community._id;
  const { color, icon } = communityVisuals(communityId);

  return {
    id: apiPost._id,
    communityId,
    communityName: community.name || 'Unknown Community',
    communityIcon: icon,
    communityColor: color,
    authorName: community.name || 'Unknown Community',
    authorAvatar: pickImageUrl(community.logo),
    type: apiPost.type || 'Announcement',
    title: apiPost.title,
    timestamp: new Date(apiPost.createdAt),
    body: apiPost.content,
    images: (apiPost.attachments || []).filter(a => a.type === 'image').map(a => a.url),
    tags: apiPost.tags || [],
    likes: apiPost.likesCount || 0,
    comments: apiPost.commentsCount || 0,
    pinned: false,
    liked: Boolean(apiPost.likedByMe),
  };
}

export function mapComment(apiComment) {
  const student = apiComment.student || {};
  return {
    id: apiComment._id,
    author: student.name || 'Deleted Student',
    avatar: pickImageUrl(student.profilePicture),
    text: apiComment.content,
    timestamp: new Date(apiComment.createdAt),
  };
}

export function passesDateFilter(post, dateFilter, customFrom, customTo) {
  if (dateFilter === 'all') return true;
  const now = new Date();
  const ts = post.timestamp;
  if (dateFilter === 'today') return ts.toDateString() === now.toDateString();
  if (dateFilter === 'week') return ts >= new Date(now - 7 * 24 * 3600 * 1000);
  if (dateFilter === 'month') return ts.getMonth() === now.getMonth() && ts.getFullYear() === now.getFullYear();
  if (dateFilter === 'year') return ts.getFullYear() === now.getFullYear();
  if (dateFilter === 'custom' && customFrom && customTo) {
    const from = new Date(customFrom);
    const to = new Date(customTo);
    to.setHours(23, 59, 59);
    return ts >= from && ts <= to;
  }
  return true;
}

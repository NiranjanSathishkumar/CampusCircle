/**
 * Filter + sort option sets, and the category -> icon/color palette, for
 * the events hub. Real Event documents carry no per-event cosmetic fields
 * (no icon, no accent color) — only `category`, one of Event.EVENT_CATEGORIES
 * on the backend (see backend/src/models/Event.js). This is the same
 * category-keyed-palette approach communitiesConstants.js already uses for
 * real Community documents.
 */

// Keep in sync with backend/src/models/Event.js's EVENT_CATEGORIES.
export const EVENT_CATEGORIES = ['Workshop', 'Competition', 'Seminar', 'Cultural', 'Sports', 'Tech Talk'];

export const CATEGORY_ICONS = {
  Workshop: '🛠️',
  Competition: '🏆',
  Seminar: '🎤',
  Cultural: '🎨',
  Sports: '⚽',
  'Tech Talk': '💡',
};

export const CATEGORY_COLORS = {
  Workshop: '#1A3A2A',
  Competition: '#7C2D12',
  Seminar: '#1E3A5F',
  Cultural: '#7E1D5F',
  Sports: '#14532D',
  'Tech Talk': '#991B1B',
};

export const DEFAULT_CATEGORY_ICON = '✦';
export const DEFAULT_CATEGORY_COLOR = '#6B7280';

export const TEAM_SIZE_OPTIONS = [
  { id: 'solo', label: 'Solo' },
  { id: '2-4', label: '2–4 members' },
  { id: '5-10', label: '5–10 members' },
  { id: '10+', label: '10+ members' },
];

export const PAYMENT_OPTIONS = [
  { id: 'free', label: 'Free' },
  { id: 'paid', label: 'Paid' },
];

export const SORT_OPTIONS = [
  { id: 'upcoming', label: 'Upcoming First' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'recent', label: 'Recently Added' },
];

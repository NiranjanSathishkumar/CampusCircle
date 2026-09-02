import { BookOpen, Buildings, Code, PaintBrush, Trophy, UsersThree } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   COMMUNITY CATEGORIES — single source of truth.
   `id` is the exact string stored in Community.category (see backend
   AdminCommunityFormModal's CATEGORIES, which now imports this same list)
   so discovery's category filter/rail can compare directly against it
   with no separate slug<->label mapping to keep in sync.
   ───────────────────────────────────────────────────────────── */
// 'all' is a discovery-rail-only pseudo-category (matches the filter's
// default state) - it is never a real Community.category value, so it's
// excluded from COMMUNITY_CATEGORY_VALUES below.
export const COMMUNITY_CATEGORIES = [
  { id: 'all', label: 'All Communities', icon: '✦' },
  { id: 'Technology & Development', label: 'Technology & Development', icon: '💻' },
  { id: 'Arts & Culture', label: 'Arts & Culture', icon: '🎨' },
  { id: 'Sports & Fitness', label: 'Sports & Fitness', icon: '🏆' },
  { id: 'Academic & Literary', label: 'Academic & Literary', icon: '📖' },
  { id: 'Social & Cultural', label: 'Social & Cultural', icon: '🎉' },
];

// Just the real category label strings (no 'all'), for the admin creation
// form's <select>.
export const COMMUNITY_CATEGORY_VALUES = COMMUNITY_CATEGORIES.filter((c) => c.id !== 'all').map((c) => c.id);

/* ─────────────────────────────────────────────────────────────
   CATEGORY ICONS — Phosphor icons for the discovery filter rail.
   Keyed by the same category strings as COMMUNITY_CATEGORIES, plus 'all'.
   ───────────────────────────────────────────────────────────── */
export const CATEGORY_ICONS = {
  all: Buildings,
  'Technology & Development': Code,
  'Arts & Culture': PaintBrush,
  'Sports & Fitness': Trophy,
  'Academic & Literary': BookOpen,
  'Social & Cultural': UsersThree,
};

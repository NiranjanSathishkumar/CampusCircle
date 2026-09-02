/**
 * Static option sets for the Discover filter + compose controls.
 */
import { Bell, Calendar, Chalkboard, Megaphone, Trophy, Warning } from '@phosphor-icons/react';

export const POST_TYPES = [
  { id: 'Announcement', label: 'Announcement', icon: Megaphone, color: '#991B1B' },
  { id: 'Event', label: 'Event', icon: Calendar, color: '#1A3A2A' },
  { id: 'Achievement', label: 'Achievement', icon: Trophy, color: '#B45309' },
  { id: 'Workshop', label: 'Workshop', icon: Chalkboard, color: '#4C1D95' },
  { id: 'Update', label: 'Update', icon: Bell, color: '#1E3A5F' },
  { id: 'Notice', label: 'Notice', icon: Warning, color: '#134E4A' },
];

export const DATE_PRESETS = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

export const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest First' },
  { id: 'liked', label: 'Most Liked' },
  { id: 'commented', label: 'Most Commented' },
];

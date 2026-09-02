/**
 * navigationConstants.js — Navigation routes and notification category definitions
 */
import {
  Calendar,
  UsersThree,
  UserPlus,
  Sparkle
} from '@phosphor-icons/react';

export const CATEGORY_MAP = {
  events: {
    icon: Calendar,
    color: '#991B1B',
    bg: 'rgba(153, 27, 27, 0.1)',
  },
  communities: {
    icon: UsersThree,
    color: '#1A3A2A',
    bg: 'rgba(26, 58, 42, 0.1)',
  },
  buddies: {
    icon: UserPlus,
    color: '#0284C7',
    bg: 'rgba(2, 132, 199, 0.1)',
  },
  system: {
    icon: Sparkle,
    color: '#7C3AED',
    bg: 'rgba(124, 58, 237, 0.1)',
  },
};

/**
 * adminNavigationConstants.js — Sidebar nav groups + notification config
 * for the Admin Console. Deliberately five items, not nine — Admin's job
 * in this product is thin by design (vet/create communities, watch for
 * shared-login misuse), so the nav shouldn't pretend otherwise.
 */
import {
  Gauge,
  Buildings,
  UsersThree,
  ShieldWarning,
  GearSix,
  Flag,
  UserPlus,
  Lightning,
} from '@phosphor-icons/react';

export const ADMIN_NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: Gauge },
    ],
  },
  {
    label: 'Platform',
    items: [
      { path: '/admin/communities', label: 'Communities', icon: Buildings },
      { path: '/admin/students', label: 'Students', icon: UsersThree },
    ],
  },
  {
    label: 'Security',
    items: [
      { path: '/admin/audit-log', label: 'Audit Log', icon: ShieldWarning },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/admin/settings', label: 'Settings', icon: GearSix },
    ],
  },
];

export const ADMIN_CATEGORY_MAP = {
  community: {
    label: 'Community',
    icon: Buildings,
    color: '#1A3A2A',
    bg: 'rgba(26, 58, 42, 0.12)',
  },
  flag: {
    label: 'Security Flag',
    icon: Flag,
    color: '#991B1B',
    bg: 'rgba(153, 27, 27, 0.12)',
  },
  student: {
    label: 'Students',
    icon: UserPlus,
    color: '#0284C7',
    bg: 'rgba(2, 132, 199, 0.12)',
  },
  system: {
    label: 'System',
    icon: Lightning,
    color: '#B45309',
    bg: 'rgba(180, 83, 9, 0.12)',
  },
};

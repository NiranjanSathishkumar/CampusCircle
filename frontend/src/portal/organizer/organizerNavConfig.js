import {
  Gauge,
  Megaphone,
  CalendarCheck,
  UsersThree,
  Briefcase,
  ChartBar,
  Medal,
  GearSix,
  CalendarPlus,
  UserPlus,
  BellRinging,
  Lightning,
  ShieldCheck,
} from '@phosphor-icons/react';

export const ORGANIZER_NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '/organizer/dashboard', label: 'Dashboard', icon: Gauge },
    ],
  },
  {
    label: 'Content & Events',
    items: [
      { path: '/organizer/posts', label: 'Posts', icon: Megaphone },
      { path: '/organizer/events', label: 'Events', icon: CalendarCheck },
    ],
  },
  {
    label: 'People',
    items: [
      { path: '/organizer/roster', label: 'Roster', icon: UsersThree },
      { path: '/organizer/recruitment', label: 'Recruitment', icon: Briefcase },
    ],
  },
  {
    label: 'Insights',
    items: [
      { path: '/organizer/analytics', label: 'Analytics', icon: ChartBar },
      { path: '/organizer/achievements', label: 'Achievements', icon: Medal },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/organizer/settings', label: 'Settings', icon: GearSix },
    ],
  },
];

export const ORGANIZER_CATEGORY_MAP = {
  registration: {
    label: 'Registration',
    icon: CalendarPlus,
    color: '#0D9488',
    bg: 'rgba(13, 148, 136, 0.12)',
  },
  recruitment: {
    label: 'Recruitment',
    icon: UserPlus,
    color: '#2563EB',
    bg: 'rgba(37, 99, 235, 0.12)',
  },
  announcement: {
    label: 'Announcement',
    icon: Megaphone,
    color: '#991B1B',
    bg: 'rgba(153, 27, 27, 0.12)',
  },
  system: {
    label: 'System',
    icon: Lightning,
    color: '#B45309',
    bg: 'rgba(180, 83, 9, 0.12)',
  },
};



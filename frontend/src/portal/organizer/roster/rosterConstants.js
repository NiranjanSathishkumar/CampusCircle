/**
 * Role presets and display helpers.
 *
 * Domain wings and per-member join dates used to live here too, but neither
 * is backed by the Community.coreTeam schema (just { user, role } — see
 * roster.api.js), so they were dropped along with the roster UI that
 * depended on them rather than persisting fake state client-side.
 */
export function getInitials(name = '') {
  if (!name) return 'CC';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0]?.slice(0, 2).toUpperCase() || 'CC';
}

export const PRESET_ROLES = [
  'Lead Organiser / Chairperson',
  'Co-Lead / Vice Chairperson',
  'General Secretary',
  'Technical Lead',
  'Web & Full-Stack Lead',
  'Design & Creatives Lead',
  'UI/UX Designer',
  'Events & Operations Head',
  'Event Operations Coordinator',
  'PR & Outreach Lead',
  'Corporate Sponsorship Lead',
  'Content & Editorial Writer',
  'Social Media Strategist',
  'Treasurer & Financial Controller',
  'Technical Associate & Mentor',
  'Event Day Operations Volunteer',
  'Core Team Volunteer',
];

/** Predefined domain wings. Also used for the inline wing selector. */
export const WING_OPTIONS = [
  'Executive Council',
  'Technical',
  'Design & Creative',
  'Operations & Events',
  'Finance & Sponsorship',
  'PR & Outreach',
  'Content & Media',
  'Volunteer',
];

/** Formats a date as a compact relative string: "2 months ago", "Today", etc. */
export function formatRelativeDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) {
    const m = Math.floor(diffDays / 30);
    return `${m} month${m > 1 ? 's' : ''} ago`;
  }
  const y = Math.floor(diffDays / 365);
  return `${y} year${y > 1 ? 's' : ''} ago`;
}

/**
 * Classifies a role string into a semantic tier/category for visual styling & hierarchy grouping
 */
export function getRoleCategory(role = '') {
  const r = (role || '').toLowerCase();
  if (r.includes('lead organiser') || r.includes('president') || r.includes('convener') || r.includes('chairperson') || r.includes('head organiser')) {
    return 'leadership';
  }
  if (r.includes('tech') || r.includes('web') || r.includes('code') || r.includes('dev')) {
    return 'technical';
  }
  if (r.includes('design') || r.includes('creative') || r.includes('media') || r.includes('ui') || r.includes('ux')) {
    return 'design';
  }
  if (r.includes('event') || r.includes('operation') || r.includes('logistics') || r.includes('management')) {
    return 'events';
  }
  if (r.includes('treasurer') || r.includes('finance') || r.includes('accounts') || r.includes('sponsorship')) {
    return 'finance';
  }
  if (r.includes('pr') || r.includes('outreach') || r.includes('marketing') || r.includes('social') || r.includes('public relations') || r.includes('editorial')) {
    return 'outreach';
  }
  if (r.includes('lead') || r.includes('head') || r.includes('secretary')) {
    return 'leadership';
  }
  if (r.includes('coordinator')) {
    return 'events';
  }
  return 'volunteer';
}

/**
 * Returns color tokens and styling metadata based on role category
 */
export function getRoleTheme(role = '') {
  const cat = getRoleCategory(role);
  switch (cat) {
    case 'leadership':
      return {
        category: 'leadership',
        label: 'Executive Leadership',
        badgeBg: 'rgba(180, 83, 9, 0.1)',
        badgeBorder: 'rgba(180, 83, 9, 0.25)',
        badgeColor: '#B45309',
        avatarBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        avatarColor: '#92400E',
        accentColor: '#D97706',
        cardBorderHover: '#D97706',
        tierRank: 1,
      };
    case 'technical':
      return {
        category: 'technical',
        label: 'Technical & Engineering',
        badgeBg: 'rgba(79, 70, 229, 0.08)',
        badgeBorder: 'rgba(79, 70, 229, 0.22)',
        badgeColor: '#4338CA',
        avatarBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
        avatarColor: '#3730A3',
        accentColor: '#4F46E5',
        cardBorderHover: '#4F46E5',
        tierRank: 2,
      };
    case 'design':
      return {
        category: 'design',
        label: 'Design & Creative',
        badgeBg: 'rgba(225, 29, 72, 0.08)',
        badgeBorder: 'rgba(225, 29, 72, 0.22)',
        badgeColor: '#BE123C',
        avatarBg: 'linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%)',
        avatarColor: '#9F1239',
        accentColor: '#E11D48',
        cardBorderHover: '#E11D48',
        tierRank: 2,
      };
    case 'finance':
      return {
        category: 'finance',
        label: 'Finance & Treasury',
        badgeBg: 'rgba(21, 128, 61, 0.08)',
        badgeBorder: 'rgba(21, 128, 61, 0.22)',
        badgeColor: '#15803D',
        avatarBg: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
        avatarColor: '#166534',
        accentColor: '#16A34A',
        cardBorderHover: '#16A34A',
        tierRank: 2,
      };
    case 'outreach':
      return {
        category: 'outreach',
        label: 'PR & Outreach',
        badgeBg: 'rgba(2, 132, 199, 0.08)',
        badgeBorder: 'rgba(2, 132, 199, 0.22)',
        badgeColor: '#0369A1',
        avatarBg: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
        avatarColor: '#075985',
        accentColor: '#0284C7',
        cardBorderHover: '#0284C7',
        tierRank: 2,
      };
    case 'events':
      return {
        category: 'events',
        label: 'Events & Operations',
        badgeBg: 'rgba(13, 148, 136, 0.08)',
        badgeBorder: 'rgba(13, 148, 136, 0.22)',
        badgeColor: '#0F766E',
        avatarBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)',
        avatarColor: '#115E59',
        accentColor: '#0D9488',
        cardBorderHover: '#0D9488',
        tierRank: 3,
      };
    default:
      return {
        category: 'volunteer',
        label: 'Core Team & Volunteers',
        badgeBg: 'rgba(15, 23, 42, 0.06)',
        badgeBorder: 'rgba(15, 23, 42, 0.15)',
        badgeColor: '#334155',
        avatarBg: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
        avatarColor: '#1E293B',
        accentColor: '#64748B',
        cardBorderHover: '#64748B',
        tierRank: 4,
      };
  }
}

export const HIERARCHY_GROUPS = [
  {
    key: 'leadership',
    title: 'Executive Leadership',
    subtitle: 'Presidents, Lead Organisers & Key Decision Makers',
    filter: (r) => getRoleCategory(r) === 'leadership',
  },
  {
    key: 'domain_heads',
    title: 'Domain Leads & Coordinators',
    subtitle: 'Technical, Design, Operations, Outreach & Finance Leads',
    filter: (r) => {
      const cat = getRoleCategory(r);
      return cat === 'technical' || cat === 'design' || cat === 'events' || cat === 'finance' || cat === 'outreach';
    },
  },
  {
    key: 'volunteers',
    title: 'Core Associates & Volunteers',
    subtitle: 'Active Core Team & Departmental Volunteers',
    filter: (r) => getRoleCategory(r) === 'volunteer',
  },
];

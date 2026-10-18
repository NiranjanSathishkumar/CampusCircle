/**
 * communitiesAdapter.js — maps a raw Community document (from
 * communities.api.js, backed by backend Community.js) onto the view model
 * CommunityCard / CommunityLedgerRow / CommunityQuickPreviewModal /
 * CommunityDetailPanel already render. Keeping the mapping in one place
 * means those four presentational components stay untouched (aside from
 * the icon-vs-logo-image rendering tweak) rather than each growing its own
 * copy of these fallbacks.
 */

// Purely cosmetic per-category styling the backend has no field for —
// the same palette is used everywhere so a category always looks the same.
const CATEGORY_STYLE = {
  'Technology & Development': { emoji: '💻', accentColor: '#1A3A2A', gradient: 'linear-gradient(135deg, #1A3A2A, #0F172A)' },
  'Arts & Culture': { emoji: '🎨', accentColor: '#7E1D5F', gradient: 'linear-gradient(135deg, #7E1D5F, #4C1D95)' },
  'Sports & Fitness': { emoji: '🏆', accentColor: '#14532D', gradient: 'linear-gradient(135deg, #14532D, #065F46)' },
  'Academic & Literary': { emoji: '📖', accentColor: '#134E4A', gradient: 'linear-gradient(135deg, #134E4A, #1A3A2A)' },
  'Social & Cultural': { emoji: '🎉', accentColor: '#4C1D95', gradient: 'linear-gradient(135deg, #4C1D95, #1E3A5F)' },
};
const DEFAULT_STYLE = { emoji: '✦', accentColor: '#1A3A2A', gradient: 'linear-gradient(135deg, #1A3A2A, #0F172A)' };

function styleFor(category) {
  return CATEGORY_STYLE[category] || DEFAULT_STYLE;
}

function formatEventDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const datePart = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timePart = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  return `${datePart} · ${timePart}`;
}

function mapLead(member) {
  const user = member.user;
  if (!user) return null; // deleted account — coreTeam.user ref left dangling
  return {
    id: user._id,
    name: user.name,
    role: member.role,
    branch: user.branch,
    avatarUrl: user.profilePicture?.cloudinaryUrl || user.profilePicture?.filename,
  };
}

function mapEvent(ev) {
  const type = ev.tags?.[0] ? ev.tags[0][0].toUpperCase() + ev.tags[0].slice(1) : 'Event';
  return { eventId: ev._id, title: ev.title, date: formatEventDate(ev.eventDate), type };
}

function mapSocials(socialLinks = []) {
  return socialLinks.reduce((acc, { platform, url }) => ({ ...acc, [platform]: url }), {});
}

export function mapCommunity(raw) {
  const style = styleFor(raw.category);
  const logoUrl = raw.logo?.cloudinaryUrl || raw.logo?.filename;
  const bannerUrl = raw.banner?.cloudinaryUrl || raw.banner?.filename;
  // Real, live CommunityRecruitment drives only - not Community.openRoles
  // (a free-text field organizers can set independently of any actual
  // drive), so the teaser never names a position students can't apply to.
  const openRoles = raw.openRecruitmentRoles || [];

  return {
    id: raw._id,
    name: raw.name,
    category: raw.category,
    categoryLabel: raw.category,
    tagline: raw.description || '',
    about: raw.description || '',
    icon: logoUrl || style.emoji,
    accentColor: style.accentColor,
    coverGradient: style.gradient,
    coverImage: bannerUrl,
    members: raw.followerCount || 0,
    activeEvents: raw.activeEventsCount || 0,
    // The Recruiting badge should ONLY show when the Recruitment Drive is active
    recruiting: raw.hasOpenRecruitment !== undefined
      ? Boolean(raw.hasOpenRecruitment)
      : Array.isArray(raw.drives)
        ? raw.drives.some((d) => d.isOpen && d.isActive !== false && (!d.deadline || new Date(d.deadline) >= new Date()))
        : false,
    recruitingRole: openRoles.length ? openRoles.join(', ') : null,
    establishedYear: raw.establishedYear,
    tags: raw.tags || [],
    faqs: raw.faqs || [],
    leadOrganizer: raw.leadOrganizer,
    location: raw.location || undefined,
    department: raw.location || undefined,
    isVerified: Boolean(raw.isVerified),
    leads: (raw.coreTeam || []).map(mapLead).filter(Boolean),
    socials: mapSocials(raw.socialLinks),
    upcomingEvents: (raw.upcomingEvents || []).map(mapEvent),
  };
}

export function mapCommunities(rawList) {
  return rawList.map(mapCommunity);
}

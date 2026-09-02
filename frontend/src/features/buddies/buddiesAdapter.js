/**
 * buddiesAdapter.js — Normalizes raw User documents from the backend
 * into the view models consumed by StudentCard, BuddyLedgerRow, and BuddyDetailPanel.
 */

export function mapBuddy(raw) {
  if (!raw) return null;

  const id = String(raw._id || raw.id || '');
  const currentYear = raw.currentYear;

  let yearLabel = 'Student';
  if (currentYear != null && currentYear >= 1 && currentYear <= 4) {
    yearLabel = `${currentYear === 1 ? '1st' : currentYear === 2 ? '2nd' : currentYear === 3 ? '3rd' : '4th'} Year`;
  } else if (raw.yearOfJoining) {
    yearLabel = raw.isEnrolled === false ? 'Graduate / Alumni' : `Class of ${raw.yearOfJoining + 4}`;
  } else if (raw.year) {
    yearLabel = raw.year;
  }

  const avatarUrl =
    raw.profilePicture?.cloudinaryUrl ||
    raw.profilePicture?.filename ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.name || 'Student')}&background=1A3A2A&color=fff&size=512`;

  const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80';
  let rawBanner = raw.profileBanner?.cloudinaryUrl || raw.profileBanner?.filename || raw.bannerUrl || raw.banner;
  if (!rawBanner || typeof rawBanner !== 'string' || rawBanner.includes('alkuwaiti.com') || rawBanner.includes('Hero-Banner-Placeholder')) {
    rawBanner = DEFAULT_BANNER;
  }
  const bannerUrl = rawBanner;

  // Convert array socialLinks [{ platform: 'github', url: '...' }] into socials map
  const socials = {};
  if (Array.isArray(raw.socialLinks)) {
    for (const item of raw.socialLinks) {
      if (item?.platform && item?.url) {
        socials[item.platform] = item.url;
      }
    }
  } else if (raw.socials && typeof raw.socials === 'object') {
    Object.assign(socials, raw.socials);
  }

  // Format achievements
  const achievements = Array.isArray(raw.achievements)
    ? raw.achievements.map((a) => ({
        id: String(a._id || a.id || ''),
        title: a.title || 'Campus Achievement',
        issuer: a.issuer || 'CampusCircle',
        year: a.dateEarned ? new Date(a.dateEarned).getFullYear() : a.year || 'Recent',
        description: a.description || '',
        verificationLink: a.verificationLink || '',
        certificate: a.certificate || null,
      }))
    : [];

  // Format joined communities
  const communities = Array.isArray(raw.communities)
    ? raw.communities.map((c) => ({
        id: String(c.id || c._id || ''),
        name: c.name || 'Campus Club',
        role: c.role || 'Member',
        logo: c.logo || null,
        category: c.category || '',
      }))
    : [];

  return {
    id,
    _id: id,
    name: raw.name || 'Campus Student',
    branch: raw.branch || 'Engineering',
    year: yearLabel,
    yearOfJoining: raw.yearOfJoining || null,
    bio: raw.bio || 'Campus member exploring new opportunities.',
    avatarUrl,
    bannerUrl,
    bannerGradient: bannerUrl ? undefined : 'linear-gradient(135deg, #1A3A2A, #0F172A)',
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    followersCount: raw.followerCount ?? raw.followersCount ?? 0,
    followingCount: raw.followingCount ?? 0,
    isFollowed: Boolean(raw.isFollowed || raw.isFollowedByMe),
    online: Boolean(raw.online),
    isVerified: Boolean(raw.isProfileComplete || raw.isVerified),
    leadBadge: raw.leadBadge || null,
    communities,
    achievements,
    socials,
    interestTags: Array.isArray(raw.interestTags) ? raw.interestTags : [],
    education: Array.isArray(raw.education) ? raw.education : [],
  };
}

export function mapBuddies(list) {
  if (!Array.isArray(list)) return [];
  return list.map(mapBuddy).filter(Boolean);
}

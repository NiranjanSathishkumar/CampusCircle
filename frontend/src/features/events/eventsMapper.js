/**
 * eventsMapper.js — translates real Event/Registration documents (backend
 * shape, see backend/src/models/Event.js and Registration.js) into the
 * flatter view-model the events UI components render.
 */
import { CATEGORY_ICONS, CATEGORY_COLORS, DEFAULT_CATEGORY_ICON, DEFAULT_CATEGORY_COLOR } from '@/features/events/eventsConstants';
import { formatEventDateTime } from '@/features/events/eventsDateUtils';

// Capacity-only: whether seats are running out. Time-based closure (event
// concluded / registration window passed) is layered on top by the caller —
// this function has no notion of "now" and never did, which used to mean an
// event card could show a green "Open" badge with 31/60 seats free right
// next to a disabled "Concluded" button, since only the button read isPast.
export function computeStatusBadge(registered, capacity) {
  if (!capacity || registered >= capacity) return 'Sold Out';
  const pct = registered / capacity;
  if (pct >= 0.9) return 'Almost Full';
  if (pct >= 0.7) return 'Filling Fast';
  return 'Open';
}

// Team display string, e.g. "2–4 members" — mirrors the free-text
// `teamFormat` field the old mock data carried, derived here from the real
// registrationType/teamSize fields so most display components didn't need
// to change shape.
function teamFormatLabel(event) {
  if (event.registrationType !== 'team' || !event.teamSize) return 'Solo';
  const { min, max } = event.teamSize;
  if (min === max) return `${min} members`;
  return `${min}–${max} members`;
}

// "Is this event over" — same definition the backend itself uses to drop
// concluded events from listEvents and to close registration (see
// backend/src/utils/registrationWindow.js): eventEndDate for a multi-day
// event, eventDate otherwise.
function eventEndsAt(event) {
  return new Date(event.eventEndDate || event.eventDate);
}

function registrationDeadlineFor(event) {
  return new Date(event.registrationDeadline || event.eventEndDate || event.eventDate);
}

/**
 * Maps a raw Event document (full shape — from listEvents/getEvent) into
 * the UI's event view-model. Per-student fields (isRegistered, isSaved,
 * ...) are NOT included here — those come from the student's own
 * registrations/bookmarks and are looked up separately so this mapping
 * stays valid across students viewing the same cached event list.
 */
export function mapEvent(raw) {
  const now = new Date();
  const registeredCount = raw.confirmedRegistrationIds?.length || 0;
  const community = raw.community || {};
  const icon = CATEGORY_ICONS[raw.category] || DEFAULT_CATEGORY_ICON;
  const color = CATEGORY_COLORS[raw.category] || DEFAULT_CATEGORY_COLOR;
  const isPast = eventEndsAt(raw) < now;
  const registrationClosed = registrationDeadlineFor(raw) < now;
  // Time-based closure takes priority over capacity: a concluded or
  // registration-closed event should never read as "Open"/"Filling Fast"
  // just because it also happens to have free seats.
  const statusBadge = isPast
    ? 'Concluded'
    : registrationClosed
    ? 'Registration Closed'
    : computeStatusBadge(registeredCount, raw.capacity);

  return {
    id: raw._id,
    title: raw.title,
    category: raw.category,
    description: raw.description,
    venue: raw.venue,

    community_id: community._id,
    hostName: community.name || 'Campus Community',
    hostIcon: icon,
    hostColor: color,
    communityLogoUrl: community.logo?.cloudinaryUrl || community.logo?.filename || null,
    // Every event on this platform is posted by an authenticated community
    // account — there's no "unverified external organizer" concept in the
    // real data model, unlike the old mock's per-event isVerified flag.
    isVerified: true,

    tags: raw.tags || [],
    imageUrl: raw.bannerImage?.url || null,

    date: new Date(raw.eventDate),
    eventEndDate: raw.eventEndDate ? new Date(raw.eventEndDate) : null,
    dateFormatted: formatEventDateTime(raw.eventDate),
    eventEndDateFormatted: raw.eventEndDate ? formatEventDateTime(raw.eventEndDate) : null,
    registrationDeadline: raw.registrationDeadline ? new Date(raw.registrationDeadline) : null,
    registrationDeadlineFormatted: raw.registrationDeadline ? formatEventDateTime(raw.registrationDeadline) : null,
    effectiveRegistrationDeadline: registrationDeadlineFor(raw),
    effectiveRegistrationDeadlineFormatted: formatEventDateTime(registrationDeadlineFor(raw)),
    isPast,
    registrationClosed,

    registrationType: raw.registrationType,
    teamSize: raw.teamSize || null,
    teamFormat: teamFormatLabel(raw),

    payment: raw.price > 0 ? 'Paid' : 'Free',
    price_amount: raw.price || 0,
    paymentQrCode: raw.paymentQrCode || null,
    paymentInstructions: raw.paymentInstructions || '',
    upiId: raw.upiId || '',

    registered_count: registeredCount,
    // Kept alongside registered_count for compatibility with components
    // that read `event._liveRegistered ?? event.registered_count` — with
    // real data there's no separate "live" figure, so both are the same.
    _liveRegistered: registeredCount,
    capacity: raw.capacity,
    statusBadge,
    allowWaitlist: Boolean(raw.allowWaitlist),

    collectProfileData: Boolean(raw.collectProfileData),
    requireWaiver: Boolean(raw.requireWaiver),
    waiverText: raw.waiverText || '',
    confirmationMessage: raw.confirmationMessage || '',
    formQuestions: raw.formQuestions || [],

    agenda: raw.agenda || [],
    rules: raw.rules || [],
    faqs: raw.faqs || [],
    contact: raw.contact || null,

    status: raw.status,
    isActive: raw.isActive,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : null,
  };
}

/**
 * Builds a Map<eventId, { registrationId, status, teamName, qrToken,
 * eventTitle, date }> from listMyRegistrations results — the one fetch that
 * both EventsPage (for isRegistered/isWaitlisted flags and same-day conflict
 * detection) and MyEventsPage (for the passbook list) need. Cancelled
 * registrations are dropped: a cancelled registration isn't "mine" anymore
 * in any of the ways the UI cares about.
 */
export function buildRegistrationIndex(rawRegistrations) {
  const index = new Map();
  for (const reg of rawRegistrations) {
    if (reg.status === 'cancelled') continue;
    if (!reg.event) continue; // dangling ref — event hard-deleted
    index.set(String(reg.event._id), {
      registrationId: reg._id,
      status: reg.status,
      teamName: reg.teamName || '',
      qrToken: reg.qrToken,
      paymentStatus: reg.paymentStatus,
      checkedIn: Boolean(reg.checkedIn),
      createdAt: reg.createdAt,
      eventTitle: reg.event.title,
      date: reg.event.eventDate ? new Date(reg.event.eventDate) : null,
      venue: reg.event.venue,
    });
  }
  return index;
}

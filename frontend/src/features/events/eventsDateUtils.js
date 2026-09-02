/**
 * eventsDateUtils.js — date formatting and countdown utilities for events.
 * Pure functions only — no mock/localStorage dependency, safe to use against
 * real Event/Registration documents.
 */

/**
 * Calculates countdown status object for event dates
 */
export function computeCountdownStatus(rawDate) {
  const now = new Date();
  const eventDate = new Date(rawDate);

  // Normalize dates to midnight for day difference
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventMidnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

  const diffMs = eventMidnight - todayMidnight;
  const diffDays = Math.round(diffMs / (1000 * 3600 * 24));

  if (diffDays < 0) {
    return {
      badge: 'Completed',
      label: 'Event Completed',
      isToday: false,
      isPast: true,
      daysLeft: 0,
    };
  }

  if (diffDays === 0) {
    return {
      badge: 'Today!',
      label: 'Happening Today!',
      isToday: true,
      isPast: false,
      daysLeft: 0,
    };
  }

  if (diffDays === 1) {
    return {
      badge: 'Tomorrow',
      label: 'Starts Tomorrow!',
      isToday: false,
      isPast: false,
      daysLeft: 1,
    };
  }

  return {
    badge: `In ${diffDays} days`,
    label: `${diffDays} days left`,
    isToday: false,
    isPast: false,
    daysLeft: diffDays,
  };
}

/**
 * Detects time conflicts across a list of registered events
 */
export function detectTimeConflicts(eventsList) {
  const conflictsMap = new Set();

  for (let i = 0; i < eventsList.length; i++) {
    for (let j = i + 1; j < eventsList.length; j++) {
      const e1 = eventsList[i];
      const e2 = eventsList[j];

      // Only check upcoming/today events
      const st1 = computeCountdownStatus(e1.rawDate);
      const st2 = computeCountdownStatus(e2.rawDate);

      if (!st1.isPast && !st2.isPast) {
        if (e1.dateFormatted === e2.dateFormatted && e1.startTime === e2.startTime) {
          conflictsMap.add(e1.id);
          conflictsMap.add(e2.id);
        }
      }
    }
  }

  return conflictsMap;
}

/**
 * Splits a combined "Sat, 16 Aug 2026 · 9:00 AM" string into
 * { dateOnly, timeOnly } for pages that display them separately.
 */
export function splitDateFormatted(dateFormatted) {
  if (!dateFormatted) return { dateOnly: 'TBA', timeOnly: '' };
  const parts = dateFormatted.split('·').map(s => s.trim());
  return { dateOnly: parts[0] || dateFormatted, timeOnly: parts[1] || '' };
}

/**
 * Formats an ISO/Date value as "Sat, 16 Aug 2026 · 9:00 AM".
 */
export function formatEventDateTime(date) {
  if (!date) return 'TBA';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return 'TBA';
  const datePart = d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const timePart = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  return `${datePart} · ${timePart}`;
}

/**
 * Finds another event the student is already registered for (confirmed or
 * waitlisted) that falls on the same calendar day as `eventId`.
 * `registrationIndex` is a Map<eventId, { title, date: Date }> built from
 * the student's own registrations (see eventsMapper.js's
 * buildRegistrationIndex) — cheap, since that list is already fetched to
 * derive registeredIds/waitlistIds, with no separate catalog lookup needed.
 */
export function findScheduleConflict(eventId, currentEventDate, registrationIndex) {
  if (!currentEventDate || !registrationIndex) return null;
  const currentDay = new Date(currentEventDate).toDateString();

  for (const [id, entry] of registrationIndex) {
    if (id === eventId) continue;
    if (!entry.date) continue;
    if (entry.date.toDateString() === currentDay) return entry;
  }
  return null;
}

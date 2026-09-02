/**
 * analyticsMapper.js — shapes raw Event + Registration docs (from the
 * existing organizer events.api.js) into the view-model
 * OrganizerEventAnalyticsPanel.jsx already expects. Mirrors the same
 * registeredCount/waitlistCount/checkedInCount/branch derivations
 * OrganizerEventDetailPage.jsx's own (unexported) mapper already uses, kept
 * here as its own small copy rather than importing across two unrelated
 * page modules.
 */

export function mapEventForAnalytics(event) {
  const eventDate = new Date(event.eventDate);
  return {
    id: event._id,
    title: event.title,
    category: event.category,
    venue: event.venue,
    dateFormatted: eventDate.toLocaleString('en-IN', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
    }),
    payment: event.price === 0 ? 'Free' : 'Paid',
    priceAmount: event.price,
    capacity: event.capacity,
    registeredCount: event.confirmedRegistrationIds?.length || 0,
    viewCount: event.viewCount || 0,
    registrationStartedCount: event.registrationStartedCount || 0,
  };
}

// Monday-anchored week bucket for a date, used only to group registrations
// into "Wk 1, Wk 2, ..." columns — cumulative count as of that week.
function weekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // shift back to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildRegistrationTimeline(registrations) {
  const active = registrations
    .filter((r) => r.status !== 'cancelled')
    .map((r) => weekStart(r.createdAt))
    .sort((a, b) => a - b);
  if (!active.length) return [];

  const buckets = new Map(); // ISO date string -> count that week
  for (const wk of active) {
    const key = wk.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  const keys = [...buckets.keys()].sort();
  let cumulative = 0;
  return keys.map((key, i) => {
    cumulative += buckets.get(key);
    return { label: `Wk ${i + 1}`, value: cumulative, date: key };
  });
}

function buildBranchBreakdown(registrations) {
  const counts = new Map();
  for (const r of registrations) {
    if (r.status === 'cancelled') continue;
    const branch = r.profileSnapshot?.branch;
    if (!branch) continue;
    counts.set(branch, (counts.get(branch) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Builds the { registrationTimeline, branchBreakdown, funnel, waitlistCount }
 * shape OrganizerEventAnalyticsPanel.jsx consumes, from a raw Event doc
 * (already carrying viewCount/registrationStartedCount) and its raw
 * Registration list.
 */
export function buildEventAnalytics(rawEvent, rawRegistrations) {
  const registrations = rawRegistrations || [];
  const confirmed = registrations.filter((r) => r.status === 'confirmed');
  const waitlistCount = registrations.filter((r) => r.status === 'waitlisted').length;
  const checkedInCount = confirmed.filter((r) => r.checkedIn).length;
  const registeredCount = rawEvent.confirmedRegistrationIds?.length || confirmed.length;

  return {
    waitlistCount,
    registrationTimeline: buildRegistrationTimeline(registrations),
    branchBreakdown: buildBranchBreakdown(registrations),
    funnel: [
      { label: 'Viewed Event', value: rawEvent.viewCount || 0 },
      { label: 'Started Registration', value: rawEvent.registrationStartedCount || 0 },
      { label: 'Completed Registration', value: registeredCount },
      { label: 'Attended (Checked In)', value: checkedInCount },
    ],
  };
}

/**
 * Search, filter, sort and display helpers for the events hub. Operate on
 * the mapped event shape from eventsMapper.js (real registrationType/
 * teamSize/createdAt fields, not the old mock's free-text teamFormat).
 */
/* ─────────────────────────────────────────────────────────────
   MATCHING HELPERS
   ───────────────────────────────────────────────────────────── */

const TEAM_SIZE_RANGES = {
  solo: [1, 1],
  '2-4': [2, 4],
  '5-10': [5, 10],
  '10+': [10, Infinity],
};

export function matchesTeamSize(event, sizes) {
  if (!sizes.length) return true;
  const min = event.registrationType === 'team' ? event.teamSize?.min || 1 : 1;
  const max = event.registrationType === 'team' ? event.teamSize?.max || 1 : 1;
  // A bucket matches when the event's real team-size range overlaps it at all.
  return sizes.some(s => {
    const range = TEAM_SIZE_RANGES[s];
    if (!range) return false;
    const [lo, hi] = range;
    return min <= hi && max >= lo;
  });
}

export function matchesSearch(event, query) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    event.title.toLowerCase().includes(q) ||
    event.description?.toLowerCase().includes(q) ||
    event.hostName?.toLowerCase().includes(q) ||
    event.tags?.some(t => t.toLowerCase().includes(q))
  );
}

export function sortEvents(events, sortBy) {
  const copy = [...events];
  if (sortBy === 'upcoming') {
    return copy.sort((a, b) => a.date - b.date);
  }
  if (sortBy === 'popular') {
    return copy.sort((a, b) => b.registered_count - a.registered_count);
  }
  if (sortBy === 'recent') {
    return copy.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
  return copy;
}

/* ─────────────────────────────────────────────────────────────
   DATE HELPERS
   ───────────────────────────────────────────────────────────── */

export function formatDateBadge(date) {
  return {
    day: date.toLocaleDateString('en-IN', { day: 'numeric' }),
    month: date.toLocaleDateString('en-IN', { month: 'short' }),
  };
}

/* ─────────────────────────────────────────────────────────────
   STATUS HELPERS
   ───────────────────────────────────────────────────────────── */

export function getProgressColor(pct) {
  if (pct >= 1) return '#374151';
  if (pct >= 0.9) return '#991B1B';
  if (pct >= 0.7) return '#B45309';
  return '#1A3A2A';
}

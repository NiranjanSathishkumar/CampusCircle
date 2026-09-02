/* ─────────────────────────────────────────────────────────────
   SORTING HELPER
   ───────────────────────────────────────────────────────────── */
export function sortCommunities(list, sortBy) {
  const copy = [...list];
  if (sortBy === 'popular') return copy.sort((a, b) => b.members - a.members);
  if (sortBy === 'name') return copy.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === 'events') return copy.sort((a, b) => b.activeEvents - a.activeEvents);
  return copy;
}

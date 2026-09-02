/**
 * localStorage-backed follow set for buddies.
 */
/* ─────────────────────────────────────────────────────────────
   PERSISTENCE HELPERS
   ───────────────────────────────────────────────────────────── */
export function loadSet(key) {
  try {
    const s = localStorage.getItem(key);
    if (s) return new Set(JSON.parse(s));
  } catch { /* ignore */ }
  return new Set();
}

export function saveSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

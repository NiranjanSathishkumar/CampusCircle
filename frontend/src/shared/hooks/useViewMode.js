import { useCallback, useState } from 'react';

/**
 * Persists a page's card/list view preference to localStorage under its own key,
 * so Discover, Events, Communities, Buddies, and My Events each remember their
 * own choice independently.
 */
export function useViewMode(storageKey, defaultMode = 'grid') {
  const [viewMode, setViewModeState] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === 'list' || stored === 'grid' ? stored : defaultMode;
    } catch {
      return defaultMode;
    }
  });

  const setViewMode = useCallback((mode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(storageKey, mode);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  return [viewMode, setViewMode];
}

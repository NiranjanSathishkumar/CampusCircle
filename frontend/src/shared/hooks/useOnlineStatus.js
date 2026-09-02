import { useEffect, useState } from 'react';

/**
 * Tracks browser connectivity via the online/offline events. This only
 * reflects whether the device has a network interface up — it can't detect
 * a reachable-but-broken backend, so pair it with per-request error
 * handling (ApiError) for that case.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}

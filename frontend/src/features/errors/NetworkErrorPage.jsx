import { WifiSlash, ArrowsClockwise } from '@phosphor-icons/react';
import StatusPage from '@/shared/components/StatusPage';

/**
 * Shown when the browser has no network connection at all (navigator
 * offline / window 'offline' event), or when a caller explicitly wants a
 * full-page "can't reach CampusCircle" state for a failed critical fetch.
 */
export default function NetworkErrorPage({ onRetry }) {
  return (
    <StatusPage
      icon={WifiSlash}
      code="Connection Lost"
      tone="ink"
      title="You're offline"
      description="CampusCircle can't reach the server right now. Check your Wi-Fi or campus network connection, then try again."
      primaryAction={
        <button
          type="button"
          className="btn-primary"
          onClick={onRetry || (() => window.location.reload())}
        >
          <ArrowsClockwise size={16} />
          Retry
        </button>
      }
    />
  );
}

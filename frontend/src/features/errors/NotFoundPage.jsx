import { Link } from 'react-router-dom';
import { Compass, House, ArrowLeft } from '@phosphor-icons/react';
import StatusPage from '@/shared/components/StatusPage';

/**
 * Route-not-found page. Used both as the top-level catch-all and, scoped
 * inside the portal shells, for unmatched /organizer/* and /admin/* paths —
 * `homePath`/`homeLabel` let it point "home" at the right place for
 * whichever shell it's rendered in.
 */
export default function NotFoundPage({ homePath = '/', homeLabel = 'Back to Home' }) {
  return (
    <StatusPage
      icon={Compass}
      code="404 · Record Not Found"
      tone="crimson"
      title="This page doesn't exist"
      description="The page you're looking for may have been moved, renamed, or never existed. Double-check the link, or head back to somewhere that does."
      primaryAction={
        <Link to={homePath} className="btn-primary">
          <House size={16} />
          {homeLabel}
        </Link>
      }
      secondaryAction={
        <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
          <ArrowLeft size={16} />
          Go Back
        </button>
      }
    />
  );
}

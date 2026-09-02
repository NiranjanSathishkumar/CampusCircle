import { Link, useLocation } from 'react-router-dom';
import { LockKey, SignIn } from '@phosphor-icons/react';
import StatusPage from '@/shared/components/StatusPage';

/**
 * 401 state — session missing or expired. Distinct from ForbiddenPage
 * (403): this means "we don't know who you are", not "we know who you are
 * and you can't do this". `loginPath` lets callers point at the right
 * role's login (student/organizer/admin); the current location is passed
 * along so the login flow can bounce back here afterward.
 */
export default function UnauthorizedPage({ loginPath = '/login' }) {
  const location = useLocation();

  return (
    <StatusPage
      icon={LockKey}
      code="401 · Sign-In Required"
      tone="crimson"
      title="Your session has expired"
      description="You need to be signed in with a valid CampusCircle account to view this page. Sign in again to continue where you left off."
      primaryAction={
        <Link to={loginPath} state={{ from: location }} className="btn-primary">
          <SignIn size={16} />
          Sign In
        </Link>
      }
      secondaryAction={
        <Link to="/" className="btn-secondary">
          Back to Home
        </Link>
      }
    />
  );
}

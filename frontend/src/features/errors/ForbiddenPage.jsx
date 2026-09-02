import { Link } from 'react-router-dom';
import { Prohibit, House } from '@phosphor-icons/react';
import StatusPage from '@/shared/components/StatusPage';

/**
 * 403 state — the visitor is authenticated but this account (role) isn't
 * allowed here, e.g. a student session hitting an organizer/admin-only
 * resource. Distinct from UnauthorizedPage (401): identity is known, it's
 * just not permitted.
 */
export default function ForbiddenPage({ homePath = '/', homeLabel = 'Back to Home' }) {
  return (
    <StatusPage
      icon={Prohibit}
      code="403 · Access Denied"
      tone="gold"
      title="You don't have access to this page"
      description="Your account doesn't have permission to view this page. If you think this is a mistake, contact the Help & Grievance Desk."
      primaryAction={
        <Link to={homePath} className="btn-primary">
          <House size={16} />
          {homeLabel}
        </Link>
      }
    />
  );
}

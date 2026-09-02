import { useOrganizerAuth } from './useOrganizerAuth';
import UnauthorizedPage from '@/features/errors/UnauthorizedPage';

// Gates the whole /organizer/* subtree (mounted once around OrganizerLayout,
// which every nested route renders through via <Outlet/>). Previously
// nothing stopped an unauthenticated visitor from navigating straight to
// e.g. /organizer/dashboard by URL and landing in the portal shell.
export default function RequireOrganizerAuth({ children }) {
  const { isOrganizerLoggedIn, initializing } = useOrganizerAuth();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EA]">
        <span className="w-6 h-6 border-2 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isOrganizerLoggedIn) {
    return <UnauthorizedPage loginPath="/organizer/login" />;
  }

  return children;
}

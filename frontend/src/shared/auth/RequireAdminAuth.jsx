import { useAdminAuth } from './useAdminAuth';
import UnauthorizedPage from '@/features/errors/UnauthorizedPage';

// Gates the whole /admin/* subtree (mounted once around AdminLayout, which
// every nested route renders through via <Outlet/>). Previously nothing
// stopped an unauthenticated visitor from navigating straight to e.g.
// /admin/dashboard by URL and landing in the console shell.
export default function RequireAdminAuth({ children }) {
  const { isAdminLoggedIn, initializing } = useAdminAuth();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EA]">
        <span className="w-6 h-6 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <UnauthorizedPage loginPath="/admin/login" />;
  }

  return children;
}

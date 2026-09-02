import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/shared/auth/AuthContext';
import { OrganizerAuthProvider } from '@/shared/auth/OrganizerAuthContext';
import { AdminAuthProvider } from '@/shared/auth/AdminAuthContext';
import RequireOrganizerAuth from '@/shared/auth/RequireOrganizerAuth';
import RequireAdminAuth from '@/shared/auth/RequireAdminAuth';
import ScrollToTop from '@/shared/behaviors/ScrollToTop';
import LegacyHashRedirect from '@/shared/behaviors/LegacyHashRedirect';
import SecretShortcutListener from '@/shared/behaviors/SecretShortcutListener';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';

import NotFoundPage from '@/features/errors/NotFoundPage';
import NetworkErrorPage from '@/features/errors/NetworkErrorPage';
import UnauthorizedPage from '@/features/errors/UnauthorizedPage';
import ForbiddenPage from '@/features/errors/ForbiddenPage';

import LandingPage from '@/features/landing/LandingPage';
import SignupPage from '@/features/auth/SignupPage';
import LoginPage from '@/features/auth/LoginPage';
import DiscoverPage from '@/features/discover/DiscoverPage';
import EventsPage from '@/features/events/EventsPage';
import ProfilePage from '@/features/profile/ProfilePage';
import CommunitiesPage from '@/features/communities/CommunitiesPage';
import BuddiesPage from '@/features/buddies/BuddiesPage';
import MyEventsPage from '@/features/my-events/MyEventsPage';
import ClosedCampusPolicyPage from '@/features/legal/ClosedCampusPolicyPage';
import CodeOfConductPage from '@/features/legal/CodeOfConductPage';
import StudentDataPrivacyPage from '@/features/legal/StudentDataPrivacyPage';
import TermsOfServicePage from '@/features/legal/TermsOfServicePage';
import SecurityDomainLockPage from '@/features/legal/SecurityDomainLockPage';
import AdminLayout from '@/portal/admin/AdminLayout';
import AdminDashboardPage from '@/portal/admin/dashboard/AdminDashboardPage';
import AdminCommunitiesPage from '@/portal/admin/communities/AdminCommunitiesPage';
import AdminStudentsPage from '@/portal/admin/students/AdminStudentsPage';
import AdminAuditLogPage from '@/portal/admin/audit-log/AdminAuditLogPage';
import AdminSettingsPage from '@/portal/admin/settings/AdminSettingsPage';

import OrganizerLayout from '@/portal/organizer/OrganizerLayout';
import OrganizerDashboardPage from '@/portal/organizer/dashboard/OrganizerDashboardPage';
import OrganizerPostsPage from '@/portal/organizer/posts/OrganizerPostsPage';
import OrganizerEventsPage from '@/portal/organizer/events/OrganizerEventsPage';
import OrganizerCreateEventPage from '@/portal/organizer/events/OrganizerCreateEventPage';
import OrganizerEventDetailPage from '@/portal/organizer/events/OrganizerEventDetailPage';
import OrganizerScanPage from '@/portal/organizer/events/OrganizerScanPage';
import OrganizerRosterPage from '@/portal/organizer/roster/OrganizerRosterPage';
import OrganizerRecruitmentPage from '@/portal/organizer/recruitment/OrganizerRecruitmentPage';
import OrganizerRecruitmentDetailPage from '@/portal/organizer/recruitment/OrganizerRecruitmentDetailPage';
import OrganizerRecruitmentRosterPage from '@/portal/organizer/recruitment/OrganizerRecruitmentRosterPage';
import OrganizerAnalyticsPage from '@/portal/organizer/analytics/OrganizerAnalyticsPage';
import OrganizerEventAnalyticsPage from '@/portal/organizer/analytics/OrganizerEventAnalyticsPage';
import OrganizerAchievementsPage from '@/portal/organizer/achievements/OrganizerAchievementsPage';
import OrganizerSettingsPage from '@/portal/organizer/settings/OrganizerSettingsPage';

export default function App() {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return <NetworkErrorPage />;
  }

  return (
    <AuthProvider>
      <OrganizerAuthProvider>
        <AdminAuthProvider>
          <ScrollToTop />
          <LegacyHashRedirect />
          <SecretShortcutListener />
          <Routes>
        {/* ── Student Interface Routes (No Prefix) ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage initialRole="student" />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/discover/posts/:postId" element={<DiscoverPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/detail/:eventId" element={<EventsPage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/communities/detail/:communityId" element={<CommunitiesPage />} />
        <Route path="/buddies" element={<BuddiesPage />} />
        <Route path="/buddies/detail/:buddyId" element={<BuddiesPage />} />
        <Route path="/myevents" element={<MyEventsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />

        {/* ── Static Legal Pages ── */}
        <Route path="/closed-campus-policy" element={<ClosedCampusPolicyPage />} />
        <Route path="/code-of-conduct" element={<CodeOfConductPage />} />
        <Route path="/student-data-privacy" element={<StudentDataPrivacyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/security-domain-lock" element={<SecurityDomainLockPage />} />

        {/* ── Error / Status Pages ── */}
        <Route path="/network-error" element={<NetworkErrorPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />

        {/* ── Organizer Interface Routes (/organizer) ── */}
        <Route path="/organizer/login" element={<LoginPage initialRole="organizer" />} />
        <Route
          path="/organizer"
          element={
            <RequireOrganizerAuth>
              <OrganizerLayout />
            </RequireOrganizerAuth>
          }
        >
          <Route index element={<Navigate to="/organizer/dashboard" replace />} />
          <Route path="dashboard" element={<OrganizerDashboardPage />} />
          <Route path="posts" element={<OrganizerPostsPage />} />
          <Route path="events" element={<OrganizerEventsPage />} />
          <Route path="events/create" element={<OrganizerCreateEventPage />} />
          <Route path="events/new" element={<OrganizerCreateEventPage />} />
          <Route path="events/:eventId/edit" element={<OrganizerCreateEventPage />} />
          <Route path="events/:eventId" element={<OrganizerEventDetailPage />} />
          <Route path="events/:eventId/scan" element={<OrganizerScanPage />} />
          <Route path="roster" element={<OrganizerRosterPage />} />
          <Route path="recruitment" element={<OrganizerRecruitmentPage />} />
          <Route path="recruitment/roster" element={<OrganizerRecruitmentRosterPage />} />
          <Route path="recruitment/:driveId" element={<OrganizerRecruitmentDetailPage />} />
          <Route path="analytics" element={<OrganizerAnalyticsPage />} />
          <Route path="analytics/:eventId" element={<OrganizerEventAnalyticsPage />} />
          <Route path="achievements" element={<OrganizerAchievementsPage />} />
          <Route path="settings" element={<OrganizerSettingsPage />} />
          <Route
            path="*"
            element={<NotFoundPage homePath="/organizer/dashboard" homeLabel="Back to Dashboard" />}
          />
        </Route>

        {/* ── Admin Interface Routes (/admin) ── */}
        <Route path="/admin/login" element={<LoginPage initialRole="admin" />} />
        <Route
          path="/admin"
          element={
            <RequireAdminAuth>
              <AdminLayout />
            </RequireAdminAuth>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="communities" element={<AdminCommunitiesPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="audit-log" element={<AdminAuditLogPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route
            path="*"
            element={<NotFoundPage homePath="/admin/dashboard" homeLabel="Back to Dashboard" />}
          />
        </Route>

        {/* ── Catch-All 404 ── */}
        <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AdminAuthProvider>
      </OrganizerAuthProvider>
    </AuthProvider>
  );
}

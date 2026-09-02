/**
 * AdminDashboardPage.jsx — Admin Console landing page.
 * Platform-wide counts only — per-community analytics stays Organiser-only
 * (Section 2 of the product doc); this is an overview, not that dashboard.
 *
 * Wired to /api/admin/dashboard. There's no "flagged login" concept in the
 * backend (AuditLog has no flagged field — see AdminAuditLogPage), so the
 * stat that used to read "Flagged Logins" is now a truthful "Recent Logins"
 * count (shared-login events in the last 7 days) instead of faking a flag.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Buildings,
  UsersThree,
  CalendarCheck,
  ShieldWarning,
  Plus,
  Warning,
} from '@phosphor-icons/react';
import { getDashboardOverview } from '@/portal/admin/admin.api';
import { ApiError } from '@/shared/api/httpClient';
import EmptyState from '@/layouts/portal/components/EmptyState';
import StatCard from '@/layouts/portal/components/StatCard';
import BarList from '@/layouts/portal/components/BarList';
import '@/layouts/portal/portal-widgets.css';
import './adm-dashboard.css';

const ACTIVITY_ICON = {
  community: Buildings,
  student: UsersThree,
  login: ShieldWarning,
};

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getDashboardOverview()
      .then((data) => {
        if (cancelled) return;
        setStats(data.stats);
        setActivityFeed(data.activityFeed);
        setCategoryBreakdown(data.categoryBreakdown);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load dashboard data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="org-page">
        <EmptyState icon={Buildings} title="Loading dashboard…" desc="Fetching platform-wide stats." />
      </div>
    );
  }

  return (
    <div className="org-page">
      <div className="org-page-header">
        <div>
          <p className="org-page-eyebrow">Admin Console</p>
          <h1 className="org-page-title">Dashboard</h1>
          <p className="org-page-desc">
            Platform-wide counts and what needs your attention — community vetting and shared-login security, not day-to-day event operations.
          </p>
        </div>
        <div className="org-page-actions">
          <button className="org-btn org-btn-primary" onClick={() => navigate('/admin/communities?new=1')}>
            <Plus size={15} weight="bold" /> New Community
          </button>
        </div>
      </div>

      {error && (
        <p className="adm-form-error" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Warning size={14} /> {error}
        </p>
      )}

      <div className="org-stat-grid">
        <StatCard label="Communities" value={stats?.totalCommunities ?? 0} icon={Buildings} accent="#1A3A2A" onClick={() => navigate('/admin/communities')} />
        <StatCard label="Students" value={(stats?.totalStudents ?? 0).toLocaleString()} icon={UsersThree} accent="#0284C7" onClick={() => navigate('/admin/students')} />
        <StatCard label="Events Hosted" value={stats?.totalEvents ?? 0} icon={CalendarCheck} accent="#B45309" />
        <StatCard label="Recent Logins" value={stats?.recentLogins ?? 0} subtitle="Last 7 days" icon={ShieldWarning} accent="#991B1B" onClick={() => navigate('/admin/audit-log')} />
      </div>

      <div className="adm-dashboard-grid">
        <div className="org-card">
          <div className="org-card-header">
            <h2 className="org-card-title">Recent Activity</h2>
          </div>
          <div className="org-card-pad adm-activity-feed">
            {activityFeed.length === 0 ? (
              <p className="org-table-muted" style={{ fontSize: '0.8125rem' }}>No recent activity yet.</p>
            ) : (
              activityFeed.map((a) => {
                const Icon = ACTIVITY_ICON[a.type] || Buildings;
                return (
                  <div className="adm-activity-row" key={a.id}>
                    <span className="adm-activity-icon">
                      <Icon size={14} weight="bold" />
                    </span>
                    <div className="adm-activity-content">
                      <p>{a.text}</p>
                      <span>{timeAgo(a.time)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="adm-dashboard-side">
          <div className="org-card org-card-pad">
            <p className="org-section-title">Communities by Category</p>
            <BarList data={categoryBreakdown} accent="#1A3A2A" />
          </div>

          <div className="org-card">
            <div className="org-card-header">
              <h2 className="org-card-title">Shortcuts</h2>
            </div>
            <div className="adm-shortcut-list">
              <button onClick={() => navigate('/admin/communities')}>
                <Buildings size={15} /> Manage Communities
              </button>
              <button onClick={() => navigate('/admin/students')}>
                <UsersThree size={15} /> Student Directory
              </button>
              <button onClick={() => navigate('/admin/audit-log')}>
                <ShieldWarning size={15} /> Review Audit Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

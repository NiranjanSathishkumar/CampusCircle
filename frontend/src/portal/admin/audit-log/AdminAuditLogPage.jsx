/**
 * AdminAuditLogPage.jsx — Platform-wide shared-login audit trail.
 * The organiser side shows each community its own login history; this is
 * the cross-community view — the actual oversight mechanism the product
 * doc ties to the shared-login risk model (Section 15).
 *
 * Wired to /api/admin/audit-logs. That collection only stores community,
 * userAgent, ipAddress and createdAt — there's no per-login "flagged" flag
 * and no individual "member" attribution (shared logins are deliberately
 * login-level, not action-level, accountability — see AuditLog.js), so
 * those columns from the earlier mock-data version of this page are gone.
 * Device is parsed client-side from the raw userAgent string for display.
 */
import { useEffect, useMemo, useState } from 'react';
import { ShieldWarning, DeviceMobile, Desktop, Funnel, Warning } from '@phosphor-icons/react';
import EmptyState from '@/layouts/portal/components/EmptyState';
import { listOrganizers, listAuditLogs } from '@/portal/admin/admin.api';
import { ApiError } from '@/shared/api/httpClient';
import '@/layouts/portal/portal-widgets.css';
import './adm-audit-log.css';

function parseUserAgent(ua = '') {
  let browser = 'Unknown browser';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua)) browser = 'Safari';

  let os = 'unknown OS';
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  return { label: `${browser} on ${os}`, isMobile: /iPhone|iPad|Android/.test(ua) };
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminAuditLogPage() {
  const [communities, setCommunities] = useState([]);
  const [community, setCommunity] = useState('all');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listOrganizers().then(({ organizers }) => setCommunities(organizers)).catch(() => {
      /* filter dropdown just stays empty — logs themselves still load below */
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    listAuditLogs(community === 'all' ? {} : { community })
      .then(({ logs: fetchedLogs }) => {
        if (!cancelled) setLogs(fetchedLogs);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load audit logs.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [community]);

  const rows = useMemo(
    () => logs.map((log) => ({
      id: log._id,
      community: log.community?.name || 'Unknown community',
      device: parseUserAgent(log.userAgent),
      ip: log.ipAddress || '—',
      loginAt: log.createdAt,
    })),
    [logs]
  );

  return (
    <div className="org-page">
      <div className="org-page-header">
        <div>
          <p className="org-page-eyebrow">Security</p>
          <h1 className="org-page-title">Audit Log</h1>
          <p className="org-page-desc">
            Every shared-login access across every community. Since these credentials are shared by 3–8 people, device/time tracking — not per-action attribution — is the mechanism that catches misuse.
          </p>
        </div>
        <span className="org-topbar-badge">{rows.length} logins</span>
      </div>

      <div className="org-toolbar">
        <div className="adm-filter-select-wrap">
          <Funnel size={13} />
          <select className="org-form-select" value={community} onChange={(e) => setCommunity(e.target.value)}>
            <option value="all">All Communities</option>
            {communities.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <p className="adm-form-error" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Warning size={14} /> {error}
        </p>
      )}

      {loading ? (
        <EmptyState icon={ShieldWarning} title="Loading audit log…" desc="Fetching shared-login history." />
      ) : rows.length === 0 ? (
        <EmptyState icon={ShieldWarning} title="No matching logins" desc="Try a different community filter." />
      ) : (
        <div className="org-card">
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Community</th>
                  <th className="org-hide-mobile">Device</th>
                  <th className="org-hide-mobile">IP Address</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((log) => (
                  <tr key={log.id}>
                    <td>{log.community}</td>
                    <td className="org-table-muted org-hide-mobile">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {log.device.isMobile ? <DeviceMobile size={13} /> : <Desktop size={13} />}
                        {log.device.label}
                      </span>
                    </td>
                    <td className="org-table-muted org-hide-mobile" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem' }}>{log.ip}</td>
                    <td className="org-table-muted">{timeAgo(log.loginAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

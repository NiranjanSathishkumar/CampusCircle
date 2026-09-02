/**
 * RecruitmentTab.jsx — the student's own recruitment history: applications
 * submitted to community drives, and the community memberships that
 * resulted from being selected. Both endpoints (/recruitment/applications/mine,
 * /recruitment/members/mine) existed on the backend with no frontend page
 * showing them before this.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, UsersThree, Buildings } from '@phosphor-icons/react';
import { fetchMyApplications, fetchMyMemberships } from '@/features/communities/communities.api';
import { ApiError } from '@/shared/api/httpClient';

const STATUS_STYLE = {
  pending: { label: 'Pending Review', bg: '#FFFBEB', color: '#B45309', border: 'rgba(180, 83, 9, 0.25)' },
  selected: { label: 'Selected', bg: '#ECFDF5', color: '#1A3A2A', border: 'rgba(26, 58, 42, 0.25)' },
  rejected: { label: 'Not Selected', bg: '#F3F4F6', color: '#6B7280', border: 'rgba(107, 114, 128, 0.25)' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.625rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '0.15rem 0.5rem',
        borderRadius: 2,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
  );
}

export default function RecruitmentTab() {
  const [subTab, setSubTab] = useState('applications'); // 'applications' | 'memberships'
  const [applications, setApplications] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    Promise.all([fetchMyApplications(), fetchMyMemberships()])
      .then(([appsRes, memsRes]) => {
        if (cancelled) return;
        setApplications(appsRes.applications || []);
        setMemberships(memsRes.memberships || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof ApiError ? err.message : 'Could not load your recruitment history.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="profile-section-header">
        <div>
          <h2 className="profile-section-title">Recruitment</h2>
          <p className="profile-section-desc">
            Applications you've submitted to community recruitment drives, and the memberships they resulted in.
          </p>
        </div>
        <Link to="/communities" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.8125rem' }}>
          Find Open Roles
        </Link>
      </div>

      <div className="club-toolbar" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button
            onClick={() => setSubTab('applications')}
            className={`events-community-btn ${subTab === 'applications' ? 'active' : ''}`}
            style={{ fontSize: '0.75rem', padding: '0.3125rem 0.75rem' }}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setSubTab('memberships')}
            className={`events-community-btn ${subTab === 'memberships' ? 'active' : ''}`}
            style={{ fontSize: '0.75rem', padding: '0.3125rem 0.75rem' }}
          >
            Memberships ({memberships.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[200px] flex items-center justify-center py-12">
          <span className="w-6 h-6 border-2 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : loadError ? (
        <div className="profile-empty-box">
          <div className="profile-empty-icon"><Briefcase size={24} /></div>
          <h3 className="profile-empty-title">Could not load recruitment history</h3>
          <p className="profile-empty-desc">{loadError}</p>
        </div>
      ) : subTab === 'applications' ? (
        applications.length === 0 ? (
          <div className="profile-empty-box">
            <div className="profile-empty-icon"><Briefcase size={24} /></div>
            <h3 className="profile-empty-title">No applications yet</h3>
            <p className="profile-empty-desc">
              Explore campus communities and apply to an open recruitment drive to see it here.
            </p>
            <Link to="/communities" className="btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>
              Discover Communities
            </Link>
          </div>
        ) : (
          <div className="club-grid">
            {applications.map((app) => {
              const communityId = app.recruitment?.community?._id;
              const communityName = app.recruitment?.community?.name || 'Unknown Community';
              const logoUrl = app.recruitment?.community?.logo?.cloudinaryUrl || app.recruitment?.community?.logo?.filename;
              return (
                <div key={app._id} className="club-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 4,
                        background: 'rgba(26, 58, 42, 0.12)',
                        color: '#1A3A2A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}
                    >
                      {logoUrl ? (
                        <img src={logoUrl} alt={communityName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Buildings size={20} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                        {app.recruitment?.title || 'Recruitment Drive'}
                      </h3>
                      {communityId ? (
                        <Link
                          to={`/communities/detail/${communityId}`}
                          style={{ fontSize: '0.75rem', color: '#6B7280', textDecoration: 'none' }}
                        >
                          {communityName}
                        </Link>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{communityName}</span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid #D8D2C4',
                    }}
                  >
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.625rem', color: '#6B7280' }}>
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : memberships.length === 0 ? (
        <div className="profile-empty-box">
          <div className="profile-empty-icon"><UsersThree size={24} /></div>
          <h3 className="profile-empty-title">No memberships yet</h3>
          <p className="profile-empty-desc">
            Once a community selects you from a recruitment drive (or adds you directly), your membership shows up here.
          </p>
        </div>
      ) : (
        <div className="club-grid">
          {memberships.map((m) => {
            const logoUrl = m.community?.logo?.cloudinaryUrl || m.community?.logo?.filename;
            return (
              <div key={m._id} className="club-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link
                    to={`/communities/detail/${m.community?._id}`}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 4,
                      background: 'rgba(26, 58, 42, 0.12)',
                      color: '#1A3A2A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0,
                      overflow: 'hidden',
                      textDecoration: 'none',
                    }}
                  >
                    {logoUrl ? (
                      <img src={logoUrl} alt={m.community?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Buildings size={20} />
                    )}
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                      <Link to={`/communities/detail/${m.community?._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {m.community?.name || 'Community'}
                      </Link>
                    </h3>
                    <span className="event-category-badge" style={{ marginTop: 2 }}>{m.label}</span>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #D8D2C4',
                  }}
                >
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.625rem', color: '#6B7280' }}>
                    Member since {new Date(m.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

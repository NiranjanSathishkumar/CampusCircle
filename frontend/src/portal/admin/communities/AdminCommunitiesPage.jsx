/**
 * AdminCommunitiesPage.jsx — Create, list, and (de)activate communities.
 * Manual creation is the only path (Section 16 of the product doc rejected
 * self-serve signup + approval queues) — this page is that entire flow.
 * Wired to /api/admin/organizers. There's no backend route to edit an
 * existing organiser's name/category/email — only activate/deactivate — so
 * unlike earlier mock-data versions of this page, "Edit" isn't offered here;
 * those details are fixed at creation time.
 */
import { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, MagnifyingGlass, Buildings, Power, ShieldCheck, X, CircleNotch, Warning } from '@phosphor-icons/react';
import EmptyState from '@/layouts/portal/components/EmptyState';
import AdminCommunityFormModal, { EMPTY_COMMUNITY } from './AdminCommunityFormModal';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { listOrganizers, createOrganizer, updateOrganizerStatus } from '@/portal/admin/admin.api';
import { ApiError } from '@/shared/api/httpClient';
import '@/layouts/portal/portal-widgets.css';
import './adm-communities.css';

// Decorative only — Community has no icon/color field on the backend, so
// these are derived deterministically from category rather than stored.
const CATEGORY_STYLE = {
  'Technology & Development': { icon: '⚡', color: '#1A3A2A' },
  'Arts & Culture': { icon: '🎨', color: '#7E1D5F' },
  'Sports & Fitness': { icon: '🏆', color: '#14532D' },
  'Academic & Literary': { icon: '📚', color: '#134E4A' },
  'Social & Cultural': { icon: '🎉', color: '#7C2D12' },
};
const DEFAULT_STYLE = { icon: '⭐', color: '#334155' };

function toRow(c) {
  return {
    id: c._id,
    name: c.name,
    category: c.category,
    logoUrl: c.logo?.cloudinaryUrl || c.logo?.filename,
    ...(CATEGORY_STYLE[c.category] || DEFAULT_STYLE),
    verified: c.isVerified,
    isActive: c.isActive,
    followers: c.followerCount || 0,
    memberCount: c.coreTeam?.length || 0,
    sharedEmail: c.email,
    createdOn: c.createdAt ? c.createdAt.slice(0, 10) : '',
  };
}

function ToggleStatusModal({ community, onClose, onConfirm, busy }) {
  const modalRef = useRef(null);
  useFocusTrap(modalRef, true, onClose);

  const activating = !community.isActive;
  return (
    <div className="org-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={modalRef} className="org-modal" style={{ maxWidth: 440 }} role="dialog" aria-modal="true">
        <div className="org-modal-header">
          <h2 className="org-modal-title">{activating ? 'Reactivate' : 'Deactivate'} Community?</h2>
          <button className="org-icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="org-modal-body">
          <p className="adm-modal-notice" style={{ background: activating ? 'rgba(26,58,42,0.08)' : 'rgba(153,27,27,0.08)', color: activating ? '#1A3A2A' : '#991B1B' }}>
            {activating
              ? `${community.name} will regain organiser login access and reappear across the student app.`
              : `${community.name}'s shared login will be locked and the community hidden from students. Data isn't deleted — this can be reversed.`}
          </p>
        </div>
        <div className="org-modal-footer">
          <button className="org-btn org-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className={activating ? 'org-btn org-btn-primary' : 'org-btn org-btn-danger'} onClick={onConfirm} disabled={busy}>
            {busy ? 'Saving…' : activating ? 'Reactivate' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCommunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toggleTarget, setToggleTarget] = useState(null);
  const [toggling, setToggling] = useState(false);

  const loadCommunities = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { organizers } = await listOrganizers();
      setCommunities(organizers.map(toRow));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load communities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setDraft({ ...EMPTY_COMMUNITY });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(
    () => communities.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [communities, search]
  );

  const handleSave = async (data) => {
    setSaving(true);
    setFormError('');
    try {
      const { community } = await createOrganizer({
        name: data.name.trim(),
        email: data.sharedEmail.trim(),
        password: data.sharedPassword,
        category: data.category,
      });
      setCommunities((prev) => [toRow(community), ...prev]);
      setDraft(null);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not create community.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    setToggling(true);
    try {
      const { community } = await updateOrganizerStatus(toggleTarget.id, !toggleTarget.isActive);
      setCommunities((prev) => prev.map((c) => (c.id === toggleTarget.id ? toRow(community) : c)));
      setToggleTarget(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not update community status.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="org-page">
      <div className="org-page-header">
        <div>
          <p className="org-page-eyebrow">Platform</p>
          <h1 className="org-page-title">Communities</h1>
          <p className="org-page-desc">
            Every community on CampusCircle is created here, manually, after off-platform vetting. There's no self-serve signup and no approval queue — this form is the approval.
          </p>
        </div>
        <div className="org-page-actions">
          <button className="org-btn org-btn-primary" onClick={() => { setFormError(''); setDraft({ ...EMPTY_COMMUNITY }); }}>
            <Plus size={15} weight="bold" /> Create Community
          </button>
        </div>
      </div>

      <div className="org-toolbar">
        <div className="org-search-wrap">
          <MagnifyingGlass size={14} className="org-search-icon" />
          <input className="org-search-input" placeholder="Search communities…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span className="org-badge">{communities.length} communities</span>
      </div>

      {loadError && (
        <p className="adm-form-error" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Warning size={14} /> {loadError}
        </p>
      )}

      {loading ? (
        <EmptyState icon={CircleNotch} title="Loading communities…" desc="Fetching the organizer roster." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Buildings} title="No communities found" desc="Try a different search, or create a new community." />
      ) : (
        <div className="org-card">
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Community</th>
                  <th className="org-hide-mobile">Category</th>
                  <th className="org-hide-mobile">Followers</th>
                  <th>Shared Login</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="adm-community-cell">
                        <span className="adm-community-icon overflow-hidden" style={{ background: `${c.color}18`, color: c.color }}>
                          {c.logoUrl ? (
                            <img src={c.logoUrl} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            c.icon
                          )}
                        </span>
                        <div>
                          <div className="adm-community-name">
                            {c.name}
                            {c.verified && <ShieldCheck size={13} weight="fill" style={{ color: '#1A3A2A' }} title="Verified" />}
                          </div>
                          <div className="org-table-muted" style={{ fontSize: '0.6875rem' }}>Created {c.createdOn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="org-table-muted org-hide-mobile">{c.category}</td>
                    <td className="org-table-muted org-hide-mobile">{c.followers.toLocaleString()}</td>
                    <td className="org-table-muted" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem' }}>{c.sharedEmail}</td>
                    <td>
                      <span className="org-status-pill" style={c.isActive ? { color: '#1A3A2A', background: 'rgba(26,58,42,0.1)' } : { color: '#6B7280', background: 'rgba(107,114,128,0.12)' }}>
                        {c.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>
                      <div className="org-events-row-actions">
                        <button className="org-icon-btn org-icon-btn--danger" title={c.isActive ? 'Deactivate' : 'Reactivate'} onClick={() => setToggleTarget(c)}>
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {draft && (
        <AdminCommunityFormModal
          draft={draft}
          onChange={setDraft}
          onClose={() => setDraft(null)}
          onSave={handleSave}
          saving={saving}
          error={formError}
        />
      )}
      {toggleTarget && (
        <ToggleStatusModal
          community={toggleTarget}
          onClose={() => setToggleTarget(null)}
          onConfirm={handleToggleStatus}
          busy={toggling}
        />
      )}
    </div>
  );
}

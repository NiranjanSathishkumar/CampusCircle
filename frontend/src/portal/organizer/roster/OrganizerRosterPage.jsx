/**
 * OrganizerRosterPage.jsx — Committee roster (Community.coreTeam), wired to
 * /api/community/core-team. See roster.api.js for why member profile data
 * (name, branch, email, avatar) is fetched per-member via /api/profile/lookup
 * rather than stored on the core team record itself.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  MagnifyingGlass,
  Trash,
  X,
  UsersThree,
  PencilSimple,
  Check,
  SquaresFour,
  Table,
  TreeStructure,
  ShieldCheck,
  Sparkle,
  Warning,
  CircleNotch,
  Crown,
  Key,
  Copy,
  EnvelopeSimple,
  GraduationCap,
  DownloadSimple,
  Code,
  PaintBrush,
  Megaphone,
  CurrencyInr,
  Broadcast,
  Handshake,
} from '@phosphor-icons/react';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
import { addCoreTeamMember, updateCoreTeamMemberRole, removeCoreTeamMember, lookupStudent } from '@/portal/organizer/roster/roster.api';
import { ApiError } from '@/shared/api/httpClient';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { formatCount } from '@/shared/utils/formatters';
import EmptyState from '@/layouts/portal/components/EmptyState';
import '@/layouts/portal/portal-widgets.css';
import './org-roster.css';
import {
  getInitials,
  getRoleCategory,
  getRoleTheme,
  PRESET_ROLES,
  HIERARCHY_GROUPS,
} from '@/portal/organizer/roster/rosterConstants';
import AddMemberModal from '@/portal/organizer/roster/components/AddMemberModal';
import AuditAccessModal from '@/portal/organizer/roster/components/AuditAccessModal';

// Helper icon component for role categories
function RoleCategoryIcon({ category, size = 14, className = '' }) {
  switch (category) {
    case 'leadership':
      return <Crown size={size} weight="fill" className={className} />;
    case 'technical':
      return <Code size={size} weight="bold" className={className} />;
    case 'design':
      return <PaintBrush size={size} weight="fill" className={className} />;
    case 'finance':
      return <CurrencyInr size={size} weight="bold" className={className} />;
    case 'outreach':
      return <Broadcast size={size} weight="fill" className={className} />;
    case 'events':
      return <Megaphone size={size} weight="fill" className={className} />;
    default:
      return <Handshake size={size} weight="bold" className={className} />;
  }
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMMITTEE ROSTER PAGE
   ───────────────────────────────────────────────────────────── */
export default function OrganizerRosterPage() {
  const { community, updateCommunity } = useOrganizerAuth();
  const communityName = community?.name || 'Your Community';
  const [searchParams, setSearchParams] = useSearchParams();

  const coreTeam = useMemo(() => community?.coreTeam || [], [community]);

  // Profiles cache
  const [profiles, setProfiles] = useState({}); // studentId -> profile | 'error' | undefined
  const loadProfiles = useCallback(async () => {
    const ids = coreTeam
      .map((m) => (typeof m.user === 'object' ? m.user?._id || m.user?.id : m.user))
      .filter(Boolean);
    const missing = ids.filter((id) => profiles[id] === undefined);
    if (missing.length === 0) return;
    setProfiles((prev) => {
      const next = { ...prev };
      missing.forEach((id) => { next[id] = null; });
      return next;
    });
    const results = await Promise.all(
      missing.map(async (id) => {
        try {
          const res = await lookupStudent({ studentId: id });
          const user = res.student || res.user || res;
          return [id, user];
        } catch {
          return [id, 'error'];
        }
      })
    );
    setProfiles((prev) => {
      const next = { ...prev };
      results.forEach(([id, val]) => { next[id] = val; });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coreTeam]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const members = useMemo(
    () =>
      coreTeam.map((m) => {
        const userId = typeof m.user === 'object' ? m.user?._id || m.user?.id : m.user;
        const profile = profiles[userId];
        const role = m.role || 'Member';
        const theme = getRoleTheme(role);
        return {
          id: userId,
          role,
          category: theme.category,
          theme,
          name: profile && profile !== 'error' ? profile.name : profile === 'error' ? 'Unknown Student' : '',
          email: profile && profile !== 'error' ? profile.email : null,
          branch: profile && profile !== 'error' ? profile.branch : null,
          yearOfJoining: profile && profile !== 'error' ? profile.yearOfJoining : null,
          loading: profile === null,
          notFound: profile === 'error',
        };
      }),
    [coreTeam, profiles]
  );

  const [sortBy, setSortBy] = useState('hierarchy'); // 'hierarchy' | 'name' | 'branch'
  const [selectedBranch, setSelectedBranch] = useState('all');

  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  const [showAdd, setShowAdd] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [busyIds, setBusyIds] = useState(() => new Set());
  const removeModalRef = useRef(null);
  useFocusTrap(removeModalRef, Boolean(memberToRemove), () => setMemberToRemove(null));

  // View modes: 'hierarchy' (default) | 'cards' | 'table'
  const viewMode = searchParams.get('view') || 'hierarchy';
  const setViewMode = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val === 'hierarchy') next.delete('view');
    else next.set('view', val);
    setSearchParams(next, { replace: true });
  };

  const roleFilter = searchParams.get('role') || 'all';
  const setRoleFilter = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val === 'all') next.delete('role');
    else next.set('role', val);
    setSearchParams(next, { replace: true });
  };

  const search = searchParams.get('q') || '';
  const setSearch = (val) => {
    const next = new URLSearchParams(searchParams);
    if (!val) next.delete('q');
    else next.set('q', val);
    setSearchParams(next, { replace: true });
  };

  const triggerToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Distinct branches list for dropdown
  const uniqueBranches = useMemo(() => {
    const set = new Set();
    members.forEach((m) => {
      if (m.branch) set.add(m.branch);
    });
    return Array.from(set).sort();
  }, [members]);

  const counts = useMemo(
    () => ({
      total: members.length,
      leads: members.filter((m) => getRoleCategory(m.role) === 'leadership').length,
      coordinators: members.filter((m) => {
        const cat = getRoleCategory(m.role);
        return cat === 'technical' || cat === 'design' || cat === 'events' || cat === 'finance' || cat === 'outreach';
      }).length,
      volunteers: members.filter((m) => getRoleCategory(m.role) === 'volunteer').length,
      branchesCount: uniqueBranches.length,
    }),
    [members, uniqueBranches]
  );

  const filteredMembers = useMemo(() => {
    const list = members.filter((m) => {
      if (roleFilter === 'leads' && getRoleCategory(m.role) !== 'leadership') {
        return false;
      }
      if (
        roleFilter === 'coordinators' &&
        !['technical', 'design', 'events', 'finance', 'outreach'].includes(getRoleCategory(m.role))
      ) {
        return false;
      }
      if (roleFilter === 'volunteers' && getRoleCategory(m.role) !== 'volunteer') {
        return false;
      }
      if (selectedBranch !== 'all' && m.branch !== selectedBranch) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = m.name?.toLowerCase().includes(q);
        const emailMatch = m.email?.toLowerCase().includes(q);
        const branchMatch = m.branch?.toLowerCase().includes(q);
        const roleMatch = m.role?.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !branchMatch && !roleMatch) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'branch') return (a.branch || '').localeCompare(b.branch || '');
      // default: hierarchy rank
      return a.theme.tierRank - b.theme.tierRank;
    });
  }, [members, roleFilter, selectedBranch, search, sortBy]);

  const withBusy = (fn) => async (id, ...args) => {
    setBusyIds((prev) => new Set(prev).add(id));
    try {
      await fn(id, ...args);
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleAdd = async (payloadOrId, role, preview) => {
    try {
      const payload = typeof payloadOrId === 'object' ? payloadOrId : { studentId: payloadOrId, role };
      const { coreTeam: updatedTeam } = await addCoreTeamMember(payload, role);
      updateCommunity({ ...community, coreTeam: updatedTeam });
      const targetId = preview?.id || preview?._id || payload.studentId;
      if (targetId) {
        setProfiles((prev) => ({ ...prev, [targetId]: preview }));
      }
      setShowAdd(false);
      triggerToast(`🎉 Added ${preview?.name || 'member'} (${role}) to committee roster!`);
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : 'Could not add committee member.');
    }
  };

  const handleRemove = withBusy(async (id) => {
    const mem = members.find((m) => m.id === id);
    try {
      const { coreTeam: updatedTeam } = await removeCoreTeamMember(id);
      updateCommunity({ ...community, coreTeam: updatedTeam });
      if (mem) triggerToast(`Revoked ${mem.name} from committee roster.`);
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : 'Could not remove committee member.');
    }
  });

  const startEditLabel = (m) => {
    setEditingId(m.id);
    setEditLabel(m.role);
  };

  const saveEditLabel = async (id) => {
    const role = editLabel.trim() || 'Volunteer';
    setBusyIds((prev) => new Set(prev).add(id));
    try {
      const { coreTeam: updatedTeam } = await updateCoreTeamMemberRole(id, role);
      updateCommunity({ ...community, coreTeam: updatedTeam });
      setEditingId(null);
      triggerToast(`✓ Updated role to "${role}".`);
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : 'Could not update role.');
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleCopyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    triggerToast(`📋 Copied "${email}" to clipboard.`);
  };

  const handleCopyAllEmails = () => {
    const emailList = filteredMembers
      .map((m) => m.email)
      .filter(Boolean)
      .join(', ');
    if (!emailList) {
      triggerToast('No member email addresses available to copy.');
      return;
    }
    navigator.clipboard.writeText(emailList);
    triggerToast(`📋 Copied ${filteredMembers.filter((m) => m.email).length} committee emails to clipboard!`);
  };

  const handleExportRoster = () => {
    const headers = 'Name,Email,Branch,Joined (Admission Year),Role,Category\n';
    const rows = filteredMembers
      .map((m) => `"${m.name}","${m.email || ''}","${m.branch || ''}","${m.yearOfJoining || ''}","${m.role}","${m.theme.label}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${communityName.replace(/\s+/g, '_')}_Committee_Roster.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('📥 Committee Roster exported as CSV.');
  };

  // Render a Member Card
  const renderMemberCard = (m) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="org-member-card group"
      key={m.id}
      style={{
        borderColor: editingId === m.id ? m.theme.accentColor : undefined,
      }}
    >
      <div
        className="org-member-card-accent-bar"
        style={{ backgroundColor: m.theme.accentColor }}
      />

      <div className="org-member-card-head">
        <div className="org-member-avatar-wrap">
          <div
            className="org-member-avatar"
            style={{ background: m.theme.avatarBg, color: m.theme.avatarColor }}
          >
            {m.loading ? (
              <CircleNotch size={18} className="animate-spin" />
            ) : (
              getInitials(m.name)
            )}
          </div>
          {!m.loading && !m.notFound && (
            <span
              className="org-member-verified-dot"
              title="Verified Student Account"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="org-member-name-row">
            <h3 className="org-member-name truncate">
              {m.loading ? 'Loading profile…' : m.name}
            </h3>
            {!m.loading && !m.notFound && (
              <ShieldCheck
                size={14}
                weight="fill"
                className="text-[#0D9488] flex-shrink-0"
                title="Verified Student"
              />
            )}
          </div>

          {/* Role Badge with click-to-edit */}
          <button
            type="button"
            className="org-member-role-badge"
            style={{
              backgroundColor: m.theme.badgeBg,
              color: m.theme.badgeColor,
              borderColor: m.theme.badgeBorder,
            }}
            onClick={() => startEditLabel(m)}
            title="Click to edit role designation"
          >
            <RoleCategoryIcon category={m.category} size={13} />
            <span className="truncate">{m.role}</span>
            <PencilSimple size={11} className="opacity-60 ml-0.5" />
          </button>
        </div>

        <button
          type="button"
          className="org-icon-btn org-icon-btn--danger opacity-50 group-hover:opacity-100 transition-opacity"
          onClick={() => setMemberToRemove(m)}
          title={`Remove ${m.name || 'member'}`}
          aria-label={`Remove ${m.name || 'member'}`}
          disabled={busyIds.has(m.id)}
        >
          <Trash size={14} />
        </button>
      </div>

      <div className="org-member-card-body">
        {/* Branch & Year Tags */}
        <div className="org-member-meta-row">
          {m.branch ? (
            <span className="org-member-chip" title="Academic Department">
              <GraduationCap size={12} className="text-[#0D9488]" />
              <span>{m.branch}</span>
            </span>
          ) : m.notFound ? (
            <span className="org-member-chip text-red-600 bg-red-50 border-red-200">
              Account Unlinked
            </span>
          ) : (
            <span className="org-member-chip text-gray-400">Department —</span>
          )}

          {m.yearOfJoining && (
            <span className="org-member-chip" title="Year of Joining">
              <span>Batch {m.yearOfJoining}</span>
            </span>
          )}
        </div>

        {/* Email Row with 1-click Copy */}
        {m.email && (
          <div className="org-member-email-row">
            <span className="org-member-email-text" title={m.email}>
              <EnvelopeSimple size={12} className="inline mr-1 text-gray-400" />
              {m.email}
            </span>
            <button
              type="button"
              className="org-member-email-copy-btn"
              onClick={() => handleCopyEmail(m.email)}
              title="Copy email to clipboard"
            >
              <Copy size={13} />
            </button>
          </div>
        )}

        {/* Inline Role Editor */}
        {editingId === m.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="org-inline-role-editor"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#0F172A] font-['Space_Grotesk'] uppercase tracking-wider">
                Edit Committee Designation
              </span>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setEditingId(null)}
              >
                <X size={13} />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                className="org-form-input !text-xs !py-1 !px-2.5 !h-[32px]"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEditLabel(m.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                placeholder="e.g. Technical Lead"
                autoFocus
              />
              <button
                type="button"
                className="org-btn org-btn-primary org-btn-sm !py-1 !px-2.5 !h-[32px]"
                onClick={() => saveEditLabel(m.id)}
                disabled={busyIds.has(m.id)}
                title="Save designation"
              >
                {busyIds.has(m.id) ? (
                  <CircleNotch size={13} className="animate-spin" />
                ) : (
                  <Check size={14} weight="bold" />
                )}
              </button>
            </div>

            <div className="org-preset-chips-grid">
              {PRESET_ROLES.slice(0, 6).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setEditLabel(p)}
                  className={`org-preset-chip ${editLabel === p ? 'active' : ''}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="org-page org-roster-page">
      {/* ── Page Header & Action Toolbar ── */}
      <div className="org-page-header">
        <div>
          <p className="org-roster-hero-eyebrow">
            <span className="org-roster-hero-eyebrow-dot" />
            People, Leadership &amp; Governance
          </p>
          <h1 className="org-page-title">Committee Roster</h1>
          <p className="org-page-desc">
            Core team leadership directory and official role designations for {communityName}.
          </p>
        </div>

        <div className="org-page-actions">
          <button
            type="button"
            className="org-btn org-btn-ghost text-xs"
            onClick={handleCopyAllEmails}
            title="Copy all committee member emails to clipboard"
          >
            <Copy size={14} className="text-[#0F172A]" />
            <span>Copy All Emails</span>
          </button>

          <button
            type="button"
            className="org-btn org-btn-ghost text-xs"
            onClick={() => setShowAuditModal(true)}
            title="View Institutional Login Audit Log"
          >
            <ShieldCheck size={14} className="text-[#1A3A2A]" />
            <span>Audit Access</span>
          </button>

          <button
            type="button"
            className="org-btn org-btn-secondary text-xs"
            onClick={handleExportRoster}
            title="Export roster to CSV"
          >
            <DownloadSimple size={14} />
            <span>Export Roster</span>
          </button>

          <button
            className="org-btn org-btn-primary shadow-md shadow-[#991B1B]/20"
            onClick={() => setShowAdd(true)}
          >
            <Plus size={15} weight="bold" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* ── Metrics Strip with Interactive Filtering ── */}
      <section className="org-roster-metrics-strip" aria-label="Committee overview metrics">
        <button
          type="button"
          className={`org-roster-metric-item ${roleFilter === 'all' ? 'active' : ''}`}
          onClick={() => setRoleFilter('all')}
          title="Show all committee members"
        >
          <div className="org-roster-metric-icon" style={{ background: 'rgba(15, 23, 42, 0.06)' }}>
            <UsersThree size={20} weight="bold" style={{ color: '#0F172A' }} />
          </div>
          <div className="org-roster-metric-text">
            <span className="org-roster-metric-label">Total Committee</span>
            <span className="org-roster-metric-val">{formatCount(counts.total)} Members</span>
            <div className="org-roster-capacity-bar-wrap">
              <div
                className="org-roster-capacity-bar-fill"
                style={{ width: `${Math.min(100, (counts.total / 50) * 100)}%` }}
              />
            </div>
          </div>
        </button>

        <button
          type="button"
          className={`org-roster-metric-item ${roleFilter === 'leads' ? 'active' : ''}`}
          onClick={() => setRoleFilter('leads')}
          title="Filter by executive leadership"
        >
          <div className="org-roster-metric-icon" style={{ background: 'rgba(217, 119, 6, 0.1)' }}>
            <Crown size={20} weight="fill" style={{ color: '#D97706' }} />
          </div>
          <div className="org-roster-metric-text">
            <span className="org-roster-metric-label">Executive &amp; Leads</span>
            <span className="org-roster-metric-val" style={{ color: '#D97706' }}>
              {formatCount(counts.leads)} Heads
            </span>
          </div>
        </button>

        <button
          type="button"
          className={`org-roster-metric-item ${roleFilter === 'coordinators' ? 'active' : ''}`}
          onClick={() => setRoleFilter('coordinators')}
          title="Filter by domain leads and coordinators"
        >
          <div className="org-roster-metric-icon" style={{ background: 'rgba(13, 148, 136, 0.1)' }}>
            <Sparkle size={20} weight="fill" style={{ color: '#0D9488' }} />
          </div>
          <div className="org-roster-metric-text">
            <span className="org-roster-metric-label">Domain Leads</span>
            <span className="org-roster-metric-val" style={{ color: '#0D9488' }}>
              {formatCount(counts.coordinators)} Officers
            </span>
          </div>
        </button>

        <div className="org-roster-metric-item">
          <div className="org-roster-metric-icon" style={{ background: 'rgba(79, 70, 229, 0.08)' }}>
            <GraduationCap size={20} weight="bold" style={{ color: '#4F46E5' }} />
          </div>
          <div className="org-roster-metric-text">
            <span className="org-roster-metric-label">Departments</span>
            <span className="org-roster-metric-val" style={{ color: '#4F46E5' }}>
              {counts.branchesCount} Branches
            </span>
          </div>
        </div>
      </section>

      {/* ── Toolbar: Search, Filters, Branch & View Switcher ── */}
      <div className="org-roster-toolbar">
        {/* Search */}
        <div className="org-roster-search">
          <MagnifyingGlass size={15} className="org-search-icon" />
          <input
            className="org-search-input"
            placeholder="Search by name, role, email, branch…"
            aria-label="Search committee members"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="org-search-clear"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Role Filter Pills */}
        <div className="org-roster-filter-pills">
          <button
            type="button"
            className={`org-roster-filter-pill ${roleFilter === 'all' ? 'active' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            <span>All</span>
            <span className="org-roster-filter-count">{counts.total}</span>
          </button>
          <button
            type="button"
            className={`org-roster-filter-pill ${roleFilter === 'leads' ? 'active' : ''}`}
            onClick={() => setRoleFilter('leads')}
          >
            <span>Executive</span>
            <span className="org-roster-filter-count">{counts.leads}</span>
          </button>
          <button
            type="button"
            className={`org-roster-filter-pill ${roleFilter === 'coordinators' ? 'active' : ''}`}
            onClick={() => setRoleFilter('coordinators')}
          >
            <span>Domain Leads</span>
            <span className="org-roster-filter-count">{counts.coordinators}</span>
          </button>
          <button
            type="button"
            className={`org-roster-filter-pill ${roleFilter === 'volunteers' ? 'active' : ''}`}
            onClick={() => setRoleFilter('volunteers')}
          >
            <span>Volunteers</span>
            <span className="org-roster-filter-count">{counts.volunteers}</span>
          </button>
        </div>

        {/* Branch / Department Dropdown Filter */}
        {uniqueBranches.length > 1 && (
          <select
            className="org-roster-select"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            aria-label="Filter by academic department"
          >
            <option value="all">All Departments</option>
            {uniqueBranches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        )}

        {/* Sorting Dropdown */}
        <select
          className="org-roster-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort roster by"
        >
          <option value="hierarchy">Sort: Role Hierarchy</option>
          <option value="name">Sort: Name (A–Z)</option>
          <option value="branch">Sort: Branch (A–Z)</option>
        </select>

        {/* View Mode Switcher */}
        <div className="org-view-mode-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={`org-view-mode-btn ${viewMode === 'hierarchy' ? 'active' : ''}`}
            onClick={() => setViewMode('hierarchy')}
            title="Tiered Hierarchy View"
          >
            <TreeStructure size={14} weight="bold" />
            <span>Hierarchy</span>
          </button>
          <button
            type="button"
            className={`org-view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Grid Cards View"
          >
            <SquaresFour size={14} weight="bold" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            className={`org-view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Directory Table View"
          >
            <Table size={14} weight="bold" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* ── Content Views ── */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={UsersThree}
          title="No committee members found"
          desc="No roster members match your active search keyword, department filter, or role tier."
          action={
            <div className="flex items-center gap-2">
              <button
                className="org-btn org-btn-ghost"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('all');
                  setSelectedBranch('all');
                }}
              >
                Clear Filters
              </button>
              <button className="org-btn org-btn-primary" onClick={() => setShowAdd(true)}>
                <Plus size={15} weight="bold" /> Add Member
              </button>
            </div>
          }
        />
      ) : viewMode === 'hierarchy' ? (
        /* ── Tiered Hierarchy Grouped View ── */
        <div className="space-y-8">
          {HIERARCHY_GROUPS.map((grp) => {
            const groupMembers = filteredMembers.filter((m) => grp.filter(m.role));
            if (groupMembers.length === 0) return null;

            return (
              <section key={grp.key} className="org-hierarchy-section">
                <div className="org-hierarchy-section-header">
                  <div className="org-hierarchy-section-title-wrap">
                    <div
                      className="org-hierarchy-section-icon-badge"
                      style={{
                        background:
                          grp.key === 'leadership'
                            ? 'rgba(217, 119, 6, 0.12)'
                            : grp.key === 'domain_heads'
                            ? 'rgba(13, 148, 136, 0.12)'
                            : 'rgba(15, 23, 42, 0.08)',
                        color:
                          grp.key === 'leadership'
                            ? '#D97706'
                            : grp.key === 'domain_heads'
                            ? '#0D9488'
                            : '#0F172A',
                      }}
                    >
                      {grp.key === 'leadership' ? (
                        <Crown size={18} weight="fill" />
                      ) : grp.key === 'domain_heads' ? (
                        <Sparkle size={18} weight="fill" />
                      ) : (
                        <Handshake size={18} weight="bold" />
                      )}
                    </div>
                    <div>
                      <h2 className="org-hierarchy-section-title">{grp.title}</h2>
                      <p className="org-hierarchy-section-subtitle">{grp.subtitle}</p>
                    </div>
                  </div>
                  <span className="org-hierarchy-section-count-pill">
                    {groupMembers.length} {groupMembers.length === 1 ? 'Member' : 'Members'}
                  </span>
                </div>

                <div className="org-roster-cards-grid">
                  <AnimatePresence mode="popLayout">
                    {groupMembers.map(renderMemberCard)}
                  </AnimatePresence>
                </div>
              </section>
            );
          })}
        </div>
      ) : viewMode === 'cards' ? (
        /* ── Flat Cards Grid View ── */
        <div className="org-roster-cards-grid">
          <AnimatePresence mode="popLayout">
            {filteredMembers.map(renderMemberCard)}
          </AnimatePresence>
        </div>
      ) : (
        /* ── Directory Table View ── */
        <div className="org-roster-table-wrap">
          <table className="org-roster-table" aria-label="Committee Members Directory">
            <thead>
              <tr>
                <th scope="col">Member Profile</th>
                <th scope="col">Department &amp; Batch</th>
                <th scope="col">Role Designation</th>
                <th scope="col">Contact</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="org-roster-table-avatar"
                        style={{ background: m.theme.avatarBg, color: m.theme.avatarColor }}
                      >
                        {m.loading ? <CircleNotch size={14} className="animate-spin" /> : getInitials(m.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="org-roster-table-name">
                            {m.loading ? 'Loading…' : m.name}
                          </p>
                          {!m.loading && !m.notFound && (
                            <ShieldCheck size={13} className="text-[#0D9488]" weight="fill" />
                          )}
                        </div>
                        {m.email && <p className="org-roster-table-email">{m.email}</p>}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="org-member-chip">
                        <GraduationCap size={12} className="text-[#0D9488]" />
                        <span>{m.branch || '—'}</span>
                      </span>
                      {m.yearOfJoining && (
                        <span className="org-member-chip font-mono">
                          Batch {m.yearOfJoining}
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    {editingId === m.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          className="org-form-input !text-xs !py-0.5 !px-2 !h-[28px]"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditLabel(m.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="org-btn org-btn-primary org-btn-sm !py-0.5 !px-1.5 !h-[28px]"
                          onClick={() => saveEditLabel(m.id)}
                          disabled={busyIds.has(m.id)}
                        >
                          <Check size={12} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="org-member-role-badge"
                        style={{
                          backgroundColor: m.theme.badgeBg,
                          color: m.theme.badgeColor,
                          borderColor: m.theme.badgeBorder,
                        }}
                        onClick={() => startEditLabel(m)}
                        title="Click to edit role designation"
                      >
                        <RoleCategoryIcon category={m.category} size={12} />
                        <span>{m.role}</span>
                        <PencilSimple size={10} className="opacity-60 ml-0.5" />
                      </button>
                    )}
                  </td>

                  <td>
                    {m.email ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#0F172A] font-mono"
                        onClick={() => handleCopyEmail(m.email)}
                        title="Copy email address"
                      >
                        <Copy size={12} />
                        <span>Copy</span>
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>

                  <td className="text-right">
                    <button
                      type="button"
                      className="org-icon-btn org-icon-btn--danger"
                      onClick={() => setMemberToRemove(m)}
                      title={`Remove ${m.name || 'member'}`}
                      aria-label={`Remove ${m.name || 'member'}`}
                      disabled={busyIds.has(m.id)}
                    >
                      <Trash size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add Member Modal ── */}
      {showAdd && (
        <AddMemberModal
          existingIds={members.map((m) => m.id)}
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}

      {/* ── Audit Access Governance Modal ── */}
      {showAuditModal && (
        <AuditAccessModal onClose={() => setShowAuditModal(false)} />
      )}

      {/* ── Remove Member Confirmation Dialog ── */}
      {memberToRemove && (
        <div
          className="org-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setMemberToRemove(null)}
        >
          <motion.div
            ref={removeModalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="org-modal"
            style={{ maxWidth: 440 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-member-title"
          >
            <div className="org-modal-header">
              <div className="flex items-center gap-2 text-red-700">
                <Warning size={20} weight="bold" />
                <h2 className="org-modal-title text-red-900" id="remove-member-title">
                  Revoke Committee Membership?
                </h2>
              </div>
              <button
                className="org-icon-btn"
                onClick={() => setMemberToRemove(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="org-modal-body">
              <p className="text-xs text-gray-600 leading-relaxed font-['Plus_Jakarta_Sans']">
                Are you sure you want to remove <strong>{memberToRemove.name || 'this student'}</strong> ({memberToRemove.role}) from the committee roster? This action revokes their official core team status for {communityName}.
              </p>
            </div>

            <div className="org-modal-footer">
              <button
                type="button"
                className="org-btn org-btn-ghost"
                onClick={() => setMemberToRemove(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="org-btn org-btn-danger-solid"
                onClick={() => {
                  handleRemove(memberToRemove.id);
                  setMemberToRemove(null);
                }}
              >
                <Trash size={15} />
                <span>Confirm Removal</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Toast Notification Banner ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-gray-700 flex items-center gap-2 text-xs font-mono"
          >
            <Sparkle size={16} className="text-emerald-400" weight="fill" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

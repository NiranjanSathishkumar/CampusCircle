/**
 * OrganizerRecruitmentRosterPage.jsx — CommunityMembership roster, wired to
 * /api/recruitment/members. Distinct from the Committee Roster
 * (Community.coreTeam, /organizer/roster) — this list is populated
 * automatically when an applicant is selected in a recruitment drive
 * (recruitment.controller.js / applications.controller.js), plus anyone the
 * organizer adds here directly.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Plus,
  MagnifyingGlass,
  Trash,
  X,
  UsersThree,
  PencilSimple,
  Check,
  Warning,
  CircleNotch,
  Copy,
  EnvelopeSimple,
  Sparkle,
  Briefcase,
  Clock,
  CaretDown,
  Network,
  ListChecks,
  DownloadSimple,
  Table,
  SquaresFour,
  UserPlus,
} from '@phosphor-icons/react';
import {
  listRecruitmentRoster,
  addRosterMember,
  updateRosterMemberLabel,
  removeRosterMember,
  bulkRemoveRosterMembers,
} from '@/portal/organizer/recruitment/recruitment.api';
import { ApiError } from '@/shared/api/httpClient';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import EmptyState from '@/layouts/portal/components/EmptyState';
import {
  getInitials,
  getRoleTheme,
  PRESET_ROLES,
  WING_OPTIONS,
  formatRelativeDate,
} from '@/portal/organizer/roster/rosterConstants';
import AddMemberModal from '@/portal/organizer/roster/components/AddMemberModal';
import '@/layouts/portal/portal-widgets.css';
import '@/portal/organizer/roster/org-roster.css';
import './org-recruitment.css';

export default function OrganizerRecruitmentRosterPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'recruited' | 'direct'
  const [selectedWing, setSelectedWing] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editWing, setEditWing] = useState('');
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [isBulkRemoving, setIsBulkRemoving] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);
  const removeModalRef = useRef(null);
  useFocusTrap(removeModalRef, Boolean(memberToRemove), () => setMemberToRemove(null));

  const triggerToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3200);
  };

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  const loadRoster = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { members: fetched } = await listRecruitmentRoster({ limit: 200 });
      setMembers(fetched || []);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load the recruitment roster.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRoster(); }, [loadRoster]);

  // ── Derived rows ──────────────────────────────────────────────────
  const rows = useMemo(
    () =>
      members.map((m) => ({
        id: m._id,
        studentId: m.student?._id,
        name: m.student?.name || 'Unknown Student',
        email: m.student?.email || null,
        photo: m.student?.profilePicture?.cloudinaryUrl || m.student?.profilePicture?.filename || null,
        label: m.label || 'Member',
        wing: m.wing || null,
        labelHistory: Array.isArray(m.labelHistory) ? m.labelHistory : [],
        theme: getRoleTheme(m.label),
        joinedAt: m.joinedAt || null,
        viaRecruitment: Boolean(m.application),
      })),
    [members]
  );

  // Distinct wings for dropdown filter
  const uniqueWings = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => { if (r.wing) set.add(r.wing); });
    return Array.from(set).sort();
  }, [rows]);

  // Stats counts
  const counts = useMemo(() => ({
    total: rows.length,
    recruited: rows.filter((r) => r.viaRecruitment).length,
    direct: rows.filter((r) => !r.viaRecruitment).length,
    wings: uniqueWings.length,
  }), [rows, uniqueWings]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (sourceFilter === 'recruited' && !r.viaRecruitment) return false;
      if (sourceFilter === 'direct' && r.viaRecruitment) return false;
      if (selectedWing !== 'all' && r.wing !== selectedWing) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !r.name.toLowerCase().includes(q) &&
          !r.email?.toLowerCase().includes(q) &&
          !r.label.toLowerCase().includes(q) &&
          !r.wing?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [rows, sourceFilter, selectedWing, search]);

  // ── Helpers ───────────────────────────────────────────────────────
  const withBusy = (fn) => async (id, ...args) => {
    setBusyIds((prev) => new Set(prev).add(id));
    try { await fn(id, ...args); }
    finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleAdd = async (payload, role, preview) => {
    const { membership } = await addRosterMember({ studentId: payload.studentId, label: role });
    setMembers((prev) => [{ ...membership, student: preview || membership.student }, ...prev]);
    setShowAdd(false);
    triggerToast(`🎉 Added ${preview?.name || 'member'} (${role}) to the recruitment roster!`);
  };

  const startEditLabel = (r) => {
    setEditingId(r.id);
    setEditLabel(r.label);
    setEditWing(r.wing || '');
    setExpandedHistoryId(null);
  };

  const saveEditLabel = async (id) => {
    const label = editLabel.trim() || 'Member';
    const wing = editWing || null;
    setBusyIds((prev) => new Set(prev).add(id));
    try {
      const { membership: updated } = await updateRosterMemberLabel(id, label, wing);
      setMembers((prev) =>
        prev.map((m) =>
          m._id === id
            ? { ...m, label: updated.label, wing: updated.wing, labelAssignedAt: updated.labelAssignedAt, labelHistory: updated.labelHistory || m.labelHistory }
            : m
        )
      );
      setEditingId(null);
      triggerToast(`✓ Updated to "${label}".`);
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : 'Could not update label.');
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleRemove = withBusy(async (id) => {
    const r = rows.find((row) => row.id === id);
    try {
      await removeRosterMember(id);
      setMembers((prev) => prev.filter((m) => m._id !== id));
      if (r) triggerToast(`Removed ${r.name} from the recruitment roster.`);
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : 'Could not remove member.');
    }
  });

  const handleCopyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    triggerToast(`📋 Copied "${email}" to clipboard.`);
  };

  const handleCopyAllEmails = () => {
    const emails = filteredRows.map((r) => r.email).filter(Boolean).join(', ');
    if (!emails) return triggerToast('No email addresses found.');
    navigator.clipboard.writeText(emails);
    triggerToast(`📋 Copied ${filteredRows.filter((r) => r.email).length} email addresses.`);
  };

  const handleExportCsv = () => {
    const headers = 'Name,Email,Label,Wing,Source,Joined Roster\n';
    const csvRows = filteredRows
      .map((r) =>
        `"${r.name}","${r.email || ''}","${r.label}","${r.wing || ''}","${r.viaRecruitment ? 'Recruitment Drive' : 'Direct Add'}","${r.joinedAt ? new Date(r.joinedAt).toLocaleDateString() : ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Recruitment_Roster.csv';
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('📥 Roster exported as CSV.');
  };

  // ── Bulk select helpers ───────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = filteredRows.map((r) => r.id);
    setSelectedIds((prev) => {
      const allSelected = allIds.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(allIds);
    });
  };

  const handleBulkRemove = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkRemoving(true);
    try {
      const ids = Array.from(selectedIds);
      const { removedCount } = await bulkRemoveRosterMembers(ids);
      setMembers((prev) => prev.filter((m) => !ids.includes(m._id)));
      setSelectedIds(new Set());
      triggerToast(`🗑 Removed ${removedCount} member${removedCount !== 1 ? 's' : ''} from the roster.`);
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : 'Bulk remove failed.');
    } finally {
      setIsBulkRemoving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="org-page org-roster-page">
      {/* ── Header ── */}
      <div className="org-page-header">
        <div>
          <Link
            to="/organizer/recruitment"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#0F172A] transition-colors mb-2"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Back to Recruitment Drives</span>
          </Link>
          <h1 className="org-page-title">Recruitment Roster</h1>
          <p className="org-page-desc">
            Members enrolled via recruitment drive selections, plus anyone added directly. Separate from the Committee Roster.
          </p>
        </div>
        <div className="org-page-actions">
          {rows.length > 0 && (
            <>
              <button
                className="org-btn org-btn-ghost"
                onClick={handleCopyAllEmails}
                title="Copy all visible email addresses"
              >
                <EnvelopeSimple size={14} />
                <span>Copy Emails</span>
              </button>
              <button
                className="org-btn org-btn-ghost"
                onClick={handleExportCsv}
                title="Export roster to CSV"
              >
                <DownloadSimple size={14} />
                <span>Export</span>
              </button>
            </>
          )}
          <button className="org-btn org-btn-primary shadow-md shadow-[#991B1B]/20" onClick={() => setShowAdd(true)}>
            <Plus size={15} weight="bold" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      {!loading && !loadError && rows.length > 0 && (
        <section className="org-roster-metrics-strip" aria-label="Recruitment roster metrics">
          <button
            type="button"
            className={`org-roster-metric-item ${sourceFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSourceFilter('all')}
          >
            <div className="org-roster-metric-icon" style={{ background: 'rgba(15,23,42,0.06)' }}>
              <UsersThree size={20} weight="bold" style={{ color: '#0F172A' }} />
            </div>
            <div className="org-roster-metric-text">
              <span className="org-roster-metric-label">Total Members</span>
              <span className="org-roster-metric-val">{counts.total} Enrolled</span>
              <div className="org-roster-capacity-bar-wrap">
                <div className="org-roster-capacity-bar-fill" style={{ width: `${Math.min(100, (counts.total / 200) * 100)}%` }} />
              </div>
            </div>
          </button>

          <button
            type="button"
            className={`org-roster-metric-item ${sourceFilter === 'recruited' ? 'active' : ''}`}
            onClick={() => setSourceFilter('recruited')}
          >
            <div className="org-roster-metric-icon" style={{ background: 'rgba(153,27,27,0.08)' }}>
              <Briefcase size={20} weight="fill" style={{ color: '#991B1B' }} />
            </div>
            <div className="org-roster-metric-text">
              <span className="org-roster-metric-label">Via Drive</span>
              <span className="org-roster-metric-val" style={{ color: '#991B1B' }}>{counts.recruited} Recruited</span>
            </div>
          </button>

          <button
            type="button"
            className={`org-roster-metric-item ${sourceFilter === 'direct' ? 'active' : ''}`}
            onClick={() => setSourceFilter('direct')}
          >
            <div className="org-roster-metric-icon" style={{ background: 'rgba(13,148,136,0.08)' }}>
              <UserPlus size={20} weight="fill" style={{ color: '#0D9488' }} />
            </div>
            <div className="org-roster-metric-text">
              <span className="org-roster-metric-label">Direct Adds</span>
              <span className="org-roster-metric-val" style={{ color: '#0D9488' }}>{counts.direct} Added</span>
            </div>
          </button>

          <div className="org-roster-metric-item">
            <div className="org-roster-metric-icon" style={{ background: 'rgba(79,70,229,0.08)' }}>
              <Network size={20} weight="bold" style={{ color: '#4F46E5' }} />
            </div>
            <div className="org-roster-metric-text">
              <span className="org-roster-metric-label">Wings Assigned</span>
              <span className="org-roster-metric-val" style={{ color: '#4F46E5' }}>
                {counts.wings > 0 ? `${counts.wings} Wings` : 'None yet'}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── Toolbar ── */}
      {!loading && !loadError && rows.length > 0 && (
        <div className="org-roster-toolbar">
          <div className="org-roster-search">
            <MagnifyingGlass size={15} className="org-search-icon" />
            <input
              className="org-search-input"
              placeholder="Search by name, email, label, wing…"
              aria-label="Search recruitment roster"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="org-search-clear" onClick={() => setSearch('')} title="Clear search">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Source filter pills */}
          <div className="org-roster-filter-pills">
            {[
              { key: 'all', label: 'All', count: counts.total },
              { key: 'recruited', label: 'Recruited', count: counts.recruited },
              { key: 'direct', label: 'Direct', count: counts.direct },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                className={`org-roster-filter-pill ${sourceFilter === key ? 'active' : ''}`}
                onClick={() => setSourceFilter(key)}
              >
                <span>{label}</span>
                <span className="org-roster-filter-count">{count}</span>
              </button>
            ))}
          </div>

          {/* Wing filter */}
          {uniqueWings.length > 0 && (
            <select
              className="org-roster-select"
              value={selectedWing}
              onChange={(e) => setSelectedWing(e.target.value)}
              aria-label="Filter by domain wing"
            >
              <option value="all">All Wings</option>
              {uniqueWings.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          )}

          {/* View mode toggle */}
          <div className="org-view-mode-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={`org-view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card Grid View"
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
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500 gap-2 text-sm">
          <CircleNotch size={18} className="animate-spin" />
          <span>Loading recruitment roster…</span>
        </div>
      ) : loadError ? (
        <EmptyState
          icon={Warning}
          title="Could not load recruitment roster"
          desc={loadError}
          action={<button className="org-btn org-btn-primary" onClick={loadRoster}>Retry</button>}
        />
      ) : filteredRows.length === 0 ? (
        <EmptyState
          icon={UsersThree}
          title="No roster members found"
          desc={
            members.length === 0
              ? 'Select an applicant in a recruitment drive, or add a member directly, to build this roster.'
              : 'No members match your active search or filters.'
          }
          action={
            <div className="flex items-center gap-2">
              {members.length > 0 && (
                <button
                  className="org-btn org-btn-ghost"
                  onClick={() => { setSearch(''); setSourceFilter('all'); setSelectedWing('all'); }}
                >
                  Clear Filters
                </button>
              )}
              <button className="org-btn org-btn-primary" onClick={() => setShowAdd(true)}>
                <Plus size={15} weight="bold" /> Add Member
              </button>
            </div>
          }
        />
      ) : viewMode === 'cards' ? (
        /* ── Cards View ── */
        <div className="org-roster-cards-grid">
          <AnimatePresence mode="popLayout">
            {filteredRows.map((r) => {
              const isSelected = selectedIds.has(r.id);
              const anySelected = selectedIds.size > 0;
              const joinedLabel = formatRelativeDate(r.joinedAt);
              const showHistory = r.labelHistory.length > 1;
              const historyExpanded = expandedHistoryId === r.id;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`org-member-card group ${isSelected ? 'org-member-card--selected' : ''}`}
                  key={r.id}
                  style={{ borderColor: isSelected ? r.theme.accentColor : editingId === r.id ? r.theme.accentColor : undefined }}
                >
                  {/* Checkbox */}
                  <label
                    className={`org-member-select-check ${isSelected || anySelected ? 'visible' : ''}`}
                    title={isSelected ? 'Deselect' : 'Select'}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(r.id)}
                      disabled={busyIds.has(r.id)}
                      aria-label={`Select ${r.name}`}
                    />
                    <span className="org-member-select-check-visual">
                      {isSelected && <Check size={11} weight="bold" />}
                    </span>
                  </label>

                  <div className="org-member-card-accent-bar" style={{ backgroundColor: r.theme.accentColor }} />

                  <div className="org-member-card-head">
                    <div className="org-member-avatar-wrap">
                      <div
                        className="org-member-avatar"
                        style={{ background: r.photo ? 'transparent' : r.theme.avatarBg, color: r.theme.avatarColor }}
                      >
                        {r.photo ? (
                          <img src={r.photo} alt={r.name} className="org-member-avatar-photo" />
                        ) : (
                          getInitials(r.name)
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="org-member-name-row">
                        <h3 className="org-member-name truncate">{r.name}</h3>
                        {r.viaRecruitment && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] px-1.5 py-0.5 rounded-full flex-shrink-0"
                            title="Enrolled via a recruitment drive selection"
                          >
                            <Briefcase size={10} weight="bold" />
                            Recruited
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="org-member-role-badge"
                        style={{ backgroundColor: r.theme.badgeBg, color: r.theme.badgeColor, borderColor: r.theme.badgeBorder }}
                        onClick={() => startEditLabel(r)}
                        title="Click to edit label"
                      >
                        <span className="truncate">{r.label}</span>
                        <PencilSimple size={11} className="opacity-60 ml-0.5" />
                      </button>

                      {r.wing && (
                        <span className="org-member-wing-badge" title={`Domain Wing: ${r.wing}`}>
                          <Network size={11} />
                          {r.wing}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="org-icon-btn org-icon-btn--danger opacity-50 group-hover:opacity-100 transition-opacity"
                      onClick={() => setMemberToRemove(r)}
                      title={`Remove ${r.name}`}
                      aria-label={`Remove ${r.name}`}
                      disabled={busyIds.has(r.id)}
                    >
                      <Trash size={14} />
                    </button>
                  </div>

                  <div className="org-member-card-body">
                    {/* Meta row */}
                    <div className="org-member-meta-row">
                      {joinedLabel && (
                        <span className="org-member-chip org-member-join-chip" title={r.joinedAt ? `Joined: ${new Date(r.joinedAt).toLocaleDateString()}` : ''}>
                          <Clock size={11} className="text-indigo-400" />
                          <span>{joinedLabel}</span>
                        </span>
                      )}
                    </div>

                    {/* Email */}
                    {r.email && (
                      <div className="org-member-email-row">
                        <span className="org-member-email-text" title={r.email}>
                          <EnvelopeSimple size={12} className="inline mr-1 text-gray-400" />
                          {r.email}
                        </span>
                        <button
                          type="button"
                          className="org-member-email-copy-btn"
                          onClick={() => handleCopyEmail(r.email)}
                          title="Copy email"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    )}

                    {/* Label history */}
                    {showHistory && (
                      <div className="org-role-history">
                        <button
                          type="button"
                          className="org-role-history-toggle"
                          onClick={() => setExpandedHistoryId(historyExpanded ? null : r.id)}
                        >
                          <Clock size={11} />
                          <span>{r.labelHistory.length} label{r.labelHistory.length !== 1 ? 's' : ''} in history</span>
                          <CaretDown
                            size={11}
                            style={{ transform: historyExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                          />
                        </button>
                        <AnimatePresence>
                          {historyExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="org-role-history-list"
                            >
                              {[...r.labelHistory].reverse().map((h, i) => (
                                <div key={i} className="org-role-history-item">
                                  <span className="org-role-history-role">{h.label}</span>
                                  <span className="org-role-history-date">{formatRelativeDate(h.changedAt) || '—'}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Inline label + wing editor */}
                    {editingId === r.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="org-inline-role-editor"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-[#0F172A] font-['Space_Grotesk'] uppercase tracking-wider">
                            Edit Label
                          </span>
                          <button type="button" className="text-gray-400 hover:text-gray-600" onClick={() => setEditingId(null)}>
                            <X size={13} />
                          </button>
                        </div>

                        {/* Label input */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <input
                            className="org-form-input !text-xs !py-1 !px-2.5 !h-[32px]"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditLabel(r.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            placeholder="e.g. Technical Lead"
                            autoFocus
                          />
                          <button
                            type="button"
                            className="org-btn org-btn-primary org-btn-sm !py-1 !px-2.5 !h-[32px]"
                            onClick={() => saveEditLabel(r.id)}
                            disabled={busyIds.has(r.id)}
                          >
                            {busyIds.has(r.id) ? <CircleNotch size={13} className="animate-spin" /> : <Check size={14} weight="bold" />}
                          </button>
                        </div>

                        {/* Wing selector */}
                        <div className="mb-2">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Domain Wing</label>
                          <select
                            className="org-roster-select !w-full !h-[30px] !text-[11px]"
                            value={editWing}
                            onChange={(e) => setEditWing(e.target.value)}
                          >
                            <option value="">— No Wing Assigned —</option>
                            {WING_OPTIONS.map((w) => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
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
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* ── Table View ── */
        <div className="org-roster-table-wrap">
          <table className="org-roster-table" aria-label="Recruitment Roster Directory">
            <thead>
              <tr>
                <th scope="col" style={{ width: 40 }}>
                  <label className="org-table-select-all" title="Select all">
                    <input
                      type="checkbox"
                      checked={filteredRows.length > 0 && filteredRows.every((r) => selectedIds.has(r.id))}
                      onChange={handleSelectAll}
                    />
                  </label>
                </th>
                <th scope="col">Member</th>
                <th scope="col">Label &amp; Wing</th>
                <th scope="col">Source</th>
                <th scope="col">Joined</th>
                <th scope="col">Email</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.id} className={selectedIds.has(r.id) ? 'org-table-row--selected' : ''}>
                  <td>
                    <label className="org-table-select-all">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        aria-label={`Select ${r.name}`}
                      />
                    </label>
                  </td>

                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="org-roster-table-avatar"
                        style={{ background: r.photo ? 'transparent' : r.theme.avatarBg, color: r.theme.avatarColor }}
                      >
                        {r.photo ? (
                          <img src={r.photo} alt={r.name} className="org-member-avatar-photo" />
                        ) : (
                          getInitials(r.name)
                        )}
                      </div>
                      <p className="org-roster-table-name">{r.name}</p>
                    </div>
                  </td>

                  <td>
                    {editingId === r.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          className="org-form-input !text-xs !py-0.5 !px-2 !h-[28px]"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditLabel(r.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="org-btn org-btn-primary org-btn-sm !py-0.5 !px-1.5 !h-[28px]"
                          onClick={() => saveEditLabel(r.id)}
                          disabled={busyIds.has(r.id)}
                        >
                          <Check size={12} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <button
                          type="button"
                          className="org-member-role-badge"
                          style={{ backgroundColor: r.theme.badgeBg, color: r.theme.badgeColor, borderColor: r.theme.badgeBorder }}
                          onClick={() => startEditLabel(r)}
                          title="Click to edit label"
                        >
                          <span>{r.label}</span>
                          <PencilSimple size={10} className="opacity-60 ml-0.5" />
                        </button>
                        {r.wing && (
                          <span className="org-member-wing-badge org-member-wing-badge--sm">
                            <Network size={10} />
                            {r.wing}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td>
                    {r.viaRecruitment ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] px-1.5 py-0.5 rounded-full">
                        <Briefcase size={10} weight="bold" />
                        Drive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#0D9488] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        <UserPlus size={10} weight="bold" />
                        Direct
                      </span>
                    )}
                  </td>

                  <td>
                    {r.joinedAt ? (
                      <span className="text-xs text-gray-500" title={new Date(r.joinedAt).toLocaleDateString()}>
                        {formatRelativeDate(r.joinedAt)}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  <td>
                    {r.email ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#0F172A] font-mono"
                        onClick={() => handleCopyEmail(r.email)}
                        title="Copy email"
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
                      onClick={() => setMemberToRemove(r)}
                      title={`Remove ${r.name}`}
                      aria-label={`Remove ${r.name}`}
                      disabled={busyIds.has(r.id)}
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
          existingIds={rows.map((r) => r.studentId).filter(Boolean)}
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}

      {/* ── Bulk Actions Floating Bar ── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="org-bulk-actions-bar"
          >
            <ListChecks size={16} className="text-white/70" />
            <span className="org-bulk-count">
              {selectedIds.size} member{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <button
              type="button"
              className="org-btn org-btn-ghost org-btn-sm !text-white/80 hover:!text-white !border-white/20"
              onClick={handleSelectAll}
            >
              {filteredRows.every((r) => selectedIds.has(r.id)) ? 'Deselect All' : `Select All (${filteredRows.length})`}
            </button>
            <div className="flex-1" />
            <button
              type="button"
              className="org-btn org-btn-ghost org-btn-sm !text-white/70 hover:!text-white !border-white/15"
              onClick={() => setSelectedIds(new Set())}
              title="Clear selection"
            >
              <X size={13} />
              Clear
            </button>
            <button
              type="button"
              className="org-bulk-remove-btn"
              onClick={handleBulkRemove}
              disabled={isBulkRemoving}
            >
              {isBulkRemoving ? <CircleNotch size={14} className="animate-spin" /> : <Trash size={14} />}
              Remove {selectedIds.size} Selected
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Remove Confirmation Dialog ── */}
      {memberToRemove && (
        <div className="org-modal-overlay" onClick={(e) => e.target === e.currentTarget && setMemberToRemove(null)}>
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
            aria-labelledby="remove-roster-member-title"
          >
            <div className="org-modal-header">
              <div className="flex items-center gap-2 text-red-700">
                <Warning size={20} weight="bold" />
                <h2 className="org-modal-title text-red-900" id="remove-roster-member-title">
                  Remove From Roster?
                </h2>
              </div>
              <button className="org-icon-btn" onClick={() => setMemberToRemove(null)} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <div className="org-modal-body">
              <p className="text-xs text-gray-600 leading-relaxed font-['Plus_Jakarta_Sans']">
                Are you sure you want to remove <strong>{memberToRemove.name}</strong> ({memberToRemove.label}) from
                the recruitment roster? Their application history is kept on record.
              </p>
            </div>
            <div className="org-modal-footer">
              <button type="button" className="org-btn org-btn-ghost" onClick={() => setMemberToRemove(null)}>
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

      {/* ── Toast ── */}
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

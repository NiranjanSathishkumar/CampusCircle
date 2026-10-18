import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Briefcase,
  Trash,
  X,
  CaretRight,
  CalendarBlank,
  UserPlus,
  CheckCircle,
  Warning,
  CircleNotch,
  MagnifyingGlass,
  SquaresFour,
  Table,
  SlidersHorizontal,
  ShareNetwork,
  ListBullets,
  PencilSimple,
  UsersThree,
} from '@phosphor-icons/react';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { formatCount } from '@/shared/utils/formatters';
import { ApiError } from '@/shared/api/httpClient';
import {
  listCommunityDrives,
  createDrive,
  updateDrive,
  deleteDrive,
} from '@/portal/organizer/recruitment/recruitment.api';
import StatusPill from '@/layouts/portal/components/StatusPill';
import EmptyState from '@/layouts/portal/components/EmptyState';
import '@/layouts/portal/portal-widgets.css';
import './org-recruitment.css';
import NewDriveModal from '@/portal/organizer/recruitment/components/NewDriveModal';

const MotionLink = motion.create(Link);

/* ─────────────────────────────────────────────────────────────
   MAIN RECRUITMENT DRIVES PAGE — wired to /api/recruitment.
   A drive is one open position (no positions[]/openings on the real
   CommunityRecruitment model). Selecting an applicant elsewhere creates a
   CommunityMembership, a separate list from the Committee Roster
   (Community.coreTeam, /organizer/roster) — this page doesn't link to it.
   ───────────────────────────────────────────────────────────── */
export default function OrganizerRecruitmentPage() {
  const { community } = useOrganizerAuth();
  const communityName = community?.name || 'Your Community';
  const [searchParams, setSearchParams] = useSearchParams();

  const [drives, setDrives] = useState([]);
  const [applicationCounts, setApplicationCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [driveToEdit, setDriveToEdit] = useState(null);
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline' | 'apps' | 'created'
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [driveToDelete, setDriveToDelete] = useState(null);
  const deleteModalRef = useRef(null);
  useFocusTrap(deleteModalRef, Boolean(driveToDelete), () => setDriveToDelete(null));

  // URL search params state sync
  const viewMode = searchParams.get('view') || 'cards'; // 'cards' | 'table'
  const setViewMode = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val === 'cards') next.delete('view');
    else next.set('view', val);
    setSearchParams(next, { replace: true });
  };

  const statusFilter = searchParams.get('status') || 'all'; // 'all' | 'open' | 'closed'
  const setStatusFilter = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val === 'all') next.delete('status');
    else next.set('status', val);
    setSearchParams(next, { replace: true });
  };

  const searchQuery = searchParams.get('q') || '';
  const setSearchQuery = (val) => {
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

  const loadDrives = useCallback(async () => {
    if (!community?._id) return;
    setLoading(true);
    setLoadError(null);
    try {
      // listCommunityDrives already returns each drive's applicationsCount in
      // one bulk aggregate for the owning organizer — no need for a separate
      // listDriveApplications round-trip per drive here.
      const { drives: fetched } = await listCommunityDrives(community._id);
      const active = fetched.filter((d) => d.isActive);
      setDrives(active);
      setApplicationCounts(Object.fromEntries(active.map((d) => [d._id, d.applicationsCount || 0])));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load recruitment drives.');
    } finally {
      setLoading(false);
    }
  }, [community?._id]);

  useEffect(() => {
    loadDrives();
  }, [loadDrives]);

  // Computed metrics
  const counts = useMemo(() => {
    const total = drives.length;
    const now = new Date();
    const openDrives = drives.filter((d) => d.isOpen && (!d.deadline || new Date(d.deadline) >= now)).length;
    const closedDrives = total - openDrives;
    const totalApps = drives.reduce((sum, d) => sum + (applicationCounts[d._id] || 0), 0);
    return { total, openDrives, closedDrives, totalApps };
  }, [drives, applicationCounts]);

  // Filtered & Sorted Drives
  const filteredDrives = useMemo(() => {
    const now = new Date();
    const list = drives.filter((d) => {
      const isDeadlinePassed = Boolean(d.deadline && new Date(d.deadline) < now);
      const isEffectiveOpen = d.isOpen && !isDeadlinePassed;
      if (statusFilter === 'open' && !isEffectiveOpen) return false;
      if (statusFilter === 'closed' && isEffectiveOpen) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = d.title.toLowerCase().includes(q);
        const descMatch = d.description && d.description.toLowerCase().includes(q);
        if (!titleMatch && !descMatch) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'apps') return (applicationCounts[b._id] || 0) - (applicationCounts[a._id] || 0);
      if (sortBy === 'created') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      // default: deadline soonest (no deadline sorts last)
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }, [drives, statusFilter, searchQuery, sortBy, applicationCounts]);

  const handleCreate = async (payload) => {
    const { drive } = await createDrive(payload);
    setDrives((prev) => [drive, ...prev]);
    setApplicationCounts((prev) => ({ ...prev, [drive._id]: 0 }));
    setShowNew(false);
    triggerToast(`🎉 Published "${drive.title}"!`);
  };

  const handleUpdate = async (payload) => {
    const { drive: updated } = await updateDrive(driveToEdit._id, payload);
    setDrives((prev) => prev.map((d) => (d._id === updated._id ? { ...d, ...updated } : d)));
    setDriveToEdit(null);
    triggerToast(`Saved changes to "${updated.title}".`);
  };

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

  const handleToggleStatus = withBusy(async (driveId, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const drive = drives.find((d) => d._id === driveId);
    if (!drive) return;
    try {
      const { drive: updated } = await updateDrive(driveId, { isOpen: !drive.isOpen });
      setDrives((prev) => prev.map((d) => (d._id === driveId ? updated : d)));
      triggerToast(updated.isOpen ? `Re-opened "${updated.title}" for applications!` : `Closed "${updated.title}" applications.`);
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : 'Could not update drive status.');
    }
  });

  const handleDelete = withBusy(async (driveId) => {
    const drive = drives.find((d) => d._id === driveId);
    try {
      await deleteDrive(driveId);
      setDrives((prev) => prev.filter((d) => d._id !== driveId));
      if (drive) triggerToast(`Removed "${drive.title}".`);
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : 'Could not remove drive.');
    }
  });

  const handleCopyShareLink = (e, drive) => {
    e.preventDefault();
    e.stopPropagation();
    const url = community?._id ? `${window.location.origin}/communities/detail/${community._id}` : window.location.origin;
    try {
      navigator.clipboard.writeText(url);
      triggerToast(`📋 Community page link for "${drive.title}" copied to clipboard!`);
    } catch {
      triggerToast(`📋 Community link: ${url}`);
    }
  };

  return (
    <div className="org-page org-recruitment-page">
      {/* ── Page Header ── */}
      <div className="org-page-header">
        <div>
          <p className="org-page-eyebrow">
            <Briefcase size={14} className="inline mr-1 text-[#991B1B]" />
            Talent Acquisition &amp; Committee Expansion
          </p>
          <h1 className="org-page-title">Recruitment Drives</h1>
          <p className="org-page-desc">
            Post open positions for {communityName}, collect candidate applications, and review them one by one.
          </p>
        </div>
        <div className="org-page-actions">
          <Link to="/organizer/recruitment/roster" className="org-btn org-btn-ghost text-xs">
            <UsersThree size={15} />
            <span>Recruitment Roster</span>
          </Link>
          <button
            className="org-btn org-btn-primary shadow-md shadow-[#991B1B]/20"
            onClick={() => setShowNew(true)}
          >
            <Plus size={15} weight="bold" />
            <span>New Recruitment Drive</span>
          </button>
        </div>
      </div>

      {/* ── Metrics Strip ── */}
      <section className="org-recruitment-metrics-strip" aria-label="Recruitment metrics summary">
        <button
          type="button"
          className={`org-recruitment-metric-item text-left transition-all ${statusFilter === 'open' ? 'ring-2 ring-emerald-600 bg-white rounded-lg p-2' : ''}`}
          onClick={() => setStatusFilter('open')}
          title="Filter by open drives"
        >
          <div className="flex items-center justify-between">
            <span className="org-recruitment-metric-label">Open Drives</span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="org-recruitment-metric-val text-[#1A3A2A]">
              {formatCount(counts.openDrives)}
            </span>
            <span className="text-[11px] font-mono text-emerald-700">accepting applications</span>
          </div>
        </button>

        <button
          type="button"
          className={`org-recruitment-metric-item text-left transition-all ${statusFilter === 'closed' ? 'ring-2 ring-[#0F172A] bg-white rounded-lg p-2' : ''}`}
          onClick={() => setStatusFilter('closed')}
          title="Filter by closed drives"
        >
          <div className="flex items-center justify-between">
            <span className="org-recruitment-metric-label">Closed Drives</span>
            <span className="text-[10px] font-mono text-gray-400">Not Accepting</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="org-recruitment-metric-val text-[#0F172A]">
              {formatCount(counts.closedDrives)}
            </span>
          </div>
        </button>

        <div className="org-recruitment-metric-item">
          <div className="flex items-center justify-between">
            <span className="org-recruitment-metric-label">Candidates Applied</span>
            <span className="text-[10px] font-mono text-[#0D9488] font-bold">In Pipeline</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="org-recruitment-metric-val text-[#0D9488]">
              {formatCount(counts.totalApps)}
            </span>
            <span className="text-[11px] font-mono text-gray-500">student submissions</span>
          </div>
        </div>
      </section>

      {/* ── Toolbar: Search, Status Filter Tabs, Sort & View Switcher ── */}
      <div className="org-recruitment-toolbar">
        {/* Search */}
        <div className="org-recruitment-search">
          <MagnifyingGlass size={15} className="org-search-icon" />
          <input
            className="org-search-input"
            placeholder="Search drives by title or description…"
            aria-label="Search drives by title or description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="org-search-clear"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={14} className="text-gray-500" />
          <select
            className="org-form-select !h-[38px] !text-xs !rounded-full !py-1 !pl-3 !pr-7 !bg-[#FAF8F5]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort drives by"
          >
            <option value="deadline">Sort: Deadline (Soonest)</option>
            <option value="apps">Sort: Most Applications</option>
            <option value="created">Sort: Recently Created</option>
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="org-posts-status-tabs">
          {[
            { id: 'all', label: 'All Drives', count: counts.total },
            { id: 'open', label: 'Open', count: counts.openDrives },
            { id: 'closed', label: 'Closed', count: counts.closedDrives },
          ].map((t) => (
            <button
              key={t.id}
              className={`org-tab-btn ${statusFilter === t.id ? 'active' : ''}`}
              aria-pressed={statusFilter === t.id}
              onClick={() => setStatusFilter(t.id)}
            >
              {t.label} <span className="org-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        {/* View Mode Switcher (Cards vs Table) */}
        <div className="org-view-mode-toggle ml-auto" role="group" aria-label="View mode">
          <button
            type="button"
            className={`org-view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
            aria-pressed={viewMode === 'cards'}
            onClick={() => setViewMode('cards')}
            title="Visual Drive Cards View"
          >
            <SquaresFour size={14} />
            <span>Cards</span>
          </button>
          <button
            type="button"
            className={`org-view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            aria-pressed={viewMode === 'table'}
            onClick={() => setViewMode('table')}
            title="Pipeline Table View"
          >
            <Table size={14} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* ── Content Views ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500 gap-2 text-sm">
          <CircleNotch size={18} className="animate-spin" />
          <span>Loading recruitment drives…</span>
        </div>
      ) : loadError ? (
        <EmptyState
          icon={Warning}
          title="Could not load recruitment drives"
          desc={loadError}
          action={
            <button className="org-btn org-btn-primary" onClick={loadDrives}>
              Retry
            </button>
          }
        />
      ) : filteredDrives.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No recruitment drives found"
          desc={drives.length === 0 ? 'No recruitment drives yet — publish your first one.' : 'No drives match your active search keyword or status filter.'}
          action={
            <div className="flex items-center gap-2">
              {drives.length > 0 && (
                <button
                  className="org-btn org-btn-ghost"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </button>
              )}
              <button className="org-btn org-btn-primary" onClick={() => setShowNew(true)}>
                <Plus size={15} weight="bold" /> New Drive
              </button>
            </div>
          }
        />
      ) : viewMode === 'cards' ? (
        /* ── VIEW MODE 1: DRIVE CARDS ── */
        <div className="org-drive-grid">
          <AnimatePresence mode="popLayout">
            {filteredDrives.map((d) => {
              const isDeadlinePassed = Boolean(d.deadline && new Date(d.deadline) < new Date());
              const isClosed = !d.isOpen || isDeadlinePassed;
              const appCount = applicationCounts[d._id] || 0;

              return (
                <MotionLink
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.22 }}
                  key={d._id}
                  className="org-drive-card group"
                  to={`/organizer/recruitment/${d._id}`}
                >
                  {/* Card Top: Status */}
                  <div className="org-drive-card-top">
                    <span className="text-[11px] font-mono font-bold text-[#0F172A] uppercase tracking-wider bg-white border border-[#D8D2C4] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ListBullets size={12} />
                      Position
                    </span>
                    <StatusPill status={isClosed ? 'closed' : 'open'} />
                  </div>

                  {/* Title & Description */}
                  <div className="mb-3">
                    <h3 className="org-drive-card-title group-hover:text-[#991B1B] transition-colors">
                      {d.title}
                    </h3>
                    {d.description && (
                      <p className="text-xs text-gray-600 font-['Plus_Jakarta_Sans'] line-clamp-2 mt-1 leading-relaxed">
                        {d.description}
                      </p>
                    )}
                  </div>

                  {/* Deadline & Application Counter Bar */}
                  <div className="bg-white border border-[#E6E1D5] rounded-lg p-2.5 mb-3 flex items-center justify-between text-xs font-mono mt-auto">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <CalendarBlank size={14} className={isClosed ? 'text-gray-400' : 'text-[#991B1B]'} />
                      <span>
                        {d.deadline
                          ? `${isDeadlinePassed ? 'Closed' : isClosed ? 'Closed' : 'Closes'} ${new Date(d.deadline).toLocaleDateString()}`
                          : 'No deadline'}
                      </span>
                    </span>
                    <span className="font-bold text-[#0F172A] flex items-center gap-1 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E6E1D5]">
                      <UserPlus size={13} className="text-[#0D9488]" />
                      <span>{formatCount(appCount)} applied</span>
                    </span>
                  </div>

                  {/* Card Action Footer */}
                  <div className="org-drive-card-footer" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="org-btn org-btn-ghost org-btn-sm !py-1 !px-2 text-xs"
                        onClick={(e) => handleCopyShareLink(e, d)}
                        title="Copy community page link"
                      >
                        <ShareNetwork size={13} />
                        <span>Share</span>
                      </button>

                      <button
                        type="button"
                        className={`org-btn org-btn-sm !py-1 !px-2 text-xs ${isClosed ? 'org-btn-ghost text-emerald-700' : 'org-btn-ghost text-gray-600'}`}
                        onClick={(e) => handleToggleStatus(d._id, e)}
                        disabled={busyIds.has(d._id)}
                        title={isClosed ? 'Re-open Drive' : 'Close Applications'}
                      >
                        <span>{isClosed ? 'Re-open' : 'Close'}</span>
                      </button>

                      <button
                        type="button"
                        className="org-icon-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDriveToEdit(d);
                        }}
                        title="Edit drive"
                        aria-label="Edit drive"
                      >
                        <PencilSimple size={13} />
                      </button>

                      <button
                        type="button"
                        className="org-icon-btn org-icon-btn--danger"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDriveToDelete(d);
                        }}
                        disabled={busyIds.has(d._id)}
                        title="Delete drive"
                        aria-label="Delete drive"
                      >
                        <Trash size={13} />
                      </button>
                    </div>

                    <span className="org-drive-card-action font-semibold text-xs text-[#991B1B] flex items-center gap-1 ml-auto">
                      <span>Review Applicants</span>
                      <CaretRight size={13} />
                    </span>
                  </div>
                </MotionLink>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* ── VIEW MODE 2: PIPELINE DATA TABLE ── */
        <div className="org-card shadow-sm">
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th scope="col">Position</th>
                  <th scope="col">Deadline</th>
                  <th scope="col">Candidates</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrives.map((d) => {
                  const isDeadlinePassed = Boolean(d.deadline && new Date(d.deadline) < new Date());
                  const isClosed = !d.isOpen || isDeadlinePassed;
                  const appCount = applicationCounts[d._id] || 0;

                  return (
                    <tr key={d._id} className="hover:bg-amber-50/20">
                      <td>
                        <Link
                          to={`/organizer/recruitment/${d._id}`}
                          className="org-event-title-link font-bold"
                        >
                          {d.title}
                        </Link>
                      </td>
                      <td className="font-mono text-xs whitespace-nowrap text-gray-600">
                        {d.deadline ? (
                          <span className={isDeadlinePassed ? 'text-red-700 font-semibold' : ''}>
                            {new Date(d.deadline).toLocaleDateString()} {isDeadlinePassed && '(Passed)'}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <span className="font-mono text-xs font-bold text-[#0D9488] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {formatCount(appCount)} applied
                        </span>
                      </td>
                      <td>
                        <StatusPill status={isClosed ? 'closed' : 'open'} />
                      </td>
                      <td className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            className="org-icon-btn"
                            onClick={(e) => handleCopyShareLink(e, d)}
                            title="Share Link"
                          >
                            <ShareNetwork size={14} />
                          </button>
                          <button
                            type="button"
                            className="org-icon-btn"
                            onClick={() => setDriveToEdit(d)}
                            title="Edit drive"
                          >
                            <PencilSimple size={14} />
                          </button>
                          <button
                            type="button"
                            className="org-icon-btn org-icon-btn--danger"
                            onClick={() => setDriveToDelete(d)}
                            disabled={busyIds.has(d._id)}
                            title="Delete drive"
                          >
                            <Trash size={14} />
                          </button>
                          <Link
                            to={`/organizer/recruitment/${d._id}`}
                            className="org-btn org-btn-primary org-btn-sm !py-1 !px-2.5 text-xs"
                            title="Review Applicants"
                          >
                            <span>Review</span>
                            <CaretRight size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── New Drive Modal ── */}
      {showNew && (
        <NewDriveModal
          onClose={() => setShowNew(false)}
          onCreate={handleCreate}
        />
      )}

      {/* ── Edit Drive Modal ── */}
      {driveToEdit && (
        <NewDriveModal
          drive={driveToEdit}
          onClose={() => setDriveToEdit(null)}
          onCreate={handleUpdate}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {driveToDelete && (
        <div
          className="org-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setDriveToDelete(null)}
        >
          <motion.div
            ref={deleteModalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="org-modal"
            style={{ maxWidth: 440 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-drive-title"
          >
            <div className="org-modal-header">
              <div className="flex items-center gap-2 text-red-700">
                <Warning size={20} weight="bold" />
                <h2 className="org-modal-title text-red-900" id="delete-drive-title">
                  Delete Recruitment Drive?
                </h2>
              </div>
              <button className="org-icon-btn" onClick={() => setDriveToDelete(null)} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <div className="org-modal-body">
              <p className="text-xs text-gray-600 leading-relaxed font-['Plus_Jakarta_Sans']">
                Are you sure you want to delete <strong>{driveToDelete.title}</strong>? Existing applications stay on record, but the drive will no longer accept new ones or appear on your community page.
              </p>
            </div>
            <div className="org-modal-footer">
              <button type="button" className="org-btn org-btn-ghost" onClick={() => setDriveToDelete(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="org-btn org-btn-danger-solid"
                onClick={() => {
                  handleDelete(driveToDelete._id);
                  setDriveToDelete(null);
                }}
              >
                <Trash size={15} />
                <span>Delete Drive</span>
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
            <CheckCircle size={16} className="text-emerald-400" weight="fill" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

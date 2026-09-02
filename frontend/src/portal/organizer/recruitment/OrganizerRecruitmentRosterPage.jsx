/**
 * OrganizerRecruitmentRosterPage.jsx — CommunityMembership roster, wired to
 * /api/recruitment/members. Distinct from the Committee Roster
 * (Community.coreTeam, /organizer/roster) — this list is the one populated
 * automatically when an applicant is selected in a recruitment drive
 * (recruitment.controller.js / applications.controller.js), plus anyone the
 * organizer adds here directly. Previously there was no page anywhere that
 * showed these records, even though selecting a candidate created one.
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
} from '@phosphor-icons/react';
import {
  listRecruitmentRoster,
  addRosterMember,
  updateRosterMemberLabel,
  removeRosterMember,
} from '@/portal/organizer/recruitment/recruitment.api';
import { ApiError } from '@/shared/api/httpClient';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import EmptyState from '@/layouts/portal/components/EmptyState';
import { getInitials, getRoleTheme, PRESET_ROLES } from '@/portal/organizer/roster/rosterConstants';
import AddMemberModal from '@/portal/organizer/roster/components/AddMemberModal';
import '@/layouts/portal/portal-widgets.css';
import '@/portal/organizer/roster/org-roster.css';
import './org-recruitment.css';

export default function OrganizerRecruitmentRosterPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);
  const removeModalRef = useRef(null);
  useFocusTrap(removeModalRef, Boolean(memberToRemove), () => setMemberToRemove(null));

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

  const loadRoster = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { members: fetched } = await listRecruitmentRoster({ limit: 100 });
      setMembers(fetched || []);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load the recruitment roster.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const rows = useMemo(
    () =>
      members.map((m) => ({
        id: m._id,
        studentId: m.student?._id,
        name: m.student?.name || 'Unknown Student',
        email: m.student?.email,
        avatarUrl: m.student?.profilePicture?.cloudinaryUrl || m.student?.profilePicture?.filename,
        label: m.label,
        theme: getRoleTheme(m.label),
        joinedAt: m.joinedAt,
        viaRecruitment: Boolean(m.application),
      })),
    [members]
  );

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.label.toLowerCase().includes(q)
    );
  }, [rows, search]);

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

  const handleAdd = async (payload, role, preview) => {
    const { membership } = await addRosterMember({ studentId: payload.studentId, label: role });
    // addMember's response doesn't populate `student` (it's just the id it
    // was created with) — use AddMemberModal's already-fetched preview for
    // display instead of refetching the whole roster just to enrich one row.
    setMembers((prev) => [{ ...membership, student: preview || membership.student }, ...prev]);
    setShowAdd(false);
    triggerToast(`🎉 Added ${preview?.name || 'member'} (${role}) to the recruitment roster!`);
  };

  const startEditLabel = (m) => {
    setEditingId(m.id);
    setEditLabel(m.label);
  };

  const saveEditLabel = async (id) => {
    const label = editLabel.trim() || 'Member';
    setBusyIds((prev) => new Set(prev).add(id));
    try {
      const { membership: updated } = await updateRosterMemberLabel(id, label);
      // updateMemberLabel's response doesn't populate `student` — merge just
      // the changed fields so the already-populated student data in state
      // (from the initial roster load) isn't clobbered with a bare id.
      setMembers((prev) =>
        prev.map((m) => (m._id === id ? { ...m, label: updated.label, labelAssignedAt: updated.labelAssignedAt } : m))
      );
      setEditingId(null);
      triggerToast(`✓ Updated label to "${label}".`);
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
    const m = rows.find((r) => r.id === id);
    try {
      await removeRosterMember(id);
      setMembers((prev) => prev.filter((mem) => mem._id !== id));
      if (m) triggerToast(`Removed ${m.name} from the recruitment roster.`);
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : 'Could not remove member.');
    }
  });

  const handleCopyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    triggerToast(`📋 Copied "${email}" to clipboard.`);
  };

  return (
    <div className="org-page org-roster-page">
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
            Members enrolled via recruitment drive selections, plus anyone added directly here. Separate from the
            Committee Roster.
          </p>
        </div>
        <div className="org-page-actions">
          <button className="org-btn org-btn-primary shadow-md shadow-[#991B1B]/20" onClick={() => setShowAdd(true)}>
            <Plus size={15} weight="bold" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="org-roster-toolbar">
        <div className="org-roster-search">
          <MagnifyingGlass size={15} className="org-search-icon" />
          <input
            className="org-search-input"
            placeholder="Search by name, email, or label…"
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
      </div>

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
          action={
            <button className="org-btn org-btn-primary" onClick={loadRoster}>
              Retry
            </button>
          }
        />
      ) : filteredRows.length === 0 ? (
        <EmptyState
          icon={UsersThree}
          title="No recruitment roster members found"
          desc={
            members.length === 0
              ? 'Select an applicant in a recruitment drive, or add a member directly, to build this roster.'
              : 'No members match your active search.'
          }
          action={
            <button className="org-btn org-btn-primary" onClick={() => setShowAdd(true)}>
              <Plus size={15} weight="bold" /> Add Member
            </button>
          }
        />
      ) : (
        <div className="org-roster-cards-grid">
          <AnimatePresence mode="popLayout">
            {filteredRows.map((m) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="org-member-card group"
                key={m.id}
                style={{ borderColor: editingId === m.id ? m.theme.accentColor : undefined }}
              >
                <div className="org-member-card-accent-bar" style={{ backgroundColor: m.theme.accentColor }} />

                <div className="org-member-card-head">
                  <div className="org-member-avatar-wrap">
                    <div className="org-member-avatar" style={{ background: m.theme.avatarBg, color: m.theme.avatarColor }}>
                      {m.avatarUrl ? (
                        <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        getInitials(m.name)
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="org-member-name-row">
                      <h3 className="org-member-name truncate">{m.name}</h3>
                      {m.viaRecruitment && (
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
                      style={{ backgroundColor: m.theme.badgeBg, color: m.theme.badgeColor, borderColor: m.theme.badgeBorder }}
                      onClick={() => startEditLabel(m)}
                      title="Click to edit label"
                    >
                      <span className="truncate">{m.label}</span>
                      <PencilSimple size={11} className="opacity-60 ml-0.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="org-icon-btn org-icon-btn--danger opacity-50 group-hover:opacity-100 transition-opacity"
                    onClick={() => setMemberToRemove(m)}
                    title={`Remove ${m.name}`}
                    aria-label={`Remove ${m.name}`}
                    disabled={busyIds.has(m.id)}
                  >
                    <Trash size={14} />
                  </button>
                </div>

                <div className="org-member-card-body">
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

                  {m.joinedAt && (
                    <span className="text-[11px] font-mono text-gray-500">
                      Joined {new Date(m.joinedAt).toLocaleDateString()}
                    </span>
                  )}

                  {editingId === m.id && (
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

                      <div className="flex items-center gap-1.5">
                        <input
                          className="org-form-input !text-xs !py-1 !px-2.5 !h-[32px]"
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
                          className="org-btn org-btn-primary org-btn-sm !py-1 !px-2.5 !h-[32px]"
                          onClick={() => saveEditLabel(m.id)}
                          disabled={busyIds.has(m.id)}
                        >
                          {busyIds.has(m.id) ? <CircleNotch size={13} className="animate-spin" /> : <Check size={14} weight="bold" />}
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
            ))}
          </AnimatePresence>
        </div>
      )}

      {showAdd && (
        <AddMemberModal
          existingIds={rows.map((r) => r.studentId).filter(Boolean)}
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}

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

/**
 * OrganizerAchievementsPage.jsx — Enhanced Student Recognition Studio.
 * Features:
 * - Recognition Metrics Strip (Total Badges, Winners, Leadership Honors).
 * - View mode switcher (Badge Showcase Cards vs Audit Log Table).
 * - Keyword search & category filter pills.
 * - Upgraded Award Modal with student autocomplete, preset title shortcuts & citation notes.
 * - Roster/Profile award integration with floating toast feedback.
 * Fully aligned with CampusCircle Student Interface design system.
 */
import { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  MagnifyingGlass,
  Medal,
  Trash,
  X,
  Check,
  SquaresFour,
  Table,
  Sparkle,
  Trophy,
  ShieldCheck,
  Clock,
  UserPlus,
  Quotes,
} from '@phosphor-icons/react';
import { AWARDED_ACHIEVEMENTS, STUDENT_DIRECTORY } from '@/mocks/organizer.mock';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import EmptyState from '@/layouts/portal/components/EmptyState';
import '@/layouts/portal/portal-widgets.css';
import './org-achievements.css';

function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0]?.slice(0, 2).toUpperCase() || 'S';
}

const PRESET_TITLES = [
  'HackCampus 2026 — 1st Place Winner',
  'Git & GitHub Bootcamp — Graduate',
  'Best Technical Speaker 2026',
  'Outstanding Community Volunteer',
  'Machine Learning Workshop — Top Performer',
];

const EMPTY_AWARD = {
  student: null,
  title: '',
  category: 'Competition',
  description: '',
};

function AwardModal({ onClose, onAward }) {
  const modalRef = useRef(null);
  useFocusTrap(modalRef, true, onClose);

  const [draft, setDraft] = useState({ ...EMPTY_AWARD });
  const [query, setQuery] = useState('');

  const results = query
    ? STUDENT_DIRECTORY.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.branch?.toLowerCase().includes(query.toLowerCase()) ||
          s.rollNo?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  const canSave = draft.student && draft.title.trim();

  return (
    <div
      className="org-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="org-modal org-award-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="award-modal-title"
      >
        {/* Modal Header */}
        <div className="org-modal-header">
          <div>
            <h2 className="org-modal-title" id="award-modal-title">
              Award Student Achievement
            </h2>
            <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] mt-0.5">
              Issue a verified recognition badge displayed on the student's profile.
            </p>
          </div>
          <button className="org-icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="org-modal-body space-y-4">
          {/* Student Autocomplete Search */}
          <div className="org-form-group">
            <label className="org-form-label">
              Student Recipient <span className="text-[#991B1B]">*</span>
            </label>
            <div className="org-roster-modal-search">
              <MagnifyingGlass size={15} className="org-search-icon" />
              <input
                className="org-search-input"
                placeholder="Search registered student by name, branch, or roll…"
                value={draft.student ? draft.student.name : query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setDraft({ ...draft, student: null });
                }}
              />
              {draft.student && (
                <button
                  type="button"
                  className="org-search-clear"
                  onClick={() => setDraft({ ...draft, student: null })}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Results List */}
            {!draft.student && query && (
              <div className="org-roster-search-results">
                {results.length === 0 ? (
                  <p className="p-3 text-xs text-gray-500 text-center font-mono">
                    No matching student accounts. Only registered campus accounts can receive awards.
                  </p>
                ) : (
                  results.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="org-roster-search-result-item"
                      onClick={() => {
                        setDraft({ ...draft, student: s });
                        setQuery('');
                      }}
                    >
                      <div className="org-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                        {getInitials(s.name)}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <span className="font-bold text-xs text-[#0F172A] block font-['Space_Grotesk'] truncate">
                          {s.name}
                        </span>
                        <span className="text-[11px] font-mono text-gray-500 block truncate">
                          {s.branch} · {s.year} · Roll: {s.rollNo || '21CE104'}
                        </span>
                      </div>
                      <UserPlus size={15} className="text-[#991B1B]" />
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected Student Card */}
            {draft.student && (
              <div className="org-selected-student-card">
                <div className="org-avatar" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>
                  {getInitials(draft.student.name)}
                </div>
                <div className="flex-1">
                  <span className="font-bold text-xs text-[#0F172A] block font-['Space_Grotesk']">
                    {draft.student.name} <ShieldCheck size={13} className="inline text-[#0D9488]" />
                  </span>
                  <span className="text-[11px] font-mono text-gray-500 block">
                    {draft.student.branch} · {draft.student.year}
                  </span>
                </div>
                <span className="org-badge font-mono text-[10px] bg-amber-50 text-amber-700">
                  Recipient Confirmed
                </span>
              </div>
            )}
          </div>

          {/* Achievement Category */}
          <div className="org-form-group">
            <label className="org-form-label">Category</label>
            <select
              className="org-form-select"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            >
              <option value="Competition">Competition Honor</option>
              <option value="Recognition">Special Recognition</option>
              <option value="Leadership">Leadership &amp; Governance</option>
              <option value="Certification">Skill Certification</option>
            </select>
          </div>

          {/* Title & Presets */}
          <div className="org-form-group">
            <label className="org-form-label">
              Achievement Title <span className="text-[#991B1B]">*</span>
            </label>
            <input
              className="org-form-input mb-2"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="e.g. HackCampus 2026 — 1st Place Winner"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-gray-500 mr-1">Shortcuts:</span>
              {PRESET_TITLES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDraft({ ...draft, title: preset })}
                  className={`org-preset-btn ${draft.title === preset ? 'bg-[#991B1B] text-white border-[#991B1B]' : ''}`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Note / Citation */}
          <div className="org-form-group">
            <label className="org-form-label">
              Citation / Note <span className="org-form-hint">(rendered on student profile)</span>
            </label>
            <textarea
              className="org-form-textarea"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="e.g. Awarded for exceptional full-stack AI development and teamwork during the 36-hour hackathon."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="org-modal-footer">
          <button type="button" className="org-btn org-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="org-btn org-btn-primary"
            disabled={!canSave}
            onClick={() => onAward(draft)}
          >
            <Medal size={15} weight="bold" />
            <span>Award Achievement Badge</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrganizerAchievementsPage() {
  const { community } = useOrganizerAuth();
  const communityName = community?.name || 'GDSC SIES GST';

  const [achievements, setAchievements] = useState(AWARDED_ACHIEVEMENTS);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [showAward, setShowAward] = useState(false);
  const [toast, setToast] = useState(null);

  // Computed metrics
  const counts = useMemo(
    () => ({
      total: achievements.length,
      competitions: achievements.filter((a) => a.category === 'Competition').length,
      recognition: achievements.filter((a) => a.category === 'Recognition' || a.category === 'Leadership').length,
      certifications: achievements.filter((a) => a.category === 'Certification').length,
    }),
    [achievements]
  );

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (
        search.trim() &&
        !a.title.toLowerCase().includes(search.toLowerCase()) &&
        !a.studentName.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [achievements, categoryFilter, search]);

  const handleAward = (draftData) => {
    const newAward = {
      id: `ach_${Date.now()}`,
      studentName: draftData.student.name,
      title: draftData.title,
      category: draftData.category,
      description: draftData.description || 'Awarded by organiser committee.',
      awardedOn: new Date().toISOString().slice(0, 10),
    };
    setAchievements((prev) => [newAward, ...prev]);
    setShowAward(false);
    setToast(`🏆 "${draftData.title}" awarded to ${draftData.student.name}`);
    setTimeout(() => setToast(null), 3800);
  };

  const handleRevoke = (id) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="org-page org-achievements-page">
      {/* ── Page Header ── */}
      <div className="org-page-header">
        <div>
          <p className="org-page-eyebrow">
            <Trophy size={13} className="inline mr-1 text-[#991B1B]" />
            Insights &amp; Recognition
          </p>
          <h1 className="org-page-title">Student Achievements</h1>
          <p className="org-page-desc">
            Issue verified recognition badges directly to student profiles for {communityName} competition wins, leadership, and outstanding contributions.
          </p>
        </div>
        <div className="org-page-actions">
          <button className="org-btn org-btn-primary" onClick={() => setShowAward(true)}>
            <Plus size={15} weight="bold" />
            <span>Award Achievement</span>
          </button>
        </div>
      </div>

      {/* ── Metrics Strip ── */}
      <div className="org-achievements-metrics-strip">
        <div className="org-achievements-metric-item">
          <span className="org-achievements-metric-label">Total Badges Issued</span>
          <span className="org-achievements-metric-val">{counts.total}</span>
        </div>
        <div className="org-achievements-metric-item">
          <span className="org-achievements-metric-label">Competition Honors</span>
          <span className="org-achievements-metric-val text-amber-600">
            {counts.competitions} Winners
          </span>
        </div>
        <div className="org-achievements-metric-item">
          <span className="org-achievements-metric-label">Leadership &amp; Recognition</span>
          <span className="org-achievements-metric-val text-[#991B1B]">
            {counts.recognition}
          </span>
        </div>
        <div className="org-achievements-metric-item">
          <span className="org-achievements-metric-label">Credential Status</span>
          <span className="org-achievements-metric-val text-[#0D9488]">
            Verified On-Profile
          </span>
        </div>
      </div>

      {/* ── Toolbar: Search, Filters & View Mode Switcher ── */}
      <div className="org-achievements-toolbar">
        {/* Search */}
        <div className="org-achievements-search">
          <MagnifyingGlass size={15} className="org-search-icon" />
          <input
            type="text"
            placeholder="Search by student name or achievement title…"
            aria-label="Search by student name or achievement title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="org-search-input"
          />
        </div>

        {/* Category Pills */}
        <div className="org-posts-type-filters">
          <button
            type="button"
            className={`org-type-filter-pill ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            All Categories
          </button>
          {['Competition', 'Recognition', 'Leadership', 'Certification'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`org-type-filter-pill ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="org-view-mode-toggle ml-auto">
          <button
            type="button"
            className={`org-view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Badge Showcase Cards View"
          >
            <SquaresFour size={15} />
            <span>Showcase</span>
          </button>
          <button
            type="button"
            className={`org-view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Audit Log Table View"
          >
            <Table size={15} />
            <span>Audit Log</span>
          </button>
        </div>
      </div>

      {/* ── Content Views ── */}
      {filteredAchievements.length === 0 ? (
        <EmptyState
          icon={Medal}
          title="No achievements found"
          desc="Recognize a standout student, competition winner, or committee volunteer."
          action={
            <button className="org-btn org-btn-primary" onClick={() => setShowAward(true)}>
              <Plus size={15} weight="bold" /> Award Achievement
            </button>
          }
        />
      ) : viewMode === 'cards' ? (
        /* Badge Showcase Cards View */
        <div className="org-achievement-cards-grid">
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((a) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="org-achievement-badge-card"
                key={a.id}
              >
                {/* Header emblem & category */}
                <div className="org-badge-card-head">
                  <div className="org-badge-medal-icon">
                    <Medal size={22} weight="fill" />
                  </div>
                  <span className="org-badge-cat-chip font-mono">{a.category}</span>
                </div>

                {/* Title & Citation */}
                <div className="org-badge-card-body">
                  <h3 className="org-badge-card-title">{a.title}</h3>

                  {a.description && (
                    <div className="org-badge-citation-box">
                      <Quotes size={12} className="text-amber-600 inline mr-1 opacity-70" />
                      <span>{a.description}</span>
                    </div>
                  )}

                  {/* Recipient Student Info */}
                  <div className="org-badge-recipient-box">
                    <div className="org-avatar" style={{ width: 30, height: 30, fontSize: '0.68rem' }}>
                      {getInitials(a.studentName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs text-[#0F172A] block font-['Space_Grotesk'] truncate">
                        {a.studentName}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 block">
                        Awarded {a.awardedOn}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="org-badge-card-footer">
                  <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 font-bold">
                    <ShieldCheck size={13} /> Verified Badge
                  </span>
                  <button
                    type="button"
                    className="org-icon-btn org-icon-btn--danger"
                    onClick={() => handleRevoke(a.id)}
                    title="Revoke achievement"
                    aria-label="Revoke achievement"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Audit Log Table View */
        <div className="org-card">
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th scope="col">Achievement Badge Title</th>
                  <th scope="col">Recipient Student</th>
                  <th scope="col">Category</th>
                  <th scope="col">Awarded Date</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAchievements.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Medal size={16} weight="fill" className="text-amber-600" />
                        <span className="font-bold text-[#0F172A] font-['Space_Grotesk'] text-sm">
                          {a.title}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="org-avatar" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>
                          {getInitials(a.studentName)}
                        </div>
                        <span className="font-semibold text-xs text-gray-800">
                          {a.studentName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="org-badge font-mono text-xs">{a.category}</span>
                    </td>
                    <td className="font-mono text-xs text-gray-500">
                      {a.awardedOn}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="org-icon-btn org-icon-btn--danger"
                        onClick={() => handleRevoke(a.id)}
                        title="Revoke achievement"
                        aria-label="Revoke achievement"
                      >
                        <Trash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Award Modal */}
      {showAward && (
        <AwardModal
          onClose={() => setShowAward(false)}
          onAward={handleAward}
        />
      )}

      {/* Toast Feedback Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="org-toast"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

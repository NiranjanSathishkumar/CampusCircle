/**
 * OrganizerRecruitmentDetailPage.jsx — Candidate application review, wired to
 * /api/recruitment. Selecting an applicant creates a CommunityMembership
 * record server-side.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Check,
  X as XIcon,
  ArrowCounterClockwise,
  UserPlus,
  CalendarBlank,
  Warning,
  CircleNotch,
  EnvelopeSimple,
  Copy,
  GraduationCap,
  DownloadSimple,
  Phone,
  ArrowSquareOut,
  Sparkle,
  Clock,
  Briefcase,
  UsersThree,
  CheckCircle,
  XCircle,
  ChatCircleText,
  MagnifyingGlass,
  PaintBrush,
  Code,
  Crown,
  Megaphone,
} from '@phosphor-icons/react';
import {
  getDrive,
  listDriveApplications,
  updateApplicationStatus,
  updateDrive,
} from '@/portal/organizer/recruitment/recruitment.api';
import { ApiError } from '@/shared/api/httpClient';
import StatusPill from '@/layouts/portal/components/StatusPill';
import EmptyState from '@/layouts/portal/components/EmptyState';
import { formatCount } from '@/shared/utils/formatters';
import NewDriveModal from '@/portal/organizer/recruitment/components/NewDriveModal';
import { PencilSimple } from '@phosphor-icons/react';
import '@/layouts/portal/portal-widgets.css';
import './org-recruitment.css';

function getInitials(name = '') {
  if (!name) return 'AP';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0]?.slice(0, 2).toUpperCase() || 'AP';
}

function formatAnswerValue(answer) {
  if (!answer || answer.value === undefined || answer.value === null) return '—';
  if (Array.isArray(answer.value)) return answer.value.join(', ');
  return String(answer.value);
}

// Determines the presentation category of a question & answer
function classifyAnswer(qa) {
  const label = (qa.questionLabel || '').toLowerCase();
  const val = String(qa.value || '');

  // Contact / Links
  if (label.includes('phone') || label.includes('mobile') || label.includes('contact') || /^\+?[0-9\s-]{8,15}$/.test(val.trim())) {
    return 'phone';
  }
  if (label.includes('portfolio') || label.includes('github') || label.includes('linkedin') || label.includes('resume') || label.includes('website') || label.includes('link') || val.startsWith('http://') || val.startsWith('https://')) {
    return 'link';
  }

  // Long-form essay / narrative response
  if (val.length > 50 || label.includes('why') || label.includes('describe') || label.includes('experience') || label.includes('tell us') || label.includes('about') || label.includes('long')) {
    return 'essay';
  }

  // Short key-value or multiple-choice option
  return 'grid';
}

function getRoleIcon(title = '') {
  const t = title.toLowerCase();
  if (t.includes('design') || t.includes('creative') || t.includes('ui') || t.includes('media')) {
    return <PaintBrush size={20} weight="fill" className="text-rose-600" />;
  }
  if (t.includes('tech') || t.includes('web') || t.includes('code') || t.includes('dev')) {
    return <Code size={20} weight="bold" className="text-indigo-600" />;
  }
  if (t.includes('lead') || t.includes('head') || t.includes('president')) {
    return <Crown size={20} weight="fill" className="text-amber-600" />;
  }
  if (t.includes('event') || t.includes('pr') || t.includes('outreach') || t.includes('marketing')) {
    return <Megaphone size={20} weight="fill" className="text-teal-600" />;
  }
  return <Briefcase size={20} weight="bold" className="text-[#991B1B]" />;
}

export default function OrganizerRecruitmentDetailPage() {
  const { driveId } = useParams();
  const navigate = useNavigate();

  const [drive, setDrive] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'selected' | 'rejected'
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name'
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' | 'celebration' }
  const toastTimerRef = useRef(null);
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [applicantSearch, setApplicantSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  const showToast = (message, type = 'success', duration = 3500) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [{ drive: fetchedDrive }, { applications: fetchedApps }] = await Promise.all([
        getDrive(driveId),
        listDriveApplications(driveId),
      ]);
      setDrive(fetchedDrive);
      setApplications(fetchedApps || []);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load this recruitment drive.');
    } finally {
      setLoading(false);
    }
  }, [driveId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Unique branches list
  const uniqueBranches = useMemo(() => {
    const set = new Set();
    applications.forEach((a) => {
      const b = a.profileSnapshot?.branch;
      if (b) set.add(b);
    });
    return Array.from(set).sort();
  }, [applications]);

  const counts = useMemo(() => {
    const total = applications.length;
    const selected = applications.filter((a) => a.status === 'selected').length;
    const pending = applications.filter((a) => a.status === 'pending').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    const acceptanceRate = total > 0 ? Math.round((selected / total) * 100) : 0;
    return { all: total, pending, selected, rejected, acceptanceRate };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const list = applications.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false;
      if (selectedBranch !== 'all' && a.profileSnapshot?.branch !== selectedBranch) return false;
      if (applicantSearch.trim()) {
        const q = applicantSearch.toLowerCase();
        const name = a.student?.name || a.profileSnapshot?.name || '';
        const branch = a.profileSnapshot?.branch || '';
        const email = a.student?.email || a.profileSnapshot?.email || '';
        const answersText = (a.answers || []).map((ans) => formatAnswerValue(ans)).join(' ').toLowerCase();
        if (!name.toLowerCase().includes(q) && !branch.toLowerCase().includes(q) && !email.toLowerCase().includes(q) && !answersText.includes(q)) {
          return false;
        }
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = a.student?.name || a.profileSnapshot?.name || '';
        const nameB = b.student?.name || b.profileSnapshot?.name || '';
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      // default: newest
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [applications, filter, selectedBranch, applicantSearch, sortBy]);

  const handleCopyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    showToast(`Copied "${email}" to clipboard.`, 'info');
  };

  const handleCopyAllEmails = () => {
    const emails = filteredApplications
      .map((a) => a.student?.email || a.profileSnapshot?.email)
      .filter(Boolean);
    if (emails.length === 0) {
      showToast('No candidate emails found to copy.', 'info');
      return;
    }
    navigator.clipboard.writeText(emails.join(', '));
    showToast(`Copied ${emails.length} candidate emails to clipboard!`, 'info');
  };

  const handleExportApplicants = () => {
    const headers = 'Applicant Name,Email,Branch,Year,Status,Applied Date,Responses\n';
    const rows = filteredApplications
      .map((a) => {
        const name = a.student?.name || a.profileSnapshot?.name || 'Unknown';
        const email = a.student?.email || a.profileSnapshot?.email || '';
        const branch = a.profileSnapshot?.branch || '';
        const year = a.profileSnapshot?.yearOfJoining || '';
        const answersStr = (a.answers || [])
          .map((ans) => `${ans.questionLabel}: ${formatAnswerValue(ans)}`)
          .join(' | ')
          .replace(/"/g, '""');
        return `"${name}","${email}","${branch}","${year}","${a.status}","${new Date(a.createdAt).toLocaleDateString()}","${answersStr}"`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const alink = document.createElement('a');
    alink.href = url;
    alink.download = `${(drive?.title || 'recruitment').replace(/\s+/g, '_')}_Applicants.csv`;
    alink.click();
    URL.revokeObjectURL(url);
    showToast('Exported applicant list to CSV.', 'info');
  };

  const handleSetStatus = async (app, status) => {
    setBusyIds((prev) => new Set(prev).add(app._id));
    try {
      const { application: updated } = await updateApplicationStatus(app._id, status);
      setApplications((prev) =>
        prev.map((a) => (a._id === app._id ? { ...a, status: updated.status, updatedAt: updated.updatedAt } : a))
      );
      const name = app.student?.name || app.profileSnapshot?.name || 'Candidate';
      if (status === 'selected') {
        showToast(`🎉 ${name} selected for "${drive?.title}"!`, 'celebration', 4000);
      } else if (status === 'rejected') {
        showToast(`Marked ${name} as rejected.`, 'danger', 3500);
      } else {
        showToast(`Reset ${name} to pending review.`, 'info', 3500);
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update application status.', 'error', 4000);
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(app._id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="org-page">
        <div className="flex items-center justify-center py-20 text-gray-500 gap-2.5 text-sm">
          <CircleNotch size={20} className="animate-spin text-[#991B1B]" />
          <span>Loading recruitment applications…</span>
        </div>
      </div>
    );
  }

  if (loadError || !drive) {
    return (
      <div className="org-page">
        <EmptyState
          icon={Warning}
          title={loadError ? 'Could not load drive' : 'Drive Not Found'}
          desc={loadError || 'The selected recruitment drive may have been deleted or closed.'}
          action={
            <button
              className="org-btn org-btn-primary"
              onClick={() => navigate('/organizer/recruitment')}
            >
              Back to Recruitment
            </button>
          }
        />
      </div>
    );
  }

  const isDeadlinePassed = Boolean(drive.deadline && new Date(drive.deadline) < new Date());
  const isClosed = !drive.isOpen || isDeadlinePassed;

  return (
    <div className="org-page org-recruitment-page">
      {/* ── Top Navigation & Actions Bar ── */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#0F172A] transition-colors"
          onClick={() => navigate('/organizer/recruitment')}
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Back to Recruitment Drives</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="org-btn org-btn-ghost text-xs"
            onClick={() => setShowEdit(true)}
            title="Edit this drive"
          >
            <PencilSimple size={14} />
            <span>Edit Drive</span>
          </button>

          <button
            type="button"
            className="org-btn org-btn-ghost text-xs"
            onClick={handleCopyAllEmails}
            disabled={applications.length === 0}
            title="Copy all candidate email addresses"
          >
            <Copy size={14} />
            <span>Copy Emails ({filteredApplications.length})</span>
          </button>

          <button
            type="button"
            className="org-btn org-btn-secondary text-xs"
            onClick={handleExportApplicants}
            disabled={applications.length === 0}
            title="Export candidate list with answers to CSV"
          >
            <DownloadSimple size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Drive Spotlight Hero Card ── */}
      <div className="org-recruitment-hero-card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="org-recruitment-eyebrow">
                <Briefcase size={12} weight="bold" className="text-[#991B1B]" />
                Recruitment Drive
              </span>
              <StatusPill status={isClosed ? 'closed' : 'open'} />
              {drive.deadline && (
                <span className={`font-mono text-xs flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${
                  isDeadlinePassed
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-[#FAF8F5] text-gray-600 border-[#E6E1D5]'
                }`}>
                  <CalendarBlank size={13} className={isDeadlinePassed ? 'text-rose-600' : 'text-[#991B1B]'} />
                  <span>{isDeadlinePassed ? 'Deadline Passed' : isClosed ? 'Concluded' : 'Closes'} {new Date(drive.deadline).toLocaleDateString()}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FAF8F5] border border-[#E6E1D5] flex-shrink-0">
                {getRoleIcon(drive.title)}
              </div>
              <h1 className="font-['Space_Grotesk'] font-bold text-2xl text-[#0F172A] tracking-tight">
                {drive.title}
              </h1>
            </div>

            {drive.description && (
              <p className="text-xs text-gray-600 leading-relaxed font-['Plus_Jakarta_Sans'] max-w-3xl mt-2">
                {drive.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Interactive Funnel Metrics Strip ── */}
      <section className="org-recruitment-metrics-strip" aria-label="Candidate applications summary">
        <button
          type="button"
          className={`org-recruitment-metric-item ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
          title="Show all candidates"
        >
          <div className="org-recruitment-metric-icon" style={{ background: 'rgba(15, 23, 42, 0.06)' }}>
            <UsersThree size={20} weight="bold" style={{ color: '#0F172A' }} />
          </div>
          <div className="org-recruitment-metric-text">
            <span className="org-recruitment-metric-label">All Candidates</span>
            <span className="org-recruitment-metric-val">{formatCount(counts.all)} Submissions</span>
          </div>
        </button>

        <button
          type="button"
          className={`org-recruitment-metric-item ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
          title="Filter pending review"
        >
          <div className="org-recruitment-metric-icon" style={{ background: 'rgba(217, 119, 6, 0.1)' }}>
            <Clock size={20} weight="bold" style={{ color: '#D97706' }} />
          </div>
          <div className="org-recruitment-metric-text">
            <span className="org-recruitment-metric-label">Pending Review</span>
            <span className="org-recruitment-metric-val" style={{ color: '#D97706' }}>
              {formatCount(counts.pending)} Awaiting
            </span>
          </div>
        </button>

        <button
          type="button"
          className={`org-recruitment-metric-item ${filter === 'selected' ? 'active' : ''}`}
          onClick={() => setFilter('selected')}
          title="Filter selected candidates"
        >
          <div className="org-recruitment-metric-icon" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
            <CheckCircle size={20} weight="fill" style={{ color: '#059669' }} />
          </div>
          <div className="org-recruitment-metric-text">
            <span className="org-recruitment-metric-label">Selected</span>
            <span className="org-recruitment-metric-val" style={{ color: '#059669' }}>
              {formatCount(counts.selected)} Accepted
            </span>
          </div>
        </button>

        <button
          type="button"
          className={`org-recruitment-metric-item ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
          title="Filter rejected candidates"
        >
          <div className="org-recruitment-metric-icon" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
            <XCircle size={20} weight="fill" style={{ color: '#DC2626' }} />
          </div>
          <div className="org-recruitment-metric-text">
            <span className="org-recruitment-metric-label">Passed / Rejected</span>
            <span className="org-recruitment-metric-val" style={{ color: '#DC2626' }}>
              {formatCount(counts.rejected)} Declined
            </span>
          </div>
        </button>
      </section>

      {/* ── Toolbar: Filter Pills, Branch Filter, Sorting & Search ── */}
      <div className="org-recruitment-toolbar">
        {/* Search */}
        <div className="org-recruitment-search">
          <MagnifyingGlass size={15} className="org-search-icon" />
          <input
            className="org-search-input"
            placeholder="Search candidate name, branch, or answer…"
            aria-label="Search candidate applications"
            value={applicantSearch}
            onChange={(e) => setApplicantSearch(e.target.value)}
          />
          {applicantSearch && (
            <button
              type="button"
              className="org-search-clear"
              onClick={() => setApplicantSearch('')}
              title="Clear search"
            >
              <XIcon size={12} />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="org-recruitment-filter-pills">
          <button
            type="button"
            className={`org-recruitment-filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span>All</span>
            <span className="org-recruitment-filter-count">{counts.all}</span>
          </button>
          <button
            type="button"
            className={`org-recruitment-filter-pill ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <span>Pending</span>
            <span className="org-recruitment-filter-count">{counts.pending}</span>
          </button>
          <button
            type="button"
            className={`org-recruitment-filter-pill ${filter === 'selected' ? 'active' : ''}`}
            onClick={() => setFilter('selected')}
          >
            <span>Selected</span>
            <span className="org-recruitment-filter-count">{counts.selected}</span>
          </button>
          <button
            type="button"
            className={`org-recruitment-filter-pill ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            <span>Rejected</span>
            <span className="org-recruitment-filter-count">{counts.rejected}</span>
          </button>
        </div>

        {/* Branch Filter Dropdown */}
        {uniqueBranches.length > 1 && (
          <select
            className="org-roster-select"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            aria-label="Filter by branch"
          >
            <option value="all">All Departments</option>
            {uniqueBranches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        )}

        {/* Sort Dropdown */}
        <select
          className="org-roster-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort applications"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="name">Sort: Candidate Name (A–Z)</option>
        </select>
      </div>

      {/* ── Candidate Applications Stream ── */}
      {filteredApplications.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No candidate applications found"
          desc={
            applicantSearch || filter !== 'all' || selectedBranch !== 'all'
              ? 'No applications match your active filter keyword or status selection.'
              : 'Candidate submissions will appear here as students apply for this position.'
          }
          action={
            (applicantSearch || filter !== 'all' || selectedBranch !== 'all') && (
              <button
                className="org-btn org-btn-ghost"
                onClick={() => {
                  setApplicantSearch('');
                  setFilter('all');
                  setSelectedBranch('all');
                }}
              >
                Clear Filters
              </button>
            )
          }
        />
      ) : (
        <div className="org-application-list">
          <AnimatePresence mode="popLayout">
            {filteredApplications.map((app) => {
              const name = app.student?.name || app.profileSnapshot?.name || 'Unknown Applicant';
              const email = app.student?.email || app.profileSnapshot?.email;
              const branch = app.profileSnapshot?.branch;
              const yearOfJoining = app.profileSnapshot?.yearOfJoining;
              const isBusy = busyIds.has(app._id);

              // Status styling
              const statusColor =
                app.status === 'selected'
                  ? '#10B981'
                  : app.status === 'rejected'
                  ? '#EF4444'
                  : '#D97706';

              // Categorize Answers into Contact, Essay, and Grid
              const contactAnswers = [];
              const essayAnswers = [];
              const gridAnswers = [];

              (app.answers || []).forEach((qa) => {
                const classification = classifyAnswer(qa);
                if (classification === 'phone' || classification === 'link') {
                  contactAnswers.push({ ...qa, type: classification });
                } else if (classification === 'essay') {
                  essayAnswers.push(qa);
                } else {
                  gridAnswers.push(qa);
                }
              });

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.22 }}
                  className="org-application-card"
                  key={app._id}
                >
                  {/* Status Top Strip */}
                  <div
                    className="org-application-status-strip"
                    style={{ backgroundColor: statusColor }}
                  />

                  {/* Candidate Header */}
                  <div className="org-application-header">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="org-applicant-avatar">
                        {getInitials(name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="org-applicant-name truncate">{name}</h3>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-gray-500 font-semibold">
                            <Clock size={12} className="text-gray-400" />
                            Applied {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Metadata Chips */}
                        <div className="org-applicant-meta-chips">
                          {branch && (
                            <span className="org-applicant-chip" title="Department">
                              <GraduationCap size={13} className="text-[#0D9488]" />
                              <span>{branch}</span>
                            </span>
                          )}
                          {yearOfJoining && (
                            <span className="org-applicant-chip font-mono">
                              Batch of {yearOfJoining}
                            </span>
                          )}
                          {email && (
                            <div className="inline-flex items-center gap-1 bg-[#FAF8F5] border border-[#E6E1D5] rounded-md px-2 py-0.5 text-xs text-gray-600 font-mono">
                              <EnvelopeSimple size={12} className="text-gray-400" />
                              <span className="truncate max-w-[200px]">{email}</span>
                              <button
                                type="button"
                                className="text-gray-400 hover:text-gray-700 ml-1"
                                onClick={() => handleCopyEmail(email)}
                                title="Copy email"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <StatusPill status={app.status} />
                  </div>

                  {/* Candidate Body / Form Responses */}
                  <div className="org-application-body">
                    {/* Contact & Links Bar (if candidate submitted phone/links) */}
                    {contactAnswers.length > 0 && (
                      <div className="org-qa-contact-bar">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-bold mr-1">
                          Applicant Links:
                        </span>
                        {contactAnswers.map((ca, idx) => {
                          const val = String(ca.value || '').trim();
                          const isUrl = val.startsWith('http://') || val.startsWith('https://');
                          return (
                            <div key={idx} className="inline-flex items-center gap-1.5 bg-white border border-[#D8D2C4] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#0F172A]">
                              {ca.type === 'phone' ? (
                                <Phone size={13} className="text-emerald-600" />
                              ) : (
                                <ArrowSquareOut size={13} className="text-[#4F46E5]" />
                              )}
                              <span className="text-gray-500 text-[11px] font-mono">{ca.questionLabel}:</span>
                              {isUrl ? (
                                <a
                                  href={val}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#4F46E5] hover:underline font-mono"
                                >
                                  Open Link
                                </a>
                              ) : (
                                <span className="font-mono">{val}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Long-form Essay Responses */}
                    {essayAnswers.map((ea, idx) => (
                      <div key={idx} className="org-qa-essay-card">
                        <div className="org-qa-essay-question">
                          <ChatCircleText size={14} className="text-[#991B1B]" weight="bold" />
                          <span>{ea.questionLabel}</span>
                        </div>
                        <p className="org-qa-essay-answer">{formatAnswerValue(ea)}</p>
                      </div>
                    ))}

                    {/* Short / Multiple-choice Grid Responses */}
                    {gridAnswers.length > 0 && (
                      <div className="org-qa-grid">
                        {gridAnswers.map((ga, idx) => (
                          <div key={idx} className="org-qa-grid-item">
                            <span className="org-qa-grid-label">{ga.questionLabel}</span>
                            <span className="org-qa-grid-val">{formatAnswerValue(ga)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Decision Actions Footer */}
                  <div className="org-application-footer">
                    <div>
                      {app.status === 'selected' ? (
                        <span className="org-decision-banner selected">
                          <CheckCircle size={15} weight="fill" />
                          <span>Selected &amp; Enrolled in Community</span>
                        </span>
                      ) : app.status === 'rejected' ? (
                        <span className="org-decision-banner rejected">
                          <XCircle size={15} weight="fill" />
                          <span>Application Declined</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] font-medium">
                          Review responses and record admission decision.
                        </span>
                      )}
                    </div>

                    <div className="org-application-actions">
                      {app.status !== 'selected' && (
                        <button
                          type="button"
                          className="org-btn org-btn-primary org-btn-sm shadow-sm"
                          style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                          onClick={() => handleSetStatus(app, 'selected')}
                          disabled={isBusy}
                        >
                          {isBusy ? (
                            <CircleNotch size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} weight="bold" />
                          )}
                          <span>Select Applicant</span>
                        </button>
                      )}

                      {app.status !== 'rejected' && (
                        <button
                          type="button"
                          className="org-btn org-btn-danger org-btn-sm"
                          onClick={() => handleSetStatus(app, 'rejected')}
                          disabled={isBusy}
                        >
                          <XIcon size={14} weight="bold" />
                          <span>Reject Candidate</span>
                        </button>
                      )}

                      {app.status !== 'pending' && (
                        <button
                          type="button"
                          className="org-btn org-btn-ghost org-btn-sm"
                          onClick={() => handleSetStatus(app, 'pending')}
                          disabled={isBusy}
                          title="Reset status back to pending review"
                        >
                          <ArrowCounterClockwise size={14} />
                          <span>Reset to Pending</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Edit Drive Modal ── */}
      {showEdit && (
        <NewDriveModal
          drive={drive}
          onClose={() => setShowEdit(false)}
          onCreate={async (payload) => {
            const { drive: updated } = await updateDrive(driveId, payload);
            setDrive(updated);
            setShowEdit(false);
            showToast(`Saved changes to "${updated.title}".`, 'success');
          }}
        />
      )}

      {/* ── Status Change Toast Notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`org-recruitment-toast org-toast--${toast.type || 'success'}`}
            role="status"
            aria-live="polite"
          >
            <div className="org-toast-icon-wrap">
              {toast.type === 'celebration' ? (
                <Sparkle size={17} weight="fill" className="text-amber-400" />
              ) : toast.type === 'error' || toast.type === 'danger' ? (
                <XCircle size={17} weight="fill" className="text-rose-400" />
              ) : toast.type === 'info' ? (
                <Copy size={16} weight="bold" className="text-sky-400" />
              ) : (
                <CheckCircle size={17} weight="fill" className="text-emerald-400" />
              )}
            </div>

            <span className="org-toast-message">{toast.message}</span>

            <button
              type="button"
              className="org-toast-close-btn"
              onClick={() => setToast(null)}
              aria-label="Close notification"
            >
              <XIcon size={13} weight="bold" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

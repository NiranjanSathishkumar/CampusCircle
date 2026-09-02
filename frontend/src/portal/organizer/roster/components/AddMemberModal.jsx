import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import {
  Check,
  CircleNotch,
  EnvelopeSimple,
  IdentificationCard,
  MagnifyingGlass,
  ShieldCheck,
  UserPlus,
  Warning,
  X,
  GraduationCap,
  Sparkle,
  Crown,
  Code,
  PaintBrush,
  Megaphone,
  CurrencyInr,
  Broadcast,
  Handshake,
  ArrowRight,
} from '@phosphor-icons/react';
import { PRESET_ROLES, getInitials, getRoleCategory, getRoleTheme } from '@/portal/organizer/roster/rosterConstants';
import { lookupStudent } from '@/portal/organizer/roster/roster.api';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { ApiError } from '@/shared/api/httpClient';

// Icon helper for preset role buttons
function PresetRoleIcon({ role, size = 13 }) {
  const cat = getRoleCategory(role);
  switch (cat) {
    case 'leadership':
      return <Crown size={size} weight="fill" className="text-amber-600" />;
    case 'technical':
      return <Code size={size} weight="bold" className="text-indigo-600" />;
    case 'design':
      return <PaintBrush size={size} weight="fill" className="text-rose-600" />;
    case 'finance':
      return <CurrencyInr size={size} weight="bold" className="text-emerald-600" />;
    case 'outreach':
      return <Broadcast size={size} weight="fill" className="text-sky-600" />;
    case 'events':
      return <Megaphone size={size} weight="fill" className="text-teal-600" />;
    default:
      return <Handshake size={size} weight="bold" className="text-slate-600" />;
  }
}

/* ─────────────────────────────────────────────────────────────
   ADD MEMBER MODAL (BY EMAIL ID OR ACCOUNT ID)
   Allows organizers to search for registered students by email
   or account ID, previews verified profile info, and adds
   them to the committee core team roster with a designated role.
   ───────────────────────────────────────────────────────────── */
export default function AddMemberModal({ existingIds, onClose, onAdd }) {
  const modalRef = useRef(null);
  const discardModalRef = useRef(null);

  // Search Mode: 'email' (default) | 'id'
  const [searchMode, setSearchMode] = useState('email');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [label, setLabel] = useState('Volunteer');
  const [lookupError, setLookupError] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = Boolean(selected || query.trim());

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  useFocusTrap(modalRef, !showDiscardConfirm, handleCloseAttempt);
  useFocusTrap(discardModalRef, showDiscardConfirm, () => setShowDiscardConfirm(false));

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery || isLookingUp) return;
    setLookupError('');
    setSelected(null);

    // Auto-detect mode if user typed an email with '@' in ID mode or vice versa
    const isEmailQuery = cleanQuery.includes('@');
    const useEmail = isEmailQuery || searchMode === 'email';

    if (!useEmail && !/^[0-9a-fA-F]{24}$/.test(cleanQuery)) {
      setLookupError('That doesn’t look like a valid 24-character account ID.');
      return;
    }

    setIsLookingUp(true);
    try {
      const res = useEmail
        ? await lookupStudent({ email: cleanQuery })
        : await lookupStudent({ studentId: cleanQuery });
      const student = res.student || res.user || res;

      if (!student || !student._id) {
        throw new Error('Could not find student account details.');
      }

      const studentIdStr = student._id.toString();
      if (existingIds.includes(studentIdStr)) {
        setLookupError(`${student.name || 'This student'} is already on the committee roster.`);
        return;
      }

      setSelected({ id: studentIdStr, ...student });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setLookupError(
          useEmail
            ? `No registered student found with email "${cleanQuery}". Ensure the student has registered on CampusCircle.`
            : 'No student account found with that ID.'
        );
      } else if (err instanceof ApiError) {
        setLookupError(err.message || 'Could not find student account.');
      } else {
        setLookupError(err.message || 'Could not look up that student account.');
      }
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAddSubmit = async () => {
    if (!selected || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAdd(
        { studentId: selected.id, email: selected.email, role: label.trim() || 'Volunteer' },
        label.trim() || 'Volunteer',
        selected
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoleTheme = getRoleTheme(label);

  return (
    <div
      className="org-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && handleCloseAttempt()}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="org-modal org-roster-modal !p-0 !overflow-hidden !border-0 !shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="roster-modal-title"
      >
        {/* Modal Top Decorative Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#991B1B] via-[#D97706] to-[#0D9488]" />

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#EBE6DA] bg-[#FCFBF9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(153, 27, 27, 0.12) 0%, rgba(153, 27, 27, 0.04) 100%)',
                color: '#991B1B',
                border: '1.5px solid rgba(153, 27, 27, 0.15)',
              }}
            >
              <UserPlus size={20} weight="bold" />
            </div>
            <div>
              <h2 className="font-['Space_Grotesk'] font-bold text-base text-[#0F172A] tracking-tight leading-tight" id="roster-modal-title">
                Add Committee Member
              </h2>
              <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] mt-0.5">
                Look up a registered student and assign their official leadership role.
              </p>
            </div>
          </div>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0F172A] hover:bg-[#F0EDE5] transition-all"
            onClick={handleCloseAttempt}
            aria-label="Close modal"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Stepper Progress Ribbon */}
        <div className="px-6 py-2.5 bg-[#FAF8F5] border-b border-[#EBE6DA] flex items-center justify-between text-xs font-['Plus_Jakarta_Sans']">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                selected ? 'bg-emerald-600 text-white' : 'bg-[#991B1B] text-white shadow-sm'
              }`}
            >
              {selected ? <Check size={11} weight="bold" /> : '1'}
            </span>
            <span className={`font-semibold ${selected ? 'text-emerald-800' : 'text-[#0F172A]'}`}>
              Find Student Account
            </span>
          </div>

          <ArrowRight size={13} className="text-gray-400" />

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                selected ? 'bg-[#991B1B] text-white shadow-sm' : 'bg-gray-200 text-gray-500'
              }`}
            >
              2
            </span>
            <span className={`font-semibold ${selected ? 'text-[#0F172A]' : 'text-gray-400'}`}>
              Assign Designation
            </span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 bg-white max-h-[70vh] overflow-y-auto">
          {/* Step 1: Search Form */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-bold flex items-center gap-1.5">
                <MagnifyingGlass size={13} className="text-[#991B1B]" weight="bold" />
                Step 1: Student Lookup
              </span>

              {/* Mode Toggle Switcher */}
              <div className="flex items-center gap-1 bg-[#F5F2EA] p-0.5 rounded-lg border border-[#E5DFD1]">
                <button
                  type="button"
                  className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 ${
                    searchMode === 'email'
                      ? 'bg-white text-[#0F172A] shadow-sm font-bold'
                      : 'text-gray-500 hover:text-[#0F172A]'
                  }`}
                  onClick={() => {
                    setSearchMode('email');
                    setLookupError('');
                  }}
                >
                  <EnvelopeSimple size={12} weight={searchMode === 'email' ? 'bold' : 'regular'} />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 ${
                    searchMode === 'id'
                      ? 'bg-white text-[#0F172A] shadow-sm font-bold'
                      : 'text-gray-500 hover:text-[#0F172A]'
                  }`}
                  onClick={() => {
                    setSearchMode('id');
                    setLookupError('');
                  }}
                >
                  <IdentificationCard size={12} weight={searchMode === 'id' ? 'bold' : 'regular'} />
                  <span>Account ID</span>
                </button>
              </div>
            </div>

            {/* Integrated Search Bar */}
            <form className="relative flex items-center" onSubmit={handleLookup}>
              <div className="relative flex-1">
                {searchMode === 'email' ? (
                  <EnvelopeSimple size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                ) : (
                  <IdentificationCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                )}
                <input
                  id="roster-search-input"
                  className="w-full h-11 pl-10 pr-24 rounded-xl border-1.5 border-[#D8D2C4] bg-[#FAF8F5] text-xs text-[#0F172A] placeholder:text-gray-400 font-['Plus_Jakarta_Sans'] focus:outline-none focus:bg-white focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/15 transition-all"
                  type={searchMode === 'email' ? 'email' : 'text'}
                  placeholder={
                    searchMode === 'email'
                      ? 'e.g. priya.sharma@college.edu or alex@example.com'
                      : 'Paste 24-character account ID…'
                  }
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (selected) setSelected(null);
                    if (lookupError) setLookupError('');
                  }}
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded"
                    onClick={() => {
                      setQuery('');
                      setSelected(null);
                      setLookupError('');
                    }}
                    title="Clear query"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="absolute right-1.5 h-8 px-3.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                disabled={!query.trim() || isLookingUp}
              >
                {isLookingUp ? (
                  <CircleNotch size={14} className="animate-spin text-white" />
                ) : (
                  <>
                    <MagnifyingGlass size={13} weight="bold" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </form>

            {lookupError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5"
              >
                <Warning size={16} className="text-red-600 flex-shrink-0 mt-0.5" weight="bold" />
                <p className="leading-snug">{lookupError}</p>
              </motion.div>
            )}

            {/* Verified Student Preview Card */}
            {selected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="p-4 rounded-xl border border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-950 font-bold text-sm shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 100%)',
                      border: '1.5px solid #34D399',
                    }}
                  >
                    {getInitials(selected.name)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-[#0F172A] font-['Space_Grotesk'] truncate">
                        {selected.name}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <ShieldCheck size={11} weight="fill" className="text-emerald-700" />
                        Verified Student
                      </span>
                    </div>

                    {selected.email && (
                      <p className="text-xs text-gray-600 font-mono truncate mt-0.5">
                        {selected.email}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1 font-['Plus_Jakarta_Sans']">
                      {selected.branch && (
                        <span className="inline-flex items-center gap-1 text-[#0D9488] font-semibold">
                          <GraduationCap size={13} />
                          {selected.branch}
                        </span>
                      )}
                      {selected.yearOfJoining && (
                        <span>· Batch of {selected.yearOfJoining}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="text-xs text-gray-400 hover:text-gray-700 font-medium px-2 py-1 rounded hover:bg-black/5 transition-all flex-shrink-0"
                  onClick={() => setSelected(null)}
                  title="Change student"
                >
                  Change
                </button>
              </motion.div>
            )}
          </div>

          {/* Step 2: Role Designation Input & Categorized Presets */}
          <div className="pt-4 border-t border-[#EBE6DA] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-bold flex items-center gap-1.5">
                <Sparkle size={13} className="text-[#991B1B]" weight="fill" />
                Step 2: Official Designation
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: selectedRoleTheme.badgeBg,
                  color: selectedRoleTheme.badgeColor,
                  border: `1px solid ${selectedRoleTheme.badgeBorder}`,
                }}
              >
                {selectedRoleTheme.label}
              </span>
            </div>

            {/* Custom Designation Input */}
            <div>
              <input
                id="roster-role-title"
                className="w-full h-10 px-3.5 rounded-xl border-1.5 border-[#D8D2C4] bg-[#FAF8F5] text-xs font-semibold text-[#0F172A] placeholder:text-gray-400 font-['Plus_Jakarta_Sans'] focus:outline-none focus:bg-white focus:border-[#991B1B] focus:ring-2 focus:ring-[#991B1B]/15 transition-all"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Type or select a role designation (e.g. Technical Lead)"
                maxLength={128}
              />
            </div>

            {/* Themed Preset Role Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-['Plus_Jakarta_Sans'] text-gray-500 font-medium block">
                Quick Role Presets:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_ROLES.map((preset) => {
                  const isSelected = label.trim().toLowerCase() === preset.toLowerCase();
                  const theme = getRoleTheme(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLabel(preset)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-sm ring-2 ring-[#0F172A]/15'
                          : 'bg-[#FAF8F5] text-[#334155] border-[#E6E1D5] hover:bg-white hover:border-gray-400'
                      }`}
                    >
                      <PresetRoleIcon role={preset} size={13} />
                      <span>{preset}</span>
                      {isSelected && <Check size={12} weight="bold" className="text-emerald-400 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#EBE6DA] flex items-center justify-between gap-3">
          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-[#0F172A] hover:bg-[#EAE5D9] rounded-xl transition-all"
            onClick={handleCloseAttempt}
          >
            Cancel
          </button>

          <button
            type="button"
            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-['Space_Grotesk'] tracking-wide flex items-center gap-2 transition-all shadow-md ${
              selected && label.trim() && !isSubmitting
                ? 'bg-[#991B1B] hover:bg-[#7F1D1D] text-white shadow-[#991B1B]/25 hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
            }`}
            disabled={!selected || !label.trim() || isSubmitting}
            onClick={handleAddSubmit}
          >
            {isSubmitting ? (
              <CircleNotch size={16} className="animate-spin text-white" />
            ) : (
              <Check size={16} weight="bold" />
            )}
            <span>{isSubmitting ? 'Adding to Core Team…' : 'Add to Committee Roster'}</span>
          </button>
        </div>
      </motion.div>

      {/* Discard Confirmation Dialog */}
      {showDiscardConfirm && (
        <div
          className="org-modal-overlay"
          style={{ zIndex: 1250 }}
          onClick={(e) => e.target === e.currentTarget && setShowDiscardConfirm(false)}
        >
          <motion.div
            ref={discardModalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="org-modal"
            style={{ maxWidth: 420 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="discard-roster-title"
          >
            <div className="org-modal-header">
              <div className="flex items-center gap-2 text-amber-700">
                <Warning size={20} weight="bold" />
                <h2 className="org-modal-title text-amber-900" id="discard-roster-title">
                  Discard Unsaved Selection?
                </h2>
              </div>
              <button
                className="org-icon-btn"
                onClick={() => setShowDiscardConfirm(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="org-modal-body">
              <p className="text-xs text-gray-600 leading-relaxed font-['Plus_Jakarta_Sans']">
                You have an active student account lookup in progress. Are you sure you want to discard and close?
              </p>
            </div>
            <div className="org-modal-footer">
              <button
                type="button"
                className="org-btn org-btn-ghost"
                onClick={() => setShowDiscardConfirm(false)}
              >
                Keep Editing
              </button>
              <button
                type="button"
                className="org-btn org-btn-danger-solid"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onClose();
                }}
              >
                Discard Selection
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

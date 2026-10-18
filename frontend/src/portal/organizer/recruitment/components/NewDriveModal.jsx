import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import { CheckCircle, CircleNotch, Plus, Sparkle, Trash, Warning, X, CaretDown, CaretUp, ShieldCheck } from '@phosphor-icons/react';
import {
  ROLE_DEPARTMENTS,
  STANDARD_COMMUNITY_ROLES,
  STARTER_DRIVE_TEMPLATES,
  findStandardRole,
} from '@/portal/organizer/recruitment/recruitmentTemplates';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { ApiError } from '@/shared/api/httpClient';

const CHOICE_TYPES = ['select', 'radio', 'checkbox'];
const QUESTION_TYPE_BUTTONS = [
  { type: 'text', label: 'Text' },
  { type: 'textarea', label: 'Long Text' },
  { type: 'number', label: 'Number' },
  { type: 'url', label: 'URL' },
  { type: 'select', label: 'Dropdown' },
  { type: 'radio', label: 'Radio' },
  { type: 'checkbox', label: 'Checkboxes' },
];

function makeQuestion(type) {
  return {
    id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type,
    label: '',
    placeholder: '',
    required: true,
    options: CHOICE_TYPES.includes(type) ? ['Option 1', 'Option 2'] : [],
  };
}

function draftFromDrive(drive) {
  if (!drive) {
    return {
      title: '',
      description: '',
      deadline: '',
      collectProfileData: false,
      requireWaiver: false,
      waiverText: '',
      confirmationMessage: '',
      sendEmailReceipt: false,
      autoDeleteAfterMonths: 6,
      questions: [],
    };
  }
  return {
    title: drive.title || '',
    description: drive.description || '',
    deadline: drive.deadline ? new Date(drive.deadline).toISOString().slice(0, 10) : '',
    collectProfileData: Boolean(drive.collectProfileData),
    requireWaiver: Boolean(drive.requireWaiver),
    waiverText: drive.waiverText || '',
    confirmationMessage: drive.confirmationMessage || '',
    sendEmailReceipt: Boolean(drive.sendEmailReceipt),
    autoDeleteAfterMonths: drive.autoDeleteAfterMonths || 6,
    questions: (drive.formQuestions || []).map((q) => ({
      id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: q.type,
      label: q.label || '',
      placeholder: q.placeholder || '',
      helpText: q.helpText || '',
      required: Boolean(q.required),
      options: q.options ? [...q.options] : [],
    })),
  };
}

/* ─────────────────────────────────────────────────────────────
   NEW / EDIT RECRUITMENT DRIVE MODAL
   One drive = one position (CommunityRecruitment has no multi-position/
   openings concept). onCreate is async — a thrown ApiError keeps the
   modal open with an inline error instead of closing. Pass `drive` to
   edit an existing drive in place (calls the same onCreate, which the
   caller wires to updateDrive instead of createDrive).
   ───────────────────────────────────────────────────────────── */
export default function NewDriveModal({ onClose, onCreate, drive }) {
  const isEditing = Boolean(drive);
  const modalRef = useRef(null);
  const discardModalRef = useRef(null);

  const [draft, setDraft] = useState(() => draftFromDrive(drive));
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectedDept, setSelectedDept] = useState('all');
  const [showAllRoles, setShowAllRoles] = useState(false);

  const displayedRoles = showAllRoles
    ? STANDARD_COMMUNITY_ROLES.filter((r) => selectedDept === 'all' || r.department === selectedDept)
    : STARTER_DRIVE_TEMPLATES;

  const activeStandardRole = findStandardRole(draft.title);

  const isDirty = Boolean(
    draft.title.trim() ||
    draft.description.trim() ||
    draft.deadline ||
    draft.questions.some((q) => q.label.trim())
  );

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  useFocusTrap(modalRef, !showDiscardConfirm, handleCloseAttempt);
  useFocusTrap(discardModalRef, showDiscardConfirm, () => setShowDiscardConfirm(false));

  const handleApplyTemplate = (tpl) => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDraft((prev) => ({
      ...prev,
      title: tpl.title,
      description: tpl.description,
      deadline: d.toISOString().slice(0, 10),
      questions: tpl.formQuestions.map((q) => ({ ...makeQuestion(q.type), ...q, options: q.options ? [...q.options] : [] })),
    }));
  };

  // Only enforced when creating — the backend's updateDrive validator (unlike
  // createDrive) deliberately allows any date, since a drive already past its
  // original deadline must stay editable for its other fields.
  const deadlineInPast = !isEditing && draft.deadline && new Date(draft.deadline) <= new Date();

  const questionsValid = draft.questions.every((q) => {
    if (!q.label.trim()) return true; // dropped silently on submit
    if (CHOICE_TYPES.includes(q.type)) return q.options.filter((o) => o.trim()).length >= 2;
    return true;
  });

  const canCreate =
    draft.title.trim() &&
    draft.description.trim() &&
    (!draft.requireWaiver || draft.waiverText.trim()) &&
    !deadlineInPast &&
    questionsValid;

  const buildPayload = () => {
    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      collectProfileData: draft.collectProfileData,
      requireWaiver: draft.requireWaiver,
      sendEmailReceipt: draft.sendEmailReceipt,
      autoDeleteAfterMonths: draft.autoDeleteAfterMonths,
    };
    if (draft.deadline) {
      payload.deadline = draft.deadline;
    } else if (isEditing) {
      payload.deadline = null;
    }
    if (draft.requireWaiver) payload.waiverText = draft.waiverText.trim();
    if (draft.confirmationMessage.trim()) payload.confirmationMessage = draft.confirmationMessage.trim();

    const formQuestions = draft.questions
      .filter((q) => q.label.trim())
      .map((q) => {
        const question = { label: q.label.trim(), type: q.type, required: q.required };
        if (q.placeholder?.trim()) question.placeholder = q.placeholder.trim();
        if (q.helpText?.trim()) question.helpText = q.helpText.trim();
        if (CHOICE_TYPES.includes(q.type)) question.options = q.options.map((o) => o.trim()).filter(Boolean);
        return question;
      });
    if (formQuestions.length) payload.formQuestions = formQuestions;

    return payload;
  };

  const handleCreateSubmit = async () => {
    if (!canCreate || isSaving) return;
    setIsSaving(true);
    setSubmitError(null);
    try {
      await onCreate(buildPayload());
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : `Could not ${isEditing ? 'save' : 'create'} recruitment drive.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = (type) =>
    setDraft((prev) => ({ ...prev, questions: [...prev.questions, makeQuestion(type)] }));

  const updateQuestion = (i, field, val) => {
    const next = [...draft.questions];
    next[i] = { ...next[i], [field]: val };
    setDraft({ ...draft, questions: next });
  };

  const removeQuestion = (i) => {
    setDraft({ ...draft, questions: draft.questions.filter((_, idx) => idx !== i) });
  };

  const addOption = (qIndex) => {
    const next = [...draft.questions];
    const opts = next[qIndex].options || [];
    next[qIndex] = { ...next[qIndex], options: [...opts, `Option ${opts.length + 1}`] };
    setDraft({ ...draft, questions: next });
  };

  const updateOption = (qIndex, optIndex, val) => {
    const next = [...draft.questions];
    const opts = [...next[qIndex].options];
    opts[optIndex] = val;
    next[qIndex] = { ...next[qIndex], options: opts };
    setDraft({ ...draft, questions: next });
  };

  const removeOption = (qIndex, optIndex) => {
    const next = [...draft.questions];
    next[qIndex] = { ...next[qIndex], options: next[qIndex].options.filter((_, i) => i !== optIndex) };
    setDraft({ ...draft, questions: next });
  };

  return (
    <div
      className="org-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && handleCloseAttempt()}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="org-modal org-drive-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drive-modal-title"
      >
        {/* Modal Header */}
        <div className="org-modal-header">
          <div>
            <h2 className="org-modal-title" id="drive-modal-title">
              {isEditing ? 'Edit Recruitment Drive' : 'Create New Recruitment Drive'}
            </h2>
            <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] mt-0.5">
              {isEditing
                ? 'Update the position details, deadline, or screening questions.'
                : 'A drive posts one open position. Set a deadline and screening questions, then publish.'}
            </p>
          </div>
          <button className="org-icon-btn" onClick={handleCloseAttempt} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="org-modal-body space-y-4 max-h-[75vh] overflow-y-auto">
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2 text-xs text-red-700">
              <Warning size={14} weight="bold" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Standard Community Roles & Starter Blueprints */}
          {!isEditing && (
            <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-lg p-3 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <span className="text-[11px] font-mono font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkle size={13} className="text-[#991B1B]" weight="fill" />
                  Standard Community Roles:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllRoles(!showAllRoles)}
                  className="text-[11px] font-mono text-[#991B1B] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                >
                  {showAllRoles ? (
                    <>
                      <span>Show Quick Starters</span>
                      <CaretUp size={12} weight="bold" />
                    </>
                  ) : (
                    <>
                      <span>Browse All Roles ({STANDARD_COMMUNITY_ROLES.length})</span>
                      <CaretDown size={12} weight="bold" />
                    </>
                  )}
                </button>
              </div>

              {/* Department category filters when browsing all roles */}
              {showAllRoles && (
                <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                  {ROLE_DEPARTMENTS.map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => setSelectedDept(dept.id)}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedDept === dept.id
                          ? 'bg-[#0F172A] text-white shadow-xs'
                          : 'bg-white border border-[#D8D2C4] text-[#475569] hover:border-[#991B1B]'
                      }`}
                    >
                      <span className="mr-1">{dept.icon}</span>
                      {dept.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Role Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-0.5">
                {displayedRoles.map((tpl) => {
                  const isSelected = draft.title === tpl.title;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#991B1B] bg-[#FEF2F2] shadow-xs ring-1 ring-[#991B1B]'
                          : 'border-[#D8D2C4] bg-white hover:border-[#991B1B] hover:shadow-xs'
                      }`}
                      onClick={() => handleApplyTemplate(tpl)}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base leading-none">{tpl.icon}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] font-bold truncate max-w-[80px]">
                            {tpl.level || tpl.tag}
                          </span>
                        </div>
                        <span className="font-bold text-[#0F172A] font-['Space_Grotesk'] block text-[11px] leading-tight mb-1">
                          {tpl.shortName || tpl.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono block mt-1">
                        {tpl.formQuestions.length} screening q's
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drive Title */}
          <div className="org-form-group">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="drive-title" className="org-form-label mb-0">
                Position Title <span className="text-[#991B1B]">*</span>
              </label>
              {activeStandardRole && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
                  <ShieldCheck size={12} weight="fill" />
                  {activeStandardRole.wing} • {activeStandardRole.level}
                </span>
              )}
            </div>
            <input
              id="drive-title"
              className="org-form-input text-xs font-bold font-['Space_Grotesk']"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="e.g. Technical Lead"
            />
          </div>

          {/* Description */}
          <div className="org-form-group">
            <label htmlFor="drive-desc" className="org-form-label">
              Role Brief / Eligibility Criteria <span className="text-[#991B1B]">*</span>
            </label>
            <textarea
              id="drive-desc"
              rows={3}
              className="org-form-textarea text-xs"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Describe the role, responsibilities, and who should apply..."
            />
          </div>

          {/* Deadline */}
          <div className="org-form-group">
            <div className="flex items-center justify-between">
              <label htmlFor="drive-deadline" className="org-form-label mb-0">
                Application Deadline <span className="org-form-hint">(optional)</span>
              </label>
              {draft.deadline && (
                <button
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, deadline: '' }))}
                  className="text-[11px] text-gray-500 hover:text-[#991B1B] underline cursor-pointer"
                >
                  Clear deadline
                </button>
              )}
            </div>
            <input
              id="drive-deadline"
              type="date"
              className="org-form-input text-xs font-mono mt-1.5"
              value={draft.deadline}
              onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
            />
            {deadlineInPast && (
              <span className="text-[11px] text-red-600 mt-1 block">Deadline must be in the future.</span>
            )}
            <p className="text-[11px] text-gray-500 mt-1">
              Once this cutoff passes, students cannot submit new applications for this position.
            </p>
          </div>

          {/* Auto-delete Timeline */}
          <div className="org-form-group">
            <label htmlFor="drive-auto-delete" className="org-form-label">
              Auto-delete After <span className="org-form-hint">(months of inactivity, 1–12)</span>
            </label>
            <input
              id="drive-auto-delete"
              type="number"
              min={1}
              max={12}
              className="org-form-input text-xs font-mono w-24"
              value={draft.autoDeleteAfterMonths}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  autoDeleteAfterMonths: Math.min(12, Math.max(1, Number(e.target.value) || 1)),
                })
              }
            />
          </div>

          {/* Application Settings */}
          <div className="org-form-group space-y-2">
            <label className="org-form-label mb-0">Application Settings</label>
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.collectProfileData}
                onChange={(e) => setDraft({ ...draft, collectProfileData: e.target.checked })}
                className="rounded border-[#D8D2C4] text-[#991B1B]"
              />
              <span>Also collect the applicant's profile (branch, year, roll no.)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.sendEmailReceipt}
                onChange={(e) => setDraft({ ...draft, sendEmailReceipt: e.target.checked })}
                className="rounded border-[#D8D2C4] text-[#991B1B]"
              />
              <span>Send an email receipt on submission</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.requireWaiver}
                onChange={(e) => setDraft({ ...draft, requireWaiver: e.target.checked })}
                className="rounded border-[#D8D2C4] text-[#991B1B]"
              />
              <span>Require a waiver / code-of-conduct agreement</span>
            </label>
            {draft.requireWaiver && (
              <textarea
                rows={2}
                className="org-form-textarea text-xs"
                value={draft.waiverText}
                onChange={(e) => setDraft({ ...draft, waiverText: e.target.value })}
                placeholder="e.g. I agree to abide by the community's code of conduct..."
              />
            )}
          </div>

          {/* Confirmation Message */}
          <div className="org-form-group">
            <label htmlFor="drive-confirmation" className="org-form-label">
              Confirmation Message <span className="org-form-hint">(shown after applying)</span>
            </label>
            <textarea
              id="drive-confirmation"
              rows={2}
              className="org-form-textarea text-xs"
              value={draft.confirmationMessage}
              onChange={(e) => setDraft({ ...draft, confirmationMessage: e.target.value })}
              placeholder="e.g. Thanks for applying! We'll be in touch soon."
            />
          </div>

          {/* Screening Questions Builder */}
          <div className="org-form-group">
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1.5">
              <label className="org-form-label mb-0">
                Screening Questions <span className="org-form-hint">({draft.questions.length})</span>
              </label>
              <div className="flex items-center gap-1 flex-wrap">
                {QUESTION_TYPE_BUTTONS.map((b) => (
                  <button
                    key={b.type}
                    type="button"
                    className="org-btn org-btn-ghost text-[11px] !py-1 !px-2 text-[#991B1B]"
                    onClick={() => addQuestion(b.type)}
                  >
                    <Plus size={11} /> {b.label}
                  </button>
                ))}
              </div>
            </div>

            {draft.questions.length === 0 ? (
              <p className="text-xs text-gray-500 italic bg-[#FAF8F5] p-3 rounded border border-[#D8D2C4] text-center">
                No screening questions yet. Add one above, or apply a starter blueprint.
              </p>
            ) : (
              <div className="org-question-list space-y-2">
                {draft.questions.map((q, i) => (
                  <div className="p-2.5 bg-[#FAF8F5] border border-[#D8D2C4] rounded-lg space-y-2" key={q.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-[#D8D2C4] text-gray-700 uppercase flex-shrink-0">
                        {q.type}
                      </span>
                      <input
                        className="org-form-input flex-1 text-xs"
                        value={q.label}
                        onChange={(e) => updateQuestion(i, 'label', e.target.value)}
                        placeholder={`Question ${i + 1} (e.g. Why do you want this role?)`}
                      />
                      <label className="flex items-center gap-1 text-[11px] font-mono text-gray-600 cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQuestion(i, 'required', e.target.checked)}
                          className="rounded border-[#D8D2C4] text-[#991B1B]"
                        />
                        <span>Required</span>
                      </label>
                      <button
                        type="button"
                        className="org-icon-btn org-icon-btn--danger flex-shrink-0"
                        onClick={() => removeQuestion(i)}
                        aria-label="Remove question"
                      >
                        <Trash size={14} />
                      </button>
                    </div>

                    {CHOICE_TYPES.includes(q.type) && (
                      <div className="pl-1 space-y-1.5">
                        {(q.options || []).map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-mono">#{optIndex + 1}</span>
                            <input
                              className="org-form-input flex-1 text-xs !py-1"
                              value={opt}
                              onChange={(e) => updateOption(i, optIndex, e.target.value)}
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                className="text-gray-400 hover:text-red-600 p-1"
                                onClick={() => removeOption(i, optIndex)}
                              >
                                <Trash size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          className="text-[11px] font-mono text-[#991B1B] hover:underline font-bold flex items-center gap-1"
                          onClick={() => addOption(i)}
                        >
                          <Plus size={11} /> Add Option
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="org-modal-footer">
          <button type="button" className="org-btn org-btn-ghost" onClick={handleCloseAttempt}>
            Cancel
          </button>
          <button
            type="button"
            className="org-btn org-btn-primary"
            disabled={!canCreate || isSaving}
            onClick={handleCreateSubmit}
          >
            {isSaving ? (
              <CircleNotch size={15} className="animate-spin" />
            ) : (
              <CheckCircle size={15} weight="bold" />
            )}
            <span>
              {isEditing
                ? (isSaving ? 'Saving Changes…' : 'Save Changes')
                : (isSaving ? 'Publishing Drive…' : 'Publish Recruitment Drive')}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Discard Confirmation Dialog */}
      {showDiscardConfirm && (
        <div
          className="org-modal-overlay"
          style={{ zIndex: 1100 }}
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
            aria-labelledby="discard-drive-title"
          >
            <div className="org-modal-header">
              <div className="flex items-center gap-2 text-amber-700">
                <Warning size={20} weight="bold" />
                <h2 className="org-modal-title text-amber-900" id="discard-drive-title">
                  Discard Unsaved Drive?
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
                You have unsaved changes in this recruitment drive draft. Are you sure you want to discard and close?
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
                Discard Drive
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

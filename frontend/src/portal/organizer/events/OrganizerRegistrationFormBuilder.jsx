import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Trash,
  PencilSimple,
  FloppyDisk,
  Eye,
  CheckCircle,
  Warning,
  ArrowUp,
  ArrowDown,
  Copy,
  TextT,
  TextAlignLeft,
  ListBullets,
  RadioButton,
  CheckSquare,
  Link as LinkIcon,
  ShieldCheck,
  Sparkle,
  ArrowCounterClockwise,
  UsersThree,
  Ticket,
  Envelope,
  CalendarBlank,
  MapPin,
  Clock,
  Check,
  X,
  FileText,
  CaretRight,
  Info,
  QrCode,
  Tag,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { FIELD_TYPES, createDefaultForm } from '@/portal/organizer/events/registrationFormDefaults';
import { FORM_TEMPLATES } from '@/portal/organizer/events/registrationFormTemplates';
import FormBuilderCanvas from '@/portal/organizer/events/form-builder/FormBuilderCanvas';
import FormBuilderPreview from '@/portal/organizer/events/form-builder/FormBuilderPreview';
import FormTemplateModal from '@/portal/organizer/events/form-builder/FormTemplateModal';

export default function OrganizerRegistrationFormBuilder({
  event,
  onSaveForm,
  communityName = 'GDSC SIES GST',
}) {
  // Active Form State — built straight from the real Event doc's fields
  // (formQuestions, requireWaiver/waiverText, registrationType/teamSize,
  // confirmationMessage). No separate form document exists server-side.
  const [form, setForm] = useState(() => createDefaultForm(event));

  // Track initial state to detect dirty / unsaved changes
  const [initialFormSnapshot, setInitialFormSnapshot] = useState(() =>
    JSON.stringify(createDefaultForm(event))
  );
  const [saving, setSaving] = useState(false);

  // Active sub-view: 'builder' | 'preview'
  const [activeMode, setActiveMode] = useState('builder');

  // Preview test submission state
  const [previewValues, setPreviewValues] = useState({});
  const [previewWaiverChecked, setPreviewWaiverChecked] = useState(false);
  const [previewTeamMembers, setPreviewTeamMembers] = useState(['']);
  const [previewSubmitted, setPreviewSubmitted] = useState(false);
  const [previewErrors, setPreviewErrors] = useState({});

  // Show Template Selector Modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Re-sync whenever the parent hands us a fresh event doc — including
  // right after our own save resolves, which clears the dirty flag.
  useEffect(() => {
    const def = createDefaultForm(event);
    setForm(def);
    setInitialFormSnapshot(JSON.stringify(def));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== initialFormSnapshot;
  }, [form, initialFormSnapshot]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  /* ── Form Mutations ── */
  const updateForm = (patch) => {
    setForm((prev) => ({
      ...prev,
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  };

  const addField = (fieldType = 'text') => {
    const newField = {
      id: `f_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: fieldType,
      label: fieldType === 'url' ? 'Project / Portfolio URL' : 'New Question Label',
      placeholder: fieldType === 'url' ? 'https://...' : 'Enter placeholder...',
      helpText: '',
      required: false,
      options: ['select', 'radio', 'checkbox'].includes(fieldType) ? ['Option 1', 'Option 2'] : [],
    };
    updateForm({ fields: [...form.fields, newField] });
    showToast('✓ Added new question field');
  };

  const updateField = (idx, patch) => {
    const next = [...form.fields];
    next[idx] = { ...next[idx], ...patch };
    updateForm({ fields: next });
  };

  const removeField = (idx) => {
    const next = form.fields.filter((_, i) => i !== idx);
    updateForm({ fields: next });
    showToast('Question removed');
  };

  const duplicateField = (idx) => {
    const src = form.fields[idx];
    const clone = {
      ...JSON.parse(JSON.stringify(src)),
      id: `f_${Date.now()}_copy`,
      label: `${src.label} (Copy)`,
    };
    const next = [...form.fields];
    next.splice(idx + 1, 0, clone);
    updateForm({ fields: next });
    showToast('Question duplicated');
  };

  const moveField = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= form.fields.length) return;
    const next = [...form.fields];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    updateForm({ fields: next });
  };

  const addOptionToField = (fieldIdx) => {
    const field = form.fields[fieldIdx];
    const currentOptions = field.options || [];
    const nextOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
    updateField(fieldIdx, { options: nextOptions });
  };

  const updateOptionInField = (fieldIdx, optIdx, val) => {
    const field = form.fields[fieldIdx];
    const nextOptions = [...field.options];
    nextOptions[optIdx] = val;
    updateField(fieldIdx, { options: nextOptions });
  };

  const removeOptionInField = (fieldIdx, optIdx) => {
    const field = form.fields[fieldIdx];
    const nextOptions = field.options.filter((_, i) => i !== optIdx);
    updateField(fieldIdx, { options: nextOptions });
  };

  const applyTemplate = (templateKey) => {
    const tpl = FORM_TEMPLATES[templateKey];
    if (!tpl) return;
    updateForm({
      fields: JSON.parse(JSON.stringify(tpl.fields)),
      description: `${tpl.desc} All registered students must adhere to SIES GST campus guidelines.`,
    });
    setShowTemplateModal(false);
    showToast(`✓ Loaded ${tpl.name}`);
  };

  /* ── Save Handler — PATCHes the event directly; there's no separate
     draft/publish state for the form itself, only for the event as a
     whole (edited via the create-wizard's edit mode). ── */
  const handleSave = async () => {
    const patch = {
      formQuestions: form.fields.map(({ id, ...rest }) => rest),
      requireWaiver: form.requireWaiver,
      registrationType: form.allowTeam ? 'team' : 'solo',
    };
    if (form.allowTeam) patch.teamSize = { min: Number(form.teamMin), max: Number(form.teamMax) };
    if (form.requireWaiver) patch.waiverText = form.waiverText;
    if (form.settings?.confirmationMessage) patch.confirmationMessage = form.settings.confirmationMessage;

    setSaving(true);
    try {
      await onSaveForm?.(patch);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDraft = () => {
    if (window.confirm('Discard unsaved edits and revert back to last saved form?')) {
      const restored = JSON.parse(initialFormSnapshot);
      setForm(restored);
      showToast('Reverted unsaved edits');
    }
  };

  /* ── Preview Test Simulator ── */
  const handlePreviewSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    form.fields.forEach((f) => {
      if (f.required) {
        const val = previewValues[f.id];
        if (!val || (Array.isArray(val) && val.length === 0) || (typeof val === 'string' && !val.trim())) {
          errors[f.id] = 'This field is required by the event organiser.';
        }
      }
    });
    if (form.requireWaiver && !previewWaiverChecked) {
      errors.waiver = 'You must accept the guidelines & waiver to complete registration.';
    }

    setPreviewErrors(errors);
    if (Object.keys(errors).length === 0) {
      setPreviewSubmitted(true);
    }
  };

  return (
    <div className="org-form-builder-container space-y-4">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="org-toast" role="status" aria-live="polite">
          <CheckCircle size={16} style={{ color: '#4ADE80', flexShrink: 0 }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Top Action Toolbar ── */}
      <div className="org-form-builder-toolbar flex items-center justify-between flex-wrap gap-3 bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl p-3 px-4 shadow-sm">
        {/* Left: Status & Meta */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#1A3A2A]/10 text-[#1A3A2A] flex items-center justify-center font-bold">
              <FileText size={17} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                  Event Registration Form
                </span>
                {isDirty && (
                  <span className="org-form-status-badge org-form-status-badge--unsaved">
                    Unsaved Edits
                  </span>
                )}
              </div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6875rem', color: '#6B7280' }}>
                Tied to: <strong style={{ color: '#991B1B' }}>{event?.title}</strong> &middot; {form.fields.length} questions
              </p>
            </div>
          </div>
        </div>

        {/* Center: Mode Switcher (Builder vs Preview) */}
        <div className="org-view-mode-toggle bg-white/80 border border-[#D8D2C4] p-1 rounded-lg flex items-center gap-1">
          <button
            type="button"
            className={`org-view-mode-btn ${activeMode === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveMode('builder')}
            title="Edit form structure and custom questions"
          >
            <PencilSimple size={13} />
            <span>Form Builder</span>
          </button>
          <button
            type="button"
            className={`org-view-mode-btn ${activeMode === 'preview' ? 'active' : ''}`}
            onClick={() => {
              setActiveMode('preview');
              setPreviewSubmitted(false);
              setPreviewErrors({});
            }}
            title="Test interactive student registration experience"
          >
            <Eye size={13} />
            <span>Live Student Preview</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="org-btn org-btn-ghost !py-1.5 !px-3 text-xs"
            onClick={() => setShowTemplateModal(true)}
            title="Load questions from preset templates"
          >
            <Sparkle size={14} className="text-amber-600" />
            <span>Templates</span>
          </button>

          {isDirty && (
            <button
              type="button"
              className="org-btn org-btn-ghost !py-1.5 !px-2.5 text-xs text-gray-600 hover:text-red-700"
              onClick={handleResetDraft}
              title="Discard unsaved edits"
            >
              <ArrowCounterClockwise size={14} />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            className="org-btn org-btn-primary !bg-[#1A3A2A] !py-1.5 !px-4 text-xs font-bold"
            onClick={handleSave}
            disabled={saving || !isDirty}
            title="Save questions, waiver, and confirmation message to the event"
          >
            <FloppyDisk size={14} />
            <span>{saving ? 'Saving…' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         SUB-VIEW 1: FORM BUILDER CANVAS
         ───────────────────────────────────────────────────────────── */}
      {activeMode === 'builder' && (
        <FormBuilderCanvas
          event={event}
          form={form}
          addField={addField}
          addOptionToField={addOptionToField}
          duplicateField={duplicateField}
          moveField={moveField}
          removeField={removeField}
          removeOptionInField={removeOptionInField}
          updateField={updateField}
          updateForm={updateForm}
          updateOptionInField={updateOptionInField}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
         SUB-VIEW 2: LIVE INTERACTIVE STUDENT PREVIEW
         ───────────────────────────────────────────────────────────── */}
      {activeMode === 'preview' && (
        <FormBuilderPreview
          communityName={communityName}
          event={event}
          form={form}
          handlePreviewSubmit={handlePreviewSubmit}
          previewErrors={previewErrors}
          previewSubmitted={previewSubmitted}
          previewTeamMembers={previewTeamMembers}
          previewValues={previewValues}
          previewWaiverChecked={previewWaiverChecked}
          setPreviewErrors={setPreviewErrors}
          setPreviewSubmitted={setPreviewSubmitted}
          setPreviewTeamMembers={setPreviewTeamMembers}
          setPreviewValues={setPreviewValues}
          setPreviewWaiverChecked={setPreviewWaiverChecked}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
         TEMPLATE SELECTOR MODAL
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showTemplateModal && (
          <FormTemplateModal
            applyTemplate={applyTemplate}
            setShowTemplateModal={setShowTemplateModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

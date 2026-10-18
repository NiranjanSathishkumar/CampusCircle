/**
 * Builder mode — field palette, ordering and per-field settings.
 */
import { motion } from 'motion/react';
import { ArrowDown, ArrowUp, CalendarBlank, CheckCircle, Copy, Eye, FileText, MapPin, Plus, ShieldCheck, Tag, Ticket, Trash, UsersThree, X } from '@phosphor-icons/react';
import { FIELD_TYPES } from '@/portal/organizer/events/registrationFormDefaults';

export default function FormBuilderCanvas({
  event,
  form,
  addField,
  addOptionToField,
  duplicateField,
  moveField,
  removeField,
  removeOptionInField,
  updateField,
  updateForm,
  updateOptionInField,
}) {
  const isTeamEvent = Boolean(form?.allowTeam || event?.registrationType === 'team' || event?.teamFormat === 'Team' || (event?.teamSize?.max && event?.teamSize?.max > 1));
  const eventDateLabel = event?.eventDate
    ? new Date(event.eventDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : 'TBA';
  const teamFormatLabel = isTeamEvent
    ? `${event?.teamSize?.min || form?.teamMin || 2}–${event?.teamSize?.max || form?.teamMax || 4} members`
    : 'Solo';
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Main Left Column: Form Header & Questions List (8 cols) */}
      <div className="lg:col-span-8 space-y-4">
        {/* Form Meta Card */}
        <div className="org-form-meta-card">
          <div className="org-form-meta-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={15} style={{ color: '#991B1B' }} />
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', margin: 0 }}>
                Form Title &amp; Instructions
              </h3>
            </div>
            <span className="org-visible-students-pill">
              <Eye size={9} /> Visible to Students
            </span>
          </div>
          <div className="org-form-meta-card-body">
            <div>
              <label className="org-field-label">Form Heading / Title</label>
              <input
                type="text"
                className="org-inline-input font-['Space_Grotesk'] font-bold text-sm"
                value={form.title}
                onChange={(e) => updateForm({ title: e.target.value })}
                placeholder="e.g. HackCampus 2026 Registration Form"
              />
            </div>
            <div>
              <label className="org-field-label">Instructions &amp; Prerequisite Notice</label>
              <textarea
                className="org-inline-textarea text-xs"
                rows={2}
                value={form.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                placeholder="Provide guidance to applicants about venue requirements, toolkits, or prerequisites..."
              />
            </div>
          </div>
        </div>

        {/* Standard Student Profile Auto-Capture Banner */}
        <div className="org-profile-capture-banner">
          <div className="org-profile-capture-icon">
            <ShieldCheck size={18} weight="fill" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.8125rem', color: '#064E3B', margin: 0 }}>
                SIES GST Student Profile Auto-Capture
              </h4>
              <span className="org-profile-capture-tag">Built-in</span>
            </div>
            <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.75rem', color: '#065F46', lineHeight: 1.55, margin: '0 0 0.625rem' }}>
              Standard verified student details (<strong>Full Name, Roll Number, Branch, Year &amp; Campus Email</strong>) are securely authenticated and attached automatically to every RSVP.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {['Full Name', 'Roll Number (121A...)', 'Engineering Branch', 'Year of Study', 'Official Email'].map((tag) => (
                <span key={tag} className="org-profile-capture-tag">
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Questions Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="org-questions-section-header">
            <span className="org-questions-section-title">
              <FileText size={16} style={{ color: '#991B1B' }} />
              Custom Registration Questions
              <span className="org-questions-count-badge">{form.fields.length}</span>
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Reorder &amp; configure fields
            </span>
          </div>

          {form.fields.length === 0 ? (
            <div className="org-card p-8 text-center space-y-3 border-2 border-dashed border-[#D8D2C4]">
              <p className="text-xs text-gray-600 font-medium">
                No custom questions added yet. Use the field buttons below to add custom fields or pick a template.
              </p>
              <button
                type="button"
                className="org-btn org-btn-primary !bg-[#1A3A2A] !py-1.5 !px-3 text-xs mx-auto"
                onClick={() => addField('select')}
              >
                <Plus size={14} /> Add First Question
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {form.fields.map((field, idx) => {
                const typeMeta = FIELD_TYPES.find((t) => t.type === field.type) || FIELD_TYPES[0];
                const IconComponent = typeMeta.icon;
                const effectiveScope = field.scope || (/(team|project|idea|pitch|track|problem|abstract|theme|topic|synopsis|solution|startup|repo|repository|github|deck|presentation|slide|stack)/i.test(field.label || '') ? 'team' : 'member');
                const isTeamScope = effectiveScope === 'team';

                return (
                  <motion.div
                    key={field.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="org-question-card"
                  >
                    {/* Card Header: Index badge, Type picker, Actions */}
                    <div className="org-question-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="org-question-index-badge">Q{idx + 1}</span>
                        <select
                          className="org-question-type-select"
                          value={field.type}
                          onChange={(e) => {
                            const newType = e.target.value;
                            const defaultOpts = ['select', 'radio', 'checkbox'].includes(newType)
                              ? field.options?.length > 0 ? field.options : ['Option 1', 'Option 2']
                              : [];
                            updateField(idx, { type: newType, options: defaultOpts });
                          }}
                          aria-label="Select Question Type"
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t.type} value={t.type}>{t.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                        <button
                          type="button"
                          className="org-question-action-btn"
                          disabled={idx === 0}
                          onClick={() => moveField(idx, -1)}
                          title="Move question up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          className="org-question-action-btn"
                          disabled={idx === form.fields.length - 1}
                          onClick={() => moveField(idx, 1)}
                          title="Move question down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          className="org-question-action-btn"
                          onClick={() => duplicateField(idx)}
                          title="Duplicate question"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          className="org-question-action-btn org-question-action-btn--danger"
                          onClick={() => removeField(idx)}
                          title="Delete question"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="org-question-card-body">
                      {/* Question Label & Required Toggle */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div>
                          <label className="org-field-label">Question Text / Label</label>
                          <input
                            type="text"
                            className="org-inline-input text-xs font-semibold"
                            value={field.label}
                            onChange={(e) => updateField(idx, { label: e.target.value })}
                            placeholder="e.g. Choose your challenge track or GitHub link..."
                          />
                        </div>
                        <label className="org-required-toggle" style={{ marginTop: '1.375rem', flexShrink: 0 }}>
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(idx, { required: e.target.checked })}
                            style={{ accentColor: '#991B1B', width: '0.75rem', height: '0.75rem' }}
                          />
                          <span>Required *</span>
                        </label>
                      </div>

                      {/* Placeholder & Helper Text */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label className="org-field-label">Input Placeholder</label>
                          <input
                            type="text"
                            className="org-inline-input text-xs"
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                            placeholder="e.g. Select from menu or type here..."
                          />
                        </div>
                        <div>
                          <label className="org-field-label">Helper Guidance Note</label>
                          <input
                            type="text"
                            className="org-inline-input text-xs"
                            value={field.helpText || ''}
                            onChange={(e) => updateField(idx, { helpText: e.target.value })}
                            placeholder="e.g. Optional instructions for applicant..."
                          />
                        </div>
                      </div>

                      {/* Team Event Question Scope (Common for Team vs Each Member) */}
                      {isTeamEvent ? (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #D8D2C4' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <label className="org-field-label" style={{ margin: 0, fontWeight: 700, color: '#0F172A' }}>
                              Who Answers This Question? <span style={{ color: '#991B1B' }}>*</span>
                            </label>
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                              {isTeamScope ? '👑 Team-Level Question' : '👤 Member-Level Question'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            <button
                              type="button"
                              className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                                isTeamScope
                                  ? 'bg-[#1A3A2A]/5 border-[#1A3A2A] ring-2 ring-[#1A3A2A]/20 shadow-xs'
                                  : 'bg-white border-[#D8D2C4] hover:border-gray-400 text-gray-600'
                              }`}
                              onClick={() => updateField(idx, { scope: 'team' })}
                            >
                              <span className="text-base leading-none mt-0.5">👑</span>
                              <div>
                                <div className={`text-xs font-bold font-['Space_Grotesk'] ${isTeamScope ? 'text-[#1A3A2A]' : 'text-gray-800'}`}>
                                  Common for Whole Team
                                </div>
                                <div className="text-[11px] text-gray-500 leading-tight mt-0.5">
                                  Answered once by Team Leader (e.g. project idea, track, repo).
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                                !isTeamScope
                                  ? 'bg-[#991B1B]/5 border-[#991B1B] ring-2 ring-[#991B1B]/20 shadow-xs'
                                  : 'bg-white border-[#D8D2C4] hover:border-gray-400 text-gray-600'
                              }`}
                              onClick={() => updateField(idx, { scope: 'member' })}
                            >
                              <span className="text-base leading-none mt-0.5">👤</span>
                              <div>
                                <div className={`text-xs font-bold font-['Space_Grotesk'] ${!isTeamScope ? 'text-[#991B1B]' : 'text-gray-800'}`}>
                                  Each Member Individually
                                </div>
                                <div className="text-[11px] text-gray-500 leading-tight mt-0.5">
                                  Answered per participant tab (e.g. T-shirt size, dietary).
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #E5DFD3' }} className="flex items-center justify-between text-[11px] font-mono text-gray-500">
                          <span>Solo Event · Answered once by registering student</span>
                          <span className="text-gray-400 text-[10px]">Enable "Allow Team Submissions" in sidebar to split scopes</span>
                        </div>
                      )}

                      {/* Options Editor for Select / Radio / Checkbox */}
                      {['select', 'radio', 'checkbox'].includes(field.type) && (
                        <div className="org-options-list-wrap">
                          <div className="org-options-list-header">
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>
                              Options ({field.options?.length || 0})
                            </span>
                            <button
                              type="button"
                              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#991B1B', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => addOptionToField(idx)}
                            >
                              <Plus size={12} /> Add Choice
                            </button>
                          </div>

                          <div>
                            {(field.options || []).map((opt, optIdx) => (
                              <div key={optIdx} className="org-option-row">
                                {field.type === 'radio' ? (
                                  <span className="org-option-bullet" />
                                ) : field.type === 'checkbox' ? (
                                  <span className="org-option-bullet org-option-bullet--checkbox" />
                                ) : (
                                  <span className="org-option-num">{optIdx + 1}.</span>
                                )}
                                <input
                                  type="text"
                                  className="org-inline-input text-xs"
                                  style={{ flex: 1, background: '#ffffff' }}
                                  value={opt}
                                  onChange={(e) => updateOptionInField(idx, optIdx, e.target.value)}
                                  placeholder={`Choice ${optIdx + 1}`}
                                />
                                <button
                                  type="button"
                                  className="org-question-action-btn org-question-action-btn--danger"
                                  disabled={field.options.length <= 1}
                                  onClick={() => removeOptionInField(idx, optIdx)}
                                  title="Delete choice"
                                  style={{ width: '1.5rem', height: '1.5rem' }}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Add Field Palette */}
          <div className="org-add-field-palette">
            <span className="org-add-field-palette-label">Add New Question Field</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.5rem' }}>
              {FIELD_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.type}
                    type="button"
                    className="org-field-type-btn"
                    onClick={() => addField(t.type)}
                  >
                    <Icon size={19} className="org-field-type-btn-icon" />
                    <span className="org-field-type-btn-label">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Column: Form Settings & Policies (4 cols) */}
      <div className="lg:col-span-4 space-y-4">
        {/* Event Context Card */}
        <div className="org-sidebar-section">
          <div className="org-sidebar-section-header">
            <div className="org-sidebar-section-icon" style={{ background: 'rgba(153, 27, 27, 0.08)', color: '#991B1B' }}>
              <Ticket size={13} />
            </div>
            Tied Event Context
          </div>
          <div className="org-sidebar-section-body">
            <div className="org-context-row">
              <div className="org-context-row-icon" style={{ background: 'rgba(153, 27, 27, 0.07)', color: '#991B1B' }}>
                <CalendarBlank size={12} />
              </div>
              <span>{eventDateLabel}</span>
            </div>
            <div className="org-context-row">
              <div className="org-context-row-icon" style={{ background: 'rgba(26, 58, 42, 0.07)', color: '#1A3A2A' }}>
                <MapPin size={12} />
              </div>
              <span>{event?.venue || 'TBA'}</span>
            </div>
            <div className="org-context-row">
              <div className="org-context-row-icon" style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6' }}>
                <UsersThree size={12} />
              </div>
              <span>{teamFormatLabel} &middot; Cap: {event?.capacity || 50} seats</span>
            </div>
          </div>
        </div>

        {/* Team Registration Rules */}
        <div className="org-sidebar-section">
          <div className="org-sidebar-section-header">
            <div className="org-sidebar-section-icon" style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6' }}>
              <UsersThree size={13} />
            </div>
            Team Registration
          </div>
          <div className="org-sidebar-section-body">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
              <input
                type="checkbox"
                checked={form.allowTeam}
                onChange={(e) => updateForm({ allowTeam: e.target.checked })}
                style={{ accentColor: '#991B1B', width: '0.875rem', height: '0.875rem' }}
              />
              <span>Allow Team Submissions</span>
            </label>

            {form.allowTeam && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Min Team Size</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="org-inline-input text-xs"
                    value={form.teamMin || 2}
                    onChange={(e) => updateForm({ teamMin: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Max Team Size</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="org-inline-input text-xs"
                    value={form.teamMax || 4}
                    onChange={(e) => updateForm({ teamMax: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Waiver & Terms Checkbox */}
        <div className="org-sidebar-section">
          <div className="org-sidebar-section-header">
            <div className="org-sidebar-section-icon" style={{ background: 'rgba(6, 95, 70, 0.08)', color: '#065F46' }}>
              <ShieldCheck size={13} />
            </div>
            Rules &amp; Waiver
          </div>
          <div className="org-sidebar-section-body">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
              <input
                type="checkbox"
                checked={form.requireWaiver}
                onChange={(e) => updateForm({ requireWaiver: e.target.checked })}
                style={{ accentColor: '#991B1B', width: '0.875rem', height: '0.875rem' }}
              />
              <span>Require Student Waiver Checkbox</span>
            </label>

            {form.requireWaiver && (
              <div>
                <label className="org-field-label">Waiver / Terms Statement</label>
                <textarea
                  className="org-inline-textarea text-xs"
                  rows={3}
                  value={form.waiverText}
                  onChange={(e) => updateForm({ waiverText: e.target.value })}
                  placeholder="Enter the agreement text..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Post-Registration Confirmation Note */}
        <div className="org-sidebar-section">
          <div className="org-sidebar-section-header">
            <div className="org-sidebar-section-icon" style={{ background: 'rgba(26, 58, 42, 0.08)', color: '#1A3A2A' }}>
              <CheckCircle size={13} />
            </div>
            Confirmation Note
          </div>
          <div className="org-sidebar-section-body">
            <label className="org-field-label">Success Dialog Message</label>
            <textarea
              className="org-inline-textarea text-xs"
              rows={3}
              value={form.settings?.confirmationMessage || ''}
              onChange={(e) =>
                updateForm({
                  settings: { ...form.settings, confirmationMessage: e.target.value },
                })
              }
              placeholder="e.g. Your seat is confirmed! Check-in pass generated."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

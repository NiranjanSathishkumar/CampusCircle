/**
 * Preview mode — the form as an applicant sees it.
 */
import { motion } from 'motion/react';
import { CheckCircle, Plus, QrCode, ShieldCheck, Sparkle, Ticket, UsersThree, X } from '@phosphor-icons/react';

export default function FormBuilderPreview({
  communityName,
  event,
  form,
  handlePreviewSubmit,
  previewErrors,
  previewSubmitted,
  previewTeamMembers,
  previewValues,
  previewWaiverChecked,
  setPreviewErrors,
  setPreviewSubmitted,
  setPreviewTeamMembers,
  setPreviewValues,
  setPreviewWaiverChecked,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Main Left: Student Preview Canvas (8 cols) */}
      <div className="lg:col-span-8">
        <div className="bg-[#FAF8F5] border-2 border-[#991B1B]/40 rounded-2xl p-6 shadow-md space-y-5">
          {/* Preview Banner */}
          <div className="flex items-center justify-between bg-amber-50 border border-amber-300 rounded-xl p-3 px-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <Sparkle size={15} className="text-amber-600 flex-shrink-0" />
              <span>
                <strong>Student Form Simulator:</strong> Test required validations and fill responses as a student.
              </span>
            </div>
            <button
              type="button"
              className="text-xs text-amber-900 font-bold underline hover:text-amber-950"
              onClick={() => {
                setPreviewValues({});
                setPreviewWaiverChecked(false);
                setPreviewSubmitted(false);
                setPreviewErrors({});
              }}
            >
              Clear Responses
            </button>
          </div>

          {previewSubmitted ? (
            /* Success Simulation State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-2 border-emerald-600 rounded-2xl p-8 text-center space-y-4 shadow-sm"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle size={32} weight="fill" />
              </div>
              <h3 className="font-['Space_Grotesk'] font-bold text-xl text-[#0F172A]">
                Registration Successfully Confirmed!
              </h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                {form.settings?.confirmationMessage || 'Your seat has been reserved! Ticket QR pass issued.'}
              </p>

              <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl p-4 max-w-sm mx-auto flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">Verified Pass Code</span>
                  <span className="font-mono text-sm font-bold text-[#991B1B]">CC-PREVIEW-PASS</span>
                </div>
                <div className="w-10 h-10 bg-white border border-[#D8D2C4] rounded flex items-center justify-center">
                  <QrCode size={24} className="text-[#1A3A2A]" />
                </div>
              </div>

              <button
                type="button"
                className="org-btn org-btn-secondary !py-1.5 !px-4 text-xs font-semibold mx-auto"
                onClick={() => setPreviewSubmitted(false)}
              >
                Test Another Submission
              </button>
            </motion.div>
          ) : (
            /* Interactive Student Form Simulator */
            <form onSubmit={handlePreviewSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-[#D8D2C4] shadow-sm">
              {/* Form Title & Event Context */}
              <div className="border-b border-[#D8D2C4] pb-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="org-badge !bg-[#1A3A2A] !text-white text-[10px]">
                    {communityName}
                  </span>
                  <span className="org-badge text-[10px]">{event?.category || 'Workshop'}</span>
                </div>
                <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#0F172A]">
                  {form.title}
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed font-['Plus_Jakarta_Sans']">
                  {form.description}
                </p>
              </div>

              {/* Auto-filled Student Profile Card */}
              <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck size={14} /> Logged-In SIES GST Student Account
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                  <div>Name: <strong className="text-gray-900">Aarav Sharma</strong></div>
                  <div>Roll No: <strong className="text-gray-900 font-mono">121A1042</strong></div>
                  <div>Branch &amp; Year: <strong className="text-gray-900">Computer Engg · TE</strong></div>
                  <div>Email: <strong className="text-gray-900 font-mono">aarav.sharma@siesgst.ac.in</strong></div>
                </div>
              </div>

              {/* Team Members Inputs if Team Event */}
              {form.allowTeam && (
                <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5 font-['Space_Grotesk']">
                      <UsersThree size={16} /> Team Members (Team of {form.teamMin}–{form.teamMax})
                    </label>
                    <span className="text-[10px] font-mono text-blue-700">Excluding team lead</span>
                  </div>
                  <div className="space-y-2">
                    {previewTeamMembers.map((member, mIdx) => (
                      <div key={mIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          className="org-inline-input text-xs bg-white flex-1"
                          placeholder={`Teammate ${mIdx + 1} Full Name & Roll No`}
                          value={member}
                          onChange={(e) => {
                            const next = [...previewTeamMembers];
                            next[mIdx] = e.target.value;
                            setPreviewTeamMembers(next);
                          }}
                        />
                        {previewTeamMembers.length > 1 && (
                          <button
                            type="button"
                            className="text-gray-400 hover:text-red-700 p-1"
                            onClick={() => setPreviewTeamMembers(previewTeamMembers.filter((_, i) => i !== mIdx))}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {previewTeamMembers.length < (form.teamMax ? form.teamMax - 1 : 3) && (
                    <button
                      type="button"
                      className="text-xs font-semibold text-blue-800 hover:underline flex items-center gap-1"
                      onClick={() => setPreviewTeamMembers([...previewTeamMembers, ''])}
                    >
                      <Plus size={12} /> Add Teammate
                    </button>
                  )}
                </div>
              )}

              {/* Custom Form Questions */}
              <div className="space-y-4 pt-2">
                {form.fields.map((field, idx) => {
                  const val = previewValues[field.id] || '';
                  const error = previewErrors[field.id];

                  return (
                    <div key={field.id} className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-800 font-['Space_Grotesk']">
                        {field.label}
                        {field.required && <span className="text-[#991B1B] ml-1">*</span>}
                      </label>

                      {field.helpText && (
                        <p className="text-[11px] text-gray-500 font-['Plus_Jakarta_Sans']">{field.helpText}</p>
                      )}

                      {/* Field Input Components */}
                      {field.type === 'text' && (
                        <input
                          type="text"
                          className={`org-inline-input text-xs ${error ? '!border-red-500' : ''}`}
                          placeholder={field.placeholder}
                          value={val}
                          onChange={(e) => setPreviewValues({ ...previewValues, [field.id]: e.target.value })}
                        />
                      )}

                      {field.type === 'url' && (
                        <input
                          type="url"
                          className={`org-inline-input text-xs font-mono ${error ? '!border-red-500' : ''}`}
                          placeholder={field.placeholder || 'https://...'}
                          value={val}
                          onChange={(e) => setPreviewValues({ ...previewValues, [field.id]: e.target.value })}
                        />
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          className={`org-inline-textarea text-xs ${error ? '!border-red-500' : ''}`}
                          rows={3}
                          placeholder={field.placeholder}
                          value={val}
                          onChange={(e) => setPreviewValues({ ...previewValues, [field.id]: e.target.value })}
                        />
                      )}

                      {field.type === 'select' && (
                        <select
                          className={`org-inline-select text-xs w-full ${error ? '!border-red-500' : ''}`}
                          value={val}
                          onChange={(e) => setPreviewValues({ ...previewValues, [field.id]: e.target.value })}
                        >
                          <option value="">-- Choose an option --</option>
                          {(field.options || []).map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === 'radio' && (
                        <div className="space-y-1.5 pt-1">
                          {(field.options || []).map((opt, oIdx) => (
                            <label key={oIdx} className="flex items-center gap-2 cursor-pointer text-xs text-gray-800">
                              <input
                                type="radio"
                                name={`preview_${field.id}`}
                                value={opt}
                                checked={val === opt}
                                onChange={(e) => setPreviewValues({ ...previewValues, [field.id]: e.target.value })}
                                className="text-[#991B1B] focus:ring-[#991B1B]"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {field.type === 'checkbox' && (
                        <div className="space-y-1.5 pt-1">
                          {(field.options || []).map((opt, oIdx) => {
                            const currentArr = Array.isArray(val) ? val : [];
                            const isChecked = currentArr.includes(opt);
                            return (
                              <label key={oIdx} className="flex items-center gap-2 cursor-pointer text-xs text-gray-800">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const nextArr = e.target.checked
                                      ? [...currentArr, opt]
                                      : currentArr.filter((item) => item !== opt);
                                    setPreviewValues({ ...previewValues, [field.id]: nextArr });
                                  }}
                                  className="rounded text-[#991B1B] focus:ring-[#991B1B]"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {error && <p className="text-[11px] font-mono text-red-600">{error}</p>}
                    </div>
                  );
                })}
              </div>

              {/* Waiver Checkbox */}
              {form.requireWaiver && (
                <div className="pt-2 border-t border-[#D8D2C4] space-y-1">
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-800 font-['Plus_Jakarta_Sans']">
                    <input
                      type="checkbox"
                      checked={previewWaiverChecked}
                      onChange={(e) => setPreviewWaiverChecked(e.target.checked)}
                      className="mt-0.5 rounded text-[#991B1B] focus:ring-[#991B1B]"
                    />
                    <span className="leading-relaxed">
                      {form.waiverText || 'I agree to the guidelines and rules for this event.'}
                    </span>
                  </label>
                  {previewErrors.waiver && (
                    <p className="text-[11px] font-mono text-red-600 pl-5">{previewErrors.waiver}</p>
                  )}
                </div>
              )}

              {/* Simulator Submit Button */}
              <div className="pt-3 border-t border-[#D8D2C4] flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] font-mono text-gray-500">
                  Entry Fee: <strong>{event?.payment === 'Free' ? 'Free RSVP' : `₹${event?.priceAmount}`}</strong>
                </span>
                <button
                  type="submit"
                  className="org-btn org-btn-primary !bg-[#1A3A2A] !py-2 !px-5 text-xs font-bold"
                >
                  <Ticket size={15} /> Confirm &amp; Submit Registration
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Sidebar Column: Form Health & Readiness (4 cols) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="org-card p-4 space-y-3 border-2 border-[#D8D2C4]">
          <h4 className="font-['Space_Grotesk'] font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle size={15} className="text-emerald-700" /> Form Readiness Checklist
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">Event Association:</span>
              <span className="font-semibold text-emerald-800">✓ Tied to {event?.title}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">Publication Status:</span>
              <span className={`font-mono font-bold ${form.status === 'published' ? 'text-emerald-800' : 'text-amber-800'}`}>
                {form.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">Custom Questions:</span>
              <span className="font-mono font-bold text-gray-800">{form.fields.length} configured</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">Required Questions:</span>
              <span className="font-mono font-bold text-[#991B1B]">
                {form.fields.filter((f) => f.required).length} required
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">Student Profile Sync:</span>
              <span className="font-semibold text-emerald-800">✓ Auto-captures 5 fields</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-600">Instant QR Pass:</span>
              <span className="font-semibold text-emerald-800">✓ Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

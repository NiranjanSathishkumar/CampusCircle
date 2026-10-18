/**
 * Wizard step 5 — registration questions and FAQs.
 */
import { motion } from 'motion/react';
import { ArrowLeft, Plus, RocketLaunch, ShieldCheck, Trash, CaretRight, Eye } from '@phosphor-icons/react';

export default function QuestionsStep({
  teamFormat,
  customQuestions,
  handleAddOption,
  handleAddQuestion,
  handleRemoveOption,
  handleRemoveQuestion,
  handleSaveEvent,
  handleUpdateOption,
  handleUpdateQuestion,
  isPublishing,
  requireWaiver,
  setActiveStep,
  setRequireWaiver,
  setWaiverText,
  title,
  waiverText,
}) {
  return (
    <motion.div
      key="step-questions"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#D8D2C4] rounded-xl p-5 shadow-sm space-y-5"
    >
      <div className="border-b border-[#E6E1D5] pb-3">
        <h2 className="text-base font-bold font-['Space_Grotesk'] text-[#0F172A]">
          Custom RSVP Registration Form
        </h2>
        <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] mt-0.5">
          Collect tailored student details like track preferences, repository links, dietary meals, and t-shirt sizes.
        </p>
      </div>

      {/* Automatic Profile Info Notice */}
      <div className="p-3.5 bg-[#FAF8F5] border border-[#D8D2C4] rounded-lg flex items-start gap-3">
        <ShieldCheck size={20} className="text-[#1A3A2A] flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold text-[#0F172A] block font-['Space_Grotesk']">
            Automatic Verified Student Profile Capture
          </span>
          <p className="text-[11px] text-gray-600 font-['Plus_Jakarta_Sans'] mt-0.5">
            Full Name, Roll Number, Branch (e.g. IT / Comp), Academic Year (FE–BE), and verified SIES GST College Email are captured automatically from the student session.
          </p>
        </div>
      </div>

      {/* Dynamic Questions Builder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0F172A] font-['Space_Grotesk'] uppercase tracking-wider block">
            Custom Event-Specific Questions ({customQuestions.length})
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="org-btn org-btn-ghost text-xs !py-1 !px-2 text-[#991B1B]"
              onClick={() => handleAddQuestion('text')}
            >
              <Plus size={12} /> Text
            </button>
            <button
              type="button"
              className="org-btn org-btn-ghost text-xs !py-1 !px-2 text-[#991B1B]"
              onClick={() => handleAddQuestion('select')}
            >
              <Plus size={12} /> Dropdown
            </button>
            <button
              type="button"
              className="org-btn org-btn-ghost text-xs !py-1 !px-2 text-[#991B1B]"
              onClick={() => handleAddQuestion('radio')}
            >
              <Plus size={12} /> Radio
            </button>
            <button
              type="button"
              className="org-btn org-btn-ghost text-xs !py-1 !px-2 text-[#991B1B]"
              onClick={() => handleAddQuestion('url')}
            >
              <Plus size={12} /> URL
            </button>
          </div>
        </div>

        {customQuestions.length === 0 ? (
          <p className="text-xs text-gray-500 italic bg-[#FAF8F5] p-3 rounded border border-[#D8D2C4] text-center">
            No custom questions added yet. Click one of the buttons above to ask attendees specific questions.
          </p>
        ) : (
          <div className="space-y-3">
            {customQuestions.map((q, qIndex) => (
              <div
                key={q.id || qIndex}
                className="p-3.5 bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl space-y-2.5 relative"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#D8D2C4] text-gray-700 uppercase">
                      {q.type}
                    </span>
                    <input
                      type="text"
                      className="org-form-input text-xs font-bold flex-1"
                      value={q.label}
                      onChange={(e) => handleUpdateQuestion(qIndex, 'label', e.target.value)}
                      placeholder="Question prompt (e.g. GitHub Profile Link)"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[11px] font-mono text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => handleUpdateQuestion(qIndex, 'required', e.target.checked)}
                        className="rounded border-[#D8D2C4] text-[#991B1B]"
                      />
                      <span>Required</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Delete question"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>

                {/* Team Event Question Scope (Common for Team vs Each Member) */}
                {teamFormat === 'Team' && (() => {
                  const isTeamScope = q.scope === 'team' || (!q.scope && /(team|project|idea|pitch|track|problem|abstract|theme|topic|synopsis|solution|startup|repo|repository|github|deck|presentation|slide|stack)/i.test(q.label || ''));
                  return (
                    <div className="pt-2 border-t border-[#E6E1D5] space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <label className="text-[11px] font-mono font-bold text-gray-700">
                          Who Answers This Question? <span className="text-[#991B1B]">*</span>
                        </label>
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white text-gray-700 border border-[#D8D2C4]">
                          {isTeamScope ? '👑 Team-Level Question' : '👤 Member-Level Question'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          className={`p-2 rounded-lg border text-left transition-all flex items-start gap-2 cursor-pointer ${
                            isTeamScope
                              ? 'bg-[#1A3A2A]/5 border-[#1A3A2A] ring-2 ring-[#1A3A2A]/20 shadow-xs'
                              : 'bg-white border-[#D8D2C4] hover:border-gray-400 text-gray-600'
                          }`}
                          onClick={() => handleUpdateQuestion(qIndex, 'scope', 'team')}
                        >
                          <span className="text-sm mt-0.5">👑</span>
                          <div>
                            <div className={`text-xs font-bold font-['Space_Grotesk'] ${isTeamScope ? 'text-[#1A3A2A]' : 'text-gray-800'}`}>
                              Common for Whole Team
                            </div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                              Answered once by Team Leader (e.g. project idea, track, repo).
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          className={`p-2 rounded-lg border text-left transition-all flex items-start gap-2 cursor-pointer ${
                            !isTeamScope
                              ? 'bg-[#991B1B]/5 border-[#991B1B] ring-2 ring-[#991B1B]/20 shadow-xs'
                              : 'bg-white border-[#D8D2C4] hover:border-gray-400 text-gray-600'
                          }`}
                          onClick={() => handleUpdateQuestion(qIndex, 'scope', 'member')}
                        >
                          <span className="text-sm mt-0.5">👤</span>
                          <div>
                            <div className={`text-xs font-bold font-['Space_Grotesk'] ${!isTeamScope ? 'text-[#991B1B]' : 'text-gray-800'}`}>
                              Each Member Individually
                            </div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                              Answered per participant tab (e.g. T-shirt size, dietary).
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Options editor for Select, Radio, Checkbox */}
                {(q.type === 'select' || q.type === 'radio' || q.type === 'checkbox') && (
                  <div className="pt-2 border-t border-[#E6E1D5] space-y-2">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
                      Choice Options
                    </span>
                    <div className="space-y-1.5">
                      {(q.options || []).map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-mono">#{optIndex + 1}</span>
                          <input
                            type="text"
                            className="org-form-input text-xs flex-1 !py-1"
                            value={opt}
                            onChange={(e) => handleUpdateOption(qIndex, optIndex, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIndex, optIndex)}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="text-[11px] font-mono text-[#991B1B] hover:underline font-bold flex items-center gap-1 mt-1"
                        onClick={() => handleAddOption(qIndex)}
                      >
                        <Plus size={11} /> Add Option Choice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student ID & Code of Conduct Waiver */}
      <div className="pt-3 border-t border-[#E6E1D5] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0F172A] font-['Space_Grotesk'] uppercase tracking-wider">
            Student ID &amp; Conduct Entry Waiver
          </span>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={requireWaiver}
              onChange={(e) => setRequireWaiver(e.target.checked)}
              className="rounded border-[#D8D2C4] text-[#991B1B]"
            />
            <span>Require explicit agreement</span>
          </label>
        </div>
        {requireWaiver && (
          <textarea
            rows={2}
            className="org-form-textarea text-xs"
            value={waiverText}
            onChange={(e) => setWaiverText(e.target.value)}
          />
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#E6E1D5]">
        <button
          type="button"
          className="org-btn org-btn-ghost text-xs"
          onClick={() => setActiveStep('agenda')}
        >
          <ArrowLeft size={13} />
          <span>Back to Agenda</span>
        </button>
        <button
          type="button"
          className="org-btn org-btn-primary text-xs"
          onClick={() => setActiveStep('preview')}
        >
          <Eye size={14} />
          <span>Next: Preview &amp; Launch</span>
          <CaretRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}

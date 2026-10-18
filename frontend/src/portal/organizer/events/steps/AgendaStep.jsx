/**
 * Wizard step 4 — session agenda and speakers.
 */
import { motion } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowUp, CaretRight, Check, Plus, Trash } from '@phosphor-icons/react';

export default function AgendaStep({
  agenda,
  contact,
  faqs,
  handleAddAgendaItem,
  handleAddFaq,
  handleAddRule,
  handleMoveAgenda,
  handleRemoveAgenda,
  handleRemoveFaq,
  handleRemoveRule,
  handleUpdateAgenda,
  handleUpdateFaq,
  newRuleInput,
  rules,
  setActiveStep,
  setContact,
  setNewRuleInput,
  title,
}) {
  return (
    <motion.div
      key="step-agenda"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#D8D2C4] rounded-xl p-5 shadow-sm space-y-5"
    >
      <div className="border-b border-[#E6E1D5] pb-3">
        <h2 className="text-base font-bold font-['Space_Grotesk'] text-[#0F172A]">
          Agenda Timeline, Rules &amp; Helpdesk
        </h2>
        <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] mt-0.5">
          Build the event schedule timeline checkpoints, campus guidelines, and coordinator support desk info.
        </p>
      </div>

      {/* Interactive Agenda Timeline Builder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#0F172A] font-['Space_Grotesk'] uppercase tracking-wider block">
              Agenda Schedule Timeline
            </span>
            <span className="text-[11px] text-gray-500 font-mono">
              Sequential event phases displayed on the student listing
            </span>
          </div>
          <button
            type="button"
            className="org-btn org-btn-ghost text-xs !py-1 !px-2.5 text-[#991B1B]"
            onClick={handleAddAgendaItem}
          >
            <Plus size={13} /> Add Phase
          </button>
        </div>

        <div className="space-y-2.5">
          {agenda.map((ag, i) => (
            <div
              key={i}
              className="p-3 bg-[#FAF8F5] border border-[#D8D2C4] rounded-lg space-y-2 relative group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-5 h-5 rounded-full bg-[#1A3A2A] text-white text-[10px] font-mono flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    className="org-form-input text-xs font-mono !py-1 !px-2 font-bold flex-1"
                    value={ag.phase}
                    onChange={(e) => handleUpdateAgenda(i, 'phase', e.target.value)}
                    placeholder="e.g. 09:30 AM — Phase 1"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveAgenda(i, 'up')}
                    disabled={i === 0}
                    className="text-gray-400 hover:text-gray-800 disabled:opacity-30 p-1"
                    title="Move up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveAgenda(i, 'down')}
                    disabled={i === agenda.length - 1}
                    className="text-gray-400 hover:text-gray-800 disabled:opacity-30 p-1"
                    title="Move down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAgenda(i)}
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Delete phase"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>

              <input
                type="text"
                className="org-form-input text-xs font-bold font-['Space_Grotesk']"
                value={ag.title}
                onChange={(e) => handleUpdateAgenda(i, 'title', e.target.value)}
                placeholder="Phase Title (e.g. Guided Live Coding Session)"
              />

              <textarea
                rows={2}
                className="org-form-textarea text-xs"
                value={ag.desc}
                onChange={(e) => handleUpdateAgenda(i, 'desc', e.target.value)}
                placeholder="Brief description of activities during this phase..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* Campus Entry Rules */}
      <div className="space-y-3 pt-3 border-t border-[#E6E1D5]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#0F172A] font-['Space_Grotesk'] uppercase tracking-wider block">
              Campus Entry Guidelines &amp; Rules
            </span>
            <span className="text-[11px] text-gray-500 font-mono">
              Prerequisites and conduct expectations
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          {rules.map((r, i) => (
            <div key={i} className="flex items-center gap-2 bg-[#FAF8F5] p-2 rounded border border-[#D8D2C4]">
              <Check size={14} className="text-[#1A3A2A] flex-shrink-0" />
              <span className="text-xs text-gray-800 flex-1">{r}</span>
              <button
                type="button"
                onClick={() => handleRemoveRule(i)}
                className="text-gray-400 hover:text-red-600 p-1"
              >
                <Trash size={13} />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              className="org-form-input text-xs flex-1"
              placeholder="Add a new guideline (e.g. Bring personal extension cord)..."
              value={newRuleInput}
              onChange={(e) => setNewRuleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRule();
                }
              }}
            />
            <button type="button" className="org-btn org-btn-ghost text-xs" onClick={handleAddRule}>
              <Plus size={13} /> Add Rule
            </button>
          </div>
        </div>
      </div>

      {/* Organizer Support Contact */}
      <div className="space-y-3 pt-3 border-t border-[#E6E1D5]">
        <span className="text-xs font-bold text-[#0F172A] font-['Space_Grotesk'] uppercase tracking-wider block">
          Coordinator Contact Card
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Lead Coordinator</label>
            <input
              type="text"
              className="org-form-input text-xs"
              value={contact.leadName}
              onChange={(e) => setContact({ ...contact, leadName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Role / Position</label>
            <input
              type="text"
              className="org-form-input text-xs"
              value={contact.leadRole}
              onChange={(e) => setContact({ ...contact, leadRole: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Support Email</label>
            <input
              type="email"
              className="org-form-input text-xs font-mono"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Helpdesk Location</label>
            <input
              type="text"
              className="org-form-input text-xs"
              value={contact.deskLocation}
              onChange={(e) => setContact({ ...contact, deskLocation: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Support Phone</label>
            <input
              type="text"
              className="org-form-input text-xs font-mono"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Building</label>
            <input
              type="text"
              className="org-form-input text-xs"
              value={contact.building}
              onChange={(e) => setContact({ ...contact, building: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Room</label>
              <input
                type="text"
                className="org-form-input text-xs"
                value={contact.room}
                onChange={(e) => setContact({ ...contact, room: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Floor</label>
              <input
                type="text"
                className="org-form-input text-xs"
                value={contact.floor}
                onChange={(e) => setContact({ ...contact, floor: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Email Response Time</label>
            <input
              type="text"
              className="org-form-input text-xs"
              placeholder="e.g. Replies within 2 hours"
              value={contact.emailSLA}
              onChange={(e) => setContact({ ...contact, emailSLA: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Operating Hours</label>
            <input
              type="text"
              className="org-form-input text-xs"
              placeholder="e.g. 10 AM – 5 PM"
              value={contact.operatingHours}
              onChange={(e) => setContact({ ...contact, operatingHours: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-3 pt-3 border-t border-[#E6E1D5]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#0F172A] font-['Space_Grotesk'] uppercase tracking-wider block">
              Frequently Asked Questions
            </span>
            <span className="text-[11px] text-gray-500 font-mono">
              Shown to students on the event listing
            </span>
          </div>
          <button
            type="button"
            className="org-btn org-btn-ghost text-xs !py-1 !px-2.5 text-[#991B1B]"
            onClick={handleAddFaq}
          >
            <Plus size={13} /> Add FAQ
          </button>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => (
            <div key={i} className="p-3 bg-[#FAF8F5] border border-[#D8D2C4] rounded-lg space-y-2 relative">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="org-form-input text-xs font-bold flex-1"
                  value={faq.q}
                  onChange={(e) => handleUpdateFaq(i, 'q', e.target.value)}
                  placeholder="Question"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(i)}
                  className="text-gray-400 hover:text-red-600 p-1"
                  title="Delete FAQ"
                >
                  <Trash size={14} />
                </button>
              </div>
              <textarea
                rows={2}
                className="org-form-textarea text-xs"
                value={faq.a}
                onChange={(e) => handleUpdateFaq(i, 'a', e.target.value)}
                placeholder="Answer"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#E6E1D5]">
        <button
          type="button"
          className="org-btn org-btn-ghost text-xs"
          onClick={() => setActiveStep('capacity')}
        >
          <ArrowLeft size={13} />
          <span>Back to Tickets</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="org-btn org-btn-ghost text-xs text-gray-500 hover:text-gray-900"
            onClick={() => setActiveStep('preview')}
          >
            <span className="font-mono">⚡ Quick Preview</span>
          </button>
          <button
            type="button"
            className="org-btn org-btn-primary text-xs"
            onClick={() => setActiveStep('questions')}
          >
            <span>Next: RSVP Form</span>
            <CaretRight size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

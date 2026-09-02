import { useState } from 'react';
import { Trash } from '@phosphor-icons/react';

/* ── FAQ Accordion Item Component ── */
export default function OrganizerFaqAccordionItem({ faq, index, isEditing, onChangeQuestion, onChangeAnswer, onDelete }) {
  const [open, setOpen] = useState(false);

  if (isEditing) {
    return (
      <div className="bg-white p-3 rounded-xl border-2 border-[#991B1B] shadow-sm mb-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-[#991B1B] font-bold">FAQ #{index + 1}</span>
          <button
            type="button"
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete FAQ Item"
          >
            <Trash size={14} />
          </button>
        </div>
        <div>
          <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Question</label>
          <input
            type="text"
            className="org-inline-input text-xs"
            value={faq.q}
            onChange={(e) => onChangeQuestion(e.target.value)}
            placeholder="e.g. Who can participate in this event?"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-gray-500 block mb-0.5">Answer</label>
          <textarea
            className="org-inline-textarea text-xs"
            rows={2}
            value={faq.a}
            onChange={(e) => onChangeAnswer(e.target.value)}
            placeholder="e.g. Open to all SIES GST undergraduate students..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`events-faq-card ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="events-faq-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <span className="events-faq-question-text">{faq.q}</span>
        <span className="events-faq-chevron font-mono font-bold text-base text-[#991B1B]">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div
          id={`faq-answer-${index}`}
          role="region"
          aria-labelledby={`faq-question-${index}`}
          className="events-faq-answer-wrap open"
        >
          <div className="events-faq-answer-inner">
            <p className="events-faq-answer-text">{faq.a}</p>
          </div>
        </div>
      )}
    </div>
  );
}

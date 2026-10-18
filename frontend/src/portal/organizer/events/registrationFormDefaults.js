/**
 * Default form shape and the palette of field types.
 */
import { CheckSquare, Link as LinkIcon, ListBullets, RadioButton, TextAlignLeft, TextT } from '@phosphor-icons/react';

/* ── Builds the form-builder's local state from a real Event doc ──
   No separate "form" document exists server-side — formQuestions, the
   waiver, and the confirmation message all live directly on Event, so this
   is a straight field-by-field read, not a template. */
export const createDefaultForm = (event) => ({
  title: event ? `${event.title} — Registration Form` : 'Event Registration Form',
  description: event
    ? `Please complete the following details to register for ${event.title}.`
    : 'Please complete this registration form to secure your entry pass.',
  allowTeam: Boolean(event?.registrationType === 'team' || event?.teamFormat === 'Team' || (event?.teamSize?.max && event?.teamSize?.max > 1)),
  teamMin: event?.teamSize?.min || 2,
  teamMax: event?.teamSize?.max || 4,
  requireWaiver: Boolean(event?.requireWaiver),
  waiverText: event?.waiverText || '',
  fields: (event?.formQuestions || []).map((q) => ({
    id: q._id || `q_${Math.random().toString(36).substr(2, 6)}`,
    type: q.type,
    label: q.label,
    placeholder: q.placeholder || '',
    helpText: q.helpText || '',
    required: Boolean(q.required),
    scope: q.scope || (/(team|project|idea|pitch|track|problem|abstract|theme|topic|synopsis|solution|startup|repo|repository|github|deck|presentation|slide|stack)/i.test(q.label || '') ? 'team' : 'member'),
    options: q.options || [],
  })),
  settings: {
    confirmationMessage: event?.confirmationMessage || '',
  },
});

/* ── Field Type Metadata ── */
export const FIELD_TYPES = [
  { type: 'text', label: 'Short Text', icon: TextT, desc: 'Single line answer (e.g. GitHub handle)' },
  { type: 'textarea', label: 'Paragraph', icon: TextAlignLeft, desc: 'Multi-line response (e.g. pitch, questions)' },
  { type: 'select', label: 'Dropdown Menu', icon: ListBullets, desc: 'Single choice from a dropdown list' },
  { type: 'radio', label: 'Single Choice', icon: RadioButton, desc: 'Radio buttons for mutually exclusive options' },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare, desc: 'Multi-select checkboxes' },
  { type: 'url', label: 'URL / Link', icon: LinkIcon, desc: 'Validated web URL (e.g. repo, portfolio)' },
];

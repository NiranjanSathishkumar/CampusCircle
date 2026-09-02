/**
 * EventFormQuestionsFieldset.jsx
 * Renders an event's custom registration formQuestions (backend FormQuestion.schema.js)
 * as controlled inputs with modern cards, icons, active highlights, and live validation.
 */
import { useState } from 'react';
import {
  CheckSquare,
  Link as LinkIcon,
  ListBullets,
  RadioButton,
  TextAlignLeft,
  TextT,
  Image as ImageIcon,
  Hash as HashIcon,
  Warning,
  Check,
} from '@phosphor-icons/react';

const TYPE_ICONS = {
  text: TextT,
  textarea: TextAlignLeft,
  number: HashIcon,
  url: LinkIcon,
  image: ImageIcon,
  select: ListBullets,
  radio: RadioButton,
  checkbox: CheckSquare,
};

export function isQuestionAnswered(question, value) {
  if (question.type === 'checkbox') return Array.isArray(value) && value.length > 0;
  if (question.type === 'number') return typeof value === 'number' && !Number.isNaN(value);
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateAnswers(formQuestions, answers) {
  if (!Array.isArray(formQuestions)) return true;
  for (const q of formQuestions) {
    if (q.required && !isQuestionAnswered(q, answers?.[q._id])) return false;
  }
  return true;
}

export function answersToPayload(formQuestions, answers) {
  if (!Array.isArray(formQuestions) || !answers) return [];
  return formQuestions
    .filter((q) => isQuestionAnswered(q, answers[q._id]))
    .map((q) => ({ question: q._id, value: answers[q._id] }));
}

export default function EventFormQuestionsFieldset({
  formQuestions,
  answers = {},
  onChange,
  showAllErrors = false,
  idPrefix = 'q',
  title = 'Registration Questions',
}) {
  const [touched, setTouched] = useState({});
  if (!formQuestions?.length) return null;

  const setValue = (questionId, value) => onChange({ ...answers, [questionId]: value });
  const markTouched = (questionId) => setTouched((t) => (t[questionId] ? t : { ...t, [questionId]: true }));

  return (
    <div className="events-form-section">
      <div className="events-form-section-header">
        <p className="events-form-section-title">
          {title}
          <span className="events-form-section-count">{formQuestions.length} Questions</span>
        </p>
      </div>

      {formQuestions.map((q) => {
        const Icon = TYPE_ICONS[q.type] || TextT;
        const inputId = `${idPrefix}-${q._id}`;
        const value = answers[q._id];
        const showError = q.required && !isQuestionAnswered(q, value) && (touched[q._id] || showAllErrors);
        const fieldClass = `events-form-input${showError ? ' has-error' : ''}`;

        return (
          <div key={q._id} className="events-form-field">
            <label htmlFor={inputId} className="events-form-label">
              <Icon size={14} className="events-form-label-icon" />
              <span>{q.label}</span>
              {q.required ? (
                <span className="events-form-required-badge">Required</span>
              ) : (
                <span style={{ fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 500 }}>(Optional)</span>
              )}
            </label>

            {q.helpText && <p className="events-form-help">{q.helpText}</p>}

            {q.type === 'textarea' ? (
              <textarea
                id={inputId}
                className={fieldClass}
                style={{ minHeight: 80, resize: 'vertical' }}
                placeholder={q.placeholder || 'Type your response here…'}
                value={value || ''}
                onChange={(e) => setValue(q._id, e.target.value)}
                onBlur={() => markTouched(q._id)}
                aria-invalid={showError}
              />
            ) : q.type === 'number' ? (
              <input
                id={inputId}
                type="number"
                className={fieldClass}
                placeholder={q.placeholder || 'Enter a number…'}
                value={value ?? ''}
                onChange={(e) => setValue(q._id, e.target.value === '' ? undefined : Number(e.target.value))}
                onBlur={() => markTouched(q._id)}
                aria-invalid={showError}
              />
            ) : q.type === 'select' ? (
              <div className="events-form-select-wrap">
                <select
                  id={inputId}
                  className={fieldClass}
                  value={value || ''}
                  onChange={(e) => {
                    setValue(q._id, e.target.value);
                    markTouched(q._id);
                  }}
                  onBlur={() => markTouched(q._id)}
                  aria-invalid={showError}
                >
                  <option value="">Choose an option…</option>
                  {(q.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ) : q.type === 'radio' ? (
              <div className="events-form-options" role="radiogroup" aria-labelledby={inputId}>
                {(q.options || []).map((opt) => {
                  const checked = value === opt;
                  return (
                    <label key={opt} className={`events-form-option-card${checked ? ' checked' : ''}`}>
                      <input
                        type="radio"
                        name={inputId}
                        checked={checked}
                        onChange={() => {
                          setValue(q._id, opt);
                          markTouched(q._id);
                        }}
                      />
                      <span className="events-form-option-radio-dot" aria-hidden="true" />
                      <span className="events-form-option-text">{opt}</span>
                    </label>
                  );
                })}
              </div>
            ) : q.type === 'checkbox' ? (
              <div className="events-form-options grid-2">
                {(q.options || []).map((opt) => {
                  const current = Array.isArray(value) ? value : [];
                  const checked = current.includes(opt);
                  return (
                    <label key={opt} className={`events-form-option-card${checked ? ' checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setValue(q._id, checked ? current.filter((v) => v !== opt) : [...current, opt]);
                          markTouched(q._id);
                        }}
                      />
                      <span className="events-form-option-check-box" aria-hidden="true">
                        {checked && <Check size={11} weight="bold" />}
                      </span>
                      <span className="events-form-option-text">{opt}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <input
                id={inputId}
                type={q.type === 'url' ? 'url' : 'text'}
                className={fieldClass}
                placeholder={q.placeholder || (q.type === 'url' ? 'https://…' : 'Type your answer…')}
                value={value || ''}
                onChange={(e) => setValue(q._id, e.target.value)}
                onBlur={() => markTouched(q._id)}
                aria-invalid={showError}
              />
            )}

            {showError && (
              <p className="events-form-error">
                <Warning size={13} weight="fill" />
                This field is required.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

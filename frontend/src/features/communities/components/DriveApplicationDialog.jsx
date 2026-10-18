/**
 * DriveApplicationDialog.jsx
 * Full questionnaire application flow for a recruitment drive that collects
 * custom formQuestions and/or a waiver acceptance — the counterpart to the
 * inline "Quick Apply" button CommunityDetailPanel uses for simple drives.
 * Reuses the events registration form-field styling (same editorial design
 * system, and Event/CommunityRecruitment share FormQuestion.schema.js) but
 * has its own dialog chrome — wider, and themed for recruitment rather than
 * ticketing.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Flame, PaperPlaneTilt, CircleNotch, ShieldCheck, Warning, Check, CheckCircle, X, Clock, ArrowRight } from '@phosphor-icons/react';
import { useAuth } from '@/shared/auth/AuthContext';
import EventFormQuestionsFieldset, {
  validateAnswers,
  answersToPayload,
} from '@/features/events/components/EventFormQuestionsFieldset';
import { submitDriveApplication } from '@/features/communities/communities.api';
import { ApiError } from '@/shared/api/httpClient';
import { getRoleTheme } from '@/portal/organizer/roster/rosterConstants';
import { findStandardRole } from '@/portal/organizer/recruitment/recruitmentTemplates';
import '@/features/events/styles/events-registration.css';
import '@/features/communities/components/drive-application-dialog.css';

function getInitials(name) {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDeadline(deadline) {
  if (!deadline) return null;
  return new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DriveApplicationDialog({ drive, communityName, onSuccess, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const isMountedRef = useRef(true);
  const [answers, setAnswers] = useState({});
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const requestClose = () => {
    // A submit is in flight — closing now would abandon the request with no
    // way to see its outcome, and any state update after unmount would be
    // silently lost. Let it finish (or fail) first.
    if (submitting) return;
    onClose();
  };

  useEffect(() => {
    const prev = document.activeElement;
    dialogRef.current?.focus();
    const handle = (e) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
      prev?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting]);

  const isDeadlinePassed = drive.deadline ? new Date() > new Date(drive.deadline) : false;
  const isClosed = !drive.isOpen || isDeadlinePassed;
  const hasFormQuestions = Array.isArray(drive.formQuestions) && drive.formQuestions.length > 0;
  const questionsValid = validateAnswers(drive.formQuestions, answers);
  const waiverValid = !drive.requireWaiver || waiverAccepted;
  const canSubmit = questionsValid && waiverValid && !isClosed;
  const deadline = formatDeadline(drive.deadline);
  const standardRole = findStandardRole(drive.title);
  const roleTheme = getRoleTheme(drive.title);

  const studentName = user?.name || 'Logged-In Student';
  const studentSub =
    [user?.department || user?.branch, user?.year ? `Year ${user.year}` : null, user?.rollNumber || user?.rollNo]
      .filter(Boolean)
      .join(' · ') || 'SIES Graduate School of Technology';

  const handleSubmit = async () => {
    if (submitting || isClosed) return;
    if (!canSubmit) {
      setAttemptedSubmit(true);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await submitDriveApplication(drive._id, answersToPayload(drive.formQuestions, answers));
      if (!isMountedRef.current) return;
      setSubmittedApplication(res.application || { status: 'pending' });
      setConfirmationMessage(res.message || '');
      onSuccess?.(res.application, res.message, drive._id);
    } catch (err) {
      if (!isMountedRef.current) return;
      setSubmitError(err instanceof ApiError ? err.message : err.message || 'Could not submit application.');
    } finally {
      if (isMountedRef.current) setSubmitting(false);
    }
  };

  if (submittedApplication) {
    return (
      <motion.div
        className="events-dialog-overlay drv-apply-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) requestClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drive-apply-success-title"
      >
        <motion.div
          ref={dialogRef}
          tabIndex={-1}
          className="events-dialog drv-apply-dialog"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          style={{ outline: 'none' }}
        >
          <div className="drv-apply-header">
            <div className="drv-apply-header-left">
              <div
                className="drv-apply-icon-badge"
                style={{
                  background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                  boxShadow: '0 4px 12px rgba(22, 101, 52, 0.3)',
                }}
              >
                <Check size={20} weight="bold" />
              </div>
              <div className="drv-apply-header-text">
                <span className="drv-apply-eyebrow" style={{ color: '#15803D' }}>Application Submitted</span>
                <h2 className="drv-apply-title" id="drive-apply-success-title">
                  {drive.title}
                </h2>
              </div>
            </div>
            <button
              type="button"
              className="events-dialog-close"
              onClick={requestClose}
              aria-label="Close application dialog"
              title="Close (Esc)"
            >
              <X size={15} weight="bold" />
            </button>
          </div>

          <div className="drv-apply-body" style={{ textAlign: 'center', padding: '2.5rem 1.75rem' }}>
            <div
              style={{
                width: '4.25rem',
                height: '4.25rem',
                borderRadius: '50%',
                background: '#DCFCE7',
                border: '2px solid #86EFAC',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 6px 16px rgba(22, 101, 52, 0.15)',
              }}
            >
              <CheckCircle size={40} weight="fill" />
            </div>

            <h3
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#0F172A',
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              Application Submitted Successfully!
            </h3>

            <p
              style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: '0.9375rem',
                color: '#475569',
                maxWidth: '480px',
                margin: '0 auto 1.5rem',
                lineHeight: 1.55,
              }}
            >
              {confirmationMessage || drive.confirmationMessage || 'Your application has been received and recorded in the recruitment roster. The community executive council will review your profile and answers.'}
            </p>

            <div
              style={{
                background: '#FAF8F5',
                border: '1px solid #E5DFD3',
                borderRadius: '12px',
                padding: '1.125rem 1.25rem',
                maxWidth: '480px',
                margin: '0 auto 1.75rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role Applied</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>{drive.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Wing / Tier</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>{standardRole ? `${standardRole.wing} (${standardRole.level})` : roleTheme.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Community</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#991B1B' }}>{communityName || 'Chapter Leadership'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.1875rem 0.625rem', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', fontFamily: 'JetBrains Mono, monospace', border: '1px solid #FCD34D' }}>
                  UNDER REVIEW
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Applicant</span>
                <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>{studentName}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="events-dialog-cancel"
                onClick={onClose}
                style={{ padding: '0.625rem 1.5rem', fontWeight: 600, minWidth: '130px' }}
              >
                Close
              </button>
              <button
                type="button"
                className="events-dialog-confirm"
                onClick={() => {
                  onClose();
                  navigate('/profile');
                }}
                style={{
                  padding: '0.625rem 1.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#0F172A',
                  color: '#fff',
                  minWidth: '180px',
                  justifyContent: 'center',
                }}
              >
                <span>View in Profile</span>
                <ArrowRight size={15} weight="bold" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="events-dialog-overlay drv-apply-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-apply-dialog-title"
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        className="events-dialog drv-apply-dialog"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{ outline: 'none' }}
      >
        <div className="drv-apply-header">
          <div className="drv-apply-header-left">
            <div className="drv-apply-icon-badge">
              <Flame size={20} weight="fill" />
            </div>
            <div className="drv-apply-header-text">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="drv-apply-eyebrow mb-0">Recruitment Application</span>
                <span
                  className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1"
                  style={{
                    background: roleTheme.badgeBg,
                    color: roleTheme.badgeColor,
                    border: `1px solid ${roleTheme.badgeBorder}`,
                  }}
                >
                  {standardRole ? `${standardRole.wing} • ${standardRole.level}` : roleTheme.label}
                </span>
              </div>
              <h2 className="drv-apply-title" id="drive-apply-dialog-title">
                {drive.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="events-dialog-close"
            onClick={requestClose}
            disabled={submitting}
            aria-label="Close application dialog"
            title="Close (Esc)"
          >
            <X size={15} weight="bold" />
          </button>
        </div>

        <div className="drv-apply-body">
          <div className="drv-apply-hero">
            <div className="drv-apply-hero-top">
              <div className="drv-apply-hero-host">
                <span className="drv-apply-hero-host-icon">🏛️</span>
                <span>{communityName}</span>
              </div>
              {deadline && (
                <span className="drv-apply-deadline-pill">
                  <Clock size={12} weight="bold" /> Apply by {deadline}
                </span>
              )}
            </div>
            <h3 className="drv-apply-hero-title">{drive.title}</h3>
            {drive.description && <p className="drv-apply-hero-desc">{drive.description}</p>}
          </div>

          <div className="drv-apply-identity-card">
            <div className="drv-apply-identity-left">
              <div className="drv-apply-avatar">{getInitials(studentName)}</div>
              <div className="drv-apply-identity-details">
                <span className="drv-apply-identity-role">Applicant</span>
                <p className="drv-apply-identity-name">{studentName}</p>
                <p className="drv-apply-identity-sub">{studentSub}</p>
              </div>
            </div>
            <span className="drv-apply-verified-seal">
              <ShieldCheck size={14} weight="fill" />
              SIES Account Verified
            </span>
          </div>

          {hasFormQuestions && (
            <EventFormQuestionsFieldset
              formQuestions={drive.formQuestions}
              answers={answers}
              onChange={setAnswers}
              showAllErrors={attemptedSubmit}
              title="Application Questions"
            />
          )}

          {drive.requireWaiver && (
            <div className="events-waiver-card">
              <div className="events-waiver-header">
                <h4 className="events-waiver-title">
                  <ShieldCheck size={16} style={{ color: '#1A3A2A' }} />
                  Recruitment Waiver
                </h4>
              </div>

              {drive.waiverText && <div className="events-waiver-text-box">{drive.waiverText}</div>}

              <label
                className={`events-waiver-checkbox-label${waiverAccepted ? ' checked' : ''}${attemptedSubmit && !waiverValid ? ' has-error' : ''}`}
              >
                <input type="checkbox" checked={waiverAccepted} onChange={(e) => setWaiverAccepted(e.target.checked)} />
                <span className="events-waiver-checkbox-icon" aria-hidden="true">
                  {waiverAccepted && <Check size={12} weight="bold" />}
                </span>
                <span className="events-waiver-checkbox-text">
                  I confirm that all details provided are accurate and agree to the terms above.
                </span>
              </label>

              {attemptedSubmit && !waiverValid && (
                <p className="events-form-error">
                  <Warning size={13} weight="fill" />
                  You must accept the waiver to submit your application.
                </p>
              )}
            </div>
          )}

          {isClosed && (
            <div className="events-conflict-notice" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
              <Clock size={16} style={{ color: '#DC2626', flexShrink: 0 }} weight="bold" />
              <p className="events-conflict-text" style={{ color: '#991B1B', fontWeight: 600 }}>
                {isDeadlinePassed ? 'The application deadline has passed. New applications are no longer accepted.' : 'This recruitment drive is closed.'}
              </p>
            </div>
          )}

          {submitError && (
            <div className="events-conflict-notice" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
              <Warning size={16} style={{ color: '#DC2626', flexShrink: 0 }} weight="fill" />
              <p className="events-conflict-text" style={{ color: '#991B1B' }}>
                {submitError}
              </p>
            </div>
          )}
        </div>

        <div className="drv-apply-footer">
          <button type="button" className="events-dialog-cancel" onClick={requestClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="events-dialog-confirm" onClick={handleSubmit} disabled={submitting || isClosed}>
            {submitting ? (
              <>
                <CircleNotch size={16} className="animate-spin" />
                <span>Submitting…</span>
              </>
            ) : isClosed ? (
              <span>{isDeadlinePassed ? 'Deadline Passed' : 'Closed'}</span>
            ) : (
              <>
                <PaperPlaneTilt size={16} weight="fill" />
                <span>Submit Application</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

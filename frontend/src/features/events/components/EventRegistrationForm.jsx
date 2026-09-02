/**
 * EventRegistrationForm.jsx
 * Shared body for both registration dialogs (events hub + detail page).
 * Features:
 * - Verified primary student identity capsule
 * - Event metadata hero capsule with date, venue, host, and fee badges
 * - Step progression & tabbed question navigation for team events
 * - Interactive team roster lookup
 * - Modern waiver & code of conduct agreement
 * - Live registration summary & pass preview
 * - Preserves all backend API contract requirements (POST /events/:eventId/register)
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Check,
  CheckCircle,
  CircleNotch,
  CurrencyInr,
  FileText,
  MapPin,
  ShieldCheck,
  Ticket,
  User,
  UsersThree,
  Warning,
  Sparkle,
} from '@phosphor-icons/react';
import { useAuth } from '@/shared/auth/AuthContext';
import { registerForEvent, trackRegistrationStarted } from '@/features/events/events.api';
import { ApiError } from '@/shared/api/httpClient';
import ConflictWarning from '@/features/events/components/EventConflictWarning';
import TeamMemberLookup from '@/features/events/components/TeamMemberLookup';
import EventFormQuestionsFieldset, {
  validateAnswers,
  answersToPayload,
} from '@/features/events/components/EventFormQuestionsFieldset';
import RegistrationSuccessView from '@/features/events/components/RegistrationSuccessView';

function getInitials(name) {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function EventRegistrationForm({
  event,
  leaderId,
  conflictTitle,
  onSuccess,
  onClose,
}) {
  const { user } = useAuth();
  const isTeamEvent = event.registrationType === 'team';
  const teamMin = Math.max((event.teamSize?.min || 1) - 1, 0);
  const teamMax = Math.max((event.teamSize?.max || 1) - 1, 0);

  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [answers, setAnswers] = useState({});
  const [activeQuestionTab, setActiveQuestionTab] = useState('leader');
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Engagement Beacon
  const trackedStartRef = useRef(false);
  useEffect(() => {
    if (trackedStartRef.current) return;
    trackedStartRef.current = true;
    trackRegistrationStarted(event.id).catch(() => {});
  }, [event.id]);

  const rosterSize = 1 + teamMembers.length;
  const teamSizeValid =
    !isTeamEvent ||
    (rosterSize >= (event.teamSize?.min || 1) && rosterSize <= (event.teamSize?.max || 1));
  const teamNameValid = !isTeamEvent || teamName.trim().length > 0;
  const questionsValid = useMemo(
    () => validateAnswers(event.formQuestions, answers),
    [event.formQuestions, answers]
  );
  const memberAnswersValid = useMemo(
    () => !isTeamEvent || teamMembers.every((m) => validateAnswers(event.formQuestions, m.answers)),
    [isTeamEvent, event.formQuestions, teamMembers]
  );
  const waiverValid = !event.requireWaiver || waiverAccepted;
  const canSubmit = teamNameValid && teamSizeValid && questionsValid && memberAnswersValid && waiverValid;

  const handleAddMember = (member) => {
    setTeamMembers((m) => [...m, { ...member, answers: {} }]);
  };
  const handleRemoveMember = (studentId) => {
    setTeamMembers((m) => m.filter((x) => x.studentId !== studentId));
    if (activeQuestionTab === `member-${studentId}`) {
      setActiveQuestionTab('leader');
    }
  };
  const handleUpdateMemberAnswers = (studentId, memberAnswers) => {
    setTeamMembers((m) =>
      m.map((x) => (x.studentId === studentId ? { ...x, answers: memberAnswers } : x))
    );
  };

  useEffect(() => {
    if (submitError) setSubmitError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, teamName, teamMembers, waiverAccepted]);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!canSubmit) {
      setAttemptedSubmit(true);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await registerForEvent(event.id, {
        teamName: isTeamEvent ? teamName.trim() : undefined,
        answers: answersToPayload(event.formQuestions, answers),
        teamMembers: isTeamEvent
          ? teamMembers.map((m) => ({
              studentId: m.studentId,
              answers: answersToPayload(event.formQuestions, m.answers),
            }))
          : undefined,
      });
      setResult(res.registration);
      onSuccess?.(res.registration);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : err.message || 'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <RegistrationSuccessView
        event={event}
        ticketId={result.qrToken}
        status={result.status}
        teamMembers={teamMembers.map((m) => m.name)}
        onDone={onClose}
      />
    );
  }

  const studentName = user?.name || 'Logged-In Student';
  const studentEmail = user?.email || 'student@siesgst.ac.in';
  const studentSub = [user?.department || user?.branch, user?.year ? `Year ${user?.year}` : null, user?.rollNumber || user?.rollNo]
    .filter(Boolean)
    .join(' · ') || 'SIES Graduate School of Technology';

  const hasFormQuestions = Array.isArray(event.formQuestions) && event.formQuestions.length > 0;

  return (
    <>
      <div className="events-dialog-body">
        {/* ── Event Hero Capsule ── */}
        <div className="events-dialog-hero-card">
          <div className="events-dialog-hero-top">
            <div className="events-dialog-hero-host">
              <span className="events-dialog-hero-host-icon">{event.hostIcon || '🏛️'}</span>
              <span>{event.hostName}</span>
            </div>
            <span className={`events-dialog-fee-badge ${event.payment === 'Free' ? 'free' : ''}`}>
              {event.payment === 'Free' ? (
                <>
                  <Check size={12} weight="bold" /> Free Entry
                </>
              ) : (
                <>
                  <CurrencyInr size={12} weight="bold" /> ₹{event.price_amount}
                </>
              )}
            </span>
          </div>

          <h3 className="events-dialog-hero-title">{event.title}</h3>

          <div className="events-dialog-hero-meta-grid">
            {event.dateFormatted && (
              <span className="events-dialog-meta-pill">
                <Calendar size={13} weight="bold" />
                {event.dateFormatted}
              </span>
            )}
            {event.venue && (
              <span className="events-dialog-meta-pill">
                <MapPin size={13} weight="bold" />
                {event.venue}
              </span>
            )}
            <span className="events-dialog-meta-pill">
              <Ticket size={13} weight="bold" />
              {isTeamEvent
                ? `Team Pass (${event.teamSize?.min === event.teamSize?.max ? event.teamSize?.min : `${event.teamSize?.min}–${event.teamSize?.max}`} members)`
                : 'Solo Pass'}
            </span>
          </div>
        </div>

        {/* ── Conflict & Waitlist Notices ── */}
        {conflictTitle && <ConflictWarning conflictTitle={conflictTitle} />}

        {event.statusBadge === 'Sold Out' && event.allowWaitlist && (
          <div className="events-conflict-notice">
            <Warning size={16} className="events-conflict-icon" weight="fill" />
            <p className="events-conflict-text">
              This event is currently at full capacity. Registering now reserves your place on the{' '}
              <strong>priority waitlist</strong>. You will be automatically confirmed if a seat opens.
            </p>
          </div>
        )}

        {/* ── Primary Registrant Identity Card ── */}
        <div className="events-reg-identity-card">
          <div className="events-reg-identity-left">
            <div className="events-reg-avatar">{getInitials(studentName)}</div>
            <div className="events-reg-identity-details">
              <span className="events-reg-identity-role">
                {isTeamEvent ? 'Team Lead · Primary Registrant' : 'Primary Registrant'}
              </span>
              <p className="events-reg-identity-name">{studentName}</p>
              <p className="events-reg-identity-sub">{studentSub}</p>
            </div>
          </div>
          <span className="events-reg-verified-seal">
            <ShieldCheck size={14} weight="fill" />
            SIES Account Verified
          </span>
        </div>

        {/* ── Team Setup (If Team Event) ── */}
        {isTeamEvent && (
          <div className="events-form-field">
            <label htmlFor="reg-team-name" className="events-form-label">
              <UsersThree size={14} className="events-form-label-icon" />
              <span>Team Name</span>
              <span className="events-form-required-badge">Required</span>
            </label>
            <input
              id="reg-team-name"
              type="text"
              className={`events-form-input${attemptedSubmit && !teamNameValid ? ' has-error' : ''}`}
              placeholder="e.g. Byte Builders, Neural Knights…"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              aria-invalid={attemptedSubmit && !teamNameValid}
            />
            {attemptedSubmit && !teamNameValid && (
              <p className="events-form-error">
                <Warning size={13} weight="fill" />
                Please provide a name for your team.
              </p>
            )}
          </div>
        )}

        {/* ── Team Roster Lookup ── */}
        {isTeamEvent && (
          <>
            <TeamMemberLookup
              members={teamMembers}
              onAdd={handleAddMember}
              onRemove={handleRemoveMember}
              min={teamMin}
              max={teamMax}
              leaderId={leaderId || user?._id}
              leaderName={studentName}
              leaderEmail={studentEmail}
            />
            {attemptedSubmit && !teamSizeValid && (
              <p className="events-form-error" style={{ marginTop: '-0.375rem' }}>
                <Warning size={13} weight="fill" />
                Your team requires{' '}
                {event.teamSize?.min === event.teamSize?.max
                  ? event.teamSize?.min
                  : `${event.teamSize?.min}–${event.teamSize?.max}`}{' '}
                members in total.
              </p>
            )}
          </>
        )}

        {/* ── Custom Questions (Solo or Team Tabs) ── */}
        {hasFormQuestions && (
          <>
            {isTeamEvent && teamMembers.length > 0 ? (
              <div className="events-form-section">
                <div className="events-form-section-header">
                  <p className="events-form-section-title">
                    <FileText size={15} style={{ color: '#991B1B' }} />
                    Participant Questions
                  </p>
                  <span className="events-form-section-count">
                    {rosterSize} Member{rosterSize === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="events-teammate-tabs-nav">
                  <button
                    type="button"
                    className={`events-teammate-tab-btn${activeQuestionTab === 'leader' ? ' active' : ''}`}
                    onClick={() => setActiveQuestionTab('leader')}
                  >
                    <span
                      className={`events-teammate-tab-status${questionsValid ? ' valid' : ''}`}
                    />
                    You (Lead)
                  </button>
                  {teamMembers.map((m) => {
                    const isMemberValid = validateAnswers(event.formQuestions, m.answers);
                    const isTabActive = activeQuestionTab === `member-${m.studentId}`;
                    return (
                      <button
                        key={m.studentId}
                        type="button"
                        className={`events-teammate-tab-btn${isTabActive ? ' active' : ''}`}
                        onClick={() => setActiveQuestionTab(`member-${m.studentId}`)}
                      >
                        <span
                          className={`events-teammate-tab-status${isMemberValid ? ' valid' : ''}`}
                        />
                        {m.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>

                {activeQuestionTab === 'leader' ? (
                  <EventFormQuestionsFieldset
                    formQuestions={event.formQuestions}
                    answers={answers}
                    onChange={setAnswers}
                    showAllErrors={attemptedSubmit}
                    title="Your Responses"
                  />
                ) : (
                  teamMembers
                    .filter((m) => `member-${m.studentId}` === activeQuestionTab)
                    .map((m) => (
                      <EventFormQuestionsFieldset
                        key={m.studentId}
                        formQuestions={event.formQuestions}
                        answers={m.answers}
                        onChange={(next) => handleUpdateMemberAnswers(m.studentId, next)}
                        showAllErrors={attemptedSubmit}
                        idPrefix={`member-${m.studentId}`}
                        title={`${m.name}'s Responses`}
                      />
                    ))
                )}
              </div>
            ) : (
              <EventFormQuestionsFieldset
                formQuestions={event.formQuestions}
                answers={answers}
                onChange={setAnswers}
                showAllErrors={attemptedSubmit}
                title={isTeamEvent ? 'Team Lead Questions' : 'Registration Questions'}
              />
            )}
          </>
        )}

        {/* ── Waiver & Conduct Acceptance ── */}
        {event.requireWaiver && (
          <div className="events-waiver-card">
            <div className="events-waiver-header">
              <h4 className="events-waiver-title">
                <ShieldCheck size={16} style={{ color: '#1A3A2A' }} />
                Event Guidelines & Waiver
              </h4>
            </div>

            {event.waiverText && (
              <div className="events-waiver-text-box">{event.waiverText}</div>
            )}

            <label
              className={`events-waiver-checkbox-label${waiverAccepted ? ' checked' : ''}${attemptedSubmit && !waiverValid ? ' has-error' : ''}`}
            >
              <input
                type="checkbox"
                checked={waiverAccepted}
                onChange={(e) => setWaiverAccepted(e.target.checked)}
              />
              <span className="events-waiver-checkbox-icon" aria-hidden="true">
                {waiverAccepted && <Check size={12} weight="bold" />}
              </span>
              <span className="events-waiver-checkbox-text">
                I confirm that all details provided are accurate and agree to follow all SIES GST
                campus rules and event conduct guidelines.
              </span>
            </label>

            {attemptedSubmit && !waiverValid && (
              <p className="events-form-error">
                <Warning size={13} weight="fill" />
                You must accept the guidelines & waiver to complete registration.
              </p>
            )}
          </div>
        )}

        {/* ── Live Summary Ribbon ── */}
        <div className="events-reg-summary-box">
          <div className="events-reg-summary-item">
            <span className="events-reg-summary-label">Registration Type</span>
            <span className="events-reg-summary-val">
              {isTeamEvent ? `Team (${rosterSize} Members)` : 'Individual Student'}
            </span>
          </div>
          <div className="events-reg-summary-item" style={{ textAlign: 'right' }}>
            <span className="events-reg-summary-label">Total Amount</span>
            <span
              className="events-reg-summary-val"
              style={{ color: event.payment === 'Free' ? '#1A3A2A' : '#991B1B' }}
            >
              {event.payment === 'Free' ? 'Free RSVP' : `₹${event.price_amount}`}
            </span>
          </div>
        </div>

        {/* ── Global Submit Error Banner ── */}
        {submitError && (
          <div
            className="events-conflict-notice"
            style={{
              background: '#FEF2F2',
              borderColor: '#FECACA',
            }}
          >
            <Warning size={16} style={{ color: '#DC2626', flexShrink: 0 }} weight="fill" />
            <p className="events-conflict-text" style={{ color: '#991B1B' }}>
              {submitError}
            </p>
          </div>
        )}
      </div>

      {/* ── Dialog Action Footer ── */}
      <div className="events-dialog-footer">
        <button
          type="button"
          className="events-dialog-cancel"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="events-dialog-confirm"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <CircleNotch size={16} className="animate-spin" />
              <span>Reserving Your Pass…</span>
            </>
          ) : (
            <>
              <Ticket size={16} weight="bold" />
              <span>
                {event.statusBadge === 'Sold Out' && event.allowWaitlist
                  ? 'Join Priority Waitlist'
                  : 'Confirm & Generate Pass'}
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );
}

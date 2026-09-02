/**
 * ManageTeamModal.jsx — post-registration team roster management, opened
 * from a registered team event's "Team" button (RegisteredEventCard /
 * MyEventsLedgerRow). Complements TeamInvitesPanel: that's where an invited
 * student accepts/declines; this is where the leader sees who's pending vs.
 * accepted, removes someone, or invites a replacement (e.g. after a
 * decline). A non-leader member gets a read-only roster plus a "Leave Team"
 * action instead — only the leader can add/remove other people.
 */
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Check,
  CircleNotch,
  Clock,
  Crown,
  EnvelopeSimple,
  Minus,
  PaperPlaneTilt,
  ShieldCheck,
  Trash,
  User,
  UserPlus,
  UsersThree,
  Warning,
  X,
} from '@phosphor-icons/react';
import {
  listTeamMembers,
  addTeamMember,
  removeTeamMember,
  lookupStudentByEmail,
} from '@/features/events/events.api';
import { validateAnswers, answersToPayload, isQuestionAnswered } from '@/features/events/components/EventFormQuestionsFieldset';
import { ApiError } from '@/shared/api/httpClient';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_PALETTES = [
  { bg: '#EBF3EE', color: '#1A3A2A', border: '#C5D8CC' },
  { bg: '#FDF3E7', color: '#B45309', border: '#F2D5B5' },
  { bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE' },
  { bg: '#FAF5FF', color: '#6B21A8', border: '#E9D5FF' },
  { bg: '#FDF2F2', color: '#991B1B', border: '#FECACA' },
  { bg: '#ECFEFF', color: '#0E7490', border: '#A5F3FC' },
];

function getAvatarPalette(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function StatusPill({ status }) {
  if (status === 'accepted') {
    return (
      <span className="myevents-team-status myevents-team-status-accepted">
        <Check size={12} weight="bold" />
        <span>Accepted</span>
      </span>
    );
  }
  return (
    <span className="myevents-team-status myevents-team-status-pending">
      <span className="myevents-status-pulse-dot" />
      <Clock size={12} weight="bold" />
      <span>Pending</span>
    </span>
  );
}

/** Inline renderer for an event's formQuestions, scoped to this modal's own CSS. */
function InviteQuestionsFieldset({ formQuestions, answers, onChange, showAllErrors }) {
  const setValue = (questionId, value) => onChange({ ...answers, [questionId]: value });

  return (
    <div className="myevents-invite-q-list">
      {formQuestions.map((q) => {
        const value = answers[q._id];
        const showError = q.required && !isQuestionAnswered(q, value) && showAllErrors;
        const fieldClass = `myevents-invite-q-input${showError ? ' has-error' : ''}`;

        return (
          <div key={q._id} className="myevents-invite-q-field">
            <label className="myevents-invite-q-label">
              <span>{q.label}</span>
              {q.required && <span className="myevents-invite-q-required">Required</span>}
            </label>
            {q.helpText && <p className="myevents-invite-q-help">{q.helpText}</p>}

            {q.type === 'textarea' ? (
              <textarea
                className={fieldClass}
                placeholder={q.placeholder || 'Type a response…'}
                value={value || ''}
                onChange={(e) => setValue(q._id, e.target.value)}
              />
            ) : q.type === 'number' ? (
              <input
                type="number"
                className={fieldClass}
                placeholder={q.placeholder || 'Enter a number…'}
                value={value ?? ''}
                onChange={(e) => setValue(q._id, e.target.value === '' ? undefined : Number(e.target.value))}
              />
            ) : q.type === 'select' ? (
              <select className={fieldClass} value={value || ''} onChange={(e) => setValue(q._id, e.target.value)}>
                <option value="">Choose an option…</option>
                {(q.options || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : q.type === 'radio' ? (
              <div className="myevents-invite-q-options">
                {(q.options || []).map((opt) => (
                  <label key={opt} className={`myevents-invite-q-option${value === opt ? ' checked' : ''}`}>
                    <input type="radio" name={q._id} checked={value === opt} onChange={() => setValue(q._id, opt)} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : q.type === 'checkbox' ? (
              <div className="myevents-invite-q-options">
                {(q.options || []).map((opt) => {
                  const current = Array.isArray(value) ? value : [];
                  const checked = current.includes(opt);
                  return (
                    <label key={opt} className={`myevents-invite-q-option${checked ? ' checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setValue(q._id, checked ? current.filter((v) => v !== opt) : [...current, opt])}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <input
                type={q.type === 'url' ? 'url' : 'text'}
                className={fieldClass}
                placeholder={q.placeholder || 'Type an answer…'}
                value={value || ''}
                onChange={(e) => setValue(q._id, e.target.value)}
              />
            )}

            {showError && (
              <p className="myevents-team-error"><Warning size={13} weight="fill" /> This field is required.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ManageTeamModal({ event, currentUserId, onClose, onChanged }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState(null);

  // Invite flow: 'search' (enter email) -> 'questions' (fill invitee's
  // answers, only when the event has formQuestions) -> sent.
  const [stage, setStage] = useState('search');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundStudent, setFoundStudent] = useState(null);
  const [memberAnswers, setMemberAnswers] = useState({});
  const [attemptedInvite, setAttemptedInvite] = useState(false);
  const [sending, setSending] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const isLeader = event.leaderId === currentUserId;
  const max = event.teamSizeLimits?.max || (event.teamSize ? parseInt(event.teamSize) : Infinity);
  const min = event.teamSizeLimits?.min || 1;
  const rosterSize = 1 + members.length;
  const hasFiniteMax = Number.isFinite(max);
  const spotsRemaining = hasFiniteMax ? Math.max(0, max - rosterSize) : null;
  const isMinMet = rosterSize >= min;
  const isAtMax = hasFiniteMax && rosterSize >= max;
  const formQuestions = Array.isArray(event.formQuestions) ? event.formQuestions : [];
  const hasFormQuestions = formQuestions.length > 0;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { members: raw } = await listTeamMembers(event.registrationId);
      setMembers(raw.filter((m) => m.student));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load the team roster.');
    } finally {
      setLoading(false);
    }
  }, [event.registrationId]);

  useEffect(() => { load(); }, [load]);

  const resetInviteFlow = () => {
    setStage('search');
    setQuery('');
    setFoundStudent(null);
    setMemberAnswers({});
    setAttemptedInvite(false);
    setInviteError('');
  };

  const sendInvite = async (studentId, answers) => {
    setSending(true);
    setInviteError('');
    try {
      await addTeamMember(event.registrationId, { studentId, answers: answersToPayload(formQuestions, answers) });
      resetInviteFlow();
      await load();
      onChanged?.();
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : (err.message || 'Could not send that invite.'));
    } finally {
      setSending(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    const email = query.trim();
    if (!email || searching) return;
    setInviteError('');
    setSearching(true);
    try {
      const res = await lookupStudentByEmail(email);
      const student = res.student || res.user;
      if (!student?._id) throw new Error('Could not find that student account.');
      if (student._id === currentUserId) {
        setInviteError("That's you — you're already on this team.");
        return;
      }
      if (members.some((m) => m.student._id === student._id)) {
        setInviteError(`${student.name} is already on this team.`);
        return;
      }
      if (hasFormQuestions) {
        setFoundStudent(student);
        setMemberAnswers({});
        setAttemptedInvite(false);
        setStage('questions');
      } else {
        await sendInvite(student._id, {});
      }
    } catch (err) {
      if (err instanceof ApiError) setInviteError(err.status === 404 ? `No registered student found with email "${email}".` : err.message);
      else setInviteError(err.message || 'Could not find that student.');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirmInvite = () => {
    if (!validateAnswers(formQuestions, memberAnswers)) {
      setAttemptedInvite(true);
      return;
    }
    sendInvite(foundStudent._id, memberAnswers);
  };

  const handleRemove = async (member) => {
    if (busyId) return;
    setBusyId(member._id);
    try {
      await removeTeamMember(event.registrationId, member._id);
      setMembers((prev) => prev.filter((m) => m._id !== member._id));
      onChanged?.();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not remove that team member.');
    } finally {
      setBusyId(null);
    }
  };

  const selfMember = members.find((m) => m.student._id === currentUserId);

  return (
    <div
      className="ticket-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-team-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="events-dialog myevents-manage-team-dialog"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      >
        {/* Header */}
        <div className="events-dialog-header myevents-manage-team-header">
          <div className="myevents-manage-team-title-wrap">
            <div className="myevents-manage-team-icon-badge">
              <UsersThree size={22} weight="bold" />
            </div>
            <div>
              <div className="myevents-manage-team-eyebrow">Team Management</div>
              <h2 className="events-dialog-title myevents-manage-team-title" id="manage-team-title">
                {event.teamName || 'Manage Team'}
              </h2>
            </div>
          </div>
          <button className="events-dialog-close" onClick={onClose} aria-label="Close modal">
            <X size={17} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="events-dialog-body myevents-manage-team-body">
          {/* Event context & Capacity tracker banner */}
          <div className="myevents-team-banner">
            <div className="myevents-team-banner-info">
              <span className="myevents-team-event-title">{event.title}</span>
              <div className="myevents-team-meta-badges">
                <span className="myevents-team-limit-chip">
                  {min === max ? `${min} members required` : `${min}–${max} members required`}
                </span>
                {isMinMet && (
                  <span className="myevents-team-min-status ready">
                    <Check size={12} weight="bold" /> Ready
                  </span>
                )}
              </div>
            </div>

            {hasFiniteMax && (
              <div className="myevents-team-capacity-box">
                <div className="myevents-team-capacity-header">
                  <span className="myevents-team-capacity-label">Roster Capacity</span>
                  <span className="myevents-team-capacity-count">
                    <strong>{rosterSize}</strong> / {max}
                  </span>
                </div>
                <div className="myevents-team-capacity-dots">
                  {Array.from({ length: max }).map((_, idx) => {
                    const isFilled = idx < rosterSize;
                    const isLeaderDot = idx === 0;
                    return (
                      <div
                        key={idx}
                        className={`myevents-capacity-dot ${isFilled ? 'filled' : 'empty'} ${isLeaderDot ? 'leader' : ''}`}
                        title={isFilled ? `Member slot ${idx + 1} filled` : `Open slot ${idx + 1}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Roster Section */}
          <div className="myevents-team-section-heading">
            <span>Current Roster</span>
            <span className="myevents-team-section-count">
              {rosterSize} {rosterSize === 1 ? 'member' : 'members'}
            </span>
          </div>

          {loading ? (
            <div className="myevents-team-loading">
              <CircleNotch size={24} className="animate-spin" />
              <span>Loading team members…</span>
            </div>
          ) : (
            <div className="myevents-team-roster">
              {/* Leader Row */}
              <div className="myevents-team-row myevents-team-row-leader">
                <div className="myevents-team-identity">
                  <div className="myevents-team-avatar myevents-team-avatar-leader">
                    <Crown size={17} weight="fill" />
                  </div>
                  <div className="myevents-team-info-group">
                    <span className="myevents-team-name">
                      You {isLeader ? '' : '(Captain)'}
                    </span>
                    <span className="myevents-team-role-subtext">Team Captain · Registrant</span>
                  </div>
                </div>
                <div className="myevents-team-row-right">
                  <span className="myevents-team-status myevents-team-status-leader">
                    <Crown size={12} weight="fill" />
                    <span>Leader</span>
                  </span>
                </div>
              </div>

              {/* Teammates */}
              <AnimatePresence initial={false}>
                {members.map((m) => {
                  const palette = getAvatarPalette(m.student.name);
                  const isCurrentUser = m.student._id === currentUserId;

                  return (
                    <motion.div
                      key={m._id}
                      className="myevents-team-row"
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="myevents-team-identity">
                        <div
                          className="myevents-team-avatar"
                          style={{
                            backgroundColor: palette.bg,
                            color: palette.color,
                            borderColor: palette.border,
                          }}
                        >
                          {getInitials(m.student.name)}
                        </div>
                        <div className="myevents-team-info-group">
                          <span className="myevents-team-name">
                            {m.student.name}
                            {isCurrentUser && <span className="myevents-you-chip">You</span>}
                          </span>
                          {m.student.email && (
                            <span className="myevents-team-email-subtext">{m.student.email}</span>
                          )}
                        </div>
                      </div>
                      <div className="myevents-team-row-right">
                        <StatusPill status={m.status} />
                        {(isLeader || isCurrentUser) && (
                          <button
                            type="button"
                            className="myevents-team-remove"
                            onClick={() => handleRemove(m)}
                            disabled={busyId === m._id || m.checkedIn}
                            aria-label={isCurrentUser ? 'Leave team' : `Remove ${m.student.name}`}
                            title={
                              m.checkedIn
                                ? 'Already checked in — cannot remove'
                                : isCurrentUser
                                ? 'Leave team'
                                : 'Remove member'
                            }
                          >
                            {busyId === m._id ? (
                              <CircleNotch size={14} className="animate-spin" />
                            ) : isCurrentUser ? (
                              <Minus size={14} weight="bold" />
                            ) : (
                              <Trash size={14} weight="bold" />
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Open Slot Placeholder if space remains */}
              {isLeader && hasFiniteMax && rosterSize < max && (
                <div className="myevents-team-slot-placeholder">
                  <div className="myevents-team-slot-icon">
                    <UserPlus size={16} />
                  </div>
                  <span className="myevents-team-slot-text">
                    Slot {rosterSize + 1} open — {spotsRemaining} {spotsRemaining === 1 ? 'spot remaining' : 'spots remaining'}
                  </span>
                </div>
              )}
            </div>
          )}

          {loadError && (
            <div className="myevents-team-error-banner">
              <Warning size={15} weight="fill" />
              <span>{loadError}</span>
            </div>
          )}

          {/* Invite Teammate Area */}
          {isLeader && !loading && rosterSize < max && (
            <div className="myevents-team-invite-card">
              <div className="myevents-team-invite-header">
                <div className="myevents-team-invite-header-left">
                  <UserPlus size={18} weight="bold" />
                  <span>Invite Teammate</span>
                </div>
                {spotsRemaining !== null && (
                  <span className="myevents-team-spots-badge">
                    {spotsRemaining} {spotsRemaining === 1 ? 'spot left' : 'spots left'}
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                {stage === 'search' ? (
                  <motion.form
                    key="search"
                    className="myevents-team-invite-form"
                    onSubmit={handleLookup}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="myevents-team-invite-input-wrap">
                      <EnvelopeSimple size={17} className="myevents-team-invite-input-icon" />
                      <input
                        type="email"
                        className="myevents-team-invite-input"
                        placeholder="Enter CampusCircle email address…"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          if (inviteError) setInviteError('');
                        }}
                        aria-label="Teammate email"
                      />
                    </div>
                    <button
                      type="submit"
                      className="myevents-team-invite-btn"
                      disabled={!query.trim() || searching}
                    >
                      {searching ? (
                        <CircleNotch size={15} className="animate-spin" />
                      ) : (
                        <PaperPlaneTilt size={15} weight="bold" />
                      )}
                      <span>{hasFormQuestions ? 'Continue' : 'Send Invite'}</span>
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="questions"
                    className="myevents-invite-questions-wrap"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="myevents-invite-found">
                      <div className="myevents-team-identity">
                        <div className="myevents-team-avatar myevents-team-avatar-preview">
                          <User size={16} weight="bold" />
                        </div>
                        <div className="myevents-team-info-group">
                          <span className="myevents-team-name">{foundStudent?.name}</span>
                          <span className="myevents-invite-found-email">{foundStudent?.email}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="myevents-invite-back-btn"
                        onClick={resetInviteFlow}
                        disabled={sending}
                      >
                        <ArrowLeft size={13} weight="bold" /> Change
                      </button>
                    </div>

                    <p className="myevents-invite-q-intro">
                      Please answer the registration questions on behalf of <strong>{foundStudent?.name}</strong> to complete the invite.
                    </p>

                    <InviteQuestionsFieldset
                      formQuestions={formQuestions}
                      answers={memberAnswers}
                      onChange={setMemberAnswers}
                      showAllErrors={attemptedInvite}
                    />

                    <button
                      type="button"
                      className="myevents-team-invite-btn myevents-invite-send-btn"
                      onClick={handleConfirmInvite}
                      disabled={sending}
                    >
                      {sending ? (
                        <CircleNotch size={15} className="animate-spin" />
                      ) : (
                        <PaperPlaneTilt size={15} weight="bold" />
                      )}
                      <span>Confirm & Send Invite</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {inviteError && (
            <motion.div
              className="myevents-team-error-banner"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Warning size={15} weight="fill" />
              <span>{inviteError}</span>
            </motion.div>
          )}

          {isLeader && !loading && isAtMax && (
            <div className="myevents-team-max-banner">
              <ShieldCheck size={18} weight="duotone" />
              <span>Team roster is complete! Maximum team capacity reached.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="events-dialog-footer myevents-manage-team-footer">
          <button className="events-dialog-cancel myevents-team-close-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}

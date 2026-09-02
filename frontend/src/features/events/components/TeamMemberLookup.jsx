/**
 * TeamMemberLookup.jsx
 * Adds real teammates to a team registration by CampusCircle email.
 * Includes interactive roster cards, avatar badges, seat capacity tracker,
 * and live student lookup feedback.
 */
import { useState } from 'react';
import {
  Check,
  CircleNotch,
  MagnifyingGlass,
  Plus,
  Trash,
  UserPlus,
  UsersThree,
  Warning,
  User,
} from '@phosphor-icons/react';
import { lookupStudentByEmail } from '@/features/events/events.api';
import { ApiError } from '@/shared/api/httpClient';

function getInitials(name) {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TeamMemberLookup({
  members = [],
  onAdd,
  onRemove,
  min = 0,
  max = 3,
  leaderId,
  leaderName = 'Team Lead',
  leaderEmail = '',
}) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canAddMore = members.length < max;
  const currentTotal = 1 + members.length;
  const targetMin = 1 + min;
  const targetMax = 1 + max;
  const isRequirementMet = members.length >= min;
  const progressPct = Math.min(Math.round((currentTotal / targetMax) * 100), 100);

  const handleLookup = async (e) => {
    e.preventDefault();
    const email = query.trim();
    if (!email || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await lookupStudentByEmail(email);
      const student = res.student || res.user;
      if (!student?._id) throw new Error('Could not find that student account.');
      if (String(student._id) === String(leaderId)) {
        setError("That's you — you're already the team leader, no need to add yourself.");
        return;
      }
      if (members.some((m) => m.studentId === String(student._id))) {
        setError(`${student.name} is already on this team.`);
        return;
      }
      onAdd({ studentId: String(student._id), name: student.name, email: student.email });
      setQuery('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError(`No registered student found with email "${email}". Ensure the student is registered on CampusCircle.`);
      } else {
        setError(err.message || 'Could not look up that student.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="events-team-section">
      <div className="events-team-header">
        <h3 className="events-team-title">
          <UsersThree size={16} weight="bold" style={{ color: '#991B1B' }} />
          Team Roster
        </h3>
        <span className={`events-team-count-badge${isRequirementMet ? ' ready' : ''}`}>
          {currentTotal} of {targetMin === targetMax ? targetMin : `${targetMin}–${targetMax}`} members
        </span>
      </div>

      <div className="events-team-progress-track">
        <div className="events-team-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="events-team-roster">
        {/* Team Leader Row */}
        <div className="events-team-member-card leader">
          <div className="events-team-member-left">
            <div className="events-team-member-avatar leader">
              {getInitials(leaderName)}
            </div>
            <div className="events-team-member-info">
              <div className="events-team-member-name">{leaderName} (You)</div>
              <div className="events-team-member-email">{leaderEmail || 'Primary Account'}</div>
            </div>
          </div>
          <span className="events-team-member-tag" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}>
            Leader
          </span>
        </div>

        {/* Added Members */}
        {members.map((m) => (
          <div key={m.studentId} className="events-team-member-card">
            <div className="events-team-member-left">
              <div className="events-team-member-avatar">
                {getInitials(m.name)}
              </div>
              <div className="events-team-member-info">
                <div className="events-team-member-name">{m.name}</div>
                <div className="events-team-member-email">{m.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="events-team-member-tag">Invited</span>
              <button
                type="button"
                className="events-team-member-remove-btn"
                onClick={() => onRemove(m.studentId)}
                aria-label={`Remove ${m.name}`}
                title="Remove teammate"
              >
                <Trash size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Teammate Input */}
      {canAddMore ? (
        <form className="events-team-lookup-form" onSubmit={handleLookup}>
          <div className="events-team-lookup-input-wrap">
            <MagnifyingGlass size={14} className="events-team-lookup-icon" />
            <input
              type="email"
              className="events-team-lookup-input"
              placeholder="Enter teammate's CampusCircle email…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (error) setError('');
              }}
              aria-label="Teammate email"
            />
          </div>
          <button
            type="submit"
            className="events-team-lookup-btn"
            disabled={!query.trim() || loading}
          >
            {loading ? (
              <CircleNotch size={14} className="animate-spin" />
            ) : (
              <UserPlus size={14} weight="bold" />
            )}
            Add
          </button>
        </form>
      ) : (
        <p style={{ fontSize: '0.725rem', color: '#64748B', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Check size={13} style={{ color: '#10B981' }} />
          Maximum team roster size ({targetMax} members) reached.
        </p>
      )}

      {error && (
        <p className="events-form-error">
          <Warning size={13} weight="fill" />
          {error}
        </p>
      )}

      {isRequirementMet && !error && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#1A3A2A', fontSize: '0.725rem', margin: '0.125rem 0 0', fontWeight: 600 }}>
          <Check size={13} weight="bold" />
          Team size requirement met ({currentTotal} members).
        </p>
      )}
    </div>
  );
}

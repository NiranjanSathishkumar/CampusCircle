/**
 * TeamInvitesPanel.jsx — the accept/reject mechanism for event team invites.
 * A team leader adding a teammate (at registration or via ManageTeamModal)
 * only creates a *pending* TeamMember row now (see backend teams.controller.js's
 * respondToTeamInvite) — this panel is where the invited student actually
 * confirms or declines, instead of being silently rostered.
 *
 * Lives on My Events (not a standalone route) since that's already the
 * student's hub for everything event-registration-related, and accepting an
 * invite immediately becomes a My Events entry.
 */
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Check, CircleNotch, MapPin, UsersThree, X } from '@phosphor-icons/react';
import { listMyTeamInvites, respondToTeamInvite } from '@/features/events/events.api';
import { formatEventDateTime } from '@/features/events/eventsDateUtils';
import { ApiError } from '@/shared/api/httpClient';

export default function TeamInvitesPanel({ onAccepted, onToast }) {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { invites: raw } = await listMyTeamInvites();
      setInvites(raw.filter((i) => i.event && i.registration));
    } catch {
      // Transient failure — the panel just stays empty rather than blocking the page.
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRespond = async (invite, action) => {
    if (respondingId) return;
    setRespondingId(invite._id);
    try {
      await respondToTeamInvite(invite.registration._id, invite._id, action);
      setInvites((prev) => prev.filter((i) => i._id !== invite._id));
      if (action === 'accept') {
        onToast?.(`You're on the team for ${invite.event.title}!`);
        onAccepted?.();
      } else {
        onToast?.(`Declined the invite to ${invite.event.title}.`);
      }
    } catch (err) {
      onToast?.(err instanceof ApiError ? err.message : 'Could not respond to that invite.');
    } finally {
      setRespondingId(null);
    }
  };

  if (loading || invites.length === 0) return null;

  return (
    <div className="myevents-invites-panel" role="region" aria-label="Pending team invites">
      <div className="myevents-invites-header">
        <UsersThree size={16} weight="fill" />
        <span>Team Invites</span>
        <span className="myevents-invites-count">{invites.length}</span>
      </div>

      <div className="myevents-invites-list">
        <AnimatePresence mode="popLayout">
          {invites.map((invite) => {
            const leaderName = invite.registration.student?.name || 'A team leader';
            const responding = respondingId === invite._id;
            return (
              <motion.div
                key={invite._id}
                className="myevents-invite-card"
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <div className="myevents-invite-info">
                  <p className="myevents-invite-title">
                    <strong>{leaderName}</strong> invited you to join <strong>{invite.registration.teamName}</strong>
                  </p>
                  <p className="myevents-invite-event">{invite.event.title}</p>
                  <div className="myevents-invite-meta">
                    <span><Calendar size={12} /> {formatEventDateTime(invite.event.eventDate)}</span>
                    {invite.event.venue && <span><MapPin size={12} /> {invite.event.venue}</span>}
                  </div>
                </div>
                <div className="myevents-invite-actions">
                  <button
                    type="button"
                    className="myevents-invite-btn myevents-invite-btn-accept"
                    onClick={() => handleRespond(invite, 'accept')}
                    disabled={responding}
                    aria-label={`Accept invite to ${invite.registration.teamName}`}
                  >
                    {responding ? <CircleNotch size={13} className="animate-spin" /> : <Check size={13} weight="bold" />}
                    Accept
                  </button>
                  <button
                    type="button"
                    className="myevents-invite-btn myevents-invite-btn-decline"
                    onClick={() => handleRespond(invite, 'decline')}
                    disabled={responding}
                    aria-label={`Decline invite to ${invite.registration.teamName}`}
                  >
                    <X size={13} weight="bold" />
                    Decline
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { motion } from 'motion/react';
import { useState } from 'react';
import { Calendar, MapPin, ShieldCheck, Ticket, Ticket as TicketIcon, Users, VideoCamera, Warning } from '@phosphor-icons/react';
import { computeCountdownStatus } from '@/features/events/eventsDateUtils';

/* ─────────────────────────────────────────────────────────────
   REGISTERED EVENT CARD
   ───────────────────────────────────────────────────────────── */
export default function RegisteredEventCard({
  event,
  hasTimeConflict,
  onViewTicket,
  onCancel,
  onManageTeam,
}) {
  const [imgError, setImgError] = useState(false);
  const countdown = computeCountdownStatus(event.rawDate);

  const getBadgeClass = () => {
    if (countdown.isPast) return 'completed';
    if (countdown.isToday) return 'today';
    if (countdown.daysLeft === 1) return 'tomorrow';
    return 'future';
  };

  return (
    <motion.article
      className="myevents-card"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      role="article"
      aria-label={event.title}
    >
      {/* Cover Image & Countdown Badge */}
      <div className="myevents-card-cover">
        {!imgError && event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="myevents-card-cover-img" loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div
            className="myevents-card-cover-img"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: `linear-gradient(135deg, ${event.hostColor || '#1A3A2A'}cc, ${event.hostColor || '#1A3A2A'}55)` }}
            role="img"
            aria-label={`${event.hostName} event`}
          >
            {event.hostIcon || '✦'}
          </div>
        )}
        <span className={`myevents-countdown-badge ${getBadgeClass()}`}>
          {countdown.badge}
        </span>
        {event.registrationStatus === 'waitlisted' && (
          <span className="myevents-countdown-badge" style={{ left: '0.625rem', right: 'auto', background: 'rgba(180,83,9,0.95)', color: '#fff' }}>
            Waitlisted
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="myevents-card-body">
        {/* Host row */}
        <div className="myevents-host-row">
          <div className="myevents-host-icon" style={{ background: (event.hostColor || '#1A3A2A') + '22', color: event.hostColor || '#1A3A2A' }}>
            {event.hostIcon || '✦'}
          </div>
          <span className="myevents-host-name">{event.hostName}</span>
          {event.isVerified && (
            <ShieldCheck size={13} weight="fill" style={{ color: '#1A3A2A', flexShrink: 0 }} title="Verified Organizer" />
          )}
          <span className={`event-payment-badge ${event.payment === 'FREE' ? 'free' : 'paid'}`} style={{ marginLeft: 'auto', fontSize: '0.5625rem' }}>
            {event.payment === 'FREE' ? 'Free' : `Rs. ${event.price_amount}`}
          </span>
        </div>

        {/* Title */}
        <h3 className="myevents-card-title">{event.title}</h3>

        {/* Schedule */}
        <div className="myevents-schedule-row">
          <div className="myevents-schedule-item">
            <Calendar size={14} style={{ color: '#9CA3AF' }} />
            <span>{event.dateFormatted}</span>
          </div>
          <div className="myevents-schedule-item">
            {event.isVirtual ? (
              <VideoCamera size={14} style={{ color: '#0284C7' }} />
            ) : (
              <MapPin size={14} style={{ color: '#9CA3AF' }} />
            )}
            <span style={{ color: event.isVirtual ? '#0284C7' : 'inherit' }}>
              {event.venue}
            </span>
          </div>
        </div>

        {/* Time Conflict Banner */}
        {hasTimeConflict && (
          <div className="myevents-conflict-banner">
            <Warning size={15} style={{ flexShrink: 0 }} />
            <span>⚠️ Time Conflict: Overlaps with another registered event</span>
          </div>
        )}

        {/* Team Members */}
        {event.teamMembers?.length > 0 && (
          <div className="myevents-schedule-row">
            <div className="myevents-schedule-item" style={{ minWidth: 0 }}>
              <Users size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {event.teamMembers.map((m, i) => (
                  <span key={m.id || i}>
                    {i > 0 && ', '}
                    {m.name}
                    {m.status === 'pending' && <span className="myevents-invite-pending-tag">pending</span>}
                  </span>
                ))}
              </span>
            </div>
          </div>
        )}

        {/* Ticket Reference Box */}
        <div className="myevents-meta-box">
          <span>Ticket: <strong className="myevents-ticket-id-pill">{event.ticketId}</strong></span>
          <span>{event.teamSize || 'Solo'}</span>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="myevents-card-actions">
        <motion.button
          className="myevents-btn-ticket"
          onClick={() => onViewTicket(event)}
          whileTap={{ scale: 0.96 }}
          aria-label={`View digital ticket for ${event.title}`}
        >
          <TicketIcon size={15} /> My Ticket
        </motion.button>

        {!countdown.isPast && event.registrationType === 'team' && (
          <motion.button
            className="myevents-btn-manage-team"
            onClick={() => onManageTeam(event)}
            whileTap={{ scale: 0.96 }}
            aria-label={`Manage team for ${event.title}`}
          >
            <Users size={14} /> Team
          </motion.button>
        )}

        {!countdown.isPast && (
          <motion.button
            className="myevents-btn-cancel"
            onClick={() => onCancel(event)}
            whileTap={{ scale: 0.96 }}
            aria-label={`Cancel registration for ${event.title}`}
          >
            Cancel
          </motion.button>
        )}
      </div>
    </motion.article>
  );
}

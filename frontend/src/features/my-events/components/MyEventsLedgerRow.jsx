import { motion } from 'motion/react';
import { Calendar, MapPin, Ticket, Ticket as TicketIcon, VideoCamera, Warning } from '@phosphor-icons/react';
import { computeCountdownStatus } from '@/features/events/eventsDateUtils';

/* ─────────────────────────────────────────────────────────────
   MY EVENTS LEDGER ROW — Compact Ledger List View
   ───────────────────────────────────────────────────────────── */
export default function MyEventsLedgerRow({ index, event, hasTimeConflict, onViewTicket, onCancel, onManageTeam }) {
  const countdown = computeCountdownStatus(event.rawDate);

  const badgeColors = {
    completed: '#6B7280',
    today: '#991B1B',
    tomorrow: '#B45309',
    future: '#1A3A2A',
  };
  const badgeClass = countdown.isPast ? 'completed' : countdown.isToday ? 'today' : countdown.daysLeft === 1 ? 'tomorrow' : 'future';

  return (
    <div className="cc-ledger-row" role="listitem" aria-label={event.title} style={{ cursor: 'default' }}>
      <span className="cc-ledger-index">{String(index + 1).padStart(2, '0')}</span>

      <span className="cc-ledger-thumb" style={{ background: `linear-gradient(135deg, ${event.hostColor || '#1A3A2A'}cc, ${event.hostColor || '#1A3A2A'}66)` }}>
        {event.imageUrl ? <img src={event.imageUrl} alt="" /> : event.hostIcon}
      </span>

      <span className="cc-ledger-main">
        <span className="cc-ledger-title-row">
          <span className="cc-ledger-title">{event.title}</span>
          <span className="cc-ledger-badge" style={{ color: badgeColors[badgeClass], background: badgeColors[badgeClass] + '14' }}>
            {countdown.badge}
          </span>
          {hasTimeConflict && (
            <span className="cc-ledger-badge" style={{ color: '#991B1B', background: 'rgba(153,27,27,0.1)' }}>
              <Warning size={9} style={{ marginRight: 2, verticalAlign: '-1px' }} />
              Conflict
            </span>
          )}
          {event.registrationStatus === 'waitlisted' && (
            <span className="cc-ledger-badge" style={{ color: '#B45309', background: 'rgba(180,83,9,0.1)' }}>
              Waitlisted
            </span>
          )}
        </span>
        <span className="cc-ledger-meta">
          <span className="cc-ledger-meta-item"><Calendar size={11} />{event.dateFormatted}</span>
          <span className="cc-ledger-meta-item cc-ledger-meta-hide-mobile">
            {event.isVirtual ? <VideoCamera size={11} /> : <MapPin size={11} />}
            {event.venue}
          </span>
          <span className="cc-ledger-meta-item cc-ledger-meta-hide-mobile">{event.hostName}</span>
          <span className="cc-ledger-meta-item">Ticket: {event.ticketId}</span>
        </span>
      </span>

      <span className="cc-ledger-actions">
        <motion.button
          className="myevents-btn-ticket"
          onClick={() => onViewTicket(event)}
          whileTap={{ scale: 0.96 }}
          aria-label={`View digital ticket for ${event.title}`}
        >
          <TicketIcon size={14} /> Ticket
        </motion.button>
        {!countdown.isPast && event.registrationType === 'team' && (
          <motion.button
            className="myevents-btn-manage-team"
            onClick={() => onManageTeam(event)}
            whileTap={{ scale: 0.96 }}
            aria-label={`Manage team for ${event.title}`}
          >
            Team
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
      </span>
    </div>
  );
}

import { motion } from 'motion/react';
import { Calendar, MapPin } from '@phosphor-icons/react';
import { formatDateBadge } from '@/features/events/eventsFilters';
import { MorphBookmark } from '@/features/events/components/EventMotion';

/* ─────────────────────────────────────────────────────────────
   EVENT LEDGER ROW — Compact Ledger List View
   ───────────────────────────────────────────────────────────── */

export default function EventLedgerRow({ index, event, isRegistered, isSaved, isWaitlisted, onViewDetails, onRegister, onToggleSave, onNavigateToLogin, isLoggedIn }) {
  const liveRegistered = event._liveRegistered ?? event.registered_count;
  const liveStatus = event.statusBadge;
  const isPast = event.isPast || event.registrationClosed;
  const isSoldOut = liveRegistered >= event.capacity;
  const blockedSoldOut = isSoldOut && !event.allowWaitlist && !isRegistered;
  const dateBadge = formatDateBadge(event.date);

  const regBtnLabel = isPast
    ? 'Concluded'
    : isRegistered
    ? (isWaitlisted ? 'Waitlisted' : 'Registered')
    : blockedSoldOut
    ? 'Sold Out'
    : isSoldOut
    ? 'Join Waitlist'
    : 'Register';

  const regDisabled = isPast || isRegistered || blockedSoldOut;

  const handleRegClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) { onNavigateToLogin(); return; }
    if (regDisabled) return;
    onRegister(event.id);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) { onNavigateToLogin(); return; }
    onToggleSave(event.id);
  };

  const statusColors = {
    'Open': '#1A3A2A',
    'Filling Fast': '#B45309',
    'Almost Full': '#991B1B',
    'Sold Out': '#374151',
  };

  const handleRowKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onViewDetails(event.id);
    }
  };

  return (
    // A div, not a button: this row nests a bookmark button and a register
    // button, and a <button> can't legally contain interactive descendants —
    // browsers and assistive tech disagree about what the inner controls even
    // are inside one. role/tabIndex/keydown put the row's own activation back.
    // (MyEventsLedgerRow already renders the same class as a div.)
    <motion.div
      className="cc-ledger-row"
      onClick={() => onViewDetails(event.id)}
      onKeyDown={handleRowKeyDown}
      role="listitem"
      tabIndex={0}
      aria-label={event.title}
      style={{ cursor: 'pointer' }}
    >
      <span className="cc-ledger-index">{String(index + 1).padStart(2, '0')}</span>

      <span className="cc-ledger-thumb" style={{ background: `linear-gradient(135deg, ${event.hostColor}cc, ${event.hostColor}66)` }}>
        {event.imageUrl ? <img src={event.imageUrl} alt="" /> : event.hostIcon}
      </span>

      <span className="cc-ledger-main">
        <span className="cc-ledger-title-row">
          <span className="cc-ledger-title">{event.title}</span>
          <span
            className="cc-ledger-badge"
            style={{ color: statusColors[liveStatus] || '#6B7280', background: (statusColors[liveStatus] || '#6B7280') + '14' }}
          >
            {liveStatus}
          </span>
          <span className={`event-payment-badge ${event.payment === 'Free' ? 'free' : 'paid'}`} style={{ fontSize: '0.55rem' }}>
            {event.payment === 'Free' ? 'Free' : `Rs. ${event.price_amount}`}
          </span>
        </span>
        <span className="cc-ledger-meta">
          <span className="cc-ledger-meta-item"><Calendar size={11} />{dateBadge.day} {dateBadge.month}</span>
          <span className="cc-ledger-meta-item cc-ledger-meta-hide-mobile"><MapPin size={11} />{event.venue || 'TBA'}</span>
          <span className="cc-ledger-meta-item cc-ledger-meta-hide-mobile">{event.hostName}</span>
          <span className="cc-ledger-meta-item">{liveRegistered}/{event.capacity} seats</span>
        </span>
      </span>

      <span className="cc-ledger-actions">
        <motion.button
          className={`event-card-bookmark ${isSaved ? 'saved' : ''}`}
          onClick={handleSaveClick}
          whileTap={{ scale: 0.82 }}
          aria-label={isSaved ? `Remove ${event.title} from saved` : `Save ${event.title}`}
          aria-pressed={isSaved}
          style={{ position: 'static' }}
        >
          <MorphBookmark isSaved={isSaved} size={15} />
        </motion.button>
        <button
          className={`event-card-btn-register ${isRegistered ? 'registered' : ''} ${isWaitlisted ? 'waitlisted' : ''}`}
          onClick={handleRegClick}
          disabled={regDisabled}
          aria-label={`${regBtnLabel} for ${event.title}`}
        >
          {regBtnLabel}
        </button>
      </span>
    </motion.div>
  );
}

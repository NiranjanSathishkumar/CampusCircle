import { motion } from 'motion/react';
import { useState } from 'react';
import { Calendar, MapPin, Sparkle, Ticket } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   FEATURED SPOTLIGHT BANNER
   ───────────────────────────────────────────────────────────── */

export default function FeaturedEventBanner({ event, isRegistered, isWaitlisted, onViewDetails, onRegister, onNavigateToLogin, isLoggedIn }) {
  const [imgError, setImgError] = useState(false);
  if (!event) return null;
  const liveRegistered = event._liveRegistered ?? event.registered_count;
  const isSoldOut = liveRegistered >= event.capacity;
  const isPast = event.isPast || event.registrationClosed;
  const blockedSoldOut = isSoldOut && !event.allowWaitlist && !isRegistered;
  const regDisabled = isPast || isRegistered || blockedSoldOut;

  const handleRegClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) { onNavigateToLogin(); return; }
    if (regDisabled) return;
    onRegister(event.id);
  };

  const regLabel = isPast
    ? 'Event Concluded'
    : isRegistered
    ? (isWaitlisted ? 'On Waitlist 🎟️' : 'Registered 🎟️')
    : blockedSoldOut
    ? 'Sold Out'
    : isSoldOut
    ? 'Join Waitlist'
    : 'Register Now';

  return (
    <motion.div
      className="events-spotlight-banner"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="events-spotlight-content">
        <div>
          <span className="events-spotlight-badge">
            <Sparkle size={12} weight="fill" />
            Campus Flagship Event
          </span>
          <h2 className="events-spotlight-title" style={{ marginTop: '0.625rem' }}>{event.title}</h2>
          <p className="events-spotlight-desc" style={{ marginTop: '0.5rem' }}>{event.description}</p>
        </div>

        <div className="events-spotlight-meta-row">
          <span className="events-spotlight-meta-item">
            <Calendar size={14} style={{ color: '#F59E0B' }} />
            {event.dateFormatted}
          </span>
          <span className="events-spotlight-meta-item">
            <MapPin size={14} style={{ color: '#F59E0B' }} />
            {event.venue}
          </span>
          <span className="events-spotlight-meta-item">
            <Ticket size={14} style={{ color: '#F59E0B' }} />
            {event.payment === 'Free' ? 'Free Entry' : `Rs. ${event.price_amount}`}
          </span>
        </div>

        <div className="events-spotlight-actions">
          <motion.button
            className="btn-primary"
            style={{ fontSize: '0.8125rem', padding: '0.625rem 1.25rem', borderRadius: 4 }}
            onClick={handleRegClick}
            disabled={regDisabled}
            whileTap={regDisabled ? undefined : { scale: 0.96 }}
            whileHover={regDisabled ? undefined : { y: -1 }}
          >
            {regLabel}
          </motion.button>
          <motion.button
            className="btn-secondary"
            style={{ fontSize: '0.8125rem', padding: '0.625rem 1.25rem', borderRadius: 4, background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
            onClick={() => onViewDetails(event.id)}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -1 }}
          >
            View Details
          </motion.button>
        </div>
      </div>

      <div className="events-spotlight-img-wrap">
        {!imgError && event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="events-spotlight-img" onError={() => setImgError(true)} />
        ) : (
          <div
            className="events-spotlight-img"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', background: `linear-gradient(135deg, ${event.hostColor}cc, ${event.hostColor}55)` }}
            role="img"
            aria-label={`${event.hostName} event`}
          >
            {event.hostIcon}
          </div>
        )}
        <div className="events-spotlight-overlay" />
      </div>
    </motion.div>
  );
}

import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { BellRinging, CheckCircle, Calendar, Clock, MapPin, ShieldCheck, Users } from '@phosphor-icons/react';
import { formatDateBadge, getProgressColor } from '@/features/events/eventsFilters';
import { GSAPDigitRoll, GSAPProgressBar, GSAPStatusBadge, MorphBookmark } from '@/features/events/components/EventMotion';

/* ─────────────────────────────────────────────────────────────
   EVENT CARD
   ───────────────────────────────────────────────────────────── */

export default function EventCard({ event, isRegistered, isSaved, isWaitlisted, onViewDetails, onRegister, onToggleSave, onNavigateToLogin, isLoggedIn }) {
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef(null);

  const liveRegistered = event._liveRegistered ?? event.registered_count;
  const liveStatus = event.statusBadge;
  const pct = Math.min(liveRegistered / event.capacity, 1);
  const barColor = getProgressColor(pct);
  const dateBadge = formatDateBadge(event.date);
  const isPast = event.isPast;
  const isRegistrationClosed = event.registrationClosed;
  const isSoldOut = liveRegistered >= event.capacity;
  // Sold out with no waitlist is the only state that actually blocks
  // registering — everything else (including a sold-out-but-waitlisted
  // event) still opens the dialog, since the backend decides
  // confirmed-vs-waitlisted for real when the request lands.
  const blockedSoldOut = isSoldOut && !event.allowWaitlist && !isRegistered;

  const regBtnLabel = isPast
    ? 'Concluded'
    : isRegistrationClosed
    ? 'Closed'
    : isRegistered
    ? (isWaitlisted ? 'Waitlisted' : 'Registered')
    : blockedSoldOut
    ? 'Sold Out'
    : isSoldOut
    ? 'Join Waitlist'
    : 'Register';

  const regDisabled = isPast || isRegistrationClosed || isRegistered || blockedSoldOut;

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

  const handlePointerMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <motion.article
      ref={cardRef}
      className="event-card"
      onClick={() => onViewDetails(event.id)}
      onMouseMove={handlePointerMove}
      role="article"
      aria-label={event.title}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
    >
      {/* Cover image */}
      <div className="event-card-img-wrap">
        {!imgError && event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={`Cover for ${event.title}`}
            className="event-card-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="event-card-img-fallback"
            style={{ background: `linear-gradient(135deg, ${event.hostColor}cc, ${event.hostColor}44)` }}
            role="img"
            aria-label={`${event.hostName} event`}
          >
            {event.hostIcon}
          </div>
        )}

        {/* Date badge */}
        <div className="event-card-date-badge" aria-label={`Date: ${event.dateFormatted}`}>
          <span className="event-card-date-day">{dateBadge.day}</span>
          <span className="event-card-date-month">{dateBadge.month}</span>
        </div>

        {/* Bookmark */}
        <motion.button
          className={`event-card-bookmark ${isSaved ? 'saved' : ''}`}
          onClick={handleSaveClick}
          whileTap={{ scale: 0.82 }}
          aria-label={isSaved ? `Remove ${event.title} from saved` : `Save ${event.title}`}
          aria-pressed={isSaved}
        >
          <MorphBookmark isSaved={isSaved} size={16} />
        </motion.button>

        {/* Bottom badges */}
        <div className="event-card-category">
          <span className="event-category-badge">{event.category}</span>
        </div>
        <div className="event-card-payment">
          <span className={`event-payment-badge ${event.payment === 'Free' ? 'free' : 'paid'}`}>
            {event.payment === 'Free' ? 'Free' : `Rs. ${event.price_amount}`}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="event-card-body">
        {/* Host row */}
        <div className="event-card-host-row">
          <div
            className="event-card-host-icon"
            style={{ background: event.hostColor + '22' }}
            aria-hidden="true"
          >
            {event.communityLogoUrl ? (
              <img src={event.communityLogoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              event.hostIcon
            )}
          </div>
          <span className="event-card-host-name">{event.hostName}</span>
          {event.isVerified && (
            <span className="event-card-verified" aria-label="Verified organizer">
              <ShieldCheck size={11} weight="fill" style={{ color: '#1A3A2A' }} />
              Verified
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="event-card-title">{event.title}</h3>

        {/* Meta */}
        <div className="event-card-meta" aria-label="Event details">
          <div className="event-card-meta-row">
            <Calendar size={13} className="event-card-meta-icon" aria-hidden="true" />
            <span>{event.dateFormatted || 'TBA'}</span>
          </div>
          <div className="event-card-meta-row">
            <MapPin size={13} className="event-card-meta-icon" aria-hidden="true" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.venue || 'TBA'}
            </span>
          </div>
          <div className="event-card-meta-row">
            <Users size={13} className="event-card-meta-icon" aria-hidden="true" />
            <span>{event.teamFormat || 'Solo'}</span>
          </div>
          {event.registrationDeadlineFormatted && !isPast && (
            <div className="event-card-meta-row" style={{ color: isRegistrationClosed ? '#991B1B' : undefined }}>
              <Clock size={13} className="event-card-meta-icon" aria-hidden="true" />
              <span>{isRegistrationClosed ? 'Registration closed' : `Register by: ${event.registrationDeadlineFormatted}`}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {event.tags?.length > 0 && (
          <div className="event-card-tags" aria-label="Tags">
            {event.tags.slice(0, 4).map(tag => (
              <span key={tag} className="event-card-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="event-card-footer">
        {/* Progress */}
        <div className="event-card-progress-row" aria-live="polite">
          <GSAPProgressBar pct={pct} liveRegistered={liveRegistered} capacity={event.capacity} />
          <span className="event-card-seat-label">
            <GSAPDigitRoll value={liveRegistered} />/{event.capacity}
          </span>
          <GSAPStatusBadge status={liveStatus} style={{ fontSize: '0.5rem', padding: '0.1875rem 0.375rem' }} />
        </div>

        {/* Actions */}
        <div className="event-card-actions">
          <motion.button
            className="event-card-btn-details"
            onClick={(e) => { e.stopPropagation(); onViewDetails(event.id); }}
            whileTap={{ scale: 0.96 }}
            aria-label={`View details for ${event.title}`}
          >
            Details
          </motion.button>
          <motion.button
            className={`event-card-btn-register ${isRegistered ? 'registered' : ''} ${isWaitlisted ? 'waitlisted' : ''}`}
            onClick={handleRegClick}
            disabled={regDisabled}
            whileTap={regDisabled ? undefined : { scale: 0.96 }}
            aria-label={`${regBtnLabel} for ${event.title}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={regBtnLabel}
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                style={{ display: 'inline-flex', alignItems: 'center' }}
              >
                {isRegistered
                  ? <><CheckCircle size={13} weight="fill" style={{ marginRight: 4 }} />{regBtnLabel}</>
                  : !blockedSoldOut && isSoldOut
                  ? <><BellRinging size={13} style={{ marginRight: 4 }} />{regBtnLabel}</>
                  : regBtnLabel
                }
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

import { motion } from 'motion/react';
import { useState } from 'react';
import { Calendar, MapPin, Receipt, ShieldCheck, Ticket, Ticket as TicketIcon, Users, VideoCamera, Warning, Clock, XCircle, Eye, FileImage } from '@phosphor-icons/react';
import { computeCountdownStatus } from '@/features/events/eventsDateUtils';

/* ─────────────────────────────────────────────────────────────
   REGISTERED EVENT CARD
   ───────────────────────────────────────────────────────────── */
export default function RegisteredEventCard({
  event,
  hasTimeConflict,
  onViewTicket,
  onPayOrViewProof,
  onCancel,
  onManageTeam,
}) {
  const [imgError, setImgError] = useState(false);
  const countdown = computeCountdownStatus(event.rawDate);
  const isPaidEvent = event.price_amount > 0 || event.payment === 'PAID';

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
        {event.registrationStatus === 'waitlisted' ? (
          <span className="myevents-countdown-badge" style={{ left: '0.625rem', right: 'auto', background: 'rgba(180,83,9,0.95)', color: '#fff' }}>
            Waitlisted
          </span>
        ) : isPaidEvent && event.paymentStatus !== 'confirmed' ? (
          <span
            className="myevents-countdown-badge"
            style={{
              left: '0.625rem',
              right: 'auto',
              background: event.paymentStatus === 'proof_submitted'
                ? 'rgba(217, 119, 6, 0.95)'
                : event.paymentStatus === 'rejected'
                ? 'rgba(220, 38, 38, 0.95)'
                : 'rgba(37, 99, 235, 0.95)',
              color: '#fff',
            }}
          >
            {event.paymentStatus === 'proof_submitted'
              ? 'Verification Pending'
              : event.paymentStatus === 'rejected'
              ? 'Payment Rejected'
              : 'Payment Required'}
          </span>
        ) : null}
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

        {/* Rejection Reason notice */}
        {isPaidEvent && event.paymentStatus === 'rejected' && event.paymentRejectionReason && (
          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-800 font-mono">
            <strong>Rejection Reason:</strong> {event.paymentRejectionReason}
          </div>
        )}

        {/* Uploaded Payment Proof Thumbnail Preview */}
        {isPaidEvent && event.paymentProof?.url && (
          <div className="flex items-center gap-2.5 p-2 bg-[#FAF8F5] border border-[#E6E1D5] rounded-lg">
            <div
              className="w-10 h-10 rounded overflow-hidden bg-gray-200 shrink-0 border border-gray-300 cursor-pointer group relative"
              onClick={() => onPayOrViewProof?.(event)}
              title="Click to preview payment screenshot"
            >
              <img
                src={event.paymentProof.url}
                alt="Proof"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-gray-800 font-mono block">
                Payment Screenshot Uploaded
              </span>
              <span className="text-[10px] text-gray-500 truncate block font-mono">
                {event.paymentProof.filename || 'payment_proof.jpg'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onPayOrViewProof?.(event)}
              className="text-[11px] text-[#1A3A2A] font-bold hover:underline shrink-0 flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded border border-[#D8D2C4]"
            >
              <Eye size={12} />
              <span>Preview</span>
            </button>
          </div>
        )}

        {/* Ticket Reference Box */}
        <div className="myevents-meta-box">
          {isPaidEvent && event.paymentStatus !== 'confirmed' ? (
            <span className="text-[11px] font-mono text-amber-800 font-semibold flex items-center gap-1">
              {event.paymentStatus === 'proof_submitted' ? (
                <>
                  <Clock size={13} className="text-amber-600" />
                  <span>Proof in Review</span>
                </>
              ) : event.paymentStatus === 'rejected' ? (
                <>
                  <XCircle size={13} className="text-red-600" />
                  <span>Proof Rejected</span>
                </>
              ) : (
                <>
                  <Receipt size={13} className="text-blue-600" />
                  <span>Slot Reserved · Unpaid</span>
                </>
              )}
            </span>
          ) : (
            <span>Ticket: <strong className="myevents-ticket-id-pill">{event.ticketId || 'Active Pass'}</strong></span>
          )}
          <span>{event.teamSize || 'Solo'}</span>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="myevents-card-actions">
        {isPaidEvent && event.paymentStatus !== 'confirmed' ? (
          <motion.button
            className={`myevents-btn-ticket ${
              event.paymentStatus === 'proof_submitted'
                ? '!bg-amber-600 hover:!bg-amber-700 !text-white'
                : event.paymentStatus === 'rejected'
                ? '!bg-red-600 hover:!bg-red-700 !text-white'
                : '!bg-[#1A3A2A] hover:!bg-[#12281D] !text-white'
            }`}
            onClick={() => onPayOrViewProof?.(event)}
            whileTap={{ scale: 0.96 }}
            aria-label={`Pay or view proof for ${event.title}`}
          >
            <Receipt size={15} />
            <span>
              {event.paymentStatus === 'proof_submitted'
                ? 'Proof Status'
                : event.paymentStatus === 'rejected'
                ? 'Re-upload Proof'
                : 'Pay & Upload Proof'}
            </span>
          </motion.button>
        ) : (
          <motion.button
            className="myevents-btn-ticket"
            onClick={() => onViewTicket(event)}
            whileTap={{ scale: 0.96 }}
            aria-label={`View digital ticket for ${event.title}`}
          >
            <TicketIcon size={15} /> My Ticket
          </motion.button>
        )}

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

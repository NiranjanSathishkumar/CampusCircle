import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { DownloadSimple, Ticket, Ticket as TicketIcon, X } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   DIGITAL PASSBOOK TICKET MODAL
   ───────────────────────────────────────────────────────────── */
export default function DigitalTicketModal({ event, user, onClose, onDownload }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    modalRef.current?.focus();
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
      prev?.focus?.();
    };
  }, [onClose]);

  if (!event) return null;

  const attendeeName = user?.name || 'Registered Student';
  const attendeeRoll = user?.rollNo || '—';
  const isUnconfirmedPaid = (event.price_amount > 0 || event.payment === 'PAID') && event.paymentStatus !== 'confirmed';

  return (
    <motion.div
      className="ticket-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
    >
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        className="ticket-pass-card"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{ outline: 'none' }}
      >
        {/* Pass Header */}
        <div className="ticket-pass-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TicketIcon size={20} style={{ color: event.registrationStatus === 'waitlisted' ? '#F59E0B' : '#4ADE80' }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              {event.registrationStatus === 'waitlisted' ? 'WAITLIST PASS' : 'OFFICIAL ADMISSION PASS'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4 }}
            aria-label="Close ticket modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pass Body */}
        <div className="ticket-pass-body">
          {/* Prominent Ticket ID */}
          {event.ticketId && !isUnconfirmedPaid ? (
            <div className="ticket-id-banner">
              <span>{event.ticketId}</span>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs text-center font-mono">
              Verification Required &bull; Ticket Pass Not Yet Active
            </div>
          )}

          {/* Scannable QR — only rendered when ticket is confirmed */}
          {event.ticketId && !isUnconfirmedPaid ? (
            <div className="ticket-qr-visual">
              <QRCodeSVG
                value={event.ticketId}
                size={132}
                bgColor="#FFFFFF"
                fgColor="#0F172A"
                level="M"
                title={`QR check-in code ${event.ticketId}`}
              />
            </div>
          ) : isUnconfirmedPaid ? (
            <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl text-center space-y-2">
              <div className="text-xs font-bold text-amber-950 font-['Space_Grotesk']">
                Payment Verification in Progress
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed max-w-sm mx-auto">
                Your admission ticket and door check-in QR code will be generated once the event organizer verifies and confirms your payment proof.
              </p>
            </div>
          ) : null}

          {/* Event Title */}
          <div>
            <span className="event-category-badge" style={{ marginBottom: 4 }}>{event.category}</span>
            <h2 id="ticket-modal-title" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '4px 0' }}>
              {event.title}
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8125rem', color: '#991B1B', fontWeight: 600, margin: 0 }}>
              Hosted by {event.hostName} {event.isVerified && '✓ Verified'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="profile-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div className="profile-detail-card" style={{ padding: '0.75rem' }}>
              <span className="profile-detail-label">Attendee Name</span>
              <p className="profile-detail-value">{attendeeName}</p>
            </div>
            <div className="profile-detail-card" style={{ padding: '0.75rem' }}>
              <span className="profile-detail-label">Roll Number</span>
              <p className="profile-detail-value" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{attendeeRoll}</p>
            </div>
            <div className="profile-detail-card" style={{ padding: '0.75rem' }}>
              <span className="profile-detail-label">Date & Time</span>
              <p className="profile-detail-value" style={{ fontSize: '0.8125rem' }}>{event.dateFormatted} · {event.startTime}</p>
            </div>
            <div className="profile-detail-card" style={{ padding: '0.75rem' }}>
              <span className="profile-detail-label">Venue / Location</span>
              <p className="profile-detail-value" style={{ fontSize: '0.8125rem' }}>{event.venue}</p>
            </div>
            {event.teamMembers?.length > 0 && (
              <div className="profile-detail-card" style={{ padding: '0.75rem', gridColumn: '1 / -1' }}>
                <span className="profile-detail-label">Team Members</span>
                <p className="profile-detail-value" style={{ fontSize: '0.8125rem' }}>
                  {event.teamMembers.map((m) => m.name + (m.status === 'pending' ? ' (pending)' : '')).join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #D8D2C4' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.625rem', color: '#6B7280' }}>
              Entry: {event.payment === 'FREE' ? 'Free Admission' : `Paid (Rs. ${event.price_amount})`} · {event.teamSize || 'Solo'}
            </span>
            <motion.button
              className="btn-primary"
              onClick={() => onDownload(event)}
              whileTap={{ scale: 0.96 }}
              style={{ fontSize: '0.8125rem' }}
            >
              <DownloadSimple size={15} /> Download Ticket
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

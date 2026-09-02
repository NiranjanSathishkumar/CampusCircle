import { motion } from 'motion/react';
import { CircleNotch, Ticket, Warning, X } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   REGISTRATION CANCELLATION CONFIRMATION MODAL
   ───────────────────────────────────────────────────────────── */
export default function CancellationModal({ event, onConfirm, onClose, confirming = false }) {
  if (!event) return null;

  return (
    <motion.div
      className="ticket-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <motion.div
        className="events-dialog"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="events-dialog-header">
          <h2 className="events-dialog-title" id="cancel-modal-title" style={{ color: '#991B1B' }}>
            Cancel Registration?
          </h2>
          <button className="events-dialog-close" onClick={onClose}><X size={15} /></button>
        </div>

        <div className="events-dialog-body">
          <div className="events-conflict-notice" style={{ background: 'rgba(153, 27, 27, 0.08)', borderColor: 'rgba(153, 27, 27, 0.25)' }}>
            <Warning size={20} style={{ color: '#991B1B', flexShrink: 0, marginTop: 2 }} />
            <p className="events-conflict-text" style={{ color: '#991B1B' }}>
              Are you sure you want to cancel your seat for <strong>{event.title}</strong>?
            </p>
          </div>

          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8125rem', color: '#374151', margin: '0.875rem 0 0', lineHeight: 1.5 }}>
            This action cannot be undone. Your reserved seat will be released back to the event capacity so other students can enroll.
          </p>
        </div>

        <div className="events-dialog-footer">
          <motion.button className="events-dialog-cancel" onClick={onClose} disabled={confirming} whileTap={{ scale: 0.97 }}>
            Keep Ticket
          </motion.button>
          <motion.button className="btn-danger" onClick={onConfirm} disabled={confirming} whileTap={{ scale: 0.97 }} style={{ flex: 1 }}>
            {confirming ? <CircleNotch size={15} className="animate-spin" style={{ marginRight: 4 }} /> : null}
            {confirming ? 'Cancelling…' : 'Confirm Cancellation'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

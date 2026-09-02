import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { Ticket, X } from '@phosphor-icons/react';
import EventRegistrationForm from '@/features/events/components/EventRegistrationForm';

/* ─────────────────────────────────────────────────────────────
   REGISTRATION DIALOG (events hub — from a card/ledger row)
   ───────────────────────────────────────────────────────────── */

export default function EventsRegistrationDialog({ event, leaderId, conflictTitle, onSuccess, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    dialogRef.current?.focus();
    const handle = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div
      className="events-dialog-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reg-hub-dialog-title"
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        className="events-dialog"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{ outline: 'none' }}
      >
        <div className="events-dialog-header">
          <div className="events-dialog-header-left">
            <span className="events-dialog-header-badge">
              <Ticket size={12} weight="fill" />
              Event Pass
            </span>
            <h2 className="events-dialog-title" id="reg-hub-dialog-title">
              Participate in Event
            </h2>
          </div>
          <button
            type="button"
            className="events-dialog-close"
            onClick={onClose}
            aria-label="Close registration dialog"
            title="Close (Esc)"
          >
            <X size={15} weight="bold" />
          </button>
        </div>

        <EventRegistrationForm
          event={event}
          leaderId={leaderId}
          conflictTitle={conflictTitle}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * ConfirmDialog.jsx — styled stand-in for window.confirm(), used across
 * student profile and organizer portals whenever an action requires explicit confirmation.
 * Closes on Escape/backdrop click unless a confirm is already in flight.
 */
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Warning, X, CircleNotch } from '@phosphor-icons/react';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Remove',
  cancelLabel = 'Cancel',
  isConfirming = false,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isConfirming) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, isConfirming]);

  return (
    <motion.div
      className="events-dialog-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget && !isConfirming) onCancel(); }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <motion.div
        className="events-dialog"
        style={{ maxWidth: 440 }}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="events-dialog-header">
          <h2 className="events-dialog-title" id="confirm-dialog-title" style={{ color: '#991B1B' }}>{title}</h2>
          <button className="events-dialog-close" onClick={onCancel} disabled={isConfirming} aria-label="Close dialog">
            <X size={15} />
          </button>
        </div>

        <div className="events-dialog-body">
          <div className="events-conflict-notice" style={{ background: 'rgba(153,27,27,0.08)', borderColor: 'rgba(153,27,27,0.25)' }}>
            <Warning size={18} weight="fill" style={{ color: '#991B1B', flexShrink: 0, marginTop: 2 }} />
            <p className="events-conflict-text" style={{ color: '#991B1B' }}>{message}</p>
          </div>
        </div>

        <div className="events-dialog-footer">
          <button className="events-dialog-cancel" onClick={onCancel} disabled={isConfirming}>
            {cancelLabel}
          </button>
          <button className="btn-danger" style={{ flex: 1 }} onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <CircleNotch size={14} className="animate-spin" /> Removing…
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

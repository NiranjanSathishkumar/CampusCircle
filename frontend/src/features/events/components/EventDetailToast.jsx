import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   TOAST (local to detail page)
   ───────────────────────────────────────────────────────────── */

export default function EventDetailToast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="events-toast-container"
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <div className="events-toast">
            <CheckCircle size={15} weight="fill" style={{ color: '#4ADE80', flexShrink: 0 }} />
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

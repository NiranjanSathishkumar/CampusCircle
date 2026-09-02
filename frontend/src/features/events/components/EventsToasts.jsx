/**
 * Toast queue + renderer for the events hub.
 */
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { CheckCircle } from '@phosphor-icons/react';

let _toastId = 0;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message) => {
    const id = ++_toastId;
    setToasts(t => [...t, { id, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, addToast };
}

export function ToastContainer({ toasts }) {
  return (
    <div className="events-toast-container" aria-live="polite" aria-atomic="false">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            className="events-toast"
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <CheckCircle size={15} weight="fill" style={{ color: '#4ADE80', flexShrink: 0 }} />
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

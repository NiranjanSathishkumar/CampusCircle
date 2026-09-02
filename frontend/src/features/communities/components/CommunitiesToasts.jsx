/**
 * Toast queue + renderer for the communities hub.
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
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none" aria-live="polite">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="flex items-center gap-2.5 bg-[#0F172A] text-[#F5F2EA] px-4 py-3 rounded-sm shadow-xl text-xs font-sans max-w-xs border border-[#991B1B]/40"
          >
            <CheckCircle size={16} weight="fill" className="text-[#4ADE80] flex-shrink-0" />
            <span>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

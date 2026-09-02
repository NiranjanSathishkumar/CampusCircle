import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   TOAST NOTIFICATION SYSTEM
   ───────────────────────────────────────────────────────────── */

export default function DiscoverToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="flex items-center gap-2.5 bg-[#0F172A] text-[#F5F2EA] px-4 py-3 rounded-sm shadow-xl text-xs font-sans max-w-xs border border-[#991B1B]/40"
          >
            <CheckCircle weight="fill" size={16} className="text-[#4ADE80] flex-shrink-0" />
            <span className="leading-snug">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

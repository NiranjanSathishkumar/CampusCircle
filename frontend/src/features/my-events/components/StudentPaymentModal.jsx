import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { X, Receipt } from '@phosphor-icons/react';
import PaidRegistrationPaymentView from '@/features/events/components/PaidRegistrationPaymentView';

export default function StudentPaymentModal({ event, onClose, onUpdated }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    modalRef.current?.focus();
    const handle = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
      prev?.focus?.();
    };
  }, [onClose]);

  if (!event) return null;

  // Adapt event into the shapes PaidRegistrationPaymentView expects
  const registrationData = {
    _id: event.registrationId,
    status: event.registrationStatus,
    paymentStatus: event.paymentStatus,
    paymentProof: event.paymentProof,
    paymentRejectionReason: event.paymentRejectionReason,
    transactionId: event.transactionId,
    paymentNotes: event.paymentNotes,
    slotExpiresAt: event.slotExpiresAt,
    qrToken: event.ticketId,
  };

  return (
    <motion.div
      className="ticket-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#D8D2C4]"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{ outline: 'none' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E6E1D5] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1A3A2A]/10 text-[#1A3A2A] flex items-center justify-center">
              <Receipt size={18} weight="bold" />
            </div>
            <div>
              <h3 id="payment-modal-title" className="text-sm font-bold text-[#0F172A] font-['Space_Grotesk']">
                Complete Event Payment &bull; {event.title}
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">
                {event.hostName} &bull; ₹{event.price_amount}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <PaidRegistrationPaymentView
            event={event}
            registration={registrationData}
            onDone={onClose}
            onUpdated={onUpdated}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

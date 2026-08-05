import React, { useEffect, useRef } from "react";
import { useToast } from "../../context/ToastContext";

function EventRegisterModal({ event, onClose, onConfirm }) {
  const { showToast } = useToast();
  const modalRef = useRef(null);

  useEffect(() => {
    if (!event) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    if (modalRef.current) {
      modalRef.current.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [event, onClose]);

  if (!event) return null;

  return (
    <div className="ev-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Confirm Registration for ${event.title}`}
        className="ev-modal-card ev-modal-card--sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ev-modal-confirm-icon">
          <i className="fa-solid fa-ticket" />
        </div>
        <h3 className="ev-modal-confirm-title">Confirm Registration</h3>
        <p className="ev-modal-confirm-text">
          You are registering for <strong>{event.title}</strong> hosted by{" "}
          <strong>{event.hostName}</strong>.
        </p>
        <div className="ev-card-action-row" style={{ marginTop: 20 }}>
          <button className="ev-card-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="ev-card-btn-primary"
            onClick={() => {
              onConfirm(event.id);
              showToast(`Ticket confirmed for ${event.title}! Saved to My Events 🎟️`, "event");
            }}
          >
            Confirm Ticket <i className="fa-solid fa-check" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventRegisterModal;

import { useEffect } from 'react';

/**
 * useFocusTrap — Traps keyboard focus within an active modal container
 * when role="dialog" or aria-modal="true" is open, preventing focus from
 * escaping to background page elements, and locks body scroll while open.
 */
export function useFocusTrap(ref, isOpen = true, onClose = null) {
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll while modal is active
    document.body.style.overflow = 'hidden';

    const cleanupScroll = () => {
      const remainingModals = document.querySelectorAll('.org-modal-overlay, [role="dialog"]');
      if (remainingModals.length <= 1) {
        document.body.style.overflow = '';
      }
    };

    const modalElement = ref?.current;
    if (!modalElement) return cleanupScroll;

    // Focusable selector covering buttons, inputs, links, textareas, selects, and tab-indexed items
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () =>
      Array.from(modalElement.querySelectorAll(focusableSelector)).filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
      );

    const timer = setTimeout(() => {
      const focusable = getFocusable();
      if (focusable.length && !modalElement.contains(document.activeElement)) {
        focusable[0].focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (typeof onClose === 'function') {
          onClose();
        } else {
          const closeBtn = modalElement.querySelector('button[aria-label*="Close"], button[aria-label*="close"], .org-modal-header button');
          if (closeBtn) {
            closeBtn.click();
          }
        }
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (!focusable.length) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || !modalElement.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement || !modalElement.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      cleanupScroll();
    };
  }, [ref, isOpen, onClose]);
}


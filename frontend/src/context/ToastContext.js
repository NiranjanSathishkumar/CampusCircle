import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", icon = null, duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    
    // Default icons based on type or action
    let defaultIcon = "fa-circle-info";
    if (type === "success") defaultIcon = "fa-circle-check";
    if (type === "bookmark") defaultIcon = "fa-bookmark";
    if (type === "copy") defaultIcon = "fa-link";
    if (type === "buddy") defaultIcon = "fa-user-plus";
    if (type === "event") defaultIcon = "fa-ticket";
    if (type === "warning") defaultIcon = "fa-triangle-exclamation";
    if (type === "error") defaultIcon = "fa-circle-xmark";

    const toast = {
      id,
      message,
      type,
      icon: icon || defaultIcon,
    };

    setToasts((prev) => [...prev.slice(-4), toast]); // Max 5 toasts visible

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Global Toast Render Container */}
      <div className="cc-toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`cc-toast cc-toast--${toast.type}`}>
            <div className="cc-toast-icon">
              <i className={`fa-solid ${toast.icon}`} />
            </div>
            <div className="cc-toast-message">{toast.message}</div>
            <button
              className="cc-toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback stub if context isn't wrapped
    return {
      showToast: () => {},
      removeToast: () => {},
    };
  }
  return context;
}

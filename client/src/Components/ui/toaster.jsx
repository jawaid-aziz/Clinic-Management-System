// components/ui/toaster.jsx
"use client";

import React, { createContext, useCallback, useState } from "react";

export const ToastContext = createContext(null);

/**
 * Toaster acts as both the provider and the visual toast viewport.
 * Wrap your app (children) with <Toaster> in root layout.
 */
export function Toaster({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(
    ({ title = "", description = "", variant = "default", duration = 4000 }) => {
      const id = Date.now() + Math.random().toString(36).slice(2, 9);
      setToasts((s) => [...s, { id, title, description, variant }]);

      if (duration && duration > 0) {
        setTimeout(() => {
          setToasts((s) => s.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const dismiss = useCallback((id) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Toast viewport */}
      <div aria-live="polite" className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "max-w-sm w-full p-3 rounded-lg shadow-md border " +
              (t.variant === "destructive"
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-white border-slate-200 text-slate-900")
            }
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                {t.title && <div className="font-semibold">{t.title}</div>}
                {t.description && <div className="text-sm opacity-90 mt-1">{t.description}</div>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-sm opacity-70 hover:opacity-100"
                aria-label="Close toast"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default Toaster;

// components/ui/use-toast.jsx
"use client";

import { useContext } from "react";
import { ToastContext } from "./toaster";

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // helpful dev message instead of cryptic crash
    throw new Error("useToast must be used inside a Toaster provider. Wrap your app with <Toaster> in root layout.");
  }
  return ctx;
}

export default useToast;

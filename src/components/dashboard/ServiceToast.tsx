"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ServiceToastProps {
  toast: { type: "success" | "error"; message: string } | null;
  onClose: () => void;
}

export function ServiceToast({ toast, onClose }: ServiceToastProps) {
  useEffect(() => {
    if (!toast) return;
    // Auto dismiss toast after 3.5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full">
      <div
        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-xs font-medium shadow-2xl backdrop-blur-md ${
          toast.type === "success"
            ? "border-emerald-500/40 bg-stone-950/95 text-emerald-300"
            : "border-red-500/40 bg-stone-950/95 text-red-300"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="text-stone-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
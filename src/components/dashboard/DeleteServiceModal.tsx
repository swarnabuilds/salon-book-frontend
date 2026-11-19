"use client";

import React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteServiceModalProps {
  isOpen: boolean;
  serviceName: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteServiceModal({
  isOpen,
  serviceName,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteServiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-stone-800 bg-stone-950 p-6 shadow-2xl space-y-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Delete Service?</h2>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                &ldquo;{serviceName}&rdquo;
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="rounded-xl border border-stone-800 bg-stone-900 px-4 py-2 text-xs font-medium text-stone-300 hover:text-white hover:border-stone-700 disabled:opacity-50 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-500/20 hover:from-rose-400 hover:to-rose-500 disabled:opacity-60 transition cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Yes, Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
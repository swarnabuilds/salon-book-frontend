"use client";

import React from "react";
import { SalonAppointment } from "@/lib/action/appointmentActions";
import { AlertTriangle, Loader2, X, XCircle } from "lucide-react";

interface CancelAppointmentModalProps {
  appointment: SalonAppointment | null;
  isCancelling: boolean;
  onClose: () => void;
  onConfirmCancel: (appointment: SalonAppointment) => void;
  formatAppointmentDate: (dateStr?: string) => string;
}

export default function CancelAppointmentModal({
  appointment,
  isCancelling,
  onClose,
  onConfirmCancel,
  formatAppointmentDate,
}: CancelAppointmentModalProps) {
  if (!appointment) return null;

  const statusText = String(appointment.status || "pending").toLowerCase();
  const canCancel = statusText === "pending";

  return (
    <div
      onClick={() => {
        if (!isCancelling) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg space-y-5 rounded-2xl border border-rose-500/35 bg-[#181510] p-6 sm:p-7 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-400/35 bg-rose-500/15 text-rose-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-300 sm:text-sm">
                Cancel Appointment Request
              </p>
              <h2 className="mt-0.5 text-xl font-bold text-white sm:text-2xl">
                Are you sure?
              </h2>
            </div>
          </div>

          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            aria-label="Close cancel modal"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-stone-700 bg-[#14110D] text-stone-300 transition hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Appointment Summary */}
        <div className="space-y-2.5 rounded-xl border border-stone-800 bg-[#14110D] p-4 text-base">
          <p className="text-lg font-bold text-white sm:text-xl">
            {appointment.serviceName}
          </p>
          <p className="text-sm font-medium text-stone-300 sm:text-base">
            Schedule: {formatAppointmentDate(appointment.appointmentDate)} •{" "}
            {appointment.timeSlot}
          </p>
          <p className="text-base font-bold text-amber-300 sm:text-lg">
            Price: ৳{Number(appointment.servicePrice || 0).toLocaleString()}
          </p>
        </div>

        {!canCancel ? (
          <div className="rounded-xl border border-amber-400/35 bg-amber-500/10 p-3.5 text-sm font-semibold text-amber-200 sm:text-base">
            Only pending appointments can be cancelled by customers.
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-stone-300 sm:text-base">
            This will mark your appointment request as{" "}
            <span className="font-bold text-rose-300">cancelled</span>. This
            action cannot be undone.
          </p>
        )}

        {/* Footer Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-stone-700 bg-[#14110D] px-5 py-2.5 text-sm font-semibold text-stone-200 transition hover:bg-[#221D17] disabled:opacity-50 sm:text-base"
          >
            Keep Appointment
          </button>

          {canCancel && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => onConfirmCancel(appointment)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-400 disabled:opacity-50 sm:text-base"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>Confirm Cancel</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
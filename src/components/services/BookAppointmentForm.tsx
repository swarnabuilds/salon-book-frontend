"use client";

import React, { useEffect, useRef, useState } from "react";
import { createAppointment } from "@/lib/action/appointmentActions";
import { formatServiceDuration } from "@/lib/formatServiceDuration";
import {
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

interface BookAppointmentFormProps {
  serviceId: string;
  serviceName: string;
  price: number;
  duration: string | number;
  onClose?: () => void;
  onSuccess?: (message: string) => void;
}

interface ToastState {
  type: "success" | "error";
  message: string;
}

const TIME_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "01:00 PM",
  "03:00 PM",
  "04:30 PM",
  "06:00 PM",
  "07:30 PM",
];

// Customer identity is never collected here. The server derives it from the
// authenticated session, so client-side values cannot impersonate another user.
export function BookAppointmentForm({
  serviceId,
  serviceName,
  price,
  duration,
  onClose,
  onSuccess,
}: BookAppointmentFormProps) {
  const [appointmentDate, setAppointmentDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, message: msg });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const todayIso = new Date().toISOString().split("T")[0];

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        input.focus();
      }
    } else {
      input.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setToast(null);

    if (!serviceId) {
      showToast("error", "Service ID is missing. Please refresh the page.");
      return;
    }

    if (!appointmentDate || !timeSlot) {
      showToast("error", "Please select both a date and a time slot.");
      return;
    }

    setIsSubmitting(true);
    const res = await createAppointment({
      serviceId,
      appointmentDate,
      timeSlot,
      message,
    });
    setIsSubmitting(false);

    if (res.success) {
      const msg = res.message || "Appointment booked successfully!";
      showToast("success", msg);
      setAppointmentDate("");
      setTimeSlot("");
      setMessage("");
      onSuccess?.(msg);
    } else {
      showToast("error", res.message || "Failed to book appointment.");
    }
  };

  return (
    <>
      {/* Top-Right Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-5 right-5 z-50 flex items-center gap-3.5 max-w-md rounded-2xl border px-5 py-4 text-sm sm:text-base font-semibold shadow-2xl backdrop-blur-md transition-all duration-300 ${
            toast.type === "success"
              ? "border-emerald-400/50 bg-stone-950/95 text-emerald-200 shadow-emerald-950/50"
              : "border-rose-400/50 bg-stone-950/95 text-rose-200 shadow-rose-950/50"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          )}

          <span className="leading-snug">{toast.message}</span>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="rounded-3xl border border-amber-500/30 bg-stone-950/95 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Form header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Request Appointment
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {serviceName}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-stone-300">
              <span>
                Fee:{" "}
                <strong className="text-amber-400 font-bold">
                  ৳{Number(price).toLocaleString()}
                </strong>
              </span>
              <span className="text-stone-600">•</span>
              <span>
                Duration:{" "}
                <strong className="text-stone-100 font-semibold">
                  {formatServiceDuration(duration)}
                </strong>
              </span>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close booking form"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-800 bg-stone-900 text-stone-300 hover:text-white hover:border-stone-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Appointment Date with Bright Yellow/Gold Calendar Icon */}
          <div>
            <label
              htmlFor="appointmentDate"
              className="flex items-center gap-2 text-sm font-semibold text-stone-200 mb-2"
            >
              <Calendar className="h-4 w-4 text-yellow-400" />
              <span>Preferred Date</span>
            </label>
            <div className="relative flex items-center">
              <input
                ref={dateInputRef}
                id="appointmentDate"
                name="appointmentDate"
                type="date"
                min={todayIso}
                required
                value={appointmentDate}
                onClick={openDatePicker}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 pl-4 pr-12 py-3 text-base text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <button
                type="button"
                onClick={openDatePicker}
                aria-label="Open calendar picker"
                className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/15 text-yellow-400 hover:bg-yellow-400/25 hover:text-yellow-300 transition cursor-pointer"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-200 mb-2.5">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>Preferred Time Slot</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TIME_SLOTS.map((slot) => {
                const isSelected = timeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition cursor-pointer ${
                      isSelected
                        ? "border-amber-400 bg-amber-500 text-stone-950 font-bold shadow-md"
                        : "border-stone-700 bg-stone-900 text-stone-200 hover:border-amber-500/50 hover:text-white"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <label
              htmlFor="bookingMessage"
              className="flex items-center gap-2 text-sm font-semibold text-stone-200 mb-2"
            >
              <MessageSquare className="h-4 w-4 text-amber-400" />
              <span>Message / Notes (Optional)</span>
            </label>
            <textarea
              id="bookingMessage"
              name="message"
              rows={3}
              placeholder="Any styling note or request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-base text-white placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            {onClose && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="rounded-xl border border-stone-700 bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-200 hover:text-white hover:border-stone-600 disabled:opacity-50 transition cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm sm:text-base font-bold text-stone-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Booking...</span>
                </>
              ) : (
                <span>Confirm Appointment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
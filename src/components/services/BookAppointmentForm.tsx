"use client";

import React, { useState } from "react";
import { createAppointment } from "@/lib/action/appointmentActions";
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
  duration: string;
  onClose?: () => void;
  onSuccess?: (message: string) => void;
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const todayIso = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!appointmentDate || !timeSlot) {
      setErrorMsg("Please select both a date and a time slot.");
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
      setSuccessMsg(msg);
      setAppointmentDate("");
      setTimeSlot("");
      setMessage("");
      onSuccess?.(msg);
    } else {
      setErrorMsg(res.message || "Failed to book appointment.");
    }
  };

  return (
    <div className="rounded-3xl border border-amber-500/25 bg-stone-950/90 p-6 sm:p-7 shadow-2xl space-y-5">
      {/* Form header */}
      <div className="flex items-start justify-between gap-4 border-b border-stone-800/80 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            Request Appointment
          </p>
          <h3 className="text-lg font-bold text-white mt-0.5">
            {serviceName}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-stone-400">
            <span>
              Fee:{" "}
              <strong className="text-amber-400">
                ৳{Number(price).toLocaleString()}
              </strong>
            </span>
            <span>•</span>
            <span>
              Duration: <strong className="text-stone-200">{duration}</strong>
            </span>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking form"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-800 bg-stone-900 text-stone-400 hover:text-white hover:border-stone-700 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Feedback messages */}
      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Appointment Date */}
        <div>
          <label
            htmlFor="appointmentDate"
            className="flex items-center gap-1.5 text-xs font-medium text-stone-300 mb-1.5"
          >
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>Preferred Date</span>
          </label>
          <input
            id="appointmentDate"
            name="appointmentDate"
            type="date"
            min={todayIso}
            required
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="w-full rounded-xl border border-stone-800 bg-stone-900/85 px-4 py-2.5 text-xs text-white focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition"
          />
        </div>

        {/* Time Slot */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-stone-300 mb-2">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Preferred Time Slot</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isSelected = timeSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? "border-amber-400 bg-amber-500 text-stone-950 font-semibold shadow-sm"
                      : "border-stone-800 bg-stone-900/75 text-stone-300 hover:border-amber-500/40 hover:text-white"
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
            className="flex items-center gap-1.5 text-xs font-medium text-stone-300 mb-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
            <span>Message / Notes (Optional)</span>
          </label>
          <textarea
            id="bookingMessage"
            name="message"
            rows={2}
            placeholder="Any styling note or request..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-stone-800 bg-stone-900/85 px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15 transition resize-none"
          />
        </div>

        <div className="pt-1 flex items-center justify-end gap-3">
          {onClose && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl border border-stone-800 bg-stone-900 px-4 py-2.5 text-xs font-medium text-stone-300 hover:text-white hover:border-stone-700 disabled:opacity-50 transition cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-stone-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 transition cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Booking...</span>
              </>
            ) : (
              <span>Confirm Appointment</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
"use client";

import React from "react";
import { SalonAppointment } from "@/lib/action/appointmentActions";
import { MessageSquare, Scissors, X } from "lucide-react";

interface AppointmentDetailsModalProps {
  appointment: SalonAppointment | null;
  onClose: () => void;
  formatAppointmentDate: (dateStr?: string) => string;
  formatRequestDate: (dateStr?: string) => string;
  getStatusBadgeClass: (status: string) => string;
  getPaymentBadgeClass: (payment: string) => string;
}

export default function AppointmentDetailsModal({
  appointment,
  onClose,
  formatAppointmentDate,
  formatRequestDate,
  getStatusBadgeClass,
  getPaymentBadgeClass,
}: AppointmentDetailsModalProps) {
  if (!appointment) return null;

  const statusText = String(appointment.status || "pending").toLowerCase();
  const paymentText = String(
    appointment.paymentStatus || "unpaid"
  ).toLowerCase();

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl space-y-6 rounded-2xl border border-stone-700 bg-[#181510] p-6 sm:p-7 shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-700 bg-[#120F0C] text-amber-400">
              <Scissors className="h-6 w-6" />
              {appointment.serviceImage && (
                <img
                  src={appointment.serviceImage}
                  alt={appointment.serviceName}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                Appointment Details
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                {appointment.serviceName}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-stone-700 bg-[#14110D] text-stone-300 transition hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Info Grid */}
        <div className="grid grid-cols-1 gap-4 text-base sm:grid-cols-2 sm:text-lg">
          <div className="rounded-xl border border-stone-800 bg-[#14110D] p-4">
            <span className="block text-sm font-semibold text-stone-400">
              Category
            </span>
            <span className="mt-1.5 block text-base font-bold text-amber-200 sm:text-lg">
              {appointment.serviceCategory || "Salon Service"}
            </span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-[#14110D] p-4">
            <span className="block text-sm font-semibold text-stone-400">
              Service Price
            </span>
            <span className="mt-1.5 block text-xl font-extrabold text-amber-300 sm:text-2xl">
              ৳{Number(appointment.servicePrice || 0).toLocaleString()}
            </span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-[#14110D] p-4">
            <span className="block text-sm font-semibold text-stone-400">
              Appointment Schedule
            </span>
            <span className="mt-1.5 block text-base font-bold text-white sm:text-lg">
              {formatAppointmentDate(appointment.appointmentDate)} •{" "}
              {appointment.timeSlot}
            </span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-[#14110D] p-4">
            <span className="block text-sm font-semibold text-stone-400">
              Request Date
            </span>
            <span className="mt-1.5 block text-base font-bold text-white sm:text-lg">
              {formatRequestDate(appointment.createdAt)}
            </span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-[#14110D] p-4">
            <span className="block text-sm font-semibold text-stone-400">
              Appointment Status
            </span>
            <span
              className={`mt-2 inline-flex items-center rounded-md border px-3 py-1 text-sm font-bold capitalize sm:text-base ${getStatusBadgeClass(
                statusText
              )}`}
            >
              {String(appointment.status || "pending")}
            </span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-[#14110D] p-4">
            <span className="block text-sm font-semibold text-stone-400">
              Payment Status
            </span>
            <span
              className={`mt-2 inline-flex items-center rounded-md border px-3 py-1 text-sm font-bold capitalize sm:text-base ${getPaymentBadgeClass(
                paymentText
              )}`}
            >
              {String(appointment.paymentStatus || "unpaid")}
            </span>
          </div>
        </div>

        {/* Optional Customer Note */}
        {appointment.message && (
          <div className="space-y-2 rounded-xl border border-stone-800 bg-[#14110D] p-4">
            <span className="flex items-center gap-2 text-sm font-bold text-amber-300 sm:text-base">
              <MessageSquare className="h-4 w-4" />
              <span>Additional Notes</span>
            </span>
            <p className="text-base leading-relaxed text-stone-200 sm:text-lg">
              {appointment.message}
            </p>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-[#A68B5B] px-6 py-3 text-base font-bold text-stone-950 transition hover:bg-[#B89B6A]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
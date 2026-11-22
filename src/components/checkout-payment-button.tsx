"use client";

import { useState } from "react";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";

interface CheckoutPaymentButtonProps {
  appointmentId: string;
  serviceName: string;
  amount: number;
  isAlreadyPaid?: boolean;
}

export default function CheckoutPaymentButton({
  appointmentId,
  serviceName,
  amount,
  isAlreadyPaid = false,
}: CheckoutPaymentButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent duplicate payment once the appointment is already paid
  if (isAlreadyPaid) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-6 py-4 text-base font-bold text-emerald-300">
        <CheckCircle2 size={18} />
        Already Paid
      </div>
    );
  }

  return (
    <form
      action="/api/checkout_sessions"
      method="POST"
      onSubmit={() => setIsSubmitting(true)}
      className="space-y-4"
    >
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="serviceName" value={serviceName} />
      <input type="hidden" name="amount" value={String(amount)} />

      <button
        type="submit"
        disabled={isSubmitting || !appointmentId}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#A68B5B] px-6 py-4 text-base font-bold text-stone-950 transition hover:bg-[#B89B6A] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Redirecting to Stripe...
          </>
        ) : (
          <>
            <CreditCard size={18} />
            Pay ${amount.toFixed(2)} Now
          </>
        )}
      </button>
    </form>
  );
}
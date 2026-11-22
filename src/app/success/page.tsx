import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { stripe } from "@/lib/stripe";

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default async function PaymentSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  let isPaid = false;

  // Verify the Stripe Checkout Session and mark the appointment as paid in the backend
  if (sessionId) {
    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
      const appointmentId = checkoutSession.metadata?.appointmentId;
      const paidAmount =
        typeof checkoutSession.amount_total === "number"
          ? checkoutSession.amount_total / 100
          : undefined;
      const paidCurrency = checkoutSession.currency
        ? checkoutSession.currency.toUpperCase()
        : "USD";

      if (checkoutSession.payment_status === "paid") {
        isPaid = true;

        // Update appointment paymentStatus and record transaction in MongoDB via Express backend
        if (appointmentId) {
          const patchRes = await fetch(`${API_URL}/appointments/${appointmentId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentStatus: "paid",
              stripeSessionId: sessionId,
              ...(paidAmount !== undefined ? { amount: paidAmount } : {}),
              currency: paidCurrency,
            }),
            cache: "no-store",
          });

          if (!patchRes.ok) {
            const errorText = await patchRes.text();
            // Ignore duplicate payment guard message if already marked paid
            if (!errorText.toLowerCase().includes("already paid")) {
              console.error(
                "Failed to mark appointment as paid:",
                errorText
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error verifying Stripe session:", error);
    }
  }

  return (
    <section className="min-h-screen bg-[#110F0B] px-4 py-12 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-stone-800 bg-[#181510] shadow-2xl">
          {/* Top Accent Header */}
          <div className="border-b border-stone-800 bg-[#1D1913] px-6 py-8 text-center sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-500/15 text-emerald-300">
              <CheckCircle2 size={36} />
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-400 sm:text-sm">
              Payment Successful
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">
              Thank You for Your Payment!
            </h1>

            <p className="mt-2 text-base text-stone-300 sm:text-lg">
              Your Stripe payment has been completed and your salon booking is
              all set.
            </p>
          </div>

          {/* Details & Actions */}
          <div className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3.5 rounded-xl border border-stone-800 bg-[#14110D] p-5">
              <div className="flex items-center justify-between gap-4 border-b border-stone-800 pb-3.5">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 sm:text-base">
                  <CalendarCheck size={18} className="text-amber-400" />
                  Payment Status
                </span>
                <span className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3.5 py-1 text-xs font-bold text-emerald-300 sm:text-sm">
                  {isPaid || !sessionId ? "Paid" : "Processing"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 sm:text-base">
                  <Receipt size={18} className="text-amber-400" />
                  Checkout Session ID
                </span>
                <span className="break-all rounded-lg border border-stone-800 bg-[#181510] px-3 py-1.5 font-mono text-xs text-amber-200 sm:text-sm">
                  {sessionId || "Completed"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-stone-400 sm:text-sm">
              <ShieldCheck size={17} className="shrink-0 text-amber-400" />
              <span>Processed securely via Stripe</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard/customer/appointments"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#A68B5B] px-6 py-3.5 text-base font-bold text-stone-950 transition hover:bg-[#B89B6A] sm:w-auto"
              >
                <span>View My Appointments</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
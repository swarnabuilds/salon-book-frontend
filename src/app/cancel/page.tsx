import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  XCircle,
} from "lucide-react";

interface CancelPageProps {
  searchParams: Promise<{
    appointmentId?: string;
    serviceName?: string;
    date?: string;
    timeSlot?: string;
    amount?: string;
  }>;
}

export default async function PaymentCancelPage({
  searchParams,
}: CancelPageProps) {
  const { appointmentId, serviceName, date, timeSlot, amount } =
    await searchParams;

  const checkoutParams = new URLSearchParams({
    ...(appointmentId ? { appointmentId } : {}),
    ...(serviceName ? { serviceName } : {}),
    ...(date ? { date } : {}),
    ...(timeSlot ? { timeSlot } : {}),
    ...(amount ? { amount } : {}),
    canceled: "true",
  });

  const retryCheckoutHref = `/checkout?${checkoutParams.toString()}`;

  return (
    <section className="min-h-screen bg-[#110F0B] px-4 py-12 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-stone-800 bg-[#181510] shadow-2xl">
          {/* Top Accent Header */}
          <div className="border-b border-stone-800 bg-[#1D1913] px-6 py-8 text-center sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-rose-400/35 bg-rose-500/15 text-rose-300">
              <XCircle size={36} />
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-400 sm:text-sm">
              Payment Canceled
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">
              Checkout Was Canceled
            </h1>

            <p className="mt-2 text-base text-stone-300 sm:text-lg">
              No charge was made to your card. You can try again whenever
              you&apos;re ready.
            </p>
          </div>

          {/* Details & Actions */}
          <div className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3 rounded-xl border border-stone-800 bg-[#14110D] p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-stone-400 sm:text-base">
                  Payment Status
                </span>
                <span className="rounded-full border border-amber-400/35 bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-300 sm:text-sm">
                  Unpaid / Canceled
                </span>
              </div>

              {serviceName && (
                <div className="flex items-center justify-between gap-4 border-t border-stone-800 pt-3">
                  <span className="text-sm font-semibold text-stone-400 sm:text-base">
                    Service
                  </span>
                  <span className="text-sm font-bold text-white sm:text-base">
                    {serviceName}
                  </span>
                </div>
              )}

              {amount && (
                <div className="flex items-center justify-between gap-4 border-t border-stone-800 pt-3">
                  <span className="text-sm font-semibold text-stone-400 sm:text-base">
                    Amount
                  </span>
                  <span className="text-base font-extrabold text-amber-300 sm:text-lg">
                    ${Number(amount).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-stone-400 sm:text-sm">
              <ShieldCheck size={17} className="shrink-0 text-amber-400" />
              <span>Your appointment remains safe and unchanged</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Link
                href="/dashboard/customer/appointments"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700 bg-[#14110D] px-5 py-3.5 text-base font-semibold text-stone-200 transition hover:border-amber-400/40 hover:text-amber-300 sm:w-auto"
              >
                <ArrowLeft size={18} />
                <span>My Appointments</span>
              </Link>

              <Link
                href={retryCheckoutHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#A68B5B] px-6 py-3.5 text-base font-bold text-stone-950 transition hover:bg-[#B89B6A] sm:w-auto"
              >
                <CreditCard size={18} />
                <span>Try Checkout Again</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
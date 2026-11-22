import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  ShieldCheck,
} from "lucide-react";
import CheckoutPaymentButton from "@/components/checkout-payment-button";

interface CheckoutPageProps {
  searchParams: Promise<{
    appointmentId?: string;
    canceled?: string;
  }>;
}

interface AppointmentRecord {
  _id: string;
  serviceName?: string;
  appointmentDate?: string;
  timeSlot?: string;
  servicePrice?: number;
  status?: string;
  paymentStatus?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getAppointmentForCheckout(
  appointmentId?: string
): Promise<AppointmentRecord | null> {
  if (!appointmentId) return null;

  try {
    // The appointment API is session-scoped, so a customer can only load their
    // own appointment here. Forward the browser cookie to preserve the session.
    const cookie = (await headers()).get("cookie") || "";

    const res = await fetch(
      `${API_URL}/appointments/${encodeURIComponent(appointmentId)}`,
      {
        headers: { cookie },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const json = (await res.json()) as {
      success?: boolean;
      data?: AppointmentRecord;
    };

    return json.data || null;
  } catch {
    return null;
  }
}

export default async function CheckoutContent({
  searchParams,
}: CheckoutPageProps) {
  const headersList = await headers();
  const authSession = await auth.api.getSession({ headers: headersList });

  if (!authSession?.user) {
    redirect("/signin");
  }

  const signedInUser = authSession.user as {
    role?: string | null;
    isBlocked?: boolean;
  };

  if (Boolean(signedInUser.isBlocked)) {
    redirect("/signin?blocked=1");
  }

  if (
    String(signedInUser.role || "customer").trim().toLowerCase() !== "customer"
  ) {
    redirect("/dashboard/admin");
  }

  const { appointmentId, canceled } = await searchParams;

  // Appointment details always come from the database, never from URL params.
  const appointment = await getAppointmentForCheckout(appointmentId);

  if (appointmentId && !appointment) {
    return (
      <section className="min-h-screen bg-[#110F0B] px-4 py-12 text-stone-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-stone-800 bg-[#181510] p-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            Appointment not found
          </h1>
          <p className="mt-2 text-sm text-stone-400">
            This appointment is unavailable or does not belong to your account.
          </p>
          <Link
            href="/dashboard/customer/appointments"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#A68B5B] px-5 py-3 text-sm font-bold text-stone-950"
          >
            <ArrowLeft size={17} />
            Back to My Appointments
          </Link>
        </div>
      </section>
    );
  }

  const serviceName = appointment?.serviceName || "Salon Service";
  const date = appointment?.appointmentDate || "Not specified";
  const timeSlot = appointment?.timeSlot || "Not specified";
  const amount = Number(appointment?.servicePrice || 0);
  const isAlreadyPaid =
    String(appointment?.paymentStatus || "").toLowerCase() === "paid";

  if (canceled) {
    console.log(
      "Order canceled -- continue to shop around and check out when you're ready."
    );
  }

  return (
    <section className="min-h-screen bg-[#110F0B] px-4 py-10 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Back Button */}
        <Link
          href="/dashboard/customer/appointments"
          className="mb-7 inline-flex items-center gap-2 rounded-lg border border-stone-800 bg-[#181510] px-4 py-2.5 text-sm font-semibold text-stone-300 transition hover:border-amber-400/40 hover:text-amber-300"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        {/* Canceled Banner */}
        {canceled && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-3.5 text-sm font-medium text-amber-200">
            <AlertCircle size={18} className="shrink-0 text-amber-400" />
            <span>
              Order canceled -- continue to shop around and check out when
              you&apos;re ready.
            </span>
          </div>
        )}

        {/* Page Heading */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Secure Payment
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Complete Your Booking
          </h1>

          <p className="mt-2 text-base text-stone-400">
            Review your appointment details and proceed with payment.
          </p>
        </div>

        {/* Checkout Card */}
        <div className="overflow-hidden rounded-2xl border border-stone-800 bg-[#181510] shadow-2xl">
          {/* Card Header */}
          <div className="border-b border-stone-800 bg-[#1D1913] px-6 py-5 sm:px-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Appointment Summary
              </h2>

              <span
                className={`rounded-full border px-3.5 py-1 text-xs font-bold ${
                  isAlreadyPaid
                    ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-300"
                    : "border-amber-400/35 bg-amber-500/10 text-amber-300"
                }`}
              >
                {isAlreadyPaid ? "Paid" : "Pending Payment"}
              </span>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-6 p-6 sm:p-8">
            {/* Service Name */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-400">
                Selected Service
              </p>

              <h3 className="text-xl font-bold text-white sm:text-2xl">
                {serviceName || "Salon Service"}
              </h3>
            </div>

            {/* Date and Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-stone-800 bg-[#14110D] p-4">
                <div className="rounded-lg border border-amber-400/25 bg-[#181510] p-2 text-amber-400">
                  <Calendar size={19} />
                </div>

                <div>
                  <p className="text-xs font-medium text-stone-400">
                    Appointment Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-stone-100 sm:text-base">
                    {date || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-stone-800 bg-[#14110D] p-4">
                <div className="rounded-lg border border-amber-400/25 bg-[#181510] p-2 text-amber-400">
                  <Clock size={19} />
                </div>

                <div>
                  <p className="text-xs font-medium text-stone-400">
                    Appointment Time
                  </p>

                  <p className="mt-1 text-sm font-semibold text-stone-100 sm:text-base">
                    {timeSlot || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="border-t border-stone-800 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-400 sm:text-base">
                  Service Price
                </span>

                <span className="text-sm font-semibold text-stone-200 sm:text-base">
                  ${amount.toFixed(2)}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-base font-bold text-white sm:text-lg">
                  Total Amount
                </span>

                <span className="text-2xl font-extrabold text-amber-300">
                  ${amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Button */}
            <CheckoutPaymentButton
              appointmentId={appointmentId || ""}
              amount={amount}
              isAlreadyPaid={isAlreadyPaid}
            />

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 text-xs text-stone-400 sm:text-sm">
              <ShieldCheck size={16} className="text-amber-400" />
              Secure payment powered by Stripe
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="mt-5 text-center text-xs text-stone-400 sm:text-sm">
          Your payment information is processed securely through Stripe.
        </p>
      </div>
    </section>
  );
}
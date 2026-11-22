import Link from "next/link";
import { ArrowLeft, Scissors } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-[#FAF8F5] px-6">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-xl shadow-stone-200/60">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-amber-600">
          <Scissors className="h-6 w-6" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
          404
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-stone-900">
          This page has left the salon
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-2.5 text-sm font-medium text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
          >
            Browse services
          </Link>
        </div>
      </div>
    </div>
  );
}

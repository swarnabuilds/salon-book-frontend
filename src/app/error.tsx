"use client";

import Link from "next/link";
import { RotateCcw, Sparkles } from "lucide-react";

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "Something went wrong while loading this page.";

  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-[#FAF8F5] px-6">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-xl shadow-stone-200/60">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-amber-600">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-serif text-2xl font-semibold text-stone-900">
          We hit a small snag
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">{message}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-2.5 text-sm font-medium text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

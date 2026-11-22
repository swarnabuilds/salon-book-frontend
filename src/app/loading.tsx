import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-[#FAF8F5] px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-300 bg-white text-amber-600 shadow-sm">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <p className="font-serif text-lg font-semibold text-stone-900">
            Preparing your SalonBook experience
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Just a moment while we load your services.
          </p>
        </div>
      </div>
    </div>
  );
}

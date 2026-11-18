import React from "react";
import Link from "next/link";
import { Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuthShowcasePanelProps {
  headline: string;
  subheadline: string;
}

export function AuthShowcasePanel({
  headline,
  subheadline,
}: AuthShowcasePanelProps) {
  return (
    <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-stone-950 text-stone-100 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35 scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/75 to-stone-900/40" />

      <div className="relative z-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-2xl font-serif tracking-tight font-semibold text-white">
            SalonBook
          </span>
        </Link>
        <Badge
          variant="outline"
          className="border-amber-400/30 text-amber-200 bg-amber-500/10 backdrop-blur-md"
        >
          Luxury Concierge
        </Badge>
      </div>

      <div className="relative z-10 space-y-6 my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs tracking-wider uppercase text-amber-200">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          Curated Beauty &amp; Wellness
        </div>
        <h1 className="text-4xl xl:text-5xl font-serif font-medium leading-[1.15] text-white">
          {headline}
        </h1>
        <p className="text-stone-300 text-base leading-relaxed max-w-md">
          {subheadline}
        </p>
      </div>

      <div className="relative z-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-5 space-y-3">
        <div className="flex items-center gap-1 text-amber-400">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-4 w-4 fill-amber-400" />
          ))}
        </div>
        <p className="text-sm text-stone-200 italic">
          “Booking my weekend spa and styling session takes under a minute. The
          real-time status updates and seamless checkout feel truly 5-star.”
        </p>
        <div className="flex items-center gap-3 pt-1">
          <Avatar className="h-8 w-8 border border-amber-400/40">
            <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-medium text-white">Amina Rahman</p>
            <p className="text-[11px] text-stone-400">
              Verified SalonBook Member
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
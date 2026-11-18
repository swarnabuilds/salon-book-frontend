import Link from "next/link";
import { Sparkles, ArrowRight, Star, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BannerSection() {
  return (
    <section className="relative overflow-hidden bg-stone-950 py-20 lg:py-32">
      {/* Salon-Themed Background Image with Luxury Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/90 to-stone-950/70 z-10" />
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1920"
          alt="Luxury Salon Interior"
          className="h-full w-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
        />
      </div>

      {/* Decorative Golden Glow Accents */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl z-10 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl z-10 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text & CTA Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-medium text-amber-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>The Ultimate Luxury Grooming Experience</span>
            </div>

            {/* Main Title */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
              Elevate Your Style, <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Redefine Your Beauty.
              </span>
            </h1>

            {/* Short Description */}
            <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Welcome to SalonBook. Discover top-tier hair stylists, expert facial treatments, and premium salon appointments tailored exclusively for your elegance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/browse-services"
                className="inline-flex h-12 items-center justify-center rounded-full bg-amber-500 hover:bg-amber-400 px-8 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 group"
              >
                <span>Explore Salon Services</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                href="/sign-in"
                className="inline-flex h-12 items-center justify-center rounded-full border border-stone-700 bg-stone-900/60 hover:bg-stone-800 px-8 text-sm font-medium text-white backdrop-blur-md transition-colors"
              >
                Book Appointment
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 border-t border-stone-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-400">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-stone-200 font-semibold">4.9/5 Rating</span> (2k+ Reviews)
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>Verified Expert Stylists</span>
              </div>
            </div>
          </div>

          {/* Right Floating Luxury Card Preview */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative mx-auto max-w-md">
              {/* Decorative Backdrop Blur Card */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-200 opacity-30 blur-lg animate-pulse" />
              
              <div className="relative rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-serif font-bold text-lg">
                      SB
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Signature Hair Spa</h3>
                      <p className="text-xs text-stone-400">Master Stylist Available</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-medium text-emerald-400">
                    Open Now
                  </span>
                </div>

                <div className="space-y-3 rounded-2xl bg-stone-950/80 p-4 border border-stone-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">Next Available Slot</span>
                    <span className="text-amber-300 font-medium">Today, 04:00 PM</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">Treatment Duration</span>
                    <span className="text-stone-200 font-medium">60 Minutes</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex -space-x-2">
                    <img className="h-8 w-8 rounded-full border-2 border-stone-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Client" />
                    <img className="h-8 w-8 rounded-full border-2 border-stone-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Client" />
                    <img className="h-8 w-8 rounded-full border-2 border-stone-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="Client" />
                  </div>
                  <span className="text-xs text-stone-400 font-medium">+1.5k Happy Clients</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
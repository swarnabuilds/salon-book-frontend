import React from "react";
import Link from "next/link";
import { Sparkles, MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200/80 bg-stone-950 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Top Grid Sections */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-white">
                SalonBook
              </span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              Your premier digital concierge for curated hair styling, luxury facial treatments, and seamless salon appointment scheduling.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-stone-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-stone-400 hover:text-white transition-colors">
                  Home Sanctuary
                </Link>
              </li>
              <li>
                <Link href="/browse-services" className="text-stone-400 hover:text-white transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="text-stone-400 hover:text-white transition-colors">
                  Client Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-stone-400 hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Treatments
            </h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li className="hover:text-white transition-colors cursor-pointer">Hair Styling &amp; Spa</li>
              <li className="hover:text-white transition-colors cursor-pointer">Advanced Facials</li>
              <li className="hover:text-white transition-colors cursor-pointer">Bridal &amp; Makeover</li>
              <li className="hover:text-white transition-colors cursor-pointer">Manicure &amp; Pedicure</li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Concierge Desk
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>+880 1234-567890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>support@salonbook.com</span>
              </li>
              <li className="pt-1">
                <span className="inline-flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                  Available 9AM - 9PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {currentYear} SalonBook Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-stone-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-stone-300 transition-colors cursor-pointer">Security Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
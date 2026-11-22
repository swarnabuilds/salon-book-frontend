import React from "react";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Camera,
  Globe,
  MessageCircle,
} from "lucide-react";

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/", icon: Globe },
  { label: "Instagram", href: "https://www.instagram.com/", icon: Camera },
  { label: "YouTube", href: "https://www.youtube.com/", icon: MessageCircle },
];

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
              Your premier digital concierge for curated hair styling, luxury
              facial treatments, and seamless salon appointment scheduling.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-stone-400">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                House 12, Road 7, Dhanmondi, Dhaka 1209
              </span>
              <span>Open daily: 9:00 AM - 9:00 PM</span>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-2 pt-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-700 bg-stone-900 text-stone-400 transition hover:border-amber-400/50 hover:text-amber-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Home Sanctuary
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Browse Services
                </Link>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Client Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Treatments */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Treatments
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/services?category=Haircut%20%26%20Styling"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Hair Styling &amp; Spa
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=Facial%20%26%20Skincare"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Advanced Facials
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=Makeup"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Bridal &amp; Makeover
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=Manicure%20%26%20Pedicure"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Manicure &amp; Pedicure
                </Link>
              </li>
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
                <a href="tel:+8801234567890" className="hover:text-white">
                  +880 1234-567890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <a
                  href="mailto:support@salonbook.com"
                  className="hover:text-white"
                >
                  support@salonbook.com
                </a>
              </li>
              <li className="pt-1">
                <span className="inline-flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                  Available 9AM - 9PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {currentYear} SalonBook Inc. All rights reserved.</p>
          <p>Beauty, confidence, and care - one appointment at a time.</p>
        </div>
      </div>
    </footer>
  );
}

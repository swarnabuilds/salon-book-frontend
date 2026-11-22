"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Scissors,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { clearAuthTokenCache } from "@/lib/api/authHeaders";

type DashboardRole = "admin" | "customer";

const adminLinks = [
  { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  {
    name: "Services",
    href: "/dashboard/admin/manage-services",
    icon: Scissors,
  },
  {
    name: "Appointments",
    href: "/dashboard/admin/appointments",
    icon: CalendarCheck,
  },
  { name: "Users", href: "/dashboard/admin/users", icon: Users },
  {
    name: "Transactions",
    href: "/dashboard/admin/transactions",
    icon: CreditCard,
  },
  { name: "Profile", href: "/dashboard/admin/profile", icon: User },
];

const customerLinks = [
  { name: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
  {
    name: "Appointments",
    href: "/dashboard/customer/appointments",
    icon: CalendarCheck,
  },
  { name: "Profile", href: "/dashboard/customer/profile", icon: User },
];

export function DashboardMobileNav({ role }: { role: DashboardRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const links = role === "admin" ? adminLinks : customerLinks;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      clearAuthTokenCache();
      toast.success("Logged out successfully.");
      router.push("/signin");
      router.refresh();
    } catch {
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="lg:hidden border-b border-stone-800/80 bg-stone-950 px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="font-serif text-base font-semibold text-white">
            SalonBook
          </span>
          <span className="text-[10px] uppercase tracking-wider text-amber-400">
            {role}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500 hover:text-white disabled:opacity-60"
        >
          <LogOut className="h-3.5 w-3.5" />
          {isLoggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {links.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "border-amber-400/50 bg-amber-500 text-stone-950"
                  : "border-stone-700 bg-stone-900 text-stone-300 hover:border-amber-400/40 hover:text-amber-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

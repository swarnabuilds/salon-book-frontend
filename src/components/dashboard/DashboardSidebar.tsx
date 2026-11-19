"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client"; // তোমার প্রজেক্টের সঠিক পাথ অনুযায়ী ঠিক করে নেবে
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  CreditCard, 
  Scissors, 
  Sparkles,
  User,
  LogOut
} from "lucide-react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Better Auth ক্লায়েন্ট হুক দিয়ে সরাসরি সেশন ও রোল ফেচ করা হচ্ছে
  const { data: session, isPending } = authClient.useSession();

  // ডাটাবেজ সেশন থেকে রোল নেওয়া (ডিফল্ট "customer" যদি না থাকে)
  const role = ((session?.user as { role?: string })?.role || "customer") as "admin" | "customer";

  const adminLinks = [
    { name: "Overview", href: "/dashboard/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Manage Services", href: "/dashboard/admin/manage-services", icon: <Scissors className="h-5 w-5" /> },
    { name: "Manage Appointments", href: "/dashboard/admin/appointments", icon: <CalendarCheck className="h-5 w-5" /> },
    { name: "Manage Users", href: "/dashboard/admin/users", icon: <Users className="h-5 w-5" /> },
    { name: "Transactions", href: "/dashboard/admin/transactions", icon: <CreditCard className="h-5 w-5" /> },
    { name: "My Profile", href: "/dashboard/admin/profile", icon: <User className="h-5 w-5" /> },
  ];

  const customerLinks = [
    { name: "Overview", href: "/dashboard/customer", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "My Appointments", href: "/dashboard/customer/appointments", icon: <CalendarCheck className="h-5 w-5" /> },
    { name: "My Profile", href: "/dashboard/customer/profile", icon: <User className="h-5 w-5" /> },
  ];

  const links = role === "admin" ? adminLinks : customerLinks;

  // লগআউট হ্যান্ডলার
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin");
          router.refresh();
        },
      },
    });
  };

  // লোডিং অবিন্যস্ততা এড়াতে
  if (isPending) {
    return (
      <aside className="hidden lg:flex flex-col w-72 border-r border-stone-800/80 bg-stone-950 p-6 min-h-screen text-stone-400 items-center justify-center">
        <p className="text-xs animate-pulse">Loading sidebar...</p>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-72 border-r border-stone-800/80 bg-stone-950 p-6 min-h-screen text-stone-300 relative shadow-2xl justify-between">
      {/* Subtle Top Glow */}
      <div className="absolute top-0 left-0 w-full h-40 bg-amber-500/5 blur-[80px] pointer-events-none" />

      <div>
        {/* Brand / Logo Area */}
        <div className="relative z-10 flex items-center gap-3 px-2 mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold text-white tracking-wide">SalonBook</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">
                {role === "admin" ? "Admin Portal" : "Customer Portal"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="relative z-10 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 px-3 mb-2">
            Main Menu
          </p>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-500/20 translate-x-1"
                    : "text-stone-400 hover:bg-stone-900/80 hover:text-white hover:translate-x-1 border border-transparent hover:border-stone-800"
                }`}
              >
                <span className={`transition-transform duration-300 ${isActive ? "scale-110 text-stone-950" : "text-amber-400 group-hover:scale-110"}`}>
                  {link.icon}
                </span>
                <span className="tracking-wide">{link.name}</span>

                {isActive && (
                  <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-stone-950" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Log Out Section */}
      <div className="relative z-10 pt-6 border-t border-stone-900/80 space-y-3">
        {/* Fancy User Info Card (Directly from Session) */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-900/60 border border-stone-800/80 backdrop-blur-md">
          {session?.user?.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name || "User"} 
              className="h-10 w-10 rounded-xl object-cover border border-amber-500/30 shadow-md"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-stone-950 font-bold text-sm shadow-md">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{session?.user?.name || "User"}</p>
            <p className="text-[11px] text-stone-400 truncate">{session?.user?.email || ""}</p>
          </div>
        </div>

        {/* Log Out Button */}
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl border border-red-500/20 bg-red-500/10 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 shadow-lg shadow-red-500/5 group cursor-pointer"
        >
          <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Log Out</span>
        </button>

        {/* Back to Website Link */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-stone-800/80 bg-stone-900/40 text-[11px] font-medium text-stone-400 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300 transition-all duration-300"
        >
          <span>← Back to Website</span>
        </Link>
      </div>
    </aside>
  );
}
import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";  
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Bell, Sparkles } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userRole = ((session.user as { role?: string }).role || "customer") as "admin" | "customer";

  return (
    <div className="flex min-h-screen bg-stone-950 text-stone-100">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 border-b border-stone-800/80 bg-stone-950/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="font-serif text-lg font-semibold text-white">
              {userRole === "admin" ? "Admin Control Panel" : "Customer Dashboard"}
            </h1>
            <p className="text-[11px] text-stone-400">
              Manage your salon activities & preferences seamlessly
            </p>
          </div>

          {/* Right Side: Notification Icon + Quick Action */}
          <div className="flex items-center gap-3">
            {/* Quick Action Button */}
            <Link
              href={userRole === "admin" ? "/dashboard/admin/manage-services" : "/services"}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500 hover:text-stone-950 transition-all duration-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{userRole === "admin" ? "Add Service" : "Book Service"}</span>
            </Link>

            {/* Notification Button */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900/70 border border-stone-800/80 text-stone-300 hover:text-amber-400 hover:border-amber-500/30 transition-all duration-300 cursor-pointer"
            >
              <Bell className="h-5 w-5" />
              {/* Unread Notification Dot */}
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-stone-950" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
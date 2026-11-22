import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";  
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav";
import { Sparkles } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/signin");
  }

  const sessionUser = session.user as {
    role?: string;
    isBlocked?: boolean;
  };

  if (sessionUser.isBlocked) {
    redirect("/signin?blocked=1");
  }

  const userRole = (sessionUser.role || "customer") as "admin" | "customer";

  return (
    <div className="flex min-h-screen bg-stone-950 text-stone-100">
      {/* Desktop sidebar */}
      <DashboardSidebar role={userRole} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Mobile role-based navigation */}
        <DashboardMobileNav role={userRole} />

        {/* Top Header */}
        <header className="h-16 sm:h-20 border-b border-stone-800/80 bg-stone-950/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
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

          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Server-side role guard so an admin cannot open customer dashboard pages by
// typing the URL manually. The shared dashboard layout already handles the
// sign-in and blocked-account checks.
export default async function CustomerDashboardLayout({
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

  const user = session.user as { role?: string; isBlocked?: boolean };

  if (user.isBlocked) {
    redirect("/signin?blocked=1");
  }

  const role = String(user.role || "customer").trim().toLowerCase();

  if (role !== "customer") {
    redirect("/dashboard/admin");
  }

  return <>{children}</>;
}

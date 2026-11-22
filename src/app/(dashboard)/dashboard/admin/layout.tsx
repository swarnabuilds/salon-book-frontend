import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminDashboardLayout({
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

  if (role !== "admin") {
    redirect("/dashboard/customer");
  }

  return <>{children}</>;
}

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardRootPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role || "customer";

  if (role === "admin") {
    redirect("/dashboard/admin");
  } else {
    redirect("/dashboard/customer");
  }
}
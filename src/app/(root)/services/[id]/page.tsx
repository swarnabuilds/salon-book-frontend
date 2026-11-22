import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import ServiceDetailsView from "@/components/services/ServiceDetailsView";

export default async function PublicServiceDetailsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/signin");
  }

  const sessionUser = session.user as { isBlocked?: boolean };
  if (sessionUser.isBlocked) {
    redirect("/signin?blocked=1");
  }

  return <ServiceDetailsView backHref="/services" backLabel="Browse Services" />;
}

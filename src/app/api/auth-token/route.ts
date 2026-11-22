import { createHmac } from "node:crypto";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const TOKEN_TTL_SECONDS = 15 * 60;

// Short-lived HS256 token used by the Express API's JWT verification
// middleware. The session cookie remains the source of truth.
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  const user = session.user as {
    id: string;
    email: string;
    role?: string;
    isBlocked?: boolean;
  };

  if (Boolean(user.isBlocked)) {
    return Response.json({ message: "This account is blocked." }, { status: 403 });
  }

  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    return Response.json(
      { message: "Auth secret is not configured." },
      { status: 500 }
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role || "customer",
      isBlocked: Boolean(user.isBlocked),
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    })
  ).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return Response.json({
    token: `${header}.${payload}.${signature}`,
    expiresAt: (now + TOKEN_TTL_SECONDS) * 1000,
  });
}

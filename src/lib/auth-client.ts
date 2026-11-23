
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

 
// sync without a hard-coded URL.
function getAuthBaseURL(): string {
  const publicUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

  if (publicUrl) return publicUrl;
  if (typeof window !== "undefined") return window.location.origin;

  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [
    inferAdditionalFields<typeof auth>(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
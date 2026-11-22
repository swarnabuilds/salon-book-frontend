import { APIError, betterAuth } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGO_URI as string);
const db = client.db("salon-book-system");

// Better Auth checks the browser origin on sign-in. Accept the configured
// deployment URL as well as the local development URLs so localhost and the
// deployed site can both sign in.
function toOrigin(value: string): string | null {
  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
}

const configuredOrigins = [
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  process.env.CLIENT_URL,
]
  .flatMap((value) => String(value || "").split(","))
  .map((value) => value.trim())
  .filter(Boolean);

const trustedOrigins = [
  ...new Set([
    ...configuredOrigins
      .map(toOrigin)
      .filter((origin): origin is string => origin !== null),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ]),
];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    password: {
      // Better Auth only checks length by default. Enforce the assignment's
      // uppercase/lowercase rule on the server too, not just in the form.
      hash: async (password: string) => {
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
          throw new APIError("BAD_REQUEST", {
            message:
              "Password must contain at least one uppercase and one lowercase letter.",
          });
        }
        return hashPassword(password);
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false,
      },
      isBlocked: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },
});

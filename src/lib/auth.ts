import { APIError, betterAuth } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGO_URI as string);
const db = client.db("salon-book-system");

export const auth = betterAuth({
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

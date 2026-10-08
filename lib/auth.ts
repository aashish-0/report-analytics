import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "./db";
import * as schema from "./schema";

export const auth = betterAuth({
  // This line fixes the yellow warning
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000", 
  
  database: drizzleAdapter(db, {
    provider: "pg", 
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
});
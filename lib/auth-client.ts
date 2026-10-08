import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Adding a fallback ensures this is always a string, satisfying TypeScript
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" 
});

// You will use this in your UI like: const { data: session } = authClient.useSession();
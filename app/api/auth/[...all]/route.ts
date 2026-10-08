import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// This single file handles EVERY auth request (login, logout, session check, oauth)
export const { GET, POST } = toNextJsHandler(auth);
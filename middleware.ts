import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Only run the auth check on protected routes
  if (pathname.startsWith("/dashboard")) {
    try {
      // 2. Ping the Better Auth session API, passing along the browser's cookies
      const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });

      const session = await response.json();

      // 3. If the session is null or missing, redirect to sign-in
      if (!session || !session.session) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    } catch (error) {
      // If the fetch fails for any reason, default to secure (logout)
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // 4. Allow all other routes (like /sign-in and API routes) to pass through
  return NextResponse.next();
}

export const config = {
  // Explicitly tell Next.js to only run this middleware on the dashboard
  matcher: ["/dashboard/:path*"],
};
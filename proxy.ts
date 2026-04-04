import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // ── Per-user rate limit for chat API (20 req/min token bucket) ──────────────
  if (pathname === "/api/chat" && request.method === "POST") {
    // Extract user ID from Supabase session cookie without a full auth round-trip
    const sessionCookie =
      request.cookies.get("sb-access-token")?.value ||
      // Supabase SSR stores the session as sb-<project-ref>-auth-token
      [...request.cookies.getAll()]
        .find((c) => c.name.endsWith("-auth-token"))
        ?.value;

    let userId: string | null = null;

    if (sessionCookie) {
      try {
        // The cookie value is a base64url-encoded JSON array: [access_token, ...]
        // We only need the sub claim from the JWT to identify the user cheaply.
        const raw = sessionCookie.startsWith("[")
          ? sessionCookie
          : Buffer.from(sessionCookie, "base64").toString("utf8");
        const [accessToken] = JSON.parse(raw) as [string];
        const payloadB64 = accessToken.split(".")[1];
        const payload = JSON.parse(
          Buffer.from(payloadB64, "base64url").toString("utf8")
        ) as { sub?: string };
        userId = payload.sub ?? null;
      } catch {
        // Malformed cookie — fall through, will be caught by route-level auth
      }
    }

    if (userId) {
      const result = await checkRateLimit(userId);
      if (!result.allowed) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
          },
        });
      }

      supabaseResponse.headers.set("X-RateLimit-Limit", "20");
      supabaseResponse.headers.set(
        "X-RateLimit-Remaining",
        String(result.remaining)
      );
      supabaseResponse.headers.set(
        "X-RateLimit-Reset",
        String(Math.floor(result.resetAt / 1000))
      );
    }
  }

  // OPTIMIZED: Use getSession() for session refresh (lighter than getUser())
  // Only refresh session for protected routes to minimize API calls
  // Layouts will use getCurrentUser() which dedupes within the same request
  
  // Exclude static assets, API routes, and Next.js internals from auth checks
  const isStaticAsset = 
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/);
  
  const protectedRoutes = ["/dashboard", "/admin", "/groups", "/onboarding", "/projects", "/issues", "/calendar", "/guides", "/notifications"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  
  let user = null;
  
  // Only refresh session for protected routes or auth pages (skip static assets)
  if (!isStaticAsset && (isProtectedRoute || pathname.startsWith("/auth"))) {
    try {
      // Use getSession() instead of getUser() - it's lighter and just refreshes the token
      // This prevents excessive API calls while still maintaining session freshness
      const getSessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Session refresh timeout")), 1500)
      );
      
      const { data } = await Promise.race([getSessionPromise, timeoutPromise]);
      user = data?.session?.user ?? null;
    } catch (error) {
      // Silently fail - let individual routes handle auth
      // This prevents middleware from blocking requests
      user = null;
    }
  }

  // If not authenticated and trying to access protected route, redirect to login
  // Exception: allow preview mode for onboarding
  const isPreviewMode = request.nextUrl.searchParams.get("preview") === "true";
  if (!user && isProtectedRoute && !(pathname === "/onboarding" && isPreviewMode)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match request paths but exclude:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/webpack-hmr (HMR)
     * - favicon.ico and other static assets
     * - API routes (handled separately)
     * - Public folder assets
     */
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot|ico)$).*)",
  ],
};

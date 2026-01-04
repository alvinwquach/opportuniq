import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  // OPTIMIZED: Use getSession() for session refresh (lighter than getUser())
  // Only refresh session for protected routes to minimize API calls
  // Layouts will use getCachedUser() which dedupes within the same request
  const { pathname } = request.nextUrl;
  
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

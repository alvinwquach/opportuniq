/**
 * proxy.ts Tests
 *
 * Tests for the Next.js proxy (middleware) at the project root:
 * - Rate limiting returns 429 after 20 requests to /api/chat
 * - Non-chat routes are not rate limited
 * - Supabase session refresh is called for protected routes
 */

import { NextRequest } from "next/server";

// ── Mock lib/rate-limiter so we control allowed/remaining/resetAt ────────────
const mockCheckRateLimit = jest.fn();
jest.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}));

// ── Mock @supabase/ssr createServerClient ────────────────────────────────────
const mockGetSession = jest.fn();
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: { getSession: mockGetSession },
    cookies: {},
  })),
}));

// Import after mocks are set up
import { proxy } from "@/proxy";

// Helper — build a minimal NextRequest
function makeRequest(
  pathname: string,
  method = "GET",
  cookieHeader = ""
): NextRequest {
  const url = `https://opportuniq.app${pathname}`;
  const req = new NextRequest(url, { method });
  if (cookieHeader) {
    // NextRequest cookies are read-only in tests; set via Headers
    Object.defineProperty(req, "cookies", {
      value: {
        getAll: () =>
          cookieHeader.split(";").map((c) => {
            const [name, ...rest] = c.trim().split("=");
            return { name: name.trim(), value: rest.join("=").trim() };
          }),
        get: (name: string) => {
          const found = cookieHeader.split(";").find((c) => c.trim().startsWith(name + "="));
          if (!found) return undefined;
          const val = found.trim().split("=").slice(1).join("=");
          return { name, value: val };
        },
      },
    });
  } else {
    Object.defineProperty(req, "cookies", {
      value: { getAll: () => [], get: () => undefined },
    });
  }
  return req;
}

beforeEach(() => {
  jest.clearAllMocks();
  // Default: session is not authenticated (no redirect needed)
  mockGetSession.mockResolvedValue({ data: { session: null } });
});

// ── Rate limiting ────────────────────────────────────────────────────────────

describe("proxy — rate limiting /api/chat", () => {
  it("allows requests when under the limit", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 19, resetAt: Date.now() + 60000 });

    const req = makeRequest("/api/chat", "POST");
    const res = await proxy(req);

    expect(res.status).not.toBe(429);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, resetAt: Date.now() + 30000 });

    // Need a session cookie so userId is resolved and rate limit is checked
    // Build a fake JWT: header.payload.sig where payload has sub
    const payload = Buffer.from(JSON.stringify({ sub: "user-123" })).toString("base64url");
    const fakeJwt = `header.${payload}.sig`;
    const cookieVal = JSON.stringify([fakeJwt]);
    const req = makeRequest("/api/chat", "POST", `sb-abc123-auth-token=${cookieVal}`);

    const res = await proxy(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("passes rate limit headers on allowed requests", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 15, resetAt: Date.now() + 60000 });

    const payload = Buffer.from(JSON.stringify({ sub: "user-456" })).toString("base64url");
    const fakeJwt = `header.${payload}.sig`;
    const cookieVal = JSON.stringify([fakeJwt]);
    const req = makeRequest("/api/chat", "POST", `sb-abc123-auth-token=${cookieVal}`);

    const res = await proxy(req);

    expect(res.status).not.toBe(429);
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("15");
  });

  it("skips rate limit check for non-POST requests to /api/chat", async () => {
    const req = makeRequest("/api/chat", "GET");
    await proxy(req);
    expect(mockCheckRateLimit).not.toHaveBeenCalled();
  });
});

// ── Non-chat routes are not rate limited ────────────────────────────────────

describe("proxy — non-chat routes", () => {
  it("does not rate limit /api/quotes", async () => {
    const req = makeRequest("/api/quotes", "POST");
    const res = await proxy(req);

    expect(mockCheckRateLimit).not.toHaveBeenCalled();
    expect(res.status).not.toBe(429);
  });

  it("does not rate limit /dashboard", async () => {
    const req = makeRequest("/dashboard");
    await proxy(req);

    expect(mockCheckRateLimit).not.toHaveBeenCalled();
  });
});

// ── Supabase session refresh ─────────────────────────────────────────────────

describe("proxy — Supabase session refresh", () => {
  it("calls getSession for protected routes", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const req = makeRequest("/dashboard");
    await proxy(req);

    expect(mockGetSession).toHaveBeenCalled();
  });

  it("does not call getSession for API routes (static asset exclusion)", async () => {
    const req = makeRequest("/api/quotes");
    await proxy(req);

    expect(mockGetSession).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated users from protected routes to /auth/login", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const req = makeRequest("/dashboard");
    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/login");
  });

  it("allows authenticated users through protected routes", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-789" } } },
    });

    const req = makeRequest("/dashboard");
    const res = await proxy(req);

    expect(res.status).not.toBe(307);
  });
});

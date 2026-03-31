import { NextRequest, NextResponse } from "next/server";

// Polyfill Response.json for jsdom (it's a newer Web API not in jsdom)
if (typeof Response !== "undefined" && !Response.json) {
  (Response as unknown as { json: (data: unknown, init?: ResponseInit) => Response }).json = (
    data: unknown,
    init?: ResponseInit
  ) =>
    new Response(JSON.stringify(data), {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
}

const mockLimit = jest.fn();
const mockUpdateSession = jest.fn();

jest.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: jest.fn(() => ({})),
  },
}));

jest.mock("@upstash/ratelimit", () => {
  const MockRatelimit = jest.fn().mockImplementation(() => ({
    limit: mockLimit,
  }));
  MockRatelimit.slidingWindow = jest.fn().mockReturnValue({});
  return { Ratelimit: MockRatelimit };
});

jest.mock("@/utils/supabase/middleware", () => ({
  updateSession: mockUpdateSession,
}));

function makeRequest(path: string, ip?: string): NextRequest {
  const req = new NextRequest(`http://localhost${path}`);
  if (ip) {
    Object.defineProperty(req, "headers", {
      value: new Headers({ "x-forwarded-for": ip }),
    });
  }
  return req;
}

let middleware: (req: NextRequest) => Promise<NextResponse>;

beforeAll(async () => {
  const mod = await import("@/middleware");
  middleware = mod.middleware;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdateSession.mockResolvedValue(NextResponse.next());
});

describe("middleware rate limiting", () => {
  it("rate limits /api/chat requests", async () => {
    mockLimit.mockResolvedValueOnce({ success: false, remaining: 0, reset: Date.now() + 5000 });
    const req = makeRequest("/api/chat", "1.2.3.4");
    const res = await middleware(req);
    expect(res.status).toBe(429);
    expect(mockLimit).toHaveBeenCalled();
  });

  it("returns 429 with Retry-After header when limited", async () => {
    const reset = Date.now() + 10000;
    mockLimit.mockResolvedValueOnce({ success: false, remaining: 0, reset });
    const req = makeRequest("/api/chat", "1.2.3.4");
    const res = await middleware(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("returns X-RateLimit-Remaining header", async () => {
    const reset = Date.now() + 10000;
    mockLimit.mockResolvedValueOnce({ success: false, remaining: 0, reset });
    const req = makeRequest("/api/chat", "1.2.3.4");
    const res = await middleware(req);
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("allows requests under the limit", async () => {
    mockLimit.mockResolvedValueOnce({ success: true, remaining: 15, reset: Date.now() + 60000 });
    mockUpdateSession.mockResolvedValueOnce(NextResponse.next());
    const req = makeRequest("/api/chat", "1.2.3.4");
    const res = await middleware(req);
    expect(res.status).not.toBe(429);
    expect(mockUpdateSession).toHaveBeenCalled();
  });

  it("does NOT rate limit non-chat routes like /api/quotes", async () => {
    const req = makeRequest("/api/quotes");
    await middleware(req);
    expect(mockLimit).not.toHaveBeenCalled();
    expect(mockUpdateSession).toHaveBeenCalled();
  });

  it("calls updateSession for Supabase auth on all routes", async () => {
    mockLimit.mockResolvedValueOnce({ success: true, remaining: 19, reset: Date.now() + 60000 });
    const chatReq = makeRequest("/api/chat", "5.5.5.5");
    await middleware(chatReq);
    expect(mockUpdateSession).toHaveBeenCalled();

    jest.clearAllMocks();
    mockUpdateSession.mockResolvedValue(NextResponse.next());

    const otherReq = makeRequest("/dashboard");
    await middleware(otherReq);
    expect(mockUpdateSession).toHaveBeenCalled();
  });

  it("uses IP address from x-forwarded-for header", async () => {
    mockLimit.mockResolvedValueOnce({ success: true, remaining: 10, reset: Date.now() + 60000 });
    const req = makeRequest("/api/chat", "9.9.9.9");
    await middleware(req);
    expect(mockLimit).toHaveBeenCalledWith("9.9.9.9");
  });

  it("handles missing x-forwarded-for gracefully", async () => {
    mockLimit.mockResolvedValueOnce({ success: true, remaining: 10, reset: Date.now() + 60000 });
    const req = makeRequest("/api/chat"); // no IP header
    await middleware(req);
    expect(mockLimit).toHaveBeenCalledWith("unknown");
  });
});

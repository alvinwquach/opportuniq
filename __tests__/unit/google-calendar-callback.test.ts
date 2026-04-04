/**
 * Google Calendar OAuth Callback Tests
 *
 * Covers: user-denied (error param), no code (400), no user (→ login redirect),
 * state userId mismatch, missing tokens, DB upsert, success redirect.
 */

// ─── DB mock ──────────────────────────────────────────────────────────────────

const mockDbInsert = jest.fn();
const mockOnConflictDoUpdate = jest.fn().mockResolvedValue(undefined);

jest.mock("@/app/db/client", () => ({
  db: {
    insert: (...args: [unknown]) => {
      mockDbInsert(...args);
      return {
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: mockOnConflictDoUpdate,
        }),
      };
    },
  },
}));

jest.mock("@/app/db/schema", () => ({
  googleCalendarTokens: { userId: "userId" },
}));

// ─── Supabase mock ────────────────────────────────────────────────────────────

const mockGetUser = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    })
  ),
}));

// ─── Google Calendar client mock ──────────────────────────────────────────────

const mockExchangeCodeForTokens = jest.fn();
const mockGetGoogleEmail = jest.fn();

jest.mock("@/lib/google-calendar", () => ({
  exchangeCodeForTokens: (...args: [unknown, ...unknown[]]) => mockExchangeCodeForTokens(...args),
  getGoogleEmail: (...args: [unknown, ...unknown[]]) => mockGetGoogleEmail(...args),
}));

// ─── Next.js mock ─────────────────────────────────────────────────────────────

const mockRedirect = jest.fn();
const mockJson = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: URL | string) => {
      const urlStr = url instanceof URL ? url.toString() : url;
      mockRedirect(urlStr);
      return { _redirect: urlStr, status: 302 };
    },
    json: (body: unknown, init?: { status?: number }) => {
      mockJson(body);
      return { _body: body, status: init?.status ?? 200 };
    },
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(searchParams: Record<string, string>): Request {
  const url = new URL("http://localhost/api/google-calendar/callback");
  for (const [k, v] of Object.entries(searchParams)) {
    url.searchParams.set(k, v);
  }
  return new Request(url.toString());
}

function makeState(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString("base64url");
}

const VALID_TOKENS = {
  access_token: "access-tok",
  refresh_token: "refresh-tok",
  expiry_date: 3600 * 1000,
  scope: "https://www.googleapis.com/auth/calendar.events",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  mockExchangeCodeForTokens.mockResolvedValue(VALID_TOKENS);
  mockGetGoogleEmail.mockResolvedValue("user@gmail.com");
});

describe("GET /api/google-calendar/callback", () => {
  // ── User denies access ────────────────────────────────────────────────────

  it("redirects with calendar_error when error param is present", async () => {
    const { GET } = await import("@/app/api/google-calendar/callback/route");
    const req = makeRequest({ error: "access_denied" });
    await GET(req);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("calendar_error=access_denied")
    );
    expect(mockDbInsert).not.toHaveBeenCalled();
  });

  // ── No code ───────────────────────────────────────────────────────────────

  it("returns 400 when no code param", async () => {
    const { GET } = await import("@/app/api/google-calendar/callback/route");
    const req = makeRequest({});
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  // ── No authenticated user ─────────────────────────────────────────────────

  it("redirects to /auth/login when no user session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { GET } = await import("@/app/api/google-calendar/callback/route");
    const req = makeRequest({ code: "auth-code" });
    await GET(req);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login")
    );
    expect(mockDbInsert).not.toHaveBeenCalled();
  });

  // ── State validation ──────────────────────────────────────────────────────

  it("redirects with calendar_error=invalid_state when userId mismatch", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const state = makeState({ userId: "different-user", redirectTo: "/dashboard" });
    const { GET } = await import("@/app/api/google-calendar/callback/route");
    const req = makeRequest({ code: "auth-code", state });
    await GET(req);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("calendar_error=invalid_state")
    );
    expect(mockDbInsert).not.toHaveBeenCalled();
  });

  it("proceeds normally when state userId matches", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const state = makeState({ userId: "user-1", redirectTo: "/dashboard" });
    const { GET } = await import("@/app/api/google-calendar/callback/route");
    const req = makeRequest({ code: "auth-code", state });
    await GET(req);

    expect(mockDbInsert).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("calendar_connected=true")
    );
  });

  it("proceeds normally with no state (uses default redirect)", async () => {
    const { GET } = await import("@/app/api/google-calendar/callback/route");
    const req = makeRequest({ code: "auth-code" });
    await GET(req);

    expect(mockDbInsert).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("calendar_connected=true")
    );
  });

  // ── Missing tokens ────────────────────────────────────────────────────────

  it("redirects with calendar_error=missing_tokens when access_token absent", async () => {
    mockExchangeCodeForTokens.mockResolvedValue({
      refresh_token: "refresh-tok",
      // no access_token
    });

    const { GET } = await import("@/app/api/google-calendar/callback/route");
    const req = makeRequest({ code: "auth-code" });
    await GET(req);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("calendar_error=missing_tokens")
    );
    expect(mockDbInsert).not.toHaveBeenCalled();
  });

  it("redirects with calendar_error=missing_tokens when refresh_token absent", async () => {
    mockExchangeCodeForTokens.mockResolvedValue({
      access_token: "access-tok",
      // no refresh_token
    });

    const { GET } = await import("@/app/api/google-calendar/callback/route");
    const req = makeRequest({ code: "auth-code" });
    await GET(req);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("calendar_error=missing_tokens")
    );
  });

  // ── Success flow ──────────────────────────────────────────────────────────

  it("upserts tokens to DB and redirects with calendar_connected=true", async () => {
    const { GET } = await import("@/app/api/google-calendar/callback/route");
    const req = makeRequest({ code: "auth-code" });
    await GET(req);

    expect(mockDbInsert).toHaveBeenCalled();
    expect(mockOnConflictDoUpdate).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("calendar_connected=true")
    );
  });

  it("uses custom redirectTo from state on success", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const state = makeState({ userId: "user-1", redirectTo: "/diagnose" });
    const { GET } = await import("@/app/api/google-calendar/callback/route");
    const req = makeRequest({ code: "auth-code", state });
    await GET(req);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/diagnose")
    );
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("calendar_connected=true")
    );
  });

  // ── Error handling ────────────────────────────────────────────────────────

  it("redirects with calendar_error=connection_failed when exchangeCodeForTokens throws", async () => {
    mockExchangeCodeForTokens.mockRejectedValue(new Error("Google API down"));

    const { GET } = await import("@/app/api/google-calendar/callback/route");
    const req = makeRequest({ code: "auth-code" });
    await GET(req);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("calendar_error=connection_failed")
    );
  });

  it("redirects with calendar_error=connection_failed when DB insert throws", async () => {
    jest.resetModules();

    // Re-mock with a throwing insert
    jest.mock("@/app/db/client", () => ({
      db: {
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            onConflictDoUpdate: jest.fn().mockRejectedValue(new Error("DB error")),
          }),
        }),
      },
    }));

    const { GET } = await import("@/app/api/google-calendar/callback/route");
    const req = makeRequest({ code: "auth-code" });
    await GET(req);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("calendar_error=connection_failed")
    );
  });
});

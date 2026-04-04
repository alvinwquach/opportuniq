/**
 * Auth Callback Route Tests
 *
 * Covers: OAuth error param, no code, PKCE errors, new user flows
 * (admin fast-path, invite token, referral code, access_required),
 * existing user flows (admin redirect, dashboard redirect, custom next),
 * group invitation token handling, catch-all error handling.
 */

// ─── DB proxy ─────────────────────────────────────────────────────────────────

const db = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock("@/app/db/client", () => ({ db }));

jest.mock("@/app/db/schema", () => ({
  users: { id: "id", role: "role" },
  groupMembers: { groupId: "groupId", userId: "userId" },
  groupInvitations: { token: "token", inviteeEmail: "inviteeEmail", id: "id" },
  invites: { token: "token", id: "id" },
  referralCodes: { code: "code", id: "id" },
  referrals: {},
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${String(a)}=${String(b)}`),
  and: jest.fn((...args: unknown[]) => args.join("&")),
  sql: jest.fn(),
}));

// ─── Supabase SSR mock ────────────────────────────────────────────────────────

const mockExchangeCodeForSession = jest.fn();

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
    cookies: {
      getAll: jest.fn().mockReturnValue([]),
      setAll: jest.fn(),
    },
  })),
}));

// ─── Referral helper ──────────────────────────────────────────────────────────

jest.mock("@/lib/referral", () => ({
  generateReferralCode: jest.fn(() => "REF-CODE-123"),
}));

// ─── Next.js mock ─────────────────────────────────────────────────────────────

const mockNextRedirect = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: string, init?: { status?: number }) => {
      mockNextRedirect(url);
      return {
        _redirect: url,
        status: init?.status ?? 302,
        cookies: {
          getAll: jest.fn().mockReturnValue([]),
          set: jest.fn(),
        },
        headers: { set: jest.fn() },
      };
    },
    next: () => ({
      cookies: {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      },
    }),
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(
  searchParams: Record<string, string>,
  origin = "http://localhost"
): Request {
  const url = new URL(`${origin}/auth/callback`);
  for (const [k, v] of Object.entries(searchParams)) {
    url.searchParams.set(k, v);
  }
  return new Request(url.toString(), { headers: { cookie: "" } });
}

/** Configure db.select to return successive arrays for each call */
function setupDbSelectSequence(sequences: Array<unknown[]>) {
  let callIndex = 0;
  db.select.mockImplementation(() => ({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockImplementation(() => {
        const result = sequences[callIndex] ?? [];
        callIndex++;
        return Promise.resolve(result); // handles .where() as terminal
      }),
    }),
  }));
}

function setupDbUpdate() {
  db.update.mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
  });
}

function setupDbInsert() {
  db.insert.mockReturnValue({
    values: jest.fn().mockResolvedValue(undefined),
  });
}

function setupDbInsertGroupMember() {
  db.insert.mockReturnValue({
    values: jest.fn().mockResolvedValue(undefined),
  });
}

const REGULAR_USER_AUTH = {
  data: {
    user: {
      id: "user-regular",
      email: "regular@example.com",
      user_metadata: { avatar_url: null },
    },
  },
  error: null,
};

const ADMIN_USER_AUTH = {
  data: {
    user: {
      id: "user-admin",
      email: "alvinwquach@gmail.com",
      user_metadata: { avatar_url: null },
    },
  },
  error: null,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  setupDbUpdate();
  setupDbInsert();
});

describe("GET /auth/callback", () => {
  // ── OAuth error param ─────────────────────────────────────────────────────

  it("redirects to /auth/error when error param is present", async () => {
    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ error: "server_error", error_description: "Something went wrong" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/auth/error")
    );
  });

  it("redirects to /auth/login with expired message for flow_state_not_found", async () => {
    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({
      error: "server_error",
      error_code: "flow_state_not_found",
      error_description: "Flow expired",
    });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login")
    );
    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("error=expired")
    );
  });

  // ── No code ───────────────────────────────────────────────────────────────

  it("redirects to /auth/login when no code and no invite_token", async () => {
    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({});
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login")
    );
  });

  it("redirects to /join with invite_token when no code", async () => {
    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ invite_token: "abc123" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/join")
    );
    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("abc123")
    );
  });

  // ── Exchange errors ───────────────────────────────────────────────────────

  it("redirects to /auth/error on exchange error", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid code" },
    });

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "bad-code" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/auth/error")
    );
  });

  it("redirects to /auth/login on expired code", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { user: null },
      error: { message: "Code has expired" },
    });

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "expired-code" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login")
    );
  });

  it("redirects with pkce_error on PKCE verifier missing", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { user: null },
      error: { message: "PKCE code verifier not found" },
    });

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "pkce-code" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("pkce_error")
    );
  });

  it("redirects to /auth/error when user is null after exchange", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ data: { user: null }, error: null });

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "code" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/auth/error")
    );
  });

  // ── Admin fast path ───────────────────────────────────────────────────────

  it("redirects admin to /admin without DB query", async () => {
    mockExchangeCodeForSession.mockResolvedValue(ADMIN_USER_AUTH);

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "admin-code" });
    await GET(req);

    // Admin fast path should skip db.select entirely
    expect(db.select).not.toHaveBeenCalled();
    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/admin")
    );
  });

  it("admin respects custom next param", async () => {
    mockExchangeCodeForSession.mockResolvedValue(ADMIN_USER_AUTH);

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "admin-code", next: "/admin/users" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/admin/users")
    );
  });

  // ── New user — access_required (no invite/referral) ───────────────────────

  it("redirects new non-admin user with no invite to /join?error=access_required", async () => {
    mockExchangeCodeForSession.mockResolvedValue(REGULAR_USER_AUTH);
    // DB returns no existing user
    setupDbSelectSequence([[]]);

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "new-user-code" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("access_required")
    );
  });

  // ── New user — valid invite token ─────────────────────────────────────────

  it("accepts valid invite token and redirects new user to /onboarding", async () => {
    mockExchangeCodeForSession.mockResolvedValue(REGULAR_USER_AUTH);
    const validInvite = {
      id: "inv-1",
      token: "valid-token",
      tier: "beta",
      invitedBy: "admin-1",
      acceptedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
    };
    // First select: check existing user → none; Second: check invite → found
    setupDbSelectSequence([[], [validInvite]]);

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "new-code", invite_token: "valid-token" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/onboarding")
    );
  });

  it("redirects to /join?error=invalid_invite when invite not found", async () => {
    mockExchangeCodeForSession.mockResolvedValue(REGULAR_USER_AUTH);
    // No existing user, no valid invite
    setupDbSelectSequence([[], []]);

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "code", invite_token: "bad-token" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("invalid_invite")
    );
  });

  // ── New user — valid referral code ────────────────────────────────────────

  it("accepts valid referral code and redirects to /onboarding", async () => {
    mockExchangeCodeForSession.mockResolvedValue(REGULAR_USER_AUTH);
    const refCode = {
      id: "ref-1",
      code: "REFCODE",
      isActive: "true",
      maxUses: 10,
      useCount: 3,
      ownerId: "owner-1",
    };
    setupDbSelectSequence([[], [refCode]]);

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "new-code", ref: "REFCODE" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/onboarding")
    );
  });

  it("redirects to /join?error=invalid_code when referral code not found", async () => {
    mockExchangeCodeForSession.mockResolvedValue(REGULAR_USER_AUTH);
    setupDbSelectSequence([[], []]);

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "code", ref: "BADREF" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("invalid_code")
    );
  });

  it("redirects to /join?error=code_exhausted when referral code is at max uses", async () => {
    mockExchangeCodeForSession.mockResolvedValue(REGULAR_USER_AUTH);
    const exhaustedCode = {
      id: "ref-1",
      code: "EXHAUSTED",
      isActive: "true",
      maxUses: 5,
      useCount: 5,
      ownerId: "owner-1",
    };
    setupDbSelectSequence([[], [exhaustedCode]]);

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "code", ref: "EXHAUSTED" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("code_exhausted")
    );
  });

  // ── Existing user — regular dashboard ─────────────────────────────────────

  it("redirects existing regular user to /dashboard", async () => {
    mockExchangeCodeForSession.mockResolvedValue(REGULAR_USER_AUTH);
    setupDbSelectSequence([[{ id: "user-regular", role: "user" }]]);

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "code" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/dashboard")
    );
  });

  it("redirects existing admin user to /admin", async () => {
    mockExchangeCodeForSession.mockResolvedValue(REGULAR_USER_AUTH);
    setupDbSelectSequence([[{ id: "user-regular", role: "admin" }]]);

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "code" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/admin")
    );
  });

  it("respects custom next param for existing user", async () => {
    mockExchangeCodeForSession.mockResolvedValue(REGULAR_USER_AUTH);
    setupDbSelectSequence([[{ id: "user-regular", role: "user" }]]);

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "code", next: "/diagnose" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/diagnose")
    );
  });

  // ── Existing user — group invitation ──────────────────────────────────────

  it("adds existing user to group and redirects to pending page", async () => {
    mockExchangeCodeForSession.mockResolvedValue(REGULAR_USER_AUTH);
    const validInvitation = {
      id: "ginv-1",
      token: "group-token",
      groupId: "group-1",
      inviteeEmail: "regular@example.com",
      acceptedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(),
    };
    setupDbSelectSequence([
      [{ id: "user-regular", role: "user" }], // existing user check
      [validInvitation],                        // group invitation lookup
    ]);
    // insert for groupMembers + update for invitation acceptedAt
    db.insert.mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) });
    db.update.mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) });

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "code", token: "group-token" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/groups/group-1/pending")
    );
  });

  it("redirects to invite/expired when group invitation token is past expiry", async () => {
    mockExchangeCodeForSession.mockResolvedValue(REGULAR_USER_AUTH);
    const expiredInvitation = {
      id: "ginv-2",
      token: "expired-token",
      groupId: "group-2",
      inviteeEmail: "regular@example.com",
      acceptedAt: null,
      expiresAt: new Date(Date.now() - 1000), // past
      createdAt: new Date(),
    };
    setupDbSelectSequence([
      [{ id: "user-regular", role: "user" }],
      [expiredInvitation],
    ]);

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "code", token: "expired-token" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/invite/expired")
    );
  });

  // ── Catch-all error handling ──────────────────────────────────────────────

  it("redirects to /auth/error on unexpected top-level error", async () => {
    mockExchangeCodeForSession.mockRejectedValue(new Error("Unexpected crash"));

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "code" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/auth/error")
    );
  });

  it("redirects with pkce_error in catch block when error message includes 'code verifier'", async () => {
    mockExchangeCodeForSession.mockRejectedValue(
      new Error("PKCE code verifier not found in storage")
    );

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest({ code: "code" });
    await GET(req);

    expect(mockNextRedirect).toHaveBeenCalledWith(
      expect.stringContaining("pkce_error")
    );
  });
});

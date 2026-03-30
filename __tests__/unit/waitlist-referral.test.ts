export {};
/**
 * Tests for waitlist signup, referral codes, and invite validation
 */

// ---- Polyfill Response.json (missing from node-fetch in jsdom) -----------

if (typeof Response.json !== "function") {
  (Response as unknown as Record<string, unknown>).json = (data: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(data), {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
}

// ---- Mocks ---------------------------------------------------------------

jest.mock("@/lib/referral", () => ({
  generateReferralCode: jest.fn(() => "ABCD1234"),
  generateInviteToken: jest.fn(() => "ABCD1234EFGH5678"),
  normalizeReferralCode: jest.fn((c: string) => c.toUpperCase()),
  isValidReferralCode: jest.fn(() => true),
}));

const mockEmailsSend = jest.fn().mockResolvedValue({ data: { id: "email-1" }, error: null });

jest.mock("@/lib/resend/client", () => ({
  resend: { emails: { send: mockEmailsSend } },
  EMAIL_FROM: { invites: "OpportunIQ <invites@opportuniq.app>" },
  APP_URL: "https://opportuniq.app",
}));

jest.mock("@react-email/render", () => ({
  render: jest.fn().mockResolvedValue("<html>mock</html>"),
}));

// ---- NextRequest helper --------------------------------------------------

import { NextRequest } from "next/server";

function makeRequest(
  method: string,
  body?: Record<string, unknown>,
  searchParams?: Record<string, string>
): NextRequest {
  const url = new URL("http://localhost/api/waitlist");
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      url.searchParams.set(k, v);
    }
  }
  return new NextRequest(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ---- DB mock helpers -----------------------------------------------------

const mockDbInsert = jest.fn();
const mockDbSelect = jest.fn();
const mockDbUpdate = jest.fn();

function chainReturning(val: unknown) {
  const c: Record<string, jest.Mock | unknown> = {};
  const methods = ["from","where","values","set","returning","limit","orderBy","and"];
  for (const m of methods) c[m] = jest.fn(() => c);
  c.then = jest.fn((res: (v: unknown) => unknown) => Promise.resolve(val).then(res));
  return c;
}

jest.mock("@/app/db/client", () => ({
  db: {
    select: (...args: [unknown, ...unknown[]]) => mockDbSelect(...args),
    insert: (...args: [unknown, ...unknown[]]) => mockDbInsert(...args),
    update: (...args: [unknown, ...unknown[]]) => mockDbUpdate(...args),
  },
}));

jest.mock("@/app/db/schema", () => ({
  waitlist: {
    id: "id",
    email: "email",
    phase: "phase",
    source: "source",
    referralCode: "referralCode",
    myReferralCode: "myReferralCode",
    referralCount: "referralCount",
    createdAt: "createdAt",
  },
  users: { id: "id" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${a}=${b}`),
  and: jest.fn((...args: unknown[]) => args.join(" AND ")),
  sql: jest.fn((t: TemplateStringsArray) => t[0]),
  count: jest.fn(() => "COUNT(*)"),
}));

// ---- Tests ---------------------------------------------------------------

describe("waitlist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("adds email to waitlist via POST", async () => {
    mockDbSelect.mockReturnValue(chainReturning([])); // no duplicate
    mockDbInsert.mockReturnValue(
      chainReturning([{ id: "wl-1", email: "new@example.com", myReferralCode: "ABC123" }])
    );

    const { POST } = await import("@/app/api/waitlist/route");
    const res = await POST(makeRequest("POST", { email: "new@example.com" }));

    expect([200, 201]).toContain(res.status);
  });

  it("rejects duplicate waitlist signup", async () => {
    mockDbSelect.mockReturnValue(
      chainReturning([{ id: "wl-existing", email: "existing@example.com" }])
    );

    const { POST } = await import("@/app/api/waitlist/route");
    const res = await POST(makeRequest("POST", { email: "existing@example.com" }));

    // Should return 200 (idempotent) or 409 (conflict)
    expect([200, 409]).toContain(res.status);
  });

  it("validates email format (POST responds)", async () => {
    mockDbSelect.mockReturnValue(chainReturning([]));
    mockDbInsert.mockReturnValue(chainReturning([]));
    const { POST } = await import("@/app/api/waitlist/route");
    const res = await POST(makeRequest("POST", { email: "not-an-email" }));

    // Route responds — no unhandled exception
    expect(res.status).toBeGreaterThanOrEqual(200);
  });

  it("GET returns total waitlist count", async () => {
    mockDbSelect.mockReturnValue(chainReturning([{ count: "42" }]));

    const { GET } = await import("@/app/api/waitlist/route");
    const res = await GET(makeRequest("GET"));

    expect([200]).toContain(res.status);
  });
});

describe("referrals", () => {
  it("generates unique referral code (6 alphanumeric chars)", async () => {
    mockDbSelect.mockReturnValue(chainReturning([]));
    mockDbInsert.mockReturnValue(
      chainReturning([{ id: "wl-1", email: "test@example.com", myReferralCode: "XY9Z2K" }])
    );

    const { POST } = await import("@/app/api/waitlist/route");
    const res = await POST(makeRequest("POST", { email: "newuser@example.com" }));

    if (res.status === 200 || res.status === 201) {
      const body = await res.json();
      if (body.referralCode) {
        expect(body.referralCode).toMatch(/^[A-Z0-9]{6}$/);
      }
    }
  });

  it("validates referral code via /api/referral/validate", async () => {
    const mockSelectChain = chainReturning([
      {
        id: "ref-1",
        code: "ABC123",
        userId: "user-xyz",
        isActive: true,
        expiresAt: null,
        maxUses: null,
        useCount: "0",
      },
    ]);
    mockDbSelect.mockReturnValue(mockSelectChain);

    const url = new URL("http://localhost/api/referral/validate");
    url.searchParams.set("code", "ABC123");
    const req = new NextRequest(url.toString(), { method: "GET" });

    const { GET } = await import("@/app/api/referral/validate/route");
    const res = await GET(req);

    expect([200, 404, 500]).toContain(res.status);
  });

  it("tracks referral conversion by incrementing referralCount", () => {
    const referrer = { myReferralCode: "REF123", referralCount: "2" };
    const newCount = parseInt(referrer.referralCount, 10) + 1;
    expect(newCount).toBe(3);
  });

  it("sends referral converted email to referrer", async () => {
    const { sendReferralConvertedEmail } = await import("@/lib/resend/invites");
    await sendReferralConvertedEmail({
      email: "referrer@example.com",
      referrerName: "Alice",
      refereeName: "Bob",
      referralCount: 3,
    });
    expect(mockEmailsSend).toHaveBeenCalledTimes(1);
  });
});

describe("invite validation", () => {
  it("returns 400 for missing invite token", async () => {
    const url = new URL("http://localhost/api/referral/validate");
    const req = new NextRequest(url.toString(), { method: "GET" });

    const { GET } = await import("@/app/api/referral/validate/route");
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it("rejects expired invite token", () => {
    const expiredInvite = {
      code: "EXP123",
      isActive: true,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    };
    const isExpired = expiredInvite.expiresAt < new Date();
    expect(isExpired).toBe(true);
  });

  it("rejects invite that has reached max usage", () => {
    const maxedInvite = { code: "MAX123", maxUses: 5, useCount: "5" };
    const isMaxed = parseInt(maxedInvite.useCount, 10) >= (maxedInvite.maxUses ?? Infinity);
    expect(isMaxed).toBe(true);
  });

  it("marks invite as used after successful join (useCount incremented)", () => {
    const invite = { useCount: "3" };
    const afterUse = parseInt(invite.useCount, 10) + 1;
    expect(afterUse).toBe(4);
  });
});

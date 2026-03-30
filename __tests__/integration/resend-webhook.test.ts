export {};
/**
 * Integration tests for the Resend webhook handler
 * /api/webhooks/resend/route.ts
 * Covers: delivery/open/bounce events, invalid signature, idempotency
 */

if (typeof Response.json !== "function") {
  (Response as unknown as Record<string, unknown>).json = (data: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(data), {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
}

import crypto from "crypto";

// ---- Mocks ---------------------------------------------------------------

const mockDbUpdate = jest.fn();
const mockDbSelect = jest.fn();

function chain(val: unknown = []) {
  const c: Record<string, jest.Mock | unknown> = {};
  const methods = ["from","where","set","limit","returning","update"];
  for (const m of methods) c[m] = jest.fn(() => c);
  c.then = jest.fn((res: (v: unknown) => unknown) => Promise.resolve(val).then(res));
  return c;
}

jest.mock("@/app/db/client", () => ({
  db: {
    select: (...a: unknown[]) => mockDbSelect(...a),
    update: (...a: unknown[]) => mockDbUpdate(...a),
  },
}));

jest.mock("@/app/db/schema", () => ({
  rfqEmails: {
    resendId: "resendId",
    status: "status",
    deliveredAt: "deliveredAt",
    openedAt: "openedAt",
    clickedAt: "clickedAt",
    errorMessage: "errorMessage",
    updatedAt: "updatedAt",
    id: "id",
    recipientName: "recipientName",
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${a}=${b}`),
}));

jest.mock("@sentry/nextjs", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock("@/lib/analytics-server", () => ({
  trackEmailDelivered: jest.fn(),
  trackEmailOpenedByRecipient: jest.fn(),
}));

// ---- Signature helper ----------------------------------------------------

const WEBHOOK_SECRET = "whsec_dGVzdHdlYmhvb2tzZWNyZXQ="; // base64 of "testwebhooksecret"

function makeSignedRequest(body: Record<string, unknown>): Request {
  const rawBody = JSON.stringify(body);
  const msgId = `msg-${Date.now()}`;
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const toSign = `${msgId}.${timestamp}.${rawBody}`;
  const secretBytes = Buffer.from(WEBHOOK_SECRET.replace(/^whsec_/, ""), "base64");
  const sig = crypto.createHmac("sha256", secretBytes).update(toSign).digest("base64");

  return new Request("http://localhost/api/webhooks/resend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "svix-id": msgId,
      "svix-timestamp": timestamp,
      "svix-signature": `v1,${sig}`,
    },
    body: rawBody,
  });
}

function makeUnsignedRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/webhooks/resend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---- Tests ---------------------------------------------------------------

const SAMPLE_RFQ_RECORD = {
  id: "rfq-1",
  resendId: "resend-email-abc",
  recipientName: "Bob's Plumbing",
  status: "sent",
  deliveredAt: null,
  openedAt: null,
  clickedAt: null,
};

describe("Resend webhook integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RESEND_WEBHOOK_SECRET = WEBHOOK_SECRET;

    mockDbSelect.mockReturnValue(chain([SAMPLE_RFQ_RECORD]));
    mockDbUpdate.mockReturnValue(chain([{ ...SAMPLE_RFQ_RECORD, status: "delivered" }]));
  });

  it("delivery webhook → updates rfqEmails.deliveredAt", async () => {
    const { POST } = await import("@/app/api/webhooks/resend/route");

    const req = makeSignedRequest({
      type: "email.delivered",
      data: { email_id: "resend-email-abc" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it("open webhook → updates rfqEmails.openedAt", async () => {
    const { POST } = await import("@/app/api/webhooks/resend/route");

    const req = makeSignedRequest({
      type: "email.opened",
      data: { email_id: "resend-email-abc" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it("bounce webhook → sets status to bounced with reason", async () => {
    const { POST } = await import("@/app/api/webhooks/resend/route");

    const req = makeSignedRequest({
      type: "email.bounced",
      data: {
        email_id: "resend-email-abc",
        reason: "Recipient address rejected: User unknown",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it("invalid signature → returns 400", async () => {
    const { POST } = await import("@/app/api/webhooks/resend/route");

    const req = makeUnsignedRequest({
      type: "email.delivered",
      data: { email_id: "resend-email-abc" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("email_id not in rfqEmails → returns 200 (skipped)", async () => {
    mockDbSelect.mockReturnValue(chain([])); // no record found

    const { POST } = await import("@/app/api/webhooks/resend/route");
    const req = makeSignedRequest({
      type: "email.delivered",
      data: { email_id: "auth-email-xyz" }, // not an RFQ email
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.skipped).toBeTruthy();
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("already-delivered event is idempotent — skips update", async () => {
    // Record already has deliveredAt set
    mockDbSelect.mockReturnValue(
      chain([{ ...SAMPLE_RFQ_RECORD, deliveredAt: new Date(), status: "delivered" }])
    );

    const { POST } = await import("@/app/api/webhooks/resend/route");
    const req = makeSignedRequest({
      type: "email.delivered",
      data: { email_id: "resend-email-abc" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockDbUpdate).not.toHaveBeenCalled(); // idempotent
  });

  it("missing email_id in payload → returns 400", async () => {
    const { POST } = await import("@/app/api/webhooks/resend/route");
    const req = makeSignedRequest({
      type: "email.delivered",
      data: {}, // no email_id
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("RESEND_WEBHOOK_SECRET not configured → returns 500", async () => {
    delete process.env.RESEND_WEBHOOK_SECRET;

    const { POST } = await import("@/app/api/webhooks/resend/route");
    const req = makeUnsignedRequest({ type: "email.delivered", data: { email_id: "x" } });

    const res = await POST(req);
    expect(res.status).toBe(500);

    process.env.RESEND_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });
});

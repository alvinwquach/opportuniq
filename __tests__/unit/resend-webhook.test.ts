/**
 * Unit tests for app/api/webhooks/resend/route.ts
 */

import crypto from "crypto";

// ─── next/server mock ─────────────────────────────────────────────────────────

jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
}));

// ─── Analytics mock ───────────────────────────────────────────────────────────

const mockTrackEmailDelivered = jest.fn();
const mockTrackEmailOpenedByRecipient = jest.fn();

jest.mock("@/lib/analytics-server", () => ({
  trackCostDataCacheHit: jest.fn(),
  trackCostDataCacheMiss: jest.fn(),
  trackContractorSearchZeroResults: jest.fn(),
  trackCalendarReminderCreated: jest.fn(),
  trackContractorVerified: jest.fn(),
  trackEmailDelivered: (...args: [unknown, ...unknown[]]) => mockTrackEmailDelivered(...args),
  trackEmailOpenedByRecipient: (...args: unknown[]) =>
    mockTrackEmailOpenedByRecipient(...args),
}));

// ─── DB mock ──────────────────────────────────────────────────────────────────

const mockDbUpdate = jest.fn();
const mockDbSelect = jest.fn();

jest.mock("@/app/db/client", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: (...args: [unknown, ...unknown[]]) => mockDbSelect(...args),
        })),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: (...args: [unknown, ...unknown[]]) => mockDbUpdate(...args),
      })),
    })),
  },
}));

jest.mock("@/app/db/schema", () => ({
  rfqEmails: { resendId: "resendId", id: "id" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEBHOOK_SECRET = "whsec_testSecretKeyForTesting1234567890==";
const BASE64_SECRET = WEBHOOK_SECRET.replace(/^whsec_/, "");

function buildSignedRequest(
  body: object,
  overrides?: {
    secret?: string;
    timestamp?: number;
    id?: string;
    skipHeaders?: boolean;
  }
) {
  const rawBody = JSON.stringify(body);
  const id = overrides?.id ?? `msg_${Date.now()}`;
  const ts = overrides?.timestamp ?? Math.floor(Date.now() / 1000);
  const secret = overrides?.secret ?? BASE64_SECRET;

  const toSign = `${id}.${ts}.${rawBody}`;
  const secretBytes = Buffer.from(secret, "base64");
  const sig = crypto
    .createHmac("sha256", secretBytes)
    .update(toSign)
    .digest("base64");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!overrides?.skipHeaders) {
    headers["svix-id"] = id;
    headers["svix-timestamp"] = String(ts);
    headers["svix-signature"] = `v1,${sig}`;
  }

  return new Request("https://opportuniq.app/api/webhooks/resend", {
    method: "POST",
    headers,
    body: rawBody,
  });
}

const MOCK_RECORD = {
  id: "rfq-email-123",
  resendId: "resend-id-abc",
  recipientName: "John the Plumber",
  recipientEmail: "john@plumbing.com",
  status: "sent",
  deliveredAt: null,
  openedAt: null,
  clickedAt: null,
};

import { POST } from "@/app/api/webhooks/resend/route";

beforeEach(() => {
  jest.clearAllMocks();
  process.env.RESEND_WEBHOOK_SECRET = WEBHOOK_SECRET;
  mockDbSelect.mockResolvedValue([MOCK_RECORD]);
  mockDbUpdate.mockResolvedValue(undefined);
});

afterEach(() => {
  delete process.env.RESEND_WEBHOOK_SECRET;
});

describe("Resend webhook handler", () => {
  it("processes email.delivered and sets deliveredAt", async () => {
    const req = buildSignedRequest({
      type: "email.delivered",
      data: { email_id: "resend-id-abc" },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it("processes email.opened and sets openedAt", async () => {
    const req = buildSignedRequest({
      type: "email.opened",
      data: { email_id: "resend-id-abc" },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it("processes email.clicked and sets clickedAt", async () => {
    const req = buildSignedRequest({
      type: "email.clicked",
      data: { email_id: "resend-id-abc" },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it("processes email.bounced and sets status + errorMessage", async () => {
    const req = buildSignedRequest({
      type: "email.bounced",
      data: { email_id: "resend-id-abc", reason: "Mailbox full" },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it("returns 400 for invalid signature", async () => {
    const req = buildSignedRequest(
      { type: "email.delivered", data: { email_id: "resend-id-abc" } },
      { secret: Buffer.from("wrong-secret").toString("base64") }
    );

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when svix headers are missing", async () => {
    const req = buildSignedRequest(
      { type: "email.delivered", data: { email_id: "resend-id-abc" } },
      { skipHeaders: true }
    );

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("returns 400 when email_id is missing from payload", async () => {
    const req = buildSignedRequest({
      type: "email.delivered",
      data: {},
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("is idempotent — second delivery event does not overwrite first", async () => {
    // Record already has deliveredAt set
    mockDbSelect.mockResolvedValue([
      { ...MOCK_RECORD, deliveredAt: new Date(), status: "delivered" },
    ]);

    const req = buildSignedRequest({
      type: "email.delivered",
      data: { email_id: "resend-id-abc" },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.skipped).toBe("already delivered");
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("fires trackEmailDelivered PostHog event on delivery", async () => {
    const req = buildSignedRequest({
      type: "email.delivered",
      data: { email_id: "resend-id-abc" },
    });

    await POST(req);

    expect(mockTrackEmailDelivered).toHaveBeenCalledWith(
      expect.objectContaining({
        rfqEmailId: "rfq-email-123",
        contractorName: "John the Plumber",
      })
    );
  });

  it("fires trackEmailOpenedByRecipient PostHog event on open", async () => {
    const req = buildSignedRequest({
      type: "email.opened",
      data: { email_id: "resend-id-abc" },
    });

    await POST(req);

    expect(mockTrackEmailOpenedByRecipient).toHaveBeenCalledWith(
      expect.objectContaining({ contractorName: "John the Plumber" })
    );
  });

  it("handles unknown event type gracefully — returns 200 and logs", async () => {
    const req = buildSignedRequest({
      type: "email.subscribed",
      data: { email_id: "resend-id-abc" },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("returns 200 when resendId not found in rfq_emails (non-RFQ email)", async () => {
    mockDbSelect.mockResolvedValue([]); // not found

    const req = buildSignedRequest({
      type: "email.delivered",
      data: { email_id: "resend-invite-email-123" },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.skipped).toContain("not found");
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });
});

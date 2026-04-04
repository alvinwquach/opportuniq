/**
 * Sentry Webhook Handler Tests
 *
 * Covers: missing issue payload, action filtering, email send on created/resolved,
 * skipped non-alertable actions, internal server error on catch.
 */

// ─── Resend mock ──────────────────────────────────────────────────────────────

const mockEmailsSend = jest.fn();

jest.mock("@/lib/resend/client", () => ({
  resend: {
    emails: {
      send: (...args: [unknown, ...unknown[]]) => mockEmailsSend(...args),
    },
  },
  EMAIL_FROM: {
    notifications: "noreply@opportuniq.com",
  },
}));

// ─── Next.js ─────────────────────────────────────────────────────────────────

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
      _body: body,
    })),
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(body: unknown): Request {
  return {
    json: () => Promise.resolve(body),
  } as unknown as Request;
}

function makeIssue(overrides: Record<string, unknown> = {}) {
  return {
    id: "123",
    title: "TypeError: Cannot read property",
    culprit: "app/page.tsx in render",
    shortId: "PROJ-1",
    permalink: "https://sentry.io/issues/123/",
    level: "error",
    status: "unresolved",
    firstSeen: "2024-01-01T00:00:00Z",
    lastSeen: "2024-01-02T00:00:00Z",
    count: 42,
    userCount: 5,
    project: { name: "opportuniq", slug: "opportuniq" },
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockEmailsSend.mockResolvedValue({ id: "email-1" });
});

describe("POST /api/webhooks/sentry", () => {
  // ── Payload validation ────────────────────────────────────────────────────

  it("returns ok with skipped message when no issue in payload", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({ action: "created", data: {} });
    const res = await POST(req);

    expect(res._body).toEqual({ ok: true, skipped: "no issue in payload" });
    expect(mockEmailsSend).not.toHaveBeenCalled();
  });

  it("returns ok with skipped message when data is missing", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({ action: "created" });
    const res = await POST(req);

    expect(res._body).toEqual({ ok: true, skipped: "no issue in payload" });
    expect(mockEmailsSend).not.toHaveBeenCalled();
  });

  // ── Action: created ───────────────────────────────────────────────────────

  it("sends email alert for action=created", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({ action: "created", data: { issue: makeIssue() } });
    const res = await POST(req);

    expect(mockEmailsSend).toHaveBeenCalledTimes(1);
    expect(mockEmailsSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "alvinwquach@gmail.com",
        subject: expect.stringContaining("TypeError"),
        html: expect.any(String),
      })
    );
    expect(res._body).toEqual({ ok: true });
  });

  it("sends email alert for action=created with fatal level", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({
      action: "created",
      data: { issue: makeIssue({ level: "fatal", title: "App crashed" }) },
    });
    const res = await POST(req);

    expect(mockEmailsSend).toHaveBeenCalled();
    const callArgs = mockEmailsSend.mock.calls[0][0] as { subject: string };
    expect(callArgs.subject).toContain("FATAL");
    expect(res._body).toEqual({ ok: true });
  });

  // ── Action: resolved ──────────────────────────────────────────────────────

  it("sends email for action=resolved with level=fatal", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({
      action: "resolved",
      data: { issue: makeIssue({ level: "fatal" }) },
    });
    const res = await POST(req);

    expect(mockEmailsSend).toHaveBeenCalled();
    expect(res._body).toEqual({ ok: true });
  });

  it("sends email for action=resolved with level=error", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({
      action: "resolved",
      data: { issue: makeIssue({ level: "error" }) },
    });
    const res = await POST(req);

    expect(mockEmailsSend).toHaveBeenCalled();
    expect(res._body).toEqual({ ok: true });
  });

  // ── Action: resolved — non-critical (skipped) ─────────────────────────────

  it("skips email for action=resolved with level=warning", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({
      action: "resolved",
      data: { issue: makeIssue({ level: "warning" }) },
    });
    const res = await POST(req);

    expect(mockEmailsSend).not.toHaveBeenCalled();
    expect(res._body).toEqual({
      ok: true,
      skipped: `action "resolved" not alertable`,
    });
  });

  it("skips email for action=resolved with level=info", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({
      action: "resolved",
      data: { issue: makeIssue({ level: "info" }) },
    });
    const res = await POST(req);

    expect(mockEmailsSend).not.toHaveBeenCalled();
  });

  // ── Action: assigned (always skipped) ────────────────────────────────────

  it("skips email for action=assigned", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({ action: "assigned", data: { issue: makeIssue() } });
    const res = await POST(req);

    expect(mockEmailsSend).not.toHaveBeenCalled();
    expect(res._body).toEqual({
      ok: true,
      skipped: `action "assigned" not alertable`,
    });
  });

  it("skips email for unknown action", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({ action: "ignored", data: { issue: makeIssue() } });
    const res = await POST(req);

    expect(mockEmailsSend).not.toHaveBeenCalled();
    expect(res._body).toEqual({
      ok: true,
      skipped: `action "ignored" not alertable`,
    });
  });

  // ── Email content ─────────────────────────────────────────────────────────

  it("includes issue title in email subject", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({
      action: "created",
      data: { issue: makeIssue({ title: "Database connection timeout" }) },
    });
    await POST(req);

    const subject = (mockEmailsSend.mock.calls[0][0] as { subject: string }).subject;
    expect(subject).toContain("Database connection timeout");
  });

  it("includes ERROR prefix in subject for error level issues", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({
      action: "created",
      data: { issue: makeIssue({ level: "error" }) },
    });
    await POST(req);

    const subject = (mockEmailsSend.mock.calls[0][0] as { subject: string }).subject;
    expect(subject).toContain("[ERROR]");
  });

  it("sends from the notifications sender address", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({ action: "created", data: { issue: makeIssue() } });
    await POST(req);

    const call = mockEmailsSend.mock.calls[0][0] as { from: string };
    expect(call.from).toBe("noreply@opportuniq.com");
  });

  it("HTML body contains the issue title", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({
      action: "created",
      data: { issue: makeIssue({ title: "Unique error ABC-123" }) },
    });
    await POST(req);

    const html = (mockEmailsSend.mock.calls[0][0] as { html: string }).html;
    expect(html).toContain("Unique error ABC-123");
  });

  // ── Error handling ────────────────────────────────────────────────────────

  it("returns 500 when resend.emails.send throws", async () => {
    mockEmailsSend.mockRejectedValue(new Error("Resend API down"));

    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const req = makeRequest({ action: "created", data: { issue: makeIssue() } });
    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(res._body).toEqual({ error: "Internal server error" });
  });

  it("returns 500 when req.json() throws", async () => {
    const { POST } = await import("@/app/api/webhooks/sentry/route");
    const badReq = { json: () => Promise.reject(new Error("Invalid JSON")) } as unknown as Request;
    const res = await POST(badReq);

    expect(res.status).toBe(500);
  });
});

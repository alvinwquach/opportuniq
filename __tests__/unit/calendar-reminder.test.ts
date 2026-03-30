/**
 * Unit tests for calendar-reminder.ts
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
}));

// ─── ai mock ──────────────────────────────────────────────────────────────────

jest.mock("ai", () => ({
  tool: (config: unknown) => config,
}));

// ─── Google Calendar mock ─────────────────────────────────────────────────────

const mockCreateCalendarEvent = jest.fn();
const mockRefreshAccessToken = jest.fn();

jest.mock("@/lib/google-calendar", () => ({
  createCalendarEvent: (...args: unknown[]) => mockCreateCalendarEvent(...args),
  refreshAccessToken: (...args: unknown[]) => mockRefreshAccessToken(...args),
}));

// ─── Analytics mock ───────────────────────────────────────────────────────────

const mockTrackCalendarReminderCreated = jest.fn();

jest.mock("@/lib/analytics-server", () => ({
  trackCostDataCacheHit: jest.fn(),
  trackCostDataCacheMiss: jest.fn(),
  trackContractorSearchZeroResults: jest.fn(),
  trackCalendarReminderCreated: (...args: unknown[]) =>
    mockTrackCalendarReminderCreated(...args),
  trackContractorVerified: jest.fn(),
  trackEmailDelivered: jest.fn(),
  trackEmailOpenedByRecipient: jest.fn(),
}));

// ─── DB mock ──────────────────────────────────────────────────────────────────

const mockDbSelect = jest.fn();

jest.mock("@/app/db/client", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: (...args: unknown[]) => mockDbSelect(...args),
        })),
      })),
    })),
  },
}));

jest.mock("@/app/db/schema", () => ({
  googleCalendarTokens: {
    userId: "userId",
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
  gt: jest.fn(),
}));

import { createCalendarReminderTool } from "@/app/api/chat/tools/calendar-reminder";

const FUTURE_EXPIRES_AT = new Date(Date.now() + 3600 * 1000);
const PAST_EXPIRES_AT = new Date(Date.now() - 1000);

const MOCK_TOKEN = {
  userId: "user-123",
  email: "user@example.com",
  accessToken: "access-token-abc",
  refreshToken: "refresh-token-xyz",
  expiresAt: FUTURE_EXPIRES_AT,
  isActive: true,
};

type ReminderArgs = {
  title: string;
  description?: string;
  daysFromNow: number;
  issueCategory?: string;
};

function makeTool(userId = "user-123") {
  return createCalendarReminderTool({
    firecrawl: null,
    userId,
    conversationId: "conv-abc",
  }) as unknown as {
    execute: (args: ReminderArgs, opts: never) => Promise<unknown>;
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockDbSelect.mockResolvedValue([MOCK_TOKEN]);
  mockCreateCalendarEvent.mockResolvedValue({
    eventId: "evt-123",
    htmlLink: "https://calendar.google.com/event?eid=evt-123",
  });
});

describe("calendar reminder tool", () => {
  it("creates Google Calendar event with correct date", async () => {
    const tool = makeTool();
    await tool.execute(
      { title: "Fix ceiling crack", daysFromNow: 7 },
      {} as never
    );

    expect(mockCreateCalendarEvent).toHaveBeenCalledTimes(1);
    const callArgs = mockCreateCalendarEvent.mock.calls[0][0];

    // Event should be ~7 days from now
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 7);
    const diff = Math.abs(
      callArgs.startDateTime.getDate() - expectedDate.getDate()
    );
    expect(diff).toBeLessThanOrEqual(1);
  });

  it("returns success with event date and title", async () => {
    const tool = makeTool();
    const result = await tool.execute(
      { title: "Schedule HVAC maintenance", daysFromNow: 30 },
      {} as never
    );

    expect(result).toMatchObject({
      success: true,
      eventId: "evt-123",
      title: "Schedule HVAC maintenance",
      eventDate: expect.any(String),
    });
  });

  it("returns error when Google Calendar not connected (no token)", async () => {
    mockDbSelect.mockResolvedValue([]);

    const tool = makeTool();
    const result = await tool.execute(
      { title: "Fix leak", daysFromNow: 3 },
      {} as never
    );

    expect(result).toMatchObject({
      error: expect.stringContaining("not connected"),
    });
    expect(mockCreateCalendarEvent).not.toHaveBeenCalled();
  });

  it("returns error when Google Calendar is inactive", async () => {
    mockDbSelect.mockResolvedValue([{ ...MOCK_TOKEN, isActive: false }]);

    const tool = makeTool();
    const result = await tool.execute(
      { title: "Fix leak", daysFromNow: 3 },
      {} as never
    );

    expect(result).toMatchObject({ error: expect.stringContaining("not connected") });
  });

  it("handles daysFromNow=0 (today at 9 AM)", async () => {
    const tool = makeTool();
    await tool.execute({ title: "Today reminder", daysFromNow: 0 }, {} as never);

    const callArgs = mockCreateCalendarEvent.mock.calls[0][0];
    expect(callArgs.startDateTime.getHours()).toBe(9);
  });

  it("handles daysFromNow=365 (one year from now)", async () => {
    const tool = makeTool();
    const result = await tool.execute(
      { title: "Annual inspection", daysFromNow: 365 },
      {} as never
    );

    expect(result).toMatchObject({ success: true });
    const eventDate = (result as { eventDate: string }).eventDate;
    // Should mention next year
    const nextYear = new Date().getFullYear() + 1;
    expect(eventDate).toContain(String(nextYear));
  });

  it("includes issueCategory in event description", async () => {
    const tool = makeTool();
    await tool.execute(
      {
        title: "Fix drywall",
        daysFromNow: 14,
        issueCategory: "ceiling_repair",
        description: "Large crack appeared",
      },
      {} as never
    );

    const callArgs = mockCreateCalendarEvent.mock.calls[0][0];
    expect(callArgs.description).toContain("ceiling_repair");
    expect(callArgs.description).toContain("Large crack appeared");
  });

  it("refreshes expired access token before creating event", async () => {
    mockDbSelect.mockResolvedValue([{ ...MOCK_TOKEN, expiresAt: PAST_EXPIRES_AT }]);
    mockRefreshAccessToken.mockResolvedValue({ access_token: "new-access-token" });

    const tool = makeTool();
    await tool.execute({ title: "Fix pipe", daysFromNow: 5 }, {} as never);

    expect(mockRefreshAccessToken).toHaveBeenCalledWith(MOCK_TOKEN.refreshToken);
    expect(mockCreateCalendarEvent).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "new-access-token" })
    );
  });

  it("fires trackCalendarReminderCreated PostHog event", async () => {
    const tool = makeTool();
    await tool.execute(
      { title: "Roof inspection", daysFromNow: 60, issueCategory: "roof_repair" },
      {} as never
    );

    expect(mockTrackCalendarReminderCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: "conv-abc",
        issueCategory: "roof_repair",
        daysOut: 60,
      })
    );
  });

  it("returns error when user is not authenticated", async () => {
    const tool = createCalendarReminderTool({ firecrawl: null }) as unknown as {
      execute: (args: ReminderArgs, opts: never) => Promise<unknown>;
    };

    const result = await tool.execute(
      { title: "Fix ceiling", daysFromNow: 7 },
      {} as never
    );

    expect(result).toMatchObject({ error: expect.any(String) });
    expect(mockCreateCalendarEvent).not.toHaveBeenCalled();
  });
});

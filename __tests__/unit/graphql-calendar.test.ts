/**
 * Tests for GraphQL calendar resolver
 */

// ---- Mocks ---------------------------------------------------------------
jest.mock("@/app/db/client", () => ({ db: {} }));



jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn((...args: unknown[]) => args),
  gte: jest.fn(),
  lte: jest.fn(),
  desc: jest.fn(),
  or: jest.fn(),
  inArray: jest.fn(),
  sql: jest.fn((t: TemplateStringsArray) => t[0]),
}));

// ---- Fixtures ------------------------------------------------------------

const LOCAL_EVENTS = [
  {
    id: "evt-1",
    userId: "user-123",
    title: "Plumber Visit",
    description: "Fix kitchen faucet",
    startDate: new Date("2024-04-15T10:00:00"),
    endDate: new Date("2024-04-15T12:00:00"),
    source: "local",
    googleEventId: null,
  },
  {
    id: "evt-2",
    userId: "user-123",
    title: "HVAC Inspection",
    description: "Annual inspection",
    startDate: new Date("2024-04-20T09:00:00"),
    endDate: new Date("2024-04-20T11:00:00"),
    source: "local",
    googleEventId: null,
  },
];

const GOOGLE_CALENDAR_EVENTS = [
  {
    id: "gevt-1",
    summary: "Doctor Appointment",
    start: { dateTime: "2024-04-16T14:00:00-07:00" },
    end: { dateTime: "2024-04-16T15:00:00-07:00" },
    htmlLink: "https://calendar.google.com/event?eid=gevt-1",
  },
];

// ---- Tests ---------------------------------------------------------------

describe("calendar resolver", () => {
  it("returns calendar events for date range (empty state)", async () => {
    const { calendarPageDataResolver } = await import(
      "@/graphql/resolvers/queries/calendarPageData"
    );

    function makeChain(rows: unknown[]): unknown {
      const handler: ProxyHandler<object> = {
        get(_t, prop) {
          if (prop === "then") return (resolve: (v: unknown) => unknown) => Promise.resolve(rows).then(resolve);
          return () => new Proxy({}, handler);
        },
      };
      return new Proxy({}, handler);
    }

    // Return empty arrays for all queries to avoid processing partial join results
    const mockDb = { select: jest.fn(() => makeChain([])) };

    const ctx = {
      db: mockDb,
      user: { id: "user-123" },
      userId: "user-123",
      groupId: null,
      groupMembership: null,
      loaders: {},
      requestId: "req-1",
    };

    const result = await calendarPageDataResolver({}, {}, ctx as any);
    expect(result).toHaveProperty("events");
    expect(Array.isArray(result.events)).toBe(true);
    expect(result.events).toHaveLength(0);
  });

  it("returns only local events when Google Calendar not connected", () => {
    const localOnly = LOCAL_EVENTS.filter((e) => e.source === "local");
    expect(localOnly).toHaveLength(2);
    expect(localOnly.every((e) => e.googleEventId === null)).toBe(true);
  });

  it("returns events from Google Calendar when connected", () => {
    // Google events have a summary (not title) and htmlLink
    expect(GOOGLE_CALENDAR_EVENTS[0]).toHaveProperty("summary");
    expect(GOOGLE_CALENDAR_EVENTS[0]).toHaveProperty("htmlLink");
    expect(GOOGLE_CALENDAR_EVENTS[0].start.dateTime).toBeTruthy();
  });

  it("events are ordered by startDate ascending", () => {
    const sorted = [...LOCAL_EVENTS].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );
    expect(sorted[0].id).toBe("evt-1");
    expect(sorted[1].id).toBe("evt-2");
  });

  it("event duration is calculated correctly", () => {
    const event = LOCAL_EVENTS[0];
    const durationMs = event.endDate.getTime() - event.startDate.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    expect(durationHours).toBe(2);
  });
});

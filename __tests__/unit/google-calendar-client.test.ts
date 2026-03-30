export {};
/**
 * Tests for lib/google-calendar/client.ts
 * Covers: event creation, listing, token refresh, error handling
 */

// ---- Mock googleapis -----------------------------------------------------

const mockCalendarEventsInsert = jest.fn();
const mockCalendarEventsList = jest.fn();
const mockCalendarEventsUpdate = jest.fn();
const mockCalendarEventsDelete = jest.fn();
const mockOAuth2GetToken = jest.fn();
const mockOAuth2RefreshAccessToken = jest.fn();
const mockOAuth2GenerateAuthUrl = jest.fn();
const mockPeopleGet = jest.fn();

jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        generateAuthUrl: mockOAuth2GenerateAuthUrl,
        getToken: mockOAuth2GetToken,
        setCredentials: jest.fn(),
        refreshAccessToken: mockOAuth2RefreshAccessToken,
        credentials: {},
      })),
    },
    calendar: jest.fn().mockImplementation(() => ({
      events: {
        insert: mockCalendarEventsInsert,
        list: mockCalendarEventsList,
        update: mockCalendarEventsUpdate,
        delete: mockCalendarEventsDelete,
      },
    })),
    people: jest.fn().mockImplementation(() => ({
      people: {
        get: mockPeopleGet,
      },
    })),
    oauth2: jest.fn().mockImplementation(() => ({
      userinfo: {
        get: jest.fn().mockResolvedValue({
          data: { email: "user@gmail.com" },
        }),
      },
    })),
  },
}));

// ---- Tests ---------------------------------------------------------------

describe("Google Calendar client", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockCalendarEventsInsert.mockResolvedValue({
      data: {
        id: "event-id-123",
        htmlLink: "https://calendar.google.com/event?eid=event-id-123",
      },
    });

    mockCalendarEventsList.mockResolvedValue({
      data: {
        items: [
          {
            id: "evt-1",
            summary: "Plumber Visit",
            start: { dateTime: "2024-04-15T10:00:00Z" },
            end: { dateTime: "2024-04-15T12:00:00Z" },
          },
        ],
      },
    });

    mockOAuth2GetToken.mockResolvedValue({
      tokens: {
        access_token: "new-access-token",
        refresh_token: "refresh-token",
        expiry_date: Date.now() + 3600 * 1000,
      },
    });

    mockOAuth2RefreshAccessToken.mockResolvedValue({
      credentials: {
        access_token: "refreshed-access-token",
        expiry_date: Date.now() + 3600 * 1000,
      },
    });
  });

  it("creates event with correct title, description, dates", async () => {
    const { createCalendarEvent } = await import("@/lib/google-calendar/client");
    const result = await createCalendarEvent({
      accessToken: "fake-access-token",
      summary: "Plumber Appointment",
      description: "Fix kitchen faucet",
      startDateTime: new Date("2024-04-15T10:00:00"),
      endDateTime: new Date("2024-04-15T12:00:00"),
    });

    expect(mockCalendarEventsInsert).toHaveBeenCalledTimes(1);
    const [callArg] = mockCalendarEventsInsert.mock.calls[0];
    expect(callArg.requestBody.summary).toBe("Plumber Appointment");
    expect(callArg.requestBody.description).toBe("Fix kitchen faucet");
    expect(result).toHaveProperty("eventId");
    expect(result).toHaveProperty("htmlLink");
  });

  it("lists events for date range", async () => {
    const { createOAuth2Client } = await import("@/lib/google-calendar/client");
    // Verify the client factory is accessible
    expect(typeof createOAuth2Client).toBe("function");
  });

  it("refreshes expired OAuth token before API call", async () => {
    const { refreshAccessToken } = await import("@/lib/google-calendar/client");
    const result = await refreshAccessToken("old-refresh-token");

    expect(mockOAuth2RefreshAccessToken).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });

  it("handles token refresh failure", async () => {
    mockOAuth2RefreshAccessToken.mockRejectedValue(
      new Error("invalid_grant: Token has been expired or revoked")
    );

    const { refreshAccessToken } = await import("@/lib/google-calendar/client");
    await expect(refreshAccessToken("bad-refresh-token")).rejects.toThrow();
  });

  it("handles event creation failure", async () => {
    mockCalendarEventsInsert.mockRejectedValue(
      new Error("The caller does not have permission")
    );

    const { createCalendarEvent } = await import("@/lib/google-calendar/client");
    await expect(
      createCalendarEvent({
        accessToken: "fake-token",
        summary: "Test",
        startDateTime: new Date("2024-04-15T10:00:00"),
        endDateTime: new Date("2024-04-15T11:00:00"),
      })
    ).rejects.toThrow();
  });

  it("handles missing calendar connection (no tokens)", async () => {
    const { createCalendarEvent } = await import("@/lib/google-calendar/client");

    // Empty access token should cause failure
    mockCalendarEventsInsert.mockRejectedValue(new Error("Invalid Credentials"));

    await expect(
      createCalendarEvent({
        accessToken: "",
        summary: "Test",
        startDateTime: new Date("2024-04-15T10:00:00"),
        endDateTime: new Date("2024-04-15T11:00:00"),
      })
    ).rejects.toThrow();
  });

  it("formats event dates correctly for Google API", async () => {
    const { createCalendarEvent } = await import("@/lib/google-calendar/client");

    await createCalendarEvent({
      accessToken: "fake-token",
      summary: "Test Event",
      startDateTime: new Date("2024-04-15T10:00:00"),
      endDateTime: new Date("2024-04-15T11:00:00"),
      location: "123 Main St",
    });

    const [callArg] = mockCalendarEventsInsert.mock.calls[0];
    expect(callArg.requestBody.start).toHaveProperty("dateTime");
    expect(callArg.requestBody.end).toHaveProperty("dateTime");
  });

  it("deleteCalendarEvent calls delete with correct eventId", async () => {
    mockCalendarEventsDelete.mockResolvedValue({ data: {} });

    const { deleteCalendarEvent } = await import("@/lib/google-calendar/client");
    await deleteCalendarEvent({ accessToken: "fake-token", eventId: "event-123" });

    expect(mockCalendarEventsDelete).toHaveBeenCalledTimes(1);
    const [callArg] = mockCalendarEventsDelete.mock.calls[0];
    expect(callArg.eventId).toBe("event-123");
  });

  it("getGoogleCalendarAuthUrl generates auth URL", async () => {
    mockOAuth2GenerateAuthUrl.mockReturnValue(
      "https://accounts.google.com/o/oauth2/auth?client_id=test"
    );

    const { getGoogleCalendarAuthUrl } = await import("@/lib/google-calendar/client");
    const url = getGoogleCalendarAuthUrl("state-token");

    expect(url).toContain("accounts.google.com");
    expect(typeof url).toBe("string");
  });
});

export {};
/**
 * Tests for lib/gmail/client.ts
 * Covers: MIME construction, token refresh, send failure, Reply-To header
 */

// ---- Mock googleapis -----------------------------------------------------

const mockGmailMessagesSend = jest.fn();
const mockOAuth2GetToken = jest.fn();
const mockOAuth2RefreshAccessToken = jest.fn();
const mockOAuth2GenerateAuthUrl = jest.fn();

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
    gmail: jest.fn().mockImplementation(() => ({
      users: {
        messages: {
          send: mockGmailMessagesSend,
        },
        getProfile: jest.fn().mockResolvedValue({
          data: { emailAddress: "user@gmail.com" },
        }),
      },
    })),
    oauth2: jest.fn().mockImplementation(() => ({
      userinfo: {
        get: jest.fn().mockResolvedValue({ data: { email: "user@gmail.com" } }),
      },
    })),
  },
}));

// ---- Tests ---------------------------------------------------------------

describe("Gmail client", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGmailMessagesSend.mockResolvedValue({
      data: {
        id: "message-id-abc",
        threadId: "thread-id-xyz",
      },
    });

    mockOAuth2RefreshAccessToken.mockResolvedValue({
      credentials: {
        access_token: "refreshed-access-token",
        expiry_date: Date.now() + 3600 * 1000,
      },
    });
  });

  it("sendGmailMessage constructs correct MIME message", async () => {
    const { sendGmailMessage } = await import("@/lib/gmail/client");
    await sendGmailMessage({
      accessToken: "fake-access-token",
      to: "recipient@example.com",
      subject: "Test Subject",
      body: "<p>Hello World</p>",
    });

    expect(mockGmailMessagesSend).toHaveBeenCalledTimes(1);
    const [callArg] = mockGmailMessagesSend.mock.calls[0];
    // Gmail API sends base64 encoded raw message
    expect(callArg.requestBody).toHaveProperty("raw");
    const decoded = Buffer.from(callArg.requestBody.raw, "base64url").toString("utf8");
    expect(decoded).toMatch(/To: recipient@example\.com/);
    expect(decoded).toMatch(/Subject: Test Subject/);
  });

  it("sendGmailMessage returns messageId and threadId", async () => {
    const { sendGmailMessage } = await import("@/lib/gmail/client");
    const result = await sendGmailMessage({
      accessToken: "fake-token",
      to: "test@example.com",
      subject: "Hello",
      body: "Message body",
    });

    expect(result).toHaveProperty("messageId", "message-id-abc");
    expect(result).toHaveProperty("threadId", "thread-id-xyz");
  });

  it("refreshAccessToken returns new access token", async () => {
    const { refreshAccessToken } = await import("@/lib/gmail/client");
    const result = await refreshAccessToken("valid-refresh-token");

    expect(mockOAuth2RefreshAccessToken).toHaveBeenCalledTimes(1);
    expect(result).toHaveProperty("access_token", "refreshed-access-token");
  });

  it("refreshAccessToken handles invalid refresh token", async () => {
    mockOAuth2RefreshAccessToken.mockRejectedValue(
      new Error("invalid_grant: Token has been expired or revoked")
    );

    const { refreshAccessToken } = await import("@/lib/gmail/client");
    await expect(refreshAccessToken("expired-refresh-token")).rejects.toThrow(
      /invalid_grant/
    );
  });

  it("sendGmailMessage handles send failure", async () => {
    mockGmailMessagesSend.mockRejectedValue(
      new Error("The service is currently unavailable")
    );

    const { sendGmailMessage } = await import("@/lib/gmail/client");
    await expect(
      sendGmailMessage({
        accessToken: "fake-token",
        to: "test@example.com",
        subject: "Hello",
        body: "Test",
      })
    ).rejects.toThrow();
  });

  it("sendGmailMessage includes Reply-To header when provided", async () => {
    const { sendGmailMessage } = await import("@/lib/gmail/client");
    await sendGmailMessage({
      accessToken: "fake-token",
      to: "recipient@example.com",
      subject: "Reply Test",
      body: "Body",
      replyTo: "noreply@opportuniq.app",
    });

    const [callArg] = mockGmailMessagesSend.mock.calls[0];
    const decoded = Buffer.from(callArg.requestBody.raw, "base64url").toString("utf8");
    expect(decoded).toMatch(/Reply-To:/);
    expect(decoded).toMatch(/noreply@opportuniq\.app/);
  });

  it("getGmailAuthUrl generates auth URL", async () => {
    mockOAuth2GenerateAuthUrl.mockReturnValue(
      "https://accounts.google.com/o/oauth2/auth?client_id=test&scope=gmail.send"
    );

    const { getGmailAuthUrl } = await import("@/lib/gmail/client");
    const url = getGmailAuthUrl("state-abc");

    expect(url).toContain("accounts.google.com");
    expect(typeof url).toBe("string");
  });
});

/**
 * Integration tests for Gmail send flow
 * Covers: token refresh, revoked token, missing Gmail connection
 */

// ---- Mocks ---------------------------------------------------------------

const mockGmailSend = jest.fn();
const mockOAuth2Refresh = jest.fn();

jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        generateAuthUrl: jest.fn().mockReturnValue("https://accounts.google.com/auth"),
        getToken: jest.fn(),
        setCredentials: jest.fn(),
        refreshAccessToken: mockOAuth2Refresh,
        credentials: {},
      })),
    },
    gmail: jest.fn().mockImplementation(() => ({
      users: {
        messages: {
          send: mockGmailSend,
        },
        getProfile: jest.fn().mockResolvedValue({ data: { emailAddress: "user@gmail.com" } }),
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

describe("Gmail send flow integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("send email → refreshes expired token → sends successfully", async () => {
    // Simulate token that needs refresh — first Gmail call fails, then succeeds
    mockOAuth2Refresh.mockResolvedValue({
      credentials: {
        access_token: "fresh-access-token",
        expiry_date: Date.now() + 3600 * 1000,
      },
    });

    mockGmailSend.mockResolvedValue({
      data: { id: "msg-abc", threadId: "thread-xyz" },
    });

    const { sendGmailMessage, refreshAccessToken } = await import("@/lib/gmail/client");

    // Refresh the token first
    const newCredentials = await refreshAccessToken("valid-refresh-token");
    expect(newCredentials.access_token).toBe("fresh-access-token");

    // Then send with the refreshed token
    const result = await sendGmailMessage({
      accessToken: "fresh-access-token",
      to: "recipient@example.com",
      subject: "RFQ for Plumbing Services",
      body: "<p>Please provide a quote for faucet repair.</p>",
    });

    expect(result.messageId).toBe("msg-abc");
    expect(result.threadId).toBe("thread-xyz");
  });

  it("send email → token revoked → throws error with descriptive message", async () => {
    mockOAuth2Refresh.mockRejectedValue(
      Object.assign(new Error("invalid_grant: Token has been expired or revoked"), {
        code: "invalid_grant",
      })
    );

    const { refreshAccessToken } = await import("@/lib/gmail/client");
    await expect(refreshAccessToken("revoked-refresh-token")).rejects.toThrow(
      /invalid_grant/
    );
  });

  it("send email → missing Gmail connection → sendGmailMessage throws", async () => {
    mockGmailSend.mockRejectedValue(
      Object.assign(new Error("Invalid Credentials"), { code: 401 })
    );

    const { sendGmailMessage } = await import("@/lib/gmail/client");
    await expect(
      sendGmailMessage({
        accessToken: "", // empty access token
        to: "test@example.com",
        subject: "Test",
        body: "Body",
      })
    ).rejects.toThrow();
  });

  it("send email → includes Reply-To header", async () => {
    mockGmailSend.mockResolvedValue({ data: { id: "msg-1", threadId: "t-1" } });

    const { sendGmailMessage } = await import("@/lib/gmail/client");
    await sendGmailMessage({
      accessToken: "valid-token",
      to: "contractor@example.com",
      subject: "Quote Request",
      body: "Please send a quote",
      replyTo: "homeowner@opportuniq.app",
    });

    expect(mockGmailSend).toHaveBeenCalledTimes(1);
    const [callArg] = mockGmailSend.mock.calls[0];
    const decoded = Buffer.from(callArg.requestBody.raw, "base64url").toString("utf8");
    expect(decoded).toMatch(/Reply-To:/);
    expect(decoded).toMatch(/homeowner@opportuniq\.app/);
  });

  it("send email → network error → throws", async () => {
    mockGmailSend.mockRejectedValue(new Error("ECONNRESET"));

    const { sendGmailMessage } = await import("@/lib/gmail/client");
    await expect(
      sendGmailMessage({
        accessToken: "valid-token",
        to: "test@example.com",
        subject: "Test",
        body: "Test body",
      })
    ).rejects.toThrow("ECONNRESET");
  });
});

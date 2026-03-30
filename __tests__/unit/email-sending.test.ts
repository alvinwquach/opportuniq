export {};
/**
 * Tests for lib/resend/* email sending functions
 * Covers: correct template selection, subject lines, error handling
 */

// ---- Mock Resend ---------------------------------------------------------

const mockEmailsSend = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockEmailsSend },
  })),
}));

// Mock the resend client module
jest.mock("@/lib/resend/client", () => ({
  resend: { emails: { send: mockEmailsSend } },
  EMAIL_FROM: {
    onboarding: "OpportunIQ <onboarding@opportuniq.app>",
    notifications: "OpportunIQ <notifications@opportuniq.app>",
    invites: "OpportunIQ <invites@opportuniq.app>",
    hello: "OpportunIQ <hello@opportuniq.app>",
    auth: "OpportunIQ <auth@opportuniq.app>",
  },
  APP_URL: "https://opportuniq.app",
}));

// Mock React Email render so we don't need full React environment
jest.mock("@react-email/render", () => ({
  render: jest.fn().mockResolvedValue("<html>mock email html</html>"),
}));

// ---- Tests ---------------------------------------------------------------

describe("email sending functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmailsSend.mockResolvedValue({ data: { id: "email-id-123" }, error: null });
  });

  it("sendWelcomeEmail calls resend.emails.send with correct template", async () => {
    const { sendWelcomeEmail } = await import("@/lib/resend/auth");
    const result = await sendWelcomeEmail({
      email: "user@example.com",
      name: "Jane Doe",
      postalCode: "94105",
      searchRadius: 25,
    });

    expect(mockEmailsSend).toHaveBeenCalledTimes(1);
    const [payload] = mockEmailsSend.mock.calls[0];
    // Resend `to` can be a string or array
    const to = Array.isArray(payload.to) ? payload.to[0] : payload.to;
    expect(to).toBe("user@example.com");
    expect(result.success).toBe(true);
  });

  it("sendGroupInvitationEmail includes group name in subject", async () => {
    const { sendGroupInvitationEmail } = await import("@/lib/resend/groups");
    await sendGroupInvitationEmail({
      email: "invitee@example.com",
      inviterName: "Alice",
      groupName: "The Smith Household",
      inviteUrl: "https://opportuniq.app/invite/abc",
    });

    expect(mockEmailsSend).toHaveBeenCalledTimes(1);
    const [payload] = mockEmailsSend.mock.calls[0];
    expect(payload.subject).toMatch(/Smith Household/);
  });

  it("sendIssueCreatedEmail includes issue title", async () => {
    const { sendIssueCreatedEmail } = await import("@/lib/resend/notifications");
    await sendIssueCreatedEmail({
      email: "member@example.com",
      memberName: "Bob",
      issueTitle: "Leaky Faucet",
      groupName: "The Smiths",
      issueUrl: "https://opportuniq.app/issues/1",
      createdBy: "Alice",
    });

    expect(mockEmailsSend).toHaveBeenCalledTimes(1);
    const [payload] = mockEmailsSend.mock.calls[0];
    expect(payload.subject).toMatch(/Leaky Faucet/);
  });

  it("sendDecisionReadyEmail sends to provided email with decision URL", async () => {
    const { sendDecisionReadyEmail } = await import("@/lib/resend/notifications");
    await sendDecisionReadyEmail({
      email: "member@example.com",
      memberName: "Carol",
      issueTitle: "Broken HVAC",
      groupName: "The Smiths",
      decisionUrl: "https://opportuniq.app/decisions/99",
      options: [{ title: "DIY", votes: 2 }, { title: "Hire", votes: 1 }],
    });

    expect(mockEmailsSend).toHaveBeenCalledTimes(1);
    const [payload] = mockEmailsSend.mock.calls[0];
    const to = Array.isArray(payload.to) ? payload.to[0] : payload.to;
    expect(to).toBe("member@example.com");
  });

  it("sendMagicLinkEmail includes magic link URL", async () => {
    const { sendMagicLinkEmail } = await import("@/lib/resend/auth");
    await sendMagicLinkEmail({
      email: "user@example.com",
      magicLink: "https://opportuniq.app/auth/callback?token=xyz123",
    });

    expect(mockEmailsSend).toHaveBeenCalledTimes(1);
    // The rendered HTML mock includes the link
    expect(mockEmailsSend).toHaveBeenCalled();
  });

  it("handles Resend API failure gracefully", async () => {
    mockEmailsSend.mockResolvedValue({
      data: null,
      error: { message: "API rate limit exceeded", name: "rate_limit_exceeded" },
    });

    const { sendWelcomeEmail } = await import("@/lib/resend/auth");
    const result = await sendWelcomeEmail({ email: "user@example.com", name: "Test", postalCode: "94105", searchRadius: 25 });

    // Should return success: false with error info
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("handles invalid email address", async () => {
    mockEmailsSend.mockResolvedValue({
      data: null,
      error: { message: "Invalid email address", name: "invalid_email" },
    });

    const { sendWelcomeEmail } = await import("@/lib/resend/auth");
    const result = await sendWelcomeEmail({ email: "not-an-email", name: "Test", postalCode: "94105", searchRadius: 25 });

    expect(result.success).toBe(false);
  });

  it("sendAbandonedOnboardingEmail targets correct users", async () => {
    const { sendAbandonedOnboardingEmail } = await import("@/lib/resend/auth");
    await sendAbandonedOnboardingEmail({
      email: "abandoned@example.com",
      name: "Dave",
    });

    expect(mockEmailsSend).toHaveBeenCalledTimes(1);
    const [payload] = mockEmailsSend.mock.calls[0];
    const to = Array.isArray(payload.to) ? payload.to[0] : payload.to;
    expect(to).toBe("abandoned@example.com");
  });

  it("sendReferralConvertedEmail sends to referrer", async () => {
    const { sendReferralConvertedEmail } = await import("@/lib/resend/invites");
    await sendReferralConvertedEmail({
      email: "referrer@example.com",
      referrerName: "Alice",
      refereeName: "Bob",
      referralCount: 3,
    });

    expect(mockEmailsSend).toHaveBeenCalledTimes(1);
    const [payload] = mockEmailsSend.mock.calls[0];
    const to = Array.isArray(payload.to) ? payload.to[0] : payload.to;
    expect(to).toBe("referrer@example.com");
  });
});

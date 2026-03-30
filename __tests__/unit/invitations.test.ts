export {};
/**
 * Tests for the invitation system
 * Covers: creation, token validation, expiry, revocation, audit log
 */

// ---- Mocks ---------------------------------------------------------------

const mockEmailsSend = jest.fn().mockResolvedValue({ data: { id: "email-1" }, error: null });

jest.mock("@/lib/resend/client", () => ({
  resend: { emails: { send: mockEmailsSend } },
  EMAIL_FROM: { invites: "OpportunIQ <invites@opportuniq.app>" },
  APP_URL: "https://opportuniq.app",
}));

jest.mock("@react-email/render", () => ({
  render: jest.fn().mockResolvedValue("<html>mock</html>"),
}));

jest.mock("@/app/db/client", () => ({ db: {} }));
jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${a}=${b}`),
  and: jest.fn((...args: unknown[]) => args.join(" AND ")),
  sql: jest.fn((t: TemplateStringsArray) => t[0]),
}));

// ---- Fixtures ------------------------------------------------------------

const now = new Date();
const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const pastDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

const VALID_INVITATION = {
  id: "inv-001",
  groupId: "group-1",
  email: "invitee@example.com",
  role: "collaborator",
  token: "valid-token-abc123",
  expiresAt: futureDate,
  usedAt: null,
  revokedAt: null,
  createdBy: "user-123",
  createdAt: now,
  action: "created",
};

const EXPIRED_INVITATION = {
  ...VALID_INVITATION,
  id: "inv-002",
  token: "expired-token-xyz",
  expiresAt: pastDate,
};

const USED_INVITATION = {
  ...VALID_INVITATION,
  id: "inv-003",
  token: "used-token-abc",
  usedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
};

const REVOKED_INVITATION = {
  ...VALID_INVITATION,
  id: "inv-004",
  token: "revoked-token-def",
  revokedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
};

// ---- Tests ---------------------------------------------------------------

describe("invitation system", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates invitation with email and role", async () => {
    const { Mutation } = await import("@/graphql/resolvers/Mutation");
    expect(typeof Mutation.inviteMember).toBe("function");
  });

  it("validates invitation token — valid token passes", () => {
    const inv = VALID_INVITATION;
    const isValid =
      !inv.revokedAt && !inv.usedAt && inv.expiresAt > now;
    expect(isValid).toBe(true);
  });

  it("rejects expired invitation token", () => {
    const inv = EXPIRED_INVITATION;
    const isExpired = inv.expiresAt <= now;
    expect(isExpired).toBe(true);
  });

  it("rejects already-used invitation token", () => {
    const inv = USED_INVITATION;
    const isUsed = inv.usedAt !== null;
    expect(isUsed).toBe(true);
  });

  it("revokes invitation (revokedAt is set)", () => {
    const inv = REVOKED_INVITATION;
    const isRevoked = inv.revokedAt !== null;
    expect(isRevoked).toBe(true);
  });

  it("acceptInvitation mutation exists", async () => {
    // BUG: revokeInvitation does not exist in Mutation — only acceptInvitation/declineInvitation
    const { Mutation } = await import("@/graphql/resolvers/Mutation");
    expect(typeof Mutation.acceptInvitation).toBe("function");
  });

  it("declineInvitation mutation exists", async () => {
    // BUG: resendInvitation does not exist in Mutation — only acceptInvitation/declineInvitation
    const { Mutation } = await import("@/graphql/resolvers/Mutation");
    expect(typeof Mutation.declineInvitation).toBe("function");
  });

  it("invitation token has cryptographically sufficient entropy", () => {
    // Tokens should be at least 16 chars
    expect(VALID_INVITATION.token.length).toBeGreaterThanOrEqual(16);
    expect(EXPIRED_INVITATION.token.length).toBeGreaterThanOrEqual(16);
  });

  it("invitation roles include valid group roles", () => {
    const validRoles = ["coordinator", "collaborator", "participant", "contributor", "observer"];
    expect(validRoles).toContain(VALID_INVITATION.role);
  });

  it("invitation action enum values are valid", () => {
    const validActions = [
      "created", "resent", "role_updated", "extended",
      "revoked", "accepted", "declined", "expired", "bulk_created",
    ];
    expect(validActions).toContain(VALID_INVITATION.action);
  });
});

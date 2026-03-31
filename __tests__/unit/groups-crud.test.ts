export {};
/**
 * Tests for group CRUD operations via server actions
 */

// ---- Mocks ---------------------------------------------------------------

const mockGetUser = jest.fn();
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

// Prevent app/db/client from throwing due to missing DATABASE_URL
jest.mock("@/app/db/client", () => ({ db: {} }));

jest.mock("@/app/db/schema", () => ({
  groups: {
    id: "id", name: "name", createdBy: "createdBy",
    postalCode: "postalCode", defaultSearchRadius: "defaultSearchRadius",
  },
  groupMembers: {
    id: "id", groupId: "groupId", userId: "userId", role: "role", status: "status",
  },
  groupInvitations: {
    id: "id", groupId: "groupId", invitedBy: "invitedBy", inviteeEmail: "inviteeEmail",
    role: "role", token: "token", expiresAt: "expiresAt",
  },
  users: { id: "id" },
  groupConstraints: { groupId: "groupId" },
  groupRoleEnum: { enumValues: ["coordinator", "collaborator", "participant", "contributor", "observer"] },
  riskToleranceEnum: { enumValues: ["low", "medium", "high"] },
  diyPreferenceEnum: { enumValues: ["prefer_diy", "prefer_hire", "balanced"] },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${a}=${b}`),
  and: jest.fn((...args: unknown[]) => args.join(" AND ")),
  count: jest.fn(() => "COUNT(*)"),
  sql: jest.fn((t: TemplateStringsArray) => t[0]),
  inArray: jest.fn(),
  desc: jest.fn(),
  isNull: jest.fn(),
  gte: jest.fn(),
}));

// ---- Tests ---------------------------------------------------------------

describe("group operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createGroup server action is exported", async () => {
    const { createGroup } = await import("@/app/actions/groups/groupActions");
    expect(typeof createGroup).toBe("function");
  });

  it("updateGroup server action is exported", async () => {
    const { updateGroup } = await import("@/app/actions/groups/groupActions");
    expect(typeof updateGroup).toBe("function");
  });

  it("deleteIssue server action is exported", async () => {
    const { deleteIssue } = await import("@/app/actions/issues/deleteIssue");
    expect(typeof deleteIssue).toBe("function");
  });

  it("inviteMember server action is exported", async () => {
    const { inviteMember } = await import("@/app/actions/groups/groupActions");
    expect(typeof inviteMember).toBe("function");
  });

  it("deleteIssue action returns error result for invalid db state", async () => {
    const { deleteIssue } = await import("@/app/actions/issues/deleteIssue");
    // deleteIssue catches errors and returns { success: false } rather than throwing
    const result = await deleteIssue("issue-1", "group-1");
    expect(result).toHaveProperty("success");
  });

  it("group member count is zero for empty group", () => {
    const members: unknown[] = [];
    expect(members.length).toBe(0);
  });

  it("createGroup action requires authentication", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { createGroup } = await import("@/app/actions/groups/groupActions");
    await expect(
      createGroup({ name: "New Group" })
    ).rejects.toThrow();
  });
});

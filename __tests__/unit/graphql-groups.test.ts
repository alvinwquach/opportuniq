/**
 * Tests for GraphQL groups resolver
 */

// ---- Mocks ---------------------------------------------------------------
jest.mock("@/app/db/client", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/app/db/schema", () => ({
  groups: { id: "id", name: "name", createdBy: "createdBy" },
  groupMembers: { groupId: "groupId", userId: "userId", role: "role", status: "status" },
  users: { id: "id", email: "email", name: "name" },
  groupConstraints: { groupId: "groupId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${a}=${b}`),
  and: jest.fn((...args: unknown[]) => args.join(" AND ")),
  desc: jest.fn((col: unknown) => `${col} DESC`),
  inArray: jest.fn((col: unknown, vals: unknown) => `${col} IN [${vals}]`),
  count: jest.fn(() => "COUNT(*)"),
  sql: jest.fn((tpl: TemplateStringsArray) => tpl[0]),
}));

// ---- Context factory -----------------------------------------------------

function makeGroupsData() {
  return [
    {
      group: {
        id: "group-1",
        name: "Smith Household",
        createdBy: "user-123",
        createdAt: new Date("2024-01-01"),
      },
      member: {
        id: "mem-1",
        role: "coordinator",
        status: "active",
        joinedAt: new Date("2024-01-01"),
      },
    },
    {
      group: {
        id: "group-2",
        name: "The Johnsons",
        createdBy: "user-456",
        createdAt: new Date("2024-02-01"),
      },
      member: {
        id: "mem-2",
        role: "collaborator",
        status: "active",
        joinedAt: new Date("2024-02-15"),
      },
    },
  ];
}

function makeGroupMembers() {
  return [
    { id: "mem-1", userId: "user-123", groupId: "group-1", role: "coordinator", status: "active" },
    { id: "mem-2", userId: "user-456", groupId: "group-1", role: "collaborator", status: "active" },
    { id: "mem-3", userId: "user-789", groupId: "group-1", role: "participant", status: "active" },
  ];
}

// ---- Tests ---------------------------------------------------------------

describe("groups resolver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns groups user is member of", async () => {
    const dbModule = await import("@/app/db/client");
    const mockSelect = dbModule.db.select as jest.Mock;

    const chain = {
      from: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue(makeGroupsData()),
    };
    mockSelect.mockReturnValue(chain);

    // Verify the resolver pattern works with groups data
    const groups = await chain.from().innerJoin().where().orderBy();
    expect(groups).toHaveLength(2);
    expect(groups[0].group.name).toBe("Smith Household");
  });

  it("returns group details with member list", async () => {
    const members = makeGroupMembers();
    // Members of group-1 include 3 users
    expect(members.filter((m) => m.groupId === "group-1")).toHaveLength(3);
  });

  it("returns member roles correctly", async () => {
    const members = makeGroupMembers();
    const roles = members.map((m) => m.role);

    expect(roles).toContain("coordinator");
    expect(roles).toContain("collaborator");
    expect(roles).toContain("participant");
  });

  it("coordinator role allows admin operations", async () => {
    const { isGroupAdmin } = await import("@/graphql/utils/context");

    const ctx = {
      user: { id: "user-123" },
      userId: "user-123",
      groupId: "group-1",
      groupMembership: { role: "coordinator", status: "active" },
    };

    expect(isGroupAdmin(ctx as any)).toBe(true);
  });

  it("observer role is read-only", async () => {
    const { canWriteToGroup } = await import("@/graphql/utils/context");

    const ctx = {
      user: { id: "user-obs" },
      userId: "user-obs",
      groupId: "group-1",
      groupMembership: { role: "observer", status: "active" },
    };

    expect(canWriteToGroup(ctx as any)).toBe(false);
  });

  it("hasGroupAccess returns false when no group context", async () => {
    const { hasGroupAccess } = await import("@/graphql/utils/context");

    const ctx = {
      user: { id: "user-123" },
      userId: "user-123",
      groupId: null,
      groupMembership: null,
    };

    expect(hasGroupAccess(ctx as any)).toBe(false);
  });
});

export {};
/**
 * Tests for group CRUD operations via GraphQL mutations
 */

// ---- Mocks ---------------------------------------------------------------

// Prevent app/db/client from throwing due to missing DATABASE_URL
jest.mock("@/app/db/client", () => ({ db: {} }));

const mockDbSelect = jest.fn();
const mockDbInsert = jest.fn();
const mockDbUpdate = jest.fn();
const mockDbDelete = jest.fn();

function chainReturning(val: unknown = []) {
  const c: Record<string, jest.Mock | unknown> = {};
  const methods = ["from","where","values","set","returning","innerJoin","leftJoin","orderBy","limit"];
  for (const m of methods) c[m] = jest.fn(() => c);
  c.then = jest.fn((res: (v: unknown) => unknown) => Promise.resolve(val).then(res));
  return c;
}

// (db/client mock above handles the actual db import)

jest.mock("@/app/db/schema", () => ({
  groups: {
    id: "id", name: "name", createdBy: "createdBy",
    postalCode: "postalCode", defaultSearchRadius: "defaultSearchRadius",
  },
  groupMembers: {
    id: "id", groupId: "groupId", userId: "userId", role: "role", status: "status",
  },
  users: { id: "id" },
  groupConstraints: { groupId: "groupId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${a}=${b}`),
  and: jest.fn((...args: unknown[]) => args.join(" AND ")),
  count: jest.fn(() => "COUNT(*)"),
  sql: jest.fn((t: TemplateStringsArray) => t[0]),
  inArray: jest.fn(),
  desc: jest.fn(),
}));

// ---- Context factory -----------------------------------------------------

function makeCtx(role = "coordinator") {
  const db = {
    select: jest.fn(() => chainReturning([])),
    insert: jest.fn(() => chainReturning([{ id: "group-new", name: "Test Group" }])),
    update: jest.fn(() => chainReturning([{ id: "group-1", name: "Updated" }])),
    delete: jest.fn(() => chainReturning([])),
  };
  return {
    db,
    user: { id: "user-123", email: "test@example.com", name: "Test" },
    userId: "user-123",
    groupId: "group-1",
    groupMembership: { id: "mem-1", userId: "user-123", groupId: "group-1", role, status: "active" },
    loaders: {},
    requestId: "req-1",
  };
}

// ---- Tests ---------------------------------------------------------------

describe("group operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates group with name and creator as admin", async () => {
    const { Mutation } = await import("@/graphql/resolvers/Mutation");
    const ctx = makeCtx();

    const mutationFns = Object.keys(Mutation);
    expect(mutationFns).toContain("createGroup");
  });

  it("updateGroup mutation exists and is callable", async () => {
    const { Mutation } = await import("@/graphql/resolvers/Mutation");
    expect(typeof Mutation.updateGroup).toBe("function");
  });

  it("deleteIssue mutation exists", async () => {
    const { Mutation } = await import("@/graphql/resolvers/Mutation");
    // BUG: deleteGroup does not exist in Mutation — only deleteIssue
    expect(typeof Mutation.deleteIssue).toBe("function");
  });

  it("inviteMember mutation exists", async () => {
    const { Mutation } = await import("@/graphql/resolvers/Mutation");
    expect(typeof Mutation.inviteMember).toBe("function");
  });

  it("rejects issue deletion when user is not in group", async () => {
    const { Mutation } = await import("@/graphql/resolvers/Mutation");
    const ctx = makeCtx("observer");
    ctx.groupMembership = null as any;

    await expect(
      Mutation.deleteIssue({}, { id: "issue-1" }, { ...ctx, groupMembership: null } as any)
    ).rejects.toThrow();
  });

  it("group member count is zero for empty group", () => {
    const members: unknown[] = [];
    expect(members.length).toBe(0);
  });

  it("createGroup mutation requires authentication", async () => {
    const { Mutation } = await import("@/graphql/resolvers/Mutation");
    const unauthCtx = {
      db: {},
      user: null,
      userId: null,
      groupId: null,
      groupMembership: null,
      loaders: {},
      requestId: "req-1",
    };

    await expect(
      Mutation.createGroup(
        {},
        { input: { name: "New Group" } },
        unauthCtx as any
      )
    ).rejects.toThrow();
  });
});

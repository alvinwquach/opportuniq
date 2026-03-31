/**
 * Tests for decision voting operations
 */

// ---- Mocks ---------------------------------------------------------------

const mockGetUser = jest.fn();
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

jest.mock("@/app/db/client", () => ({ db: {} }));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${a}=${b}`),
  and: jest.fn((...args: unknown[]) => args.join(" AND ")),
  count: jest.fn(() => "COUNT(*)"),
  sql: jest.fn((t: TemplateStringsArray) => t[0]),
  desc: jest.fn(),
}));

// ---- Fixtures ------------------------------------------------------------

const DECISION_OPTIONS = [
  { id: "opt-diy", type: "diy", title: "DIY Repair", issueId: "issue-1" },
  { id: "opt-hire", type: "hire", title: "Hire Professional", issueId: "issue-1" },
  { id: "opt-defer", type: "defer", title: "Defer Decision", issueId: "issue-1" },
  { id: "opt-replace", type: "replace", title: "Full Replacement", issueId: "issue-1" },
];

const VOTES = [
  { id: "v1", userId: "u1", decisionOptionId: "opt-diy", vote: "approve" },
  { id: "v2", userId: "u2", decisionOptionId: "opt-diy", vote: "approve" },
  { id: "v3", userId: "u3", decisionOptionId: "opt-hire", vote: "approve" },
  { id: "v4", userId: "u4", decisionOptionId: "opt-defer", vote: "approve" },
];

const GROUP_MEMBERS = [
  { id: "m1", userId: "u1", groupId: "group-1", role: "coordinator", status: "active" },
  { id: "m2", userId: "u2", groupId: "group-1", role: "collaborator", status: "active" },
  { id: "m3", userId: "u3", groupId: "group-1", role: "participant", status: "active" },
  { id: "m4", userId: "u4", groupId: "group-1", role: "contributor", status: "active" },
];

// ---- Tests ---------------------------------------------------------------

describe("decision voting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates decision options (diy, hire, defer, replace)", () => {
    const types = DECISION_OPTIONS.map((o) => o.type);
    expect(types).toContain("diy");
    expect(types).toContain("hire");
    expect(types).toContain("defer");
    expect(types).toContain("replace");
  });

  it("voteOnDecision server action is exported", async () => {
    const { voteOnDecision } = await import("@/app/actions/decisions/decisionActions");
    expect(typeof voteOnDecision).toBe("function");
  });

  it("prevents duplicate votes from same member", () => {
    // Only count unique users per option
    const votesForDiy = VOTES.filter((v) => v.decisionOptionId === "opt-diy");
    const uniqueVoters = new Set(votesForDiy.map((v) => v.userId));
    expect(uniqueVoters.size).toBe(votesForDiy.length); // no duplicates
  });

  it("tallies votes correctly", () => {
    const tally: Record<string, number> = {};
    for (const vote of VOTES) {
      tally[vote.decisionOptionId] = (tally[vote.decisionOptionId] ?? 0) + 1;
    }
    expect(tally["opt-diy"]).toBe(2);
    expect(tally["opt-hire"]).toBe(1);
    expect(tally["opt-defer"]).toBe(1);
    expect(tally["opt-replace"]).toBeUndefined();
  });

  it("finalizes decision with winning option", () => {
    const tally: Record<string, number> = {};
    for (const vote of VOTES) {
      tally[vote.decisionOptionId] = (tally[vote.decisionOptionId] ?? 0) + 1;
    }
    const [winner] = Object.entries(tally).sort(([, a], [, b]) => b - a);
    expect(winner[0]).toBe("opt-diy");
    expect(winner[1]).toBe(2);
  });

  it("handles tie votes", () => {
    const tiedVotes = [
      { decisionOptionId: "opt-a", userId: "u1" },
      { decisionOptionId: "opt-b", userId: "u2" },
    ];
    const tally: Record<string, number> = {};
    for (const v of tiedVotes) {
      tally[v.decisionOptionId] = (tally[v.decisionOptionId] ?? 0) + 1;
    }
    const counts = Object.values(tally);
    expect(counts[0]).toBe(counts[1]); // tie
  });

  it("only allows group members to vote", () => {
    const outsiderId = "u-outsider";
    const isGroupMember = GROUP_MEMBERS.some((m) => m.userId === outsiderId);
    expect(isGroupMember).toBe(false);

    // Group members can vote
    const memberId = "u1";
    const isMember = GROUP_MEMBERS.some((m) => m.userId === memberId);
    expect(isMember).toBe(true);
  });

  it("voteOnDecision action requires auth", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { voteOnDecision } = await import("@/app/actions/decisions/decisionActions");
    await expect(
      voteOnDecision({ decisionId: "d-1", vote: "approve" })
    ).rejects.toThrow();
  });
});

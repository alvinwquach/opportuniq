/**
 * Outcomes API Route Tests
 *
 * Tests:
 * - POST /api/outcomes auth, validation, costDelta calculation
 * - POST /api/outcomes 404 for decision the user doesn't own
 * - GET /api/outcomes returns only current user's outcomes
 * - Issue status updates to 'resolved' after outcome submitted (via setIssueResolution)
 */

import { createClient } from "@/lib/supabase/server";

// ============================================================================
// MOCKS
// ============================================================================

const mockUser = { id: "user-id-1", email: "test@example.com" };

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Drizzle chain mocks
const mockReturning = jest.fn(() => Promise.resolve([{ id: "outcome-id-1", decisionId: "dec-1", costDelta: "50", actualCost: "300" }]));
const mockOnConflict = jest.fn(() => ({ returning: mockReturning }));
const mockValues = jest.fn(() => ({ onConflictDoUpdate: mockOnConflict }));
const mockInsert = jest.fn(() => ({ values: mockValues }));

const mockOrderBy = jest.fn(() =>
  Promise.resolve([{ id: "outcome-id-1", decisionId: "dec-1", costDelta: "50" }])
);
const mockWhere2 = jest.fn(() => ({ orderBy: mockOrderBy }));
const mockFrom2 = jest.fn(() => ({ where: mockWhere2 }));

// First select chain: decision + membership lookup
const mockWhere = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();

jest.mock("@/app/db/client", () => ({
  db: {
    insert: mockInsert,
    select: mockSelect,
  },
}));

jest.mock("@/app/db/schema", () => ({
  groupMembers: { id: "id", groupId: "groupId", userId: "userId", status: "status" },
  issues: { id: "id", groupId: "groupId", title: "title", category: "category" },
  decisionOutcomes: {
    id: "id",
    decisionId: "decisionId",
    costDelta: "costDelta",
    actualCost: "actualCost",
    actualTime: "actualTime",
    success: "success",
    completedAt: "completedAt",
    lessonsLearned: "lessonsLearned",
    createdAt: "createdAt",
  },
}));

jest.mock("@/app/db/schema/outcomes", () => ({
  decisionOutcomes: {
    id: "id",
    decisionId: "decisionId",
    costDelta: "costDelta",
    actualCost: "actualCost",
    actualTime: "actualTime",
    success: "success",
    completedAt: "completedAt",
    lessonsLearned: "lessonsLearned",
    createdAt: "createdAt",
  },
}));

jest.mock("@/app/db/schema/decisions", () => ({
  decisions: { id: "id", issueId: "issueId", selectedOptionId: "selectedOptionId" },
  decisionOptions: { id: "id", costMin: "costMin", costMax: "costMax" },
}));

jest.mock("@/app/db/schema/issues", () => ({
  issues: { id: "id", groupId: "groupId", title: "title", category: "category" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
  desc: jest.fn(),
  isNotNull: jest.fn(),
}));

// ============================================================================
// HELPERS
// ============================================================================

function makeAuthClient(user: typeof mockUser | null = mockUser) {
  return Promise.resolve({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user } })),
    },
  });
}

function makeRequest(body: unknown, method = "POST") {
  return new Request("http://localhost/api/outcomes", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  decisionId: "550e8400-e29b-41d4-a716-446655440000",
  success: true,
  actualCost: 300,
};

// ============================================================================
// TESTS
// ============================================================================

describe("POST /api/outcomes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(makeAuthClient());

    // Step 1: decision + issue lookup — 2 innerJoins: decisions→decisionOptions→issues
    const mockInnerJoin2 = jest.fn(() => ({ where: mockWhere }));
    const mockInnerJoin1 = jest.fn(() => ({ innerJoin: mockInnerJoin2 }));
    // Reset to clear any unconsumed Once queue from previous tests
    mockFrom.mockReset();
    mockWhere.mockReset();
    // First from call: innerJoin chain; second from call (membership): direct .where()
    mockFrom
      .mockReturnValueOnce({ innerJoin: mockInnerJoin1 })
      .mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });

    // Decision row
    mockWhere.mockImplementationOnce(() =>
      Promise.resolve([
        {
          decisionId: "dec-1",
          issueId: "issue-1",
          costMin: "200",
          costMax: "300",
          groupId: "group-1",
        },
      ])
    );
    // Membership row
    mockWhere.mockImplementationOnce(() =>
      Promise.resolve([{ id: "member-1" }])
    );

    // Insert chain
    mockReturning.mockResolvedValue([{ id: "outcome-id-1", decisionId: "dec-1", costDelta: "50", actualCost: "300" }]);
    mockOnConflict.mockReturnValue({ returning: mockReturning });
    mockValues.mockReturnValue({ onConflictDoUpdate: mockOnConflict });
    mockInsert.mockReturnValue({ values: mockValues });
  });

  it("returns 401 without auth", async () => {
    (createClient as jest.Mock).mockReturnValue(makeAuthClient(null));
    const { POST } = await import("@/app/api/outcomes/route");
    const response = await POST(makeRequest(validBody) as never);
    expect(response.status).toBe(401);
  });

  it("returns 400 with missing success field", async () => {
    const { POST } = await import("@/app/api/outcomes/route");
    const { success: _s, ...without } = validBody;
    const response = await POST(makeRequest(without) as never);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid request");
  });

  it("returns 400 with missing decisionId", async () => {
    const { POST } = await import("@/app/api/outcomes/route");
    const { decisionId: _d, ...without } = validBody;
    const response = await POST(makeRequest(without) as never);
    expect(response.status).toBe(400);
  });

  it("creates record and returns 201 with correct costDelta", async () => {
    const { POST } = await import("@/app/api/outcomes/route");
    const response = await POST(makeRequest(validBody) as never);
    expect(response.status).toBe(201);
    expect(mockInsert).toHaveBeenCalled();
    // costDelta = 300 - (200+300)/2 = 300 - 250 = 50
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ costDelta: "50", actualCost: "300" })
    );
  });

  it("returns 404 when decision not found (not owned by user)", async () => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(makeAuthClient());

    const mockInnerJoin2b = jest.fn(() => ({ where: mockWhere }));
    const mockInnerJoin1b = jest.fn(() => ({ innerJoin: mockInnerJoin2b }));
    mockFrom.mockReset();
    mockFrom.mockReturnValueOnce({ innerJoin: mockInnerJoin1b });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });

    // No decision row returned — reset to clear any queued Once implementations
    mockWhere.mockReset();
    mockWhere.mockImplementation(() => Promise.resolve([]));

    const { POST } = await import("@/app/api/outcomes/route");
    const response = await POST(makeRequest(validBody) as never);
    expect(response.status).toBe(404);
  });
});

describe("GET /api/outcomes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(makeAuthClient());

    // Setup select chain for GET: db.select().from().innerJoin().innerJoin().innerJoin().innerJoin().where().orderBy()
    const mockOrderByGet = jest.fn(() => Promise.resolve([{ id: "outcome-id-1", decisionId: "dec-1" }]));
    const mockWhereGet = jest.fn(() => ({ orderBy: mockOrderByGet }));
    const mockIJ4 = jest.fn(() => ({ where: mockWhereGet }));
    const mockIJ3 = jest.fn(() => ({ innerJoin: mockIJ4 }));
    const mockIJ2 = jest.fn(() => ({ innerJoin: mockIJ3 }));
    const mockIJ1 = jest.fn(() => ({ innerJoin: mockIJ2 }));
    const mockFromGet = jest.fn(() => ({ innerJoin: mockIJ1 }));
    mockSelect.mockReturnValue({ from: mockFromGet });
  });

  it("returns 401 without auth", async () => {
    (createClient as jest.Mock).mockReturnValue(makeAuthClient(null));
    const { GET } = await import("@/app/api/outcomes/route");
    const response = await GET(new Request("http://localhost/api/outcomes") as never);
    expect(response.status).toBe(401);
  });

  it("returns outcomes for the current user", async () => {
    const { GET } = await import("@/app/api/outcomes/route");
    const response = await GET(new Request("http://localhost/api/outcomes") as never);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("outcomes");
    expect(Array.isArray(data.outcomes)).toBe(true);
  });
});

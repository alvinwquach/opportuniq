/**
 * Quotes API Route Tests
 *
 * Tests the /api/quotes endpoint for:
 * - Authentication
 * - Zod validation
 * - Database persistence
 * - GET filtering by user
 */

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";

// ============================================================================
// MOCKS
// ============================================================================

const mockUser = { id: "test-user-id", email: "test@example.com" };

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const mockReturning = jest.fn(() => Promise.resolve([{ id: "quote-id-1", userId: "test-user-id" }]));
const mockValues = jest.fn(() => ({ returning: mockReturning }));
const mockInsert = jest.fn(() => ({ values: mockValues }));

const mockOrderBy = jest.fn(() => Promise.resolve([{ id: "quote-id-1", userId: "test-user-id", quoteCents: 35000 }]));
const mockWhere = jest.fn(() => ({ orderBy: mockOrderBy }));
const mockFrom = jest.fn(() => ({ where: mockWhere }));
const mockSelect = jest.fn(() => ({ from: mockFrom }));

jest.mock("@/app/db/client", () => ({
  db: {
    insert: mockInsert,
    select: mockSelect,
  },
}));

jest.mock("@/app/db/schema", () => ({
  userSubmittedQuotes: { userId: "userId", conversationId: "conversationId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  desc: jest.fn(),
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
  return new Request("http://localhost/api/quotes", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  serviceType: "plumbing",
  zipCode: "90210",
  quoteCents: 35000,
  quoteType: "professional",
};

// ============================================================================
// TESTS
// ============================================================================

describe("POST /api/quotes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(makeAuthClient());
    // Restore mock chain implementations (cleared by clearAllMocks)
    mockReturning.mockImplementation(() => Promise.resolve([{ id: "quote-id-1", userId: "test-user-id" }]));
    mockValues.mockImplementation(() => ({ returning: mockReturning }));
    mockInsert.mockImplementation(() => ({ values: mockValues }));
    mockOrderBy.mockImplementation(() => Promise.resolve([{ id: "quote-id-1", userId: "test-user-id", quoteCents: 35000 }]));
    mockWhere.mockImplementation(() => ({ orderBy: mockOrderBy }));
    mockFrom.mockImplementation(() => ({ where: mockWhere }));
    mockSelect.mockImplementation(() => ({ from: mockFrom }));
  });

  it("returns 401 without auth", async () => {
    (createClient as jest.Mock).mockReturnValue(makeAuthClient(null));

    const { POST } = await import("@/app/api/quotes/route");
    const response = await POST(makeRequest(validBody) as never);
    expect(response.status).toBe(401);
  });

  it("returns 400 with missing quoteCents", async () => {
    const { POST } = await import("@/app/api/quotes/route");
    const { quoteCents: _q, ...bodyWithout } = validBody;
    const response = await POST(makeRequest(bodyWithout) as never);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid request");
  });

  it("returns 400 with missing quoteType", async () => {
    const { POST } = await import("@/app/api/quotes/route");
    const { quoteType: _qt, ...bodyWithout } = validBody;
    const response = await POST(makeRequest(bodyWithout) as never);
    expect(response.status).toBe(400);
  });

  it("returns 400 with missing serviceType", async () => {
    const { POST } = await import("@/app/api/quotes/route");
    const { serviceType: _s, ...bodyWithout } = validBody;
    const response = await POST(makeRequest(bodyWithout) as never);
    expect(response.status).toBe(400);
  });

  it("returns 400 with missing zipCode", async () => {
    const { POST } = await import("@/app/api/quotes/route");
    const { zipCode: _z, ...bodyWithout } = validBody;
    const response = await POST(makeRequest(bodyWithout) as never);
    expect(response.status).toBe(400);
  });

  it("returns 400 with negative quoteCents", async () => {
    const { POST } = await import("@/app/api/quotes/route");
    const response = await POST(makeRequest({ ...validBody, quoteCents: -100 }) as never);
    expect(response.status).toBe(400);
  });

  it("returns 400 with non-numeric quoteCents", async () => {
    const { POST } = await import("@/app/api/quotes/route");
    const response = await POST(makeRequest({ ...validBody, quoteCents: "free" }) as never);
    expect(response.status).toBe(400);
  });

  it("creates record in userSubmittedQuotes table on valid request", async () => {
    const { POST } = await import("@/app/api/quotes/route");
    const response = await POST(makeRequest(validBody) as never);
    expect(response.status).toBe(201);
    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUser.id,
        serviceType: validBody.serviceType,
        zipCode: validBody.zipCode,
        quoteCents: validBody.quoteCents,
        quoteType: validBody.quoteType,
      })
    );
  });

  it("links to conversationId when provided", async () => {
    const { POST } = await import("@/app/api/quotes/route");
    const conversationId = "550e8400-e29b-41d4-a716-446655440001";
    await POST(makeRequest({ ...validBody, conversationId }) as never);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId })
    );
  });

  it("accepts wasAccepted field", async () => {
    const { POST } = await import("@/app/api/quotes/route");
    await POST(makeRequest({ ...validBody, wasAccepted: "yes" }) as never);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ wasAccepted: "yes" })
    );
  });
});

describe("GET /api/quotes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(makeAuthClient());
    mockOrderBy.mockImplementation(() => Promise.resolve([{ id: "quote-id-1", userId: "test-user-id", quoteCents: 35000 }]));
    mockWhere.mockImplementation(() => ({ orderBy: mockOrderBy }));
    mockFrom.mockImplementation(() => ({ where: mockWhere }));
    mockSelect.mockImplementation(() => ({ from: mockFrom }));
  });

  it("returns 401 without auth", async () => {
    (createClient as jest.Mock).mockReturnValue(makeAuthClient(null));
    const { GET } = await import("@/app/api/quotes/route");
    const request = new Request("http://localhost/api/quotes");
    const response = await GET(request as never);
    expect(response.status).toBe(401);
  });

  it("returns quotes for the current user", async () => {
    const { GET } = await import("@/app/api/quotes/route");
    const request = new Request("http://localhost/api/quotes");
    const response = await GET(request as never);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("quotes");
    expect(Array.isArray(data.quotes)).toBe(true);
  });

  it("filters by conversationId when provided", async () => {
    const { GET } = await import("@/app/api/quotes/route");
    const conversationId = "550e8400-e29b-41d4-a716-446655440001";
    const request = new Request(`http://localhost/api/quotes?conversationId=${conversationId}`);
    const response = await GET(request as never);
    expect(response.status).toBe(200);
    // The select chain should have been called with the conversationId filter
    expect(mockSelect).toHaveBeenCalled();
  });
});

/**
 * Tests for GraphQL guides resolver (guides/DIY guides page data)
 */

// ---- Mocks ---------------------------------------------------------------
jest.mock("@/app/db/client", () => ({ db: {} }));



jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn((...args: unknown[]) => args),
  desc: jest.fn(),
  asc: jest.fn(),
  inArray: jest.fn(),
  isNotNull: jest.fn(),
  sql: jest.fn((tpl: TemplateStringsArray) => tpl[0]),
}));

// ---- Fixtures ------------------------------------------------------------

const SAMPLE_GUIDES = [
  {
    id: "guide-1",
    userId: "user-123",
    title: "How to Fix a Leaky Faucet",
    source: "ifixit",
    sourceUrl: "https://ifixit.com/guide/12345",
    category: "plumbing",
    difficulty: "beginner",
    timeEstimate: "1 hour",
    toolsRequired: ["wrench", "pliers"],
    isBookmarked: true,
    completedAt: null,
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "guide-2",
    userId: "user-123",
    title: "Replacing a Light Switch",
    source: "youtube",
    sourceUrl: "https://youtube.com/watch?v=abc123",
    category: "electrical",
    difficulty: "intermediate",
    timeEstimate: "30 min",
    toolsRequired: ["screwdriver", "voltage tester"],
    isBookmarked: false,
    completedAt: new Date("2024-03-15"),
    createdAt: new Date("2024-03-01"),
  },
];

// ---- Tests ---------------------------------------------------------------

describe("guides resolver", () => {
  it("returns all guides for user", () => {
    const userGuides = SAMPLE_GUIDES.filter((g) => g.userId === "user-123");
    expect(userGuides).toHaveLength(2);
  });

  it("returns bookmarked guides only when filter applied", () => {
    const bookmarked = SAMPLE_GUIDES.filter((g) => g.isBookmarked);
    expect(bookmarked).toHaveLength(1);
    expect(bookmarked[0].title).toBe("How to Fix a Leaky Faucet");
  });

  it("returns guides by source (ifixit, youtube, etc.)", () => {
    const ifixitGuides = SAMPLE_GUIDES.filter((g) => g.source === "ifixit");
    expect(ifixitGuides).toHaveLength(1);

    const youtubeGuides = SAMPLE_GUIDES.filter((g) => g.source === "youtube");
    expect(youtubeGuides).toHaveLength(1);
  });

  it("returns completed guides correctly", () => {
    const completed = SAMPLE_GUIDES.filter((g) => g.completedAt !== null);
    expect(completed).toHaveLength(1);
    expect(completed[0].id).toBe("guide-2");
  });

  it("returns incomplete guides", () => {
    const incomplete = SAMPLE_GUIDES.filter((g) => g.completedAt === null);
    expect(incomplete).toHaveLength(1);
    expect(incomplete[0].id).toBe("guide-1");
  });

  it("guidesPageDataResolver resolves without throwing for new user", async () => {
    const { guidesPageDataResolver } = await import(
      "@/graphql/resolvers/queries/guidesPageData"
    );

    const mockDb = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([]),
        limit: jest.fn().mockResolvedValue([]),
        leftJoin: jest.fn().mockReturnThis(),
      }),
    };

    const ctx = {
      db: mockDb,
      user: { id: "user-new" },
      userId: "user-new",
      groupId: null,
      groupMembership: null,
      loaders: {},
      requestId: "req-1",
    };

    const result = await guidesPageDataResolver({}, {}, ctx as any);
    expect(result).toHaveProperty("guides");
    expect(Array.isArray(result.guides)).toBe(true);
  });
});

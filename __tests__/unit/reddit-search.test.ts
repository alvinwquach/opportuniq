/**
 * Unit tests for app/api/chat/tools/reddit-search.ts
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
}));

// ─── Feature flag mock ────────────────────────────────────────────────────────

const mockGetFeatureFlag = jest.fn();
jest.mock("@/lib/feature-flags", () => ({
  getFeatureFlag: (...args: [unknown, ...unknown[]]) => mockGetFeatureFlag(...args),
}));

// ─── firecrawlSearch mock ─────────────────────────────────────────────────────

const mockFirecrawlSearch = jest.fn();
jest.mock("@/lib/integrations/firecrawl-search", () => ({
  firecrawlSearch: (...args: [unknown, ...unknown[]]) => mockFirecrawlSearch(...args),
}));

// ─── FirecrawlApp mock ────────────────────────────────────────────────────────

const mockScrape = jest.fn();
jest.mock("@mendable/firecrawl-js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    scrape: mockScrape,
    search: jest.fn(),
  })),
}));

// ─── DB mock ──────────────────────────────────────────────────────────────────

const mockDbInsert = jest.fn();
jest.mock("@/app/db/client", () => ({
  db: {
    insert: () => ({ values: mockDbInsert }),
  },
}));

jest.mock("@/app/db/schema", () => ({
  diyGuides: {},
}));

// ─── ai mock ──────────────────────────────────────────────────────────────────

jest.mock("ai", () => ({
  tool: (config: unknown) => config,
}));

import FirecrawlApp from "@mendable/firecrawl-js";
import { createRedditSearchTool } from "@/app/api/chat/tools/reddit-search";
import type { ToolContext } from "@/app/api/chat/tools/types";

const firecrawl = new FirecrawlApp({ apiKey: "test" });

const baseCtx: ToolContext = {
  firecrawl,
  userId: "user-123",
  conversationId: "conv-456",
};

type ExecuteArgs = {
  query: string;
  focusOn?: "cost" | "diy_difficulty" | "contractor_experience" | "general";
  category?: "home" | "auto";
};

function getExecute(ctx: ToolContext) {
  const toolDef = createRedditSearchTool(ctx) as unknown as {
    execute: (args: ExecuteArgs) => Promise<unknown>;
  };
  return toolDef.execute;
}

const mockRedditResults = {
  web: [
    {
      url: "https://www.reddit.com/r/HomeImprovement/comments/abc123/water_heater_replacement/",
      title: "Water heater replacement cost experiences",
      description: "Paid $1200 for a 50-gal gas heater installed",
      markdown: "## Water Heater Costs\nMost people paid $800-1500 for installation.",
    },
    {
      url: "https://www.reddit.com/r/DIY/comments/def456/diy_water_heater/",
      title: "DIY water heater replacement",
      description: "Step by step guide for replacing water heater",
      markdown: "## DIY Guide\nThis is a moderate difficulty project.",
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockDbInsert.mockResolvedValue([]);
});

// ─────────────────────────────────────────────────────────────────────────────
describe("reddit search tool", () => {
  describe("flag ON", () => {
    beforeEach(() => {
      // Enable firecrawl-search-v2 only; keep json-extraction OFF to isolate behavior
      mockGetFeatureFlag.mockImplementation((flag: string) => {
        if (flag === "firecrawl-search-v2") return Promise.resolve(true);
        return Promise.resolve(false);
      });
    });

    it("calls firecrawlSearch with enhanced query based on focusOn", async () => {
      mockFirecrawlSearch.mockResolvedValue(mockRedditResults);

      const execute = getExecute(baseCtx);
      await execute({ query: "water heater", focusOn: "cost" });

      expect(mockFirecrawlSearch).toHaveBeenCalledTimes(1);
      const [, query] = mockFirecrawlSearch.mock.calls[0] as [unknown, string];
      expect(query).toContain("water heater");
      expect(query).toContain("cost");
    });

    it("includes scrapeOptions for markdown content", async () => {
      mockFirecrawlSearch.mockResolvedValue(mockRedditResults);

      const execute = getExecute(baseCtx);
      await execute({ query: "water heater" });

      const [, , options] = mockFirecrawlSearch.mock.calls[0] as [unknown, unknown, { scrapeOptions?: unknown }];
      expect(options?.scrapeOptions).toMatchObject({ formats: ["markdown"] });
    });

    it("returns posts with titles and URLs", async () => {
      mockFirecrawlSearch.mockResolvedValue(mockRedditResults);

      const execute = getExecute(baseCtx);
      const result = await execute({ query: "water heater replacement" }) as {
        posts: Array<{ title: string; url: string }>;
        postsFound: number;
      };

      expect(result.postsFound).toBe(2);
      expect(result.posts).toHaveLength(2);
      expect(result.posts[0]).toMatchObject({
        title: "Water heater replacement cost experiences",
        url: "https://www.reddit.com/r/HomeImprovement/comments/abc123/water_heater_replacement/",
      });
    });

    it("saves guides to diyGuides table when userId present", async () => {
      mockFirecrawlSearch.mockResolvedValue(mockRedditResults);

      const execute = getExecute(baseCtx);
      await execute({ query: "water heater" });

      expect(mockDbInsert).toHaveBeenCalledTimes(1);
    });

    it("does NOT save guides when userId missing", async () => {
      mockFirecrawlSearch.mockResolvedValue(mockRedditResults);

      const ctx: ToolContext = { firecrawl, conversationId: "conv-1" };
      const execute = getExecute(ctx);
      await execute({ query: "water heater" });

      expect(mockDbInsert).not.toHaveBeenCalled();
    });

    it("does NOT save guides when conversationId missing", async () => {
      mockFirecrawlSearch.mockResolvedValue(mockRedditResults);

      const ctx: ToolContext = { firecrawl, userId: "user-1" };
      const execute = getExecute(ctx);
      await execute({ query: "water heater" });

      expect(mockDbInsert).not.toHaveBeenCalled();
    });

    it("falls back to old code when search returns null", async () => {
      mockFirecrawlSearch.mockResolvedValue(null);
      mockScrape.mockResolvedValue({ markdown: "# Reddit results\n[Post title](https://www.reddit.com/r/DIY/comments/xyz/post/)" });

      const execute = getExecute(baseCtx);
      await execute({ query: "water heater" });

      expect(mockScrape).toHaveBeenCalledTimes(1);
    });

    it("includes interpretation tips in response", async () => {
      mockFirecrawlSearch.mockResolvedValue(mockRedditResults);

      const execute = getExecute(baseCtx);
      const result = await execute({ query: "water heater", focusOn: "cost" }) as {
        interpretation: string[];
      };

      expect(Array.isArray(result.interpretation)).toBe(true);
      expect(result.interpretation.length).toBeGreaterThan(0);
    });
  });

  describe("flag OFF", () => {
    beforeEach(() => {
      mockGetFeatureFlag.mockResolvedValue(false);
    });

    it("scrapes reddit.com/r/.../search directly via scrapeWithTimeout", async () => {
      mockScrape.mockResolvedValue({ markdown: "Reddit search results" });

      const execute = getExecute(baseCtx);
      await execute({ query: "water heater replacement" });

      expect(mockFirecrawlSearch).not.toHaveBeenCalled();
      expect(mockScrape).toHaveBeenCalledTimes(1);
      const scrapeUrl = mockScrape.mock.calls[0][0] as string;
      expect(scrapeUrl).toContain("reddit.com/r/");
    });
  });

  describe("focusOn variations", () => {
    beforeEach(() => {
      mockGetFeatureFlag.mockResolvedValue(true);
      mockFirecrawlSearch.mockResolvedValue(mockRedditResults);
    });

    it("focusOn=cost adds cost-specific terms to query", async () => {
      const execute = getExecute(baseCtx);
      await execute({ query: "roof repair", focusOn: "cost" });

      const [, query] = mockFirecrawlSearch.mock.calls[0] as [unknown, string];
      expect(query).toMatch(/cost|price|paid|quote/i);
    });

    it("focusOn=diy_difficulty adds difficulty terms", async () => {
      const execute = getExecute(baseCtx);
      await execute({ query: "roof repair", focusOn: "diy_difficulty" });

      const [, query] = mockFirecrawlSearch.mock.calls[0] as [unknown, string];
      expect(query).toMatch(/DIY|difficulty|beginner|experience/i);
    });

    it("focusOn=contractor_experience adds contractor terms", async () => {
      const execute = getExecute(baseCtx);
      await execute({ query: "roof repair", focusOn: "contractor_experience" });

      const [, query] = mockFirecrawlSearch.mock.calls[0] as [unknown, string];
      expect(query).toMatch(/contractor|hired|experience|review/i);
    });

    it("focusOn=general uses base query without modification", async () => {
      const execute = getExecute(baseCtx);
      await execute({ query: "roof repair", focusOn: "general" });

      const [, query] = mockFirecrawlSearch.mock.calls[0] as [unknown, string];
      expect(query).toBe("roof repair");
    });
  });

  describe("category variations", () => {
    beforeEach(() => {
      mockGetFeatureFlag.mockResolvedValue(false);
      mockScrape.mockResolvedValue({ markdown: "results" });
    });

    it("category=auto uses AUTO_REPAIR_SUBREDDITS", async () => {
      const execute = getExecute(baseCtx);
      await execute({ query: "brake repair", category: "auto" });

      const scrapeUrl = mockScrape.mock.calls[0][0] as string;
      expect(scrapeUrl).toContain("MechanicAdvice");
    });

    it("category=home uses HOME_REPAIR_SUBREDDITS", async () => {
      const execute = getExecute(baseCtx);
      await execute({ query: "water heater", category: "home" });

      const scrapeUrl = mockScrape.mock.calls[0][0] as string;
      expect(scrapeUrl).toContain("HomeImprovement");
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      // Enable firecrawl-search-v2 only; keep json-extraction OFF to isolate behavior
      mockGetFeatureFlag.mockImplementation((flag: string) => {
        if (flag === "firecrawl-search-v2") return Promise.resolve(true);
        return Promise.resolve(false);
      });
    });

    it("search returns results but all markdown is empty", async () => {
      mockFirecrawlSearch.mockResolvedValue({
        web: [
          { url: "https://www.reddit.com/r/DIY/comments/abc/post/", title: "Post without content" },
        ],
      });

      const execute = getExecute(baseCtx);
      const result = await execute({ query: "water heater" }) as {
        postsFound: number;
      };

      expect(result.postsFound).toBe(1);
    });

    it("search returns zero results", async () => {
      mockFirecrawlSearch.mockResolvedValue({ web: [] });
      mockScrape.mockResolvedValue({ markdown: "fallback content" });

      const execute = getExecute(baseCtx);
      await execute({ query: "very obscure query" });

      // Should fall back to scrape
      expect(mockScrape).toHaveBeenCalledTimes(1);
    });

    it("DB insert fails — tool still returns results (does not throw)", async () => {
      mockFirecrawlSearch.mockResolvedValue(mockRedditResults);
      mockDbInsert.mockRejectedValue(new Error("DB connection failed"));

      const execute = getExecute(baseCtx);
      const result = await execute({ query: "water heater" });

      // Should still return results even though DB insert failed
      expect(result).toBeDefined();
      expect((result as { postsFound: number }).postsFound).toBe(2);
    });

    it("query with emoji and special characters", async () => {
      mockFirecrawlSearch.mockResolvedValue({ web: [] });
      mockScrape.mockResolvedValue({ markdown: "result" });

      const execute = getExecute(baseCtx);
      const result = await execute({ query: "water heater 🔥 repair & maintenance" });
      expect(result).toBeDefined();
    });
  });
});

/**
 * Unit tests for reddit-search.ts — JSON extraction and summary format
 * (firecrawl-json-extraction flag)
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setContext: jest.fn(),
}));

// ─── Feature flag mock ────────────────────────────────────────────────────────

const mockGetFeatureFlag = jest.fn();
jest.mock("@/lib/feature-flags", () => ({
  getFeatureFlag: (...args: unknown[]) => mockGetFeatureFlag(...args),
}));

// ─── firecrawlSearch mock ─────────────────────────────────────────────────────

const mockFirecrawlSearch = jest.fn();
jest.mock("@/lib/integrations/firecrawl-search", () => ({
  firecrawlSearch: (...args: unknown[]) => mockFirecrawlSearch(...args),
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

const LONG_MARKDOWN = `# Reddit: Water Heater Replacement Costs

## Post 1: I paid $1,200 for a 50-gal gas heater installed
Several contractors quoted me between $900 and $1500. I went with the middle quote.
Difficulty: Easy if you're handy. Hard if not.
Key advice: Always get 3 quotes.
Warning: Don't go with the cheapest contractor.
Recommendation: Hire a professional for gas connections.

## Post 2: DIY water heater replacement guide
I replaced mine for $650 in parts. Took about 3 hours.
The hardest part is the gas line connection.
Key advice: Shut off the gas and water first.
I recommend DIY if you're comfortable with basic plumbing.
`.repeat(5); // repeat to make it long (>500 chars)

beforeEach(() => {
  jest.clearAllMocks();
  mockDbInsert.mockResolvedValue([]);
  mockScrape.mockReset();
});

// ─────────────────────────────────────────────────────────────────────────────
describe("Reddit prompt-based extraction", () => {
  beforeEach(() => {
    // Both flags ON: new search + json extraction
    mockGetFeatureFlag.mockImplementation((flag: string) => {
      if (flag === "firecrawl-search-v2") return Promise.resolve(true);
      if (flag === "firecrawl-json-extraction") return Promise.resolve(true);
      return Promise.resolve(false);
    });
  });

  it("extracts cost, difficulty, advice from Reddit markdown", async () => {
    const structuredInsights = {
      costPaid: 1200,
      difficulty: "moderate",
      keyAdvice: "Get 3 quotes before hiring",
      warnings: ["Avoid cheapest contractors"],
      recommendDIY: false,
    };

    mockFirecrawlSearch.mockResolvedValue({
      web: [
        {
          url: "https://www.reddit.com/r/HomeImprovement/comments/abc/water_heater/",
          title: "Water heater replacement cost",
          markdown: LONG_MARKDOWN,
        },
      ],
    });

    // Second scrape call is for JSON extraction on the individual post
    mockScrape.mockResolvedValue({ json: structuredInsights });

    const execute = getExecute(baseCtx);
    const result = await execute({ query: "water heater replacement cost", focusOn: "cost" }) as {
      posts: Array<{ insights?: unknown }>;
    };

    expect(result.posts[0].insights).toEqual(structuredInsights);
  });

  it("returns structured insights instead of raw markdown", async () => {
    mockFirecrawlSearch.mockResolvedValue({
      web: [
        {
          url: "https://www.reddit.com/r/DIY/comments/def/guide/",
          title: "DIY water heater guide",
          markdown: LONG_MARKDOWN,
        },
      ],
    });

    mockScrape.mockResolvedValue({
      json: { costPaid: 650, difficulty: "easy", recommendDIY: true },
    });

    const execute = getExecute(baseCtx);
    const result = await execute({ query: "water heater DIY" }) as {
      posts: Array<{ insights?: { costPaid?: number; difficulty?: string; recommendDIY?: boolean } }>;
    };

    // Should have structured insights object, not raw markdown string
    expect(typeof result.posts[0].insights).toBe("object");
    expect(result.posts[0].insights?.costPaid).toBe(650);
  });

  it("handles post with no cost information (cost = null)", async () => {
    mockFirecrawlSearch.mockResolvedValue({
      web: [
        {
          url: "https://www.reddit.com/r/DIY/comments/ghi/discussion/",
          title: "General discussion",
          markdown: LONG_MARKDOWN,
        },
      ],
    });

    mockScrape.mockResolvedValue({
      json: { costPaid: null, difficulty: "moderate", keyAdvice: "Read the manual first" },
    });

    const execute = getExecute(baseCtx);
    const result = await execute({ query: "water heater tips" }) as {
      posts: Array<{ insights?: unknown }>;
    };

    // Should handle null cost gracefully — insights still returned
    expect(result.posts[0].insights).toBeDefined();
    expect((result.posts[0].insights as { costPaid: null }).costPaid).toBeNull();
  });

  it("handles post with no difficulty assessment", async () => {
    mockFirecrawlSearch.mockResolvedValue({
      web: [
        {
          url: "https://www.reddit.com/r/HomeImprovement/comments/jkl/cost_only/",
          title: "Just the costs",
          markdown: LONG_MARKDOWN,
        },
      ],
    });

    mockScrape.mockResolvedValue({
      json: { costPaid: 1400, keyAdvice: "Worth every penny" },
      // No difficulty field
    });

    const execute = getExecute(baseCtx);
    const result = await execute({ query: "water heater cost" }) as {
      posts: Array<{ insights?: { difficulty?: string } }>;
    };

    expect(result.posts[0].insights).toBeDefined();
    expect(result.posts[0].insights?.difficulty).toBeUndefined();
  });

  it("extraction failure is non-fatal — post still included without insights", async () => {
    mockFirecrawlSearch.mockResolvedValue({
      web: [
        {
          url: "https://www.reddit.com/r/DIY/comments/abc/post/",
          title: "Water heater tips",
          markdown: LONG_MARKDOWN,
        },
      ],
    });

    // Extraction throws
    mockScrape.mockRejectedValue(new Error("Extraction failed"));

    const execute = getExecute(baseCtx);
    const result = await execute({ query: "water heater" }) as {
      posts: Array<{ title: string; insights?: unknown }>;
    };

    // Post is still returned despite extraction failure
    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].title).toBe("Water heater tips");
  });

  it("only extracts from posts with markdown content (skips markdown-less posts)", async () => {
    mockFirecrawlSearch.mockResolvedValue({
      web: [
        // No markdown
        { url: "https://www.reddit.com/r/DIY/comments/a/no_markdown/", title: "No content" },
        // Has markdown
        { url: "https://www.reddit.com/r/DIY/comments/b/with_markdown/", title: "Has content", markdown: LONG_MARKDOWN },
      ],
    });

    mockScrape.mockResolvedValue({ json: { costPaid: 500 } });

    const execute = getExecute(baseCtx);
    await execute({ query: "water heater" });

    // Only 1 scrape call (for the post with markdown)
    expect(mockScrape).toHaveBeenCalledTimes(1);
  });

  it("limits JSON extraction to top 3 posts with markdown", async () => {
    mockFirecrawlSearch.mockResolvedValue({
      web: Array.from({ length: 6 }, (_, i) => ({
        url: `https://www.reddit.com/r/DIY/comments/${i}/post/`,
        title: `Post ${i}`,
        markdown: LONG_MARKDOWN,
      })),
    });

    mockScrape.mockResolvedValue({ json: { costPaid: 800 } });

    const execute = getExecute(baseCtx);
    await execute({ query: "water heater" });

    // Only top 3 get extracted
    expect(mockScrape).toHaveBeenCalledTimes(3);
  });
});

describe("Reddit summary format", () => {
  beforeEach(() => {
    // json-extraction ON, new-search OFF (fallback path)
    mockGetFeatureFlag.mockImplementation((flag: string) => {
      if (flag === "firecrawl-search-v2") return Promise.resolve(false);
      if (flag === "firecrawl-json-extraction") return Promise.resolve(true);
      return Promise.resolve(false);
    });
  });

  it("uses summary format instead of markdown when flag is ON", async () => {
    mockScrape.mockResolvedValue({
      summary: "Water heater replacement costs $800-1500 professionally. DIY is possible for $400-700.",
    });

    const execute = getExecute(baseCtx);
    const result = await execute({ query: "water heater replacement" }) as {
      results?: string;
    };

    const [, options] = mockScrape.mock.calls[0] as [string, { formats: string[] }];
    expect(options.formats).toContain("summary");
    expect(result.results).toBe(
      "Water heater replacement costs $800-1500 professionally. DIY is possible for $400-700."
    );
  });

  it("summary is shorter than original markdown by >50%", async () => {
    const summaryText = "Water heater replacement typically costs $800-1500. DIY saves money but requires skill.";
    mockScrape.mockResolvedValue({ summary: summaryText });

    const execute = getExecute(baseCtx);
    const result = await execute({ query: "water heater" }) as { results?: string };

    expect(result.results).toBe(summaryText);
    // Summary is much shorter than LONG_MARKDOWN (which is >2000 chars)
    expect((result.results?.length ?? 0)).toBeLessThan(LONG_MARKDOWN.length * 0.5);
  });

  it("summary preserves key information (costs, recommendations)", async () => {
    const summaryText =
      "Professional water heater replacement costs $800-1500. DIY is possible for experienced homeowners. Recommend getting 3 quotes.";
    mockScrape.mockResolvedValue({ summary: summaryText });

    const execute = getExecute(baseCtx);
    const result = await execute({ query: "water heater cost" }) as { results?: string };

    expect(result.results).toContain("$800");
    expect(result.results).toContain("DIY");
  });

  it("falls back to markdown path when summary scrape returns null", async () => {
    // First call (summary) times out → returns null
    // Second call (markdown via scrapeWithTimeout) succeeds
    mockScrape
      .mockResolvedValueOnce(null) // summary fails
      .mockResolvedValueOnce({ markdown: "# Reddit results\n[Post](https://www.reddit.com/r/DIY/comments/xyz/post/)" });

    const execute = getExecute(baseCtx);
    const result = await execute({ query: "water heater" });

    expect(result).toBeDefined();
    expect(mockScrape).toHaveBeenCalledTimes(2);
  });

  it("falls back to markdown path when summary scrape throws", async () => {
    mockScrape
      .mockRejectedValueOnce(new Error("Scrape failed")) // summary throws
      .mockResolvedValueOnce({ markdown: "# Results\n[Post](https://www.reddit.com/r/DIY/comments/abc/post/)" });

    const execute = getExecute(baseCtx);
    const result = await execute({ query: "water heater" });

    expect(result).toBeDefined();
  });

  it("both flags OFF — uses old markdown path with substring(0, 3000)", async () => {
    mockGetFeatureFlag.mockResolvedValue(false); // both flags OFF

    mockScrape.mockResolvedValue({ markdown: LONG_MARKDOWN });

    const execute = getExecute(baseCtx);
    const result = await execute({ query: "water heater" }) as { results?: string };

    // Old path: substring(0, 3000)
    if (result.results !== undefined) {
      expect(result.results.length).toBeLessThanOrEqual(3000);
    }
    // Summary format NOT used
    const [, options] = mockScrape.mock.calls[0] as [string, { formats: string[] }];
    expect(options.formats).not.toContain("summary");
  });
});

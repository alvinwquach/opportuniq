/**
 * Integration tests for Firecrawl search tools (permit, reddit, utility rebates)
 *
 * Mocks: Firecrawl SDK (module-level) + feature flags (always ON).
 * Tests the full flow through the tool including flag check, search call, and response shape.
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
  withServerActionInstrumentation: jest.fn((_n: unknown, _o: unknown, fn: () => unknown) => fn()),
}));

// ─── Feature flags: always ON ─────────────────────────────────────────────────

jest.mock("@/lib/feature-flags", () => ({
  getFeatureFlag: jest.fn().mockResolvedValue(true),
}));

// ─── Firecrawl SDK mock ───────────────────────────────────────────────────────

const mockSearch = jest.fn();
const mockScrape = jest.fn();

jest.mock("@mendable/firecrawl-js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    search: mockSearch,
    scrape: mockScrape,
  })),
}));

// ─── firecrawl-limiter: pass through to real search ──────────────────────────

jest.mock("@/lib/firecrawl-limiter", () => ({
  limitedSearch: jest.fn((_fc: unknown, query: string, options: unknown) =>
    mockSearch(query, options)
  ),
  limitedScrape: jest.fn((_fc: unknown, url: string, options: unknown) =>
    mockScrape(url, options)
  ),
  limitedCrawl: jest.fn(),
  limitedBatch: jest.fn(),
  getCreditUsage: jest.fn(),
  _resetCreditTracking: jest.fn(),
  _getActiveCount: jest.fn(),
}));

// ─── DB mock ──────────────────────────────────────────────────────────────────

const mockDbInsert = jest.fn().mockResolvedValue([]);
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
import { createPermitLookupTool } from "@/app/api/chat/tools/permit-lookup";
import { createRedditSearchTool } from "@/app/api/chat/tools/reddit-search";
import { createUtilityRebatesTool } from "@/app/api/chat/tools/utility-rebates";
import type { ToolContext } from "@/app/api/chat/tools/types";

const firecrawl = new FirecrawlApp({ apiKey: "test" });

const ctx: ToolContext = {
  firecrawl,
  userId: "user-test",
  conversationId: "conv-test",
  zipCode: "94102",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockDbInsert.mockResolvedValue([]);
});

// ─────────────────────────────────────────────────────────────────────────────
describe("permit lookup full flow", () => {
  it("flag ON → search succeeds → structured response with guidance", async () => {
    mockSearch.mockResolvedValue({
      web: [
        { url: "https://austin.gov/permits", title: "Austin Building Permits", description: "Official permit info" },
        { url: "https://example.com/guide", title: "Permit Guide", description: "How to get a deck permit" },
      ],
    });

    const toolDef = createPermitLookupTool(ctx) as unknown as {
      execute: (args: { projectType: string; city: string; state: string }) => Promise<unknown>;
    };
    const result = await toolDef.execute({ projectType: "deck construction", city: "Austin", state: "TX" }) as {
      projectType: string;
      location: string;
      searchResults: Array<{ url: string; title?: string }>;
      generalGuidance: string[];
      tip: string;
    };

    expect(result.projectType).toBe("deck construction");
    expect(result.location).toBe("Austin, TX");
    expect(Array.isArray(result.searchResults)).toBe(true);
    expect(result.searchResults).toHaveLength(2);
    expect(result.searchResults[0].url).toBe("https://austin.gov/permits");
    expect(Array.isArray(result.generalGuidance)).toBe(true);
    expect(result.tip).toBeDefined();
    expect(mockScrape).not.toHaveBeenCalled();
  });

  it("flag ON → search returns null → fallback to scrape → still returns response", async () => {
    mockSearch.mockRejectedValue(new Error("timeout")); // causes firecrawlSearch to return null
    mockScrape.mockResolvedValue({ markdown: "Google search results about permits in Austin TX" });

    const toolDef = createPermitLookupTool(ctx) as unknown as {
      execute: (args: { projectType: string; city: string; state: string }) => Promise<unknown>;
    };
    const result = await toolDef.execute({ projectType: "electrical", city: "Austin", state: "TX" }) as {
      projectType: string;
      searchResults: string;
    };

    expect(result).toBeDefined();
    expect(mockScrape).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("reddit search full flow", () => {
  it("flag ON → search with scrapeOptions → posts + saves to diyGuides DB", async () => {
    mockSearch.mockResolvedValue({
      web: [
        {
          url: "https://www.reddit.com/r/HomeImprovement/comments/abc/roof_repair/",
          title: "Roof repair cost experience",
          description: "Got 3 quotes, ended up paying $4500",
          markdown: "## My experience\nI replaced my roof last summer...",
        },
      ],
    });

    const toolDef = createRedditSearchTool(ctx) as unknown as {
      execute: (args: { query: string; focusOn?: string }) => Promise<unknown>;
    };
    const result = await toolDef.execute({ query: "roof repair cost", focusOn: "cost" }) as {
      postsFound: number;
      posts: Array<{ title: string; url: string }>;
      interpretation: string[];
    };

    expect(result.postsFound).toBe(1);
    expect(result.posts[0].url).toContain("reddit.com");
    expect(Array.isArray(result.interpretation)).toBe(true);
    expect(mockDbInsert).toHaveBeenCalledTimes(1);

    // Verify scrapeOptions was passed to get markdown
    const searchOptions = mockSearch.mock.calls[0][1] as { scrapeOptions?: { formats: string[] } };
    expect(searchOptions?.scrapeOptions?.formats).toContain("markdown");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("utility rebates full flow", () => {
  it("flag ON → search → resources + rebates + results", async () => {
    mockSearch.mockResolvedValue({
      web: [
        { url: "https://energystar.gov/rebates", title: "Energy Star Rebates", description: "Federal rebate finder" },
        { url: "https://dsire.org", title: "DSIRE Incentives", description: "State incentives database" },
      ],
    });

    const toolDef = createUtilityRebatesTool(ctx) as unknown as {
      execute: (args: { upgradeType: string; zipCode: string }) => Promise<unknown>;
    };
    const result = await toolDef.execute({ upgradeType: "heat pump water heater", zipCode: "94102" }) as {
      upgradeType: string;
      zipCode: string;
      searchResults: Array<{ url: string }>;
      resources: unknown[];
      commonRebates: string[];
      tip: string;
    };

    expect(result.upgradeType).toBe("heat pump water heater");
    expect(result.zipCode).toBe("94102");
    expect(Array.isArray(result.searchResults)).toBe(true);
    expect(result.searchResults).toHaveLength(2);
    expect(Array.isArray(result.resources)).toBe(true);
    expect(result.resources.length).toBeGreaterThan(0);
    expect(Array.isArray(result.commonRebates)).toBe(true);
    expect(result.tip).toBeDefined();
    expect(mockScrape).not.toHaveBeenCalled();
  });
});

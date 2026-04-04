/**
 * Unit tests for permit mode of app/api/chat/tools/local-lookup.ts
 */

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
}));

const mockGetFeatureFlag = jest.fn();
jest.mock("@/lib/feature-flags", () => ({
  getFeatureFlag: (...args: [unknown, ...unknown[]]) => mockGetFeatureFlag(...args),
}));

const mockFirecrawlSearch = jest.fn();
jest.mock("@/lib/integrations/firecrawl-search", () => ({
  firecrawlSearch: (...args: [unknown, ...unknown[]]) => mockFirecrawlSearch(...args),
}));

const mockScrape = jest.fn();
jest.mock("@mendable/firecrawl-js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    scrape: mockScrape,
    search: jest.fn(),
  })),
}));

jest.mock("ai", () => ({
  tool: (config: unknown) => config,
}));

import FirecrawlApp from "@mendable/firecrawl-js";
import { createLocalLookupTool } from "@/app/api/chat/tools/local-lookup";
import type { ToolContext } from "@/app/api/chat/tools/types";

const firecrawl = new FirecrawlApp({ apiKey: "test" });

const baseCtx: ToolContext = {
  firecrawl,
  userId: "user-123",
  conversationId: "conv-456",
};

function getExecute(ctx: ToolContext) {
  const toolDef = createLocalLookupTool(ctx) as unknown as {
    execute: (args: { mode: "permits" | "rebates"; projectType?: string; city?: string; state?: string }) => Promise<unknown>;
  };
  return toolDef.execute;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("local lookup tool — permits mode", () => {
  describe("with firecrawl-search-v2 flag ON", () => {
    beforeEach(() => {
      mockGetFeatureFlag.mockResolvedValue(true);
    });

    it("calls firecrawlSearch instead of scrapeWithTimeout", async () => {
      mockFirecrawlSearch.mockResolvedValue({
        web: [{ url: "https://example.com", title: "Permit Info", description: "Details" }],
      });

      const execute = getExecute(baseCtx);
      await execute({ mode: "permits", projectType: "deck construction", city: "Austin", state: "TX" });

      expect(mockFirecrawlSearch).toHaveBeenCalledTimes(1);
      expect(mockScrape).not.toHaveBeenCalled();
    });

    it("returns structured search results with titles and URLs", async () => {
      mockFirecrawlSearch.mockResolvedValue({
        web: [
          { url: "https://austin.gov/permits", title: "Austin Permits", description: "Official info" },
          { url: "https://example.com/deck", title: "Deck Permit Guide", description: "How-to guide" },
        ],
      });

      const execute = getExecute(baseCtx);
      const result = await execute({ mode: "permits", projectType: "deck construction", city: "Austin", state: "TX" }) as {
        searchResults: Array<{ url: string; title?: string; description?: string }>;
      };

      expect(Array.isArray(result.searchResults)).toBe(true);
      expect(result.searchResults).toHaveLength(2);
      expect(result.searchResults[0]).toMatchObject({ url: "https://austin.gov/permits", title: "Austin Permits" });
    });

    it("includes generalGuidance array in response", async () => {
      mockFirecrawlSearch.mockResolvedValue({
        web: [{ url: "https://example.com", title: "Info" }],
      });

      const execute = getExecute(baseCtx);
      const result = await execute({ mode: "permits", projectType: "deck", city: "Austin", state: "TX" }) as {
        generalGuidance: string[];
      };

      expect(Array.isArray(result.generalGuidance)).toBe(true);
      expect(result.generalGuidance.length).toBeGreaterThan(0);
    });

    it("falls back to scrape when search returns null", async () => {
      mockFirecrawlSearch.mockResolvedValue(null);
      mockScrape.mockResolvedValue({ markdown: "Google result content" });

      const execute = getExecute(baseCtx);
      const result = await execute({ mode: "permits", projectType: "deck", city: "Austin", state: "TX" }) as {
        searchResults: string;
      };

      expect(mockScrape).toHaveBeenCalledTimes(1);
      expect(typeof result.searchResults).toBe("string");
    });

    it("falls back to scrape when search returns empty web array", async () => {
      mockFirecrawlSearch.mockResolvedValue({ web: [] });
      mockScrape.mockResolvedValue({ markdown: "Google fallback" });

      const execute = getExecute(baseCtx);
      await execute({ mode: "permits", projectType: "deck", city: "Austin", state: "TX" });

      expect(mockScrape).toHaveBeenCalledTimes(1);
    });
  });

  describe("with firecrawl-search-v2 flag OFF", () => {
    beforeEach(() => {
      mockGetFeatureFlag.mockResolvedValue(false);
    });

    it("uses Google scraping code path", async () => {
      mockScrape.mockResolvedValue({ markdown: "Google result content about permits" });

      const execute = getExecute(baseCtx);
      await execute({ mode: "permits", projectType: "water heater", city: "Denver", state: "CO" });

      expect(mockFirecrawlSearch).not.toHaveBeenCalled();
      expect(mockScrape).toHaveBeenCalledTimes(1);

      const scrapeUrl = mockScrape.mock.calls[0][0] as string;
      expect(scrapeUrl).toContain("google.com/search");
      expect(scrapeUrl).toContain("Denver");
    });

    it("returns correct response shape", async () => {
      mockScrape.mockResolvedValue({ markdown: "permit content here" });

      const execute = getExecute(baseCtx);
      const result = await execute({ mode: "permits", projectType: "water heater", city: "Denver", state: "CO" }) as {
        projectType: string;
        location: string;
        searchResults: string;
        generalGuidance: string[];
        tip: string;
      };

      expect(result).toMatchObject({ projectType: "water heater", location: "Denver CO" });
      expect(typeof result.searchResults).toBe("string");
      expect(Array.isArray(result.generalGuidance)).toBe(true);
    });
  });

  describe("when ctx.firecrawl is null", () => {
    it("returns error object with suggestion text", async () => {
      const ctx: ToolContext = { firecrawl: null, userId: "user-1" };
      const execute = getExecute(ctx);

      const result = await execute({ mode: "permits", projectType: "electrical", city: "Miami", state: "FL" }) as {
        error: string;
        suggestion: string;
      };

      expect(result.error).toBeDefined();
      expect(result.suggestion).toBeDefined();
    });

    it("does not call firecrawlSearch", async () => {
      const ctx: ToolContext = { firecrawl: null, userId: "user-1" };
      const execute = getExecute(ctx);

      await execute({ mode: "permits", projectType: "electrical", city: "Miami", state: "FL" });

      expect(mockFirecrawlSearch).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      mockGetFeatureFlag.mockResolvedValue(false);
      mockScrape.mockResolvedValue({ markdown: "result" });
    });

    it("handles empty city string", async () => {
      const execute = getExecute(baseCtx);
      const result = await execute({ mode: "permits", projectType: "deck", city: "", state: "TX" });
      expect(result).toBeDefined();
    });

    it("handles empty state string", async () => {
      const execute = getExecute(baseCtx);
      const result = await execute({ mode: "permits", projectType: "deck", city: "Austin", state: "" });
      expect(result).toBeDefined();
    });

    it("handles projectType with special characters", async () => {
      const execute = getExecute(baseCtx);
      const result = await execute({ mode: "permits", projectType: "deck & patio (wood)", city: "Austin", state: "TX" });
      expect(result).toBeDefined();
    });

    it("handles very long projectType (1000+ chars)", async () => {
      const longType = "a".repeat(1100);
      const execute = getExecute(baseCtx);
      const result = await execute({ mode: "permits", projectType: longType, city: "Austin", state: "TX" });
      expect(result).toBeDefined();
    });
  });
});

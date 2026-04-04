/**
 * Unit tests for rebates mode of app/api/chat/tools/local-lookup.ts
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
  zipCode: "94102",
};

function getExecute(ctx: ToolContext) {
  const toolDef = createLocalLookupTool(ctx) as unknown as {
    execute: (args: { mode: "permits" | "rebates"; upgradeType?: string; zipCode?: string }) => Promise<unknown>;
  };
  return toolDef.execute;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("local lookup tool — rebates mode", () => {
  describe("flag ON", () => {
    beforeEach(() => {
      mockGetFeatureFlag.mockResolvedValue(true);
    });

    it("calls firecrawlSearch with upgrade type and zip code", async () => {
      mockFirecrawlSearch.mockResolvedValue({
        web: [{ url: "https://example.com", title: "Rebate Info", description: "Heat pump rebates" }],
      });

      const execute = getExecute(baseCtx);
      await execute({ mode: "rebates", upgradeType: "heat pump water heater", zipCode: "94102" });

      expect(mockFirecrawlSearch).toHaveBeenCalledTimes(1);
      const [, query] = mockFirecrawlSearch.mock.calls[0] as [unknown, string];
      expect(query).toContain("heat pump water heater");
      expect(query).toContain("94102");
    });

    it("returns resources + commonRebates + search results", async () => {
      mockFirecrawlSearch.mockResolvedValue({
        web: [{ url: "https://dsire.org/search", title: "DSIRE Result", description: "State rebate" }],
      });

      const execute = getExecute(baseCtx);
      const result = await execute({ mode: "rebates", upgradeType: "smart thermostat", zipCode: "94102" }) as {
        resources: unknown[];
        commonRebates: string[];
        searchResults: Array<{ url: string }>;
      };

      expect(Array.isArray(result.resources)).toBe(true);
      expect(result.resources.length).toBeGreaterThan(0);
      expect(Array.isArray(result.commonRebates)).toBe(true);
      expect(result.commonRebates.length).toBeGreaterThan(0);
      expect(Array.isArray(result.searchResults)).toBe(true);
      expect(result.searchResults[0]).toMatchObject({ url: "https://dsire.org/search" });
    });

    it("falls back to scrape when search returns null", async () => {
      mockFirecrawlSearch.mockResolvedValue(null);
      mockScrape.mockResolvedValue({ markdown: "Google fallback result" });

      const execute = getExecute(baseCtx);
      const result = await execute({ mode: "rebates", upgradeType: "insulation", zipCode: "94102" }) as {
        searchResults: string;
      };

      expect(mockScrape).toHaveBeenCalledTimes(1);
      expect(typeof result.searchResults).toBe("string");
    });
  });

  describe("flag OFF", () => {
    beforeEach(() => {
      mockGetFeatureFlag.mockResolvedValue(false);
    });

    it("uses Google scraping code path", async () => {
      mockScrape.mockResolvedValue({ markdown: "Google rebate results" });

      const execute = getExecute(baseCtx);
      await execute({ mode: "rebates", upgradeType: "heat pump", zipCode: "12345" });

      expect(mockFirecrawlSearch).not.toHaveBeenCalled();
      expect(mockScrape).toHaveBeenCalledTimes(1);

      const scrapeUrl = mockScrape.mock.calls[0][0] as string;
      expect(scrapeUrl).toContain("google.com/search");
      expect(scrapeUrl).toContain("12345");
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      mockGetFeatureFlag.mockResolvedValue(true);
    });

    it("handles empty zip code", async () => {
      mockFirecrawlSearch.mockResolvedValue({ web: [] });
      mockScrape.mockResolvedValue({ markdown: "result" });

      const execute = getExecute(baseCtx);
      const result = await execute({ mode: "rebates", upgradeType: "heat pump", zipCode: "" });
      expect(result).toBeDefined();
    });

    it("handles non-numeric zip code", async () => {
      mockFirecrawlSearch.mockResolvedValue({ web: [] });
      mockScrape.mockResolvedValue({ markdown: "result" });

      const execute = getExecute(baseCtx);
      const result = await execute({ mode: "rebates", upgradeType: "heat pump", zipCode: "ABCDE" });
      expect(result).toBeDefined();
    });

    it("falls back to scrape on search timeout (null return)", async () => {
      mockFirecrawlSearch.mockResolvedValue(null);
      mockScrape.mockResolvedValue({ markdown: "fallback" });

      const execute = getExecute(baseCtx);
      await execute({ mode: "rebates", upgradeType: "heat pump", zipCode: "94102" });

      expect(mockScrape).toHaveBeenCalledTimes(1);
    });
  });
});

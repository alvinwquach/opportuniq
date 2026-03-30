/**
 * Integration tests for Firecrawl JSON extraction
 *
 * Tests the full flow from scrape → JSON extract → DB save → formatted response,
 * and contractor search with extractContractorsFromPage.
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
}));

// ─── Firecrawl mocks ──────────────────────────────────────────────────────────

const mockScrape = jest.fn();
const mockScrapePage = jest.fn();

jest.mock("@/lib/integrations/firecrawl", () => ({
  scrapePage: (...args: [unknown, ...unknown[]]) => mockScrapePage(...args),
  getFirecrawlClient: () => ({ scrape: mockScrape }),
  scrapeAngiContractors: jest.fn(),
  extractVendorsFromMarkdown: jest.fn(() => []),
  extractContractorsFromPage: jest.fn(),
}));

// ─── Feature flag mock ────────────────────────────────────────────────────────

const mockGetFeatureFlag = jest.fn();
jest.mock("@/lib/feature-flags", () => ({
  getFeatureFlag: (...args: [unknown, ...unknown[]]) => mockGetFeatureFlag(...args),
}));

// ─── Analytics mocks ──────────────────────────────────────────────────────────

const mockTrackCacheHit = jest.fn();
const mockTrackCacheMiss = jest.fn();
const mockTrackZeroResults = jest.fn();
jest.mock("@/lib/analytics-server", () => ({
  trackCostDataCacheHit: (...args: [unknown, ...unknown[]]) => mockTrackCacheHit(...args),
  trackCostDataCacheMiss: (...args: [unknown, ...unknown[]]) => mockTrackCacheMiss(...args),
  trackContractorSearchZeroResults: (...args: [unknown, ...unknown[]]) => mockTrackZeroResults(...args),
}));

// ─── DB mock ──────────────────────────────────────────────────────────────────

const mockSelect = jest.fn();
const mockInsert = jest.fn();

jest.mock("@/app/db/client", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => mockSelect()),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        onConflictDoUpdate: jest.fn(() => ({
          returning: mockInsert,
        })),
      })),
    })),
  },
}));

jest.mock("@/app/db/schema", () => ({
  costData: {
    serviceType: "serviceType",
    region: "region",
    source: "source",
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((_col: unknown, val: unknown) => `eq(${val})`),
  and: jest.fn((...args: unknown[]) => `and(${args.join(",")})`),
  gt: jest.fn((_col: unknown, val: unknown) => `gt(${val})`),
}));

jest.mock("@/lib/integrations/firecrawl-schemas", () => ({
  COST_ESTIMATE_SCHEMA: { type: "object", properties: {}, required: ["proMin", "proMax"] },
  CONTRACTOR_SCHEMA: { type: "object", properties: {} },
}));

// ─── Yelp and Foursquare mocks ────────────────────────────────────────────────

jest.mock("@/lib/integrations/yelp", () => ({
  findContractorsForIssue: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/lib/integrations/foursquare", () => ({
  findContractorsOnFoursquare: jest.fn().mockResolvedValue([]),
}));

import { getCostEstimate } from "@/lib/integrations/cost-scraper";
import { searchContractors } from "@/lib/integrations/contractor-search";
import { extractContractorsFromPage } from "@/lib/integrations/firecrawl";

function makeCostData(overrides?: Record<string, unknown>) {
  return {
    id: "cost-1",
    serviceType: "ceiling_repair",
    region: "941",
    source: "homeadvisor" as const,
    diyMinCents: null,
    diyMaxCents: null,
    diyAvgCents: null,
    proMinCents: 30000,
    proMaxCents: 80000,
    proAvgCents: 55000,
    costFactors: null,
    timeEstimate: null,
    sourceUrl: null,
    rawContent: null,
    sampleSize: null,
    scrapedAt: new Date(Date.now() - 1000 * 60 * 60),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 29),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSelect.mockReset();
  mockInsert.mockReset();
  mockScrape.mockReset();
  mockScrapePage.mockReset();
  delete process.env.YELP_API_KEY;
  delete process.env.FOURSQUARE_API_KEY;
  process.env.FIRECRAWL_API_KEY = "test-key";
});

afterEach(() => {
  delete process.env.FIRECRAWL_API_KEY;
});

// ─────────────────────────────────────────────────────────────────────────────
describe("cost scraper integration with JSON extraction", () => {
  it("full flow: scrape cost guide → JSON extract → save to DB → return formatted", async () => {
    // Flag ON
    mockGetFeatureFlag.mockResolvedValue(true);

    // No cached data
    mockSelect.mockResolvedValue([]);

    // Firecrawl returns JSON extraction result
    mockScrape.mockResolvedValue({
      markdown: "# Ceiling Repair Costs\nProfessionals charge $300-$800.",
      json: { proMin: 300, proMax: 800, proAvg: 550, costFactors: ["Size of damage"], sampleSize: 500 },
    });

    // DB insert returns the saved record
    mockInsert.mockResolvedValue([
      makeCostData({
        proMinCents: 30000,
        proMaxCents: 80000,
        proAvgCents: 55000,
        sampleSize: 500,
      }),
    ]);

    const result = await getCostEstimate("ceiling_repair", "94102");

    expect(result).not.toBeNull();
    expect(result?.pro?.min).toBe(300);
    expect(result?.pro?.max).toBe(800);
    expect(result?.pro?.avg).toBe(550);
  });

  it("full flow: JSON extract fails → regex fallback → still returns data", async () => {
    // Flag ON
    mockGetFeatureFlag.mockResolvedValue(true);

    // No cached data
    mockSelect.mockResolvedValue([]);

    // JSON extraction returns invalid data (no proMin/proMax)
    mockScrape.mockResolvedValue({
      markdown: "professional cost: $300 - $800",
      json: null,
    });

    // DB insert after regex fallback
    mockInsert.mockResolvedValue([
      makeCostData({ proMinCents: 30000, proMaxCents: 80000, proAvgCents: 55000 }),
    ]);

    const result = await getCostEstimate("ceiling_repair", "94102");

    // Regex fallback parsed the markdown and returned data
    expect(result).not.toBeNull();
    expect(result?.pro).not.toBeNull();
  });

  it("flag OFF: uses scrapePage + regex, not firecrawl.scrape", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    mockSelect.mockResolvedValue([]);

    mockScrapePage.mockResolvedValue({
      markdown: "professional cost: $300 - $800",
    });
    mockInsert.mockResolvedValue([makeCostData()]);

    await getCostEstimate("ceiling_repair", "94102");

    expect(mockScrapePage).toHaveBeenCalled();
    expect(mockScrape).not.toHaveBeenCalled();
  });
});

describe("contractor search integration", () => {
  beforeEach(() => {
    // Yelp and Foursquare not configured → fall through to Firecrawl
    delete process.env.YELP_API_KEY;
    delete process.env.FOURSQUARE_API_KEY;
  });

  it("Firecrawl fallback uses extractContractorsFromPage → returns named contractors", async () => {
    mockGetFeatureFlag.mockResolvedValue(true); // flag ON

    const mockExtract = extractContractorsFromPage as jest.MockedFunction<typeof extractContractorsFromPage>;
    mockExtract.mockResolvedValue([
      { name: "Top Roofers LLC", phone: "555-0101", rating: 4.8 },
      { name: "Best Roof Co", phone: "555-0202", rating: 4.5 },
    ]);

    const result = await searchContractors("roofing", "90210");

    expect(result.contractors).toHaveLength(2);
    expect(result.contractors[0].vendorName).toBe("Top Roofers LLC");
    expect(result.contractors[1].vendorName).toBe("Best Roof Co");
    expect(result.source).toBe("firecrawl");
  });

  it("contractors have names (not 'Unknown')", async () => {
    mockGetFeatureFlag.mockResolvedValue(true);

    const mockExtract = extractContractorsFromPage as jest.MockedFunction<typeof extractContractorsFromPage>;
    mockExtract.mockResolvedValue([
      { name: "Reliable Plumbing Inc" },
    ]);

    const result = await searchContractors("plumbing", "10001");

    expect(result.contractors[0].vendorName).toBe("Reliable Plumbing Inc");
    expect(result.contractors[0].vendorName).not.toBe("Unknown");
  });

  it("fires trackContractorSearchZeroResults when all providers return empty", async () => {
    mockGetFeatureFlag.mockResolvedValue(true);

    const mockExtract = extractContractorsFromPage as jest.MockedFunction<typeof extractContractorsFromPage>;
    mockExtract.mockResolvedValue([]); // empty → zero results

    await searchContractors("roofing", "90210");

    expect(mockTrackZeroResults).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "roofing",
        zipCode: "90210",
        providersAttempted: expect.any(Array),
      })
    );
  });

  it("flag OFF: falls back to old extractVendorsFromMarkdown path", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);

    const { scrapeAngiContractors } = jest.requireMock("@/lib/integrations/firecrawl") as {
      scrapeAngiContractors: jest.Mock;
    };
    scrapeAngiContractors.mockResolvedValue({ content: "# Contractors\n★★★★☆ 4.5 stars\n555-0101" });

    await searchContractors("roofing", "90210");

    const mockExtract = extractContractorsFromPage as jest.MockedFunction<typeof extractContractorsFromPage>;
    expect(mockExtract).not.toHaveBeenCalled();
    expect(scrapeAngiContractors).toHaveBeenCalled();
  });
});

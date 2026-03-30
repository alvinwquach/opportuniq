/**
 * Unit tests for extractContractorsFromPage() in lib/integrations/firecrawl.ts
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setContext: jest.fn(),
}));

// ─── firecrawl-schemas mock ───────────────────────────────────────────────────

jest.mock("@/lib/integrations/firecrawl-schemas", () => ({
  CONTRACTOR_SCHEMA: {
    type: "object",
    properties: {
      contractors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            phone: { type: "string" },
            address: { type: "string" },
            rating: { type: "number" },
            reviewCount: { type: "number" },
            specialties: { type: "array", items: { type: "string" } },
          },
          required: ["name"],
        },
      },
    },
  },
  COST_ESTIMATE_SCHEMA: { type: "object", properties: {}, required: [] },
}));

import { extractContractorsFromPage } from "@/lib/integrations/firecrawl";

// Build a mock FirecrawlApp instance
function makeMockFirecrawl(scrapeResult: unknown) {
  return { scrape: jest.fn().mockResolvedValue(scrapeResult) } as unknown as import("@mendable/firecrawl-js").default;
}

describe("extractContractorsFromPage", () => {
  it("returns array of contractors with names from JSON extraction", async () => {
    const firecrawl = makeMockFirecrawl({
      json: {
        contractors: [
          { name: "ABC Roofing", phone: "555-1234", rating: 4.8, reviewCount: 120 },
          { name: "XYZ Repairs", phone: "555-5678", rating: 4.2, reviewCount: 45 },
        ],
      },
    });

    const result = await extractContractorsFromPage(firecrawl, "https://www.angi.com/search/roofing-90210.htm");

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("ABC Roofing");
    expect(result[1].name).toBe("XYZ Repairs");
  });

  it("returns empty array when JSON extraction returns null", async () => {
    const firecrawl = makeMockFirecrawl({ json: null });

    const result = await extractContractorsFromPage(firecrawl, "https://www.angi.com/search/roofing-90210.htm");

    expect(result).toEqual([]);
  });

  it("returns empty array when contractors array is empty", async () => {
    const firecrawl = makeMockFirecrawl({ json: { contractors: [] } });

    const result = await extractContractorsFromPage(firecrawl, "https://www.angi.com/search/roofing-90210.htm");

    expect(result).toEqual([]);
  });

  it("returns empty array when JSON field is missing entirely", async () => {
    const firecrawl = makeMockFirecrawl({});

    const result = await extractContractorsFromPage(firecrawl, "https://www.angi.com/search/roofing-90210.htm");

    expect(result).toEqual([]);
  });

  it("maps phone, address, rating, reviewCount correctly", async () => {
    const firecrawl = makeMockFirecrawl({
      json: {
        contractors: [
          {
            name: "Best Plumbers Inc",
            phone: "800-555-0100",
            address: "123 Main St, Los Angeles, CA 90001",
            rating: 4.9,
            reviewCount: 350,
          },
        ],
      },
    });

    const result = await extractContractorsFromPage(firecrawl, "https://www.angi.com/search/plumbing-90001.htm");

    expect(result[0]).toMatchObject({
      name: "Best Plumbers Inc",
      phone: "800-555-0100",
      address: "123 Main St, Los Angeles, CA 90001",
      rating: 4.9,
      reviewCount: 350,
    });
  });

  it("handles contractor with only name (minimal data)", async () => {
    const firecrawl = makeMockFirecrawl({
      json: {
        contractors: [{ name: "Joe's Handyman Service" }],
      },
    });

    const result = await extractContractorsFromPage(firecrawl, "https://www.angi.com/search/handyman-10001.htm");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Joe's Handyman Service");
    expect(result[0].phone).toBeUndefined();
    expect(result[0].rating).toBeUndefined();
  });

  it("handles rating as decimal (4.7)", async () => {
    const firecrawl = makeMockFirecrawl({
      json: {
        contractors: [{ name: "Star Electricians", rating: 4.7 }],
      },
    });

    const result = await extractContractorsFromPage(firecrawl, "https://www.angi.com/search/electrical-77001.htm");

    expect(result[0].rating).toBe(4.7);
  });

  it("maps specialties array correctly", async () => {
    const firecrawl = makeMockFirecrawl({
      json: {
        contractors: [
          {
            name: "Full Service HVAC",
            specialties: ["AC installation", "Furnace repair", "Duct cleaning"],
          },
        ],
      },
    });

    const result = await extractContractorsFromPage(firecrawl, "https://www.angi.com/search/hvac-60601.htm");

    expect(result[0].specialties).toEqual(["AC installation", "Furnace repair", "Duct cleaning"]);
  });

  it("passes CONTRACTOR_SCHEMA in the formats option", async () => {
    const mockScrape = jest.fn().mockResolvedValue({ json: { contractors: [] } });
    const firecrawl = { scrape: mockScrape } as unknown as import("@mendable/firecrawl-js").default;

    await extractContractorsFromPage(firecrawl, "https://www.angi.com/search/roofing-90210.htm");

    const [, options] = mockScrape.mock.calls[0] as [string, { formats: unknown[] }];
    expect(options.formats).toContainEqual(
      expect.objectContaining({ type: "json" })
    );
  });
});

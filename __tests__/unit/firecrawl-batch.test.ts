/**
 * Unit tests for batchScrape() in lib/integrations/firecrawl.ts
 * Verifies it uses native firecrawl.batchScrape() instead of Promise.all
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
}));

// ─── Firecrawl mock ───────────────────────────────────────────────────────────

const mockBatchScrape = jest.fn();
const mockScrape = jest.fn();

jest.mock("@mendable/firecrawl-js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    batchScrape: mockBatchScrape,
    scrape: mockScrape,
  })),
}));

import { batchScrape } from "@/lib/integrations/firecrawl";

beforeEach(() => {
  jest.clearAllMocks();
  process.env.FIRECRAWL_API_KEY = "test-key";
});

describe("batchScrape()", () => {
  it("calls native firecrawl.batchScrape (not Promise.all of scrape)", async () => {
    mockBatchScrape.mockResolvedValue({ data: [] });

    await batchScrape(["https://example.com/a", "https://example.com/b"]);

    expect(mockBatchScrape).toHaveBeenCalledTimes(1);
    expect(mockScrape).not.toHaveBeenCalled();
  });

  it("passes formats and pollInterval options", async () => {
    mockBatchScrape.mockResolvedValue({ data: [] });

    await batchScrape(["https://example.com"], { formats: ["markdown"] });

    expect(mockBatchScrape).toHaveBeenCalledWith(
      ["https://example.com"],
      expect.objectContaining({
        formats: ["markdown"],
        pollInterval: 2,
      })
    );
  });

  it("defaults formats to markdown when not specified", async () => {
    mockBatchScrape.mockResolvedValue({ data: [] });

    await batchScrape(["https://example.com"]);

    expect(mockBatchScrape).toHaveBeenCalledWith(
      ["https://example.com"],
      expect.objectContaining({ formats: ["markdown"] })
    );
  });

  it("returns results array matching input URLs", async () => {
    const fakeResults = {
      data: [
        { url: "https://example.com/a", markdown: "Page A content" },
        { url: "https://example.com/b", markdown: "Page B content" },
      ],
    };
    mockBatchScrape.mockResolvedValue(fakeResults);

    const result = await batchScrape([
      "https://example.com/a",
      "https://example.com/b",
    ]);

    expect(result).toEqual(fakeResults);
  });

  it("handles partial failures (3 of 5 URLs fail)", async () => {
    const partialResult = {
      data: [
        { url: "https://example.com/1", markdown: "ok" },
        { url: "https://example.com/2", error: "Failed to scrape" },
        { url: "https://example.com/3", markdown: "ok" },
        { url: "https://example.com/4", error: "Timeout" },
        { url: "https://example.com/5", markdown: "ok" },
      ],
    };
    mockBatchScrape.mockResolvedValue(partialResult);

    const result = await batchScrape([
      "https://example.com/1",
      "https://example.com/2",
      "https://example.com/3",
      "https://example.com/4",
      "https://example.com/5",
    ]);

    // Native batchScrape handles partial failures internally — we just get the result
    expect(result).toEqual(partialResult);
    expect(mockBatchScrape).toHaveBeenCalledTimes(1);
  });

  it("returns empty results when all URLs fail", async () => {
    mockBatchScrape.mockResolvedValue({ data: [] });

    const result = await batchScrape(["https://bad1.com", "https://bad2.com"]);

    expect(result).toEqual({ data: [] });
  });

  it("throws and captures to Sentry when batchScrape rejects", async () => {
    const error = new Error("API error");
    mockBatchScrape.mockRejectedValue(error);

    await expect(
      batchScrape(["https://example.com"])
    ).rejects.toThrow("API error");

    const { captureException } = jest.requireMock("@sentry/nextjs");
    expect(captureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        extra: expect.objectContaining({ tool: "batchScrape" }),
      })
    );
  });
});

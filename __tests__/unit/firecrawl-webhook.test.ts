export {};
/**
 * Unit tests for app/api/webhooks/firecrawl/route.ts
 */

// ─── next/server mock ─────────────────────────────────────────────────────────

jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
}));

// ─── cost-scraper mock ────────────────────────────────────────────────────────

const mockScrapeCostGuide = jest.fn();

jest.mock("@/lib/integrations/cost-scraper", () => ({
  scrapeCostGuide: (...args: [unknown, ...unknown[]]) => mockScrapeCostGuide(...args),
}));

// ─── DB mock ──────────────────────────────────────────────────────────────────

const mockDbInsert = jest.fn();

jest.mock("@/app/db/client", () => ({
  db: {
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        onConflictDoUpdate: jest.fn(() => ({
          returning: jest.fn().mockResolvedValue([{}]),
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
  eq: jest.fn(),
  and: jest.fn(),
}));

function makeRequest(body: unknown) {
  return new Request("https://opportuniq.app/api/webhooks/firecrawl", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// We need to re-import the handler fresh for each test to reset the
// processedJobIds Set (module-level state). Use jest.isolateModules.
async function getHandler() {
  let handler!: { POST: (req: Request) => Promise<Response> };
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    handler = require("@/app/api/webhooks/firecrawl/route");
  });
  // Wait for async module evaluation
  await Promise.resolve();
  return handler.POST;
}

describe("Firecrawl webhook handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScrapeCostGuide.mockResolvedValue({
      proMinCents: 20000,
      proMaxCents: 80000,
      proAvgCents: 50000,
    });
  });

  it("returns 200 on valid batch_scrape.completed payload", async () => {
    const POST = await getHandler();
    const req = makeRequest({
      type: "batch_scrape.completed",
      jobId: "job-001",
      data: [
        {
          url: "https://www.homeadvisor.com/cost/ceilings/repair-a-ceiling/",
          markdown: "Average cost $200 - $500",
        },
      ],
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
  });

  it("processes batch scrape completion and updates cost data cache", async () => {
    const POST = await getHandler();
    const req = makeRequest({
      type: "batch_scrape.completed",
      jobId: "job-002",
      data: [
        {
          url: "https://www.homeadvisor.com/cost/plumbing/repair-a-pipe/",
          markdown: "Cost $150 - $350",
        },
      ],
    });

    await POST(req);

    expect(mockScrapeCostGuide).toHaveBeenCalledWith(
      "homeadvisor",
      "plumbing/repair-a-pipe"
    );
  });

  it("returns 400 on malformed payload (missing jobId)", async () => {
    const POST = await getHandler();
    const req = makeRequest({ type: "batch_scrape.completed" }); // no jobId

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid JSON", async () => {
    const POST = await getHandler();
    const req = new Request("https://opportuniq.app/api/webhooks/firecrawl", {
      method: "POST",
      body: "not json {{{",
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("deduplicates — ignores already-processed job IDs", async () => {
    const POST = await getHandler();
    const payload = {
      type: "batch_scrape.completed",
      jobId: "job-dedup-001",
      data: [
        {
          url: "https://www.homeadvisor.com/cost/ceilings/repair-a-ceiling/",
          markdown: "Cost data",
        },
      ],
    };

    // First call — should process
    await POST(makeRequest(payload));
    // Second call — same jobId, should skip
    const res2 = await POST(makeRequest(payload));
    const json2 = await res2.json();

    expect(json2.skipped).toBe("already processed");
    // scrapeCostGuide only called once (first request)
    expect(mockScrapeCostGuide).toHaveBeenCalledTimes(1);
  });

  it("skips non-cost-guide URLs silently", async () => {
    const POST = await getHandler();
    const req = makeRequest({
      type: "batch_scrape.completed",
      jobId: "job-003",
      data: [
        { url: "https://www.google.com/search?q=ceiling+repair", markdown: "..." },
        { url: "https://www.reddit.com/r/DIY/", markdown: "..." },
      ],
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.skipped).toBe(2);
    expect(mockScrapeCostGuide).not.toHaveBeenCalled();
  });
});

/**
 * Sentry Integration Tests
 *
 * Verifies that Sentry.captureException is called on failures
 * in firecrawl, cost-scraper, contractor-search, and chat tools.
 */

const mockCaptureException = jest.fn();
const mockCaptureMessage = jest.fn();
const mockSetContext = jest.fn();
const mockSetTag = jest.fn();
const mockWithServerActionInstrumentation = jest.fn((name, opts, fn) => fn());

jest.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  captureMessage: (...args: unknown[]) => mockCaptureMessage(...args),
  setContext: (...args: unknown[]) => mockSetContext(...args),
  setTag: (...args: unknown[]) => mockSetTag(...args),
  withServerActionInstrumentation: (...args: unknown[]) =>
    mockWithServerActionInstrumentation(...args),
}));

// ─── Firecrawl ───────────────────────────────────────────────────────────────

const mockFirecrawlScrape = jest.fn();
const mockFirecrawlCrawl = jest.fn();

jest.mock("@mendable/firecrawl-js", () => {
  const MockFirecrawl = jest.fn().mockImplementation(() => ({
    scrape: mockFirecrawlScrape,
    crawl: mockFirecrawlCrawl,
  }));
  return { __esModule: true, default: MockFirecrawl };
});

// ─── Cost Scraper ─────────────────────────────────────────────────────────────

jest.mock("@/app/db/client", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        onConflictDoUpdate: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([{ id: "1" }])),
        })),
        returning: jest.fn(() => Promise.resolve([{ id: "1" }])),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

jest.mock("@/app/db/schema", () => ({
  costData: { serviceType: "serviceType", region: "region", source: "source" },
  issues: {},
  issueHypotheses: {},
  issueActivityLog: {},
  groups: {},
  groupMembers: { userId: "userId", status: "status" },
  groupConstraints: {},
  diyGuides: {},
  gmailTokens: {},
  aiConversations: { id: "id", userId: "userId" },
  aiMessages: { conversationId: "conversationId", createdAt: "createdAt" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
  gt: jest.fn(),
}));

// ─── Supabase ─────────────────────────────────────────────────────────────────

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: {
        getUser: jest.fn(() =>
          Promise.resolve({
            data: { user: { id: "user-1", user_metadata: {} } },
          })
        ),
      },
    })
  ),
}));

// ─── Gmail ─────────────────────────────────────────────────────────────────────

jest.mock("@/lib/gmail", () => ({
  sendGmailMessage: jest.fn(),
  refreshAccessToken: jest.fn(),
}));

// ─── Yelp / Foursquare ────────────────────────────────────────────────────────

const mockFindContractorsOnYelp = jest.fn();
jest.mock("@/lib/integrations/yelp", () => ({
  findContractorsForIssue: (...args: unknown[]) => mockFindContractorsOnYelp(...args),
}));

jest.mock("@/lib/integrations/foursquare", () => ({
  findContractorsOnFoursquare: jest.fn().mockResolvedValue([]),
}));

// ─── Cost scraper ─────────────────────────────────────────────────────────────
// Partially mock: getCostEstimate is interceptable; scrapeCostGuide uses the
// real implementation (which in turn calls firecrawl that is mocked via
// the FirecrawlApp constructor mock above).

const mockGetCostEstimate = jest.fn();
jest.mock("@/lib/integrations/cost-scraper", () => {
  const actual = jest.requireActual("@/lib/integrations/cost-scraper");
  return {
    ...actual,
    getCostEstimate: (...args: unknown[]) => mockGetCostEstimate(...args),
  };
});

// ─── Next.js server ───────────────────────────────────────────────────────────

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
      headers: { get: jest.fn(), set: jest.fn() },
    })),
  },
}));

// ─── AI SDK ───────────────────────────────────────────────────────────────────

jest.mock("@ai-sdk/openai", () => ({ openai: jest.fn(() => "mocked-model") }));
jest.mock("ai", () => ({
  streamText: jest.fn(() => ({
    toUIMessageStreamResponse: jest.fn(() => {
      const r = new Response("ok");
      r.headers.set("X-Conversation-Id", "conv-1");
      return r;
    }),
  })),
  generateText: jest.fn(() => Promise.resolve({ text: "title" })),
  tool: jest.fn((c) => c),
  stepCountIs: jest.fn(() => () => false),
}));
jest.mock("openai", () => {
  const MockOpenAI = jest.fn(() => ({
    chat: { completions: { create: jest.fn(() => Promise.resolve({ choices: [{ message: { content: "" } }] })) } },
  }));
  return { default: MockOpenAI, __esModule: true };
});

// ─── Schemas / Prompts ───────────────────────────────────────────────────────

jest.mock("@/lib/schemas/diagnosis", () => ({
  diagnosisRequestSchema: {
    safeParse: jest.fn((data) => ({ success: true, data })),
  },
}));
jest.mock("@/lib/prompts/diagnosis", () => ({
  buildDiagnosisPrompt: jest.fn(() => "system-prompt"),
  buildFollowUpPrompt: jest.fn(() => "followup-prompt"),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Provide a dummy FIRECRAWL_API_KEY so getFirecrawlClient() doesn't throw
  process.env.FIRECRAWL_API_KEY = "test-key";
  process.env.RESEND_API_KEY = "test-key";
});

// =============================================================================
// firecrawl.ts
// =============================================================================

describe("lib/integrations/firecrawl", () => {
  describe("scrapePage", () => {
    it("calls Sentry.captureException when scrape throws", async () => {
      const err = new Error("scrape failed");
      mockFirecrawlScrape.mockRejectedValueOnce(err);

      const { scrapePage } = await import("@/lib/integrations/firecrawl");

      await expect(scrapePage("https://example.com")).rejects.toThrow("scrape failed");

      expect(mockCaptureException).toHaveBeenCalledWith(
        err,
        expect.objectContaining({ extra: expect.objectContaining({ tool: "scrapePage" }) })
      );
    });

    it("sets Sentry context before scraping", async () => {
      mockFirecrawlScrape.mockResolvedValueOnce({ markdown: "content" });

      const { scrapePage } = await import("@/lib/integrations/firecrawl");
      await scrapePage("https://example.com");

      expect(mockSetContext).toHaveBeenCalledWith(
        "firecrawl",
        expect.objectContaining({ feature: "scrapePage", url: "https://example.com" })
      );
    });
  });

  describe("crawlWebsite", () => {
    it("calls Sentry.captureException when crawl throws", async () => {
      const err = new Error("crawl failed");
      mockFirecrawlCrawl.mockRejectedValueOnce(err);

      const { crawlWebsite } = await import("@/lib/integrations/firecrawl");
      await expect(crawlWebsite("https://example.com")).rejects.toThrow("crawl failed");

      expect(mockCaptureException).toHaveBeenCalledWith(
        err,
        expect.objectContaining({ extra: expect.objectContaining({ tool: "crawlWebsite" }) })
      );
    });
  });

  describe("batchScrape", () => {
    it("calls Sentry.captureException when batch scrape throws", async () => {
      const err = new Error("batch failed");
      mockFirecrawlScrape.mockRejectedValueOnce(err);

      const { batchScrape } = await import("@/lib/integrations/firecrawl");
      await expect(batchScrape(["https://a.com", "https://b.com"])).rejects.toThrow("batch failed");

      expect(mockCaptureException).toHaveBeenCalledWith(
        err,
        expect.objectContaining({ extra: expect.objectContaining({ tool: "batchScrape" }) })
      );
    });
  });
});

// =============================================================================
// cost-scraper.ts
// =============================================================================

describe("lib/integrations/cost-scraper", () => {
  describe("scrapeCostGuide", () => {
    it("calls Sentry.captureException when scrape throws", async () => {
      // scrapePage calls firecrawl.scrape internally; make it fail
      mockFirecrawlScrape.mockRejectedValueOnce(new Error("network error"));

      const { scrapeCostGuide } = await import("@/lib/integrations/cost-scraper");
      const result = await scrapeCostGuide("homeadvisor", "ceilings/repair-a-ceiling");

      expect(result).toBeNull();
      expect(mockCaptureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ extra: expect.objectContaining({ tool: "scrapeCostGuide" }) })
      );
    });
  });
});

// =============================================================================
// contractor-search.ts
// =============================================================================

describe("lib/integrations/contractor-search", () => {
  it("calls Sentry.captureException when Yelp throws", async () => {
    process.env.YELP_API_KEY = "test-yelp-key";
    delete process.env.FOURSQUARE_API_KEY;
    delete process.env.FIRECRAWL_API_KEY;

    mockFindContractorsOnYelp.mockRejectedValueOnce(new Error("yelp error"));

    const { searchContractors } = await import("@/lib/integrations/contractor-search");
    const result = await searchContractors("plumber", "90210");

    expect(result.contractors).toHaveLength(0);
    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ extra: expect.objectContaining({ tool: "searchContractors" }) })
    );

    delete process.env.YELP_API_KEY;
    process.env.FIRECRAWL_API_KEY = "test-key";
  });
});

// =============================================================================
// chat tools
// =============================================================================

describe("app/api/chat/tools/cost-lookup", () => {
  it("calls Sentry.captureException when getCostEstimate throws", async () => {
    mockGetCostEstimate.mockRejectedValueOnce(new Error("db error"));

    const { createCostLookupTool } = await import("@/app/api/chat/tools/cost-lookup");
    const tool = createCostLookupTool({ firecrawl: null });
    const result = await tool.execute({ serviceType: "ceiling_repair", zipCode: "90210" }, {} as never);

    expect((result as { success: boolean }).success).toBe(false);
    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ extra: expect.objectContaining({ tool: "getCostEstimate" }) })
    );
  });
});

describe("app/api/chat/tools/recall-check", () => {
  it("calls Sentry.captureMessage when firecrawl is unavailable", async () => {
    const { createRecallCheckTool } = await import("@/app/api/chat/tools/recall-check");
    const tool = createRecallCheckTool({ firecrawl: null });
    const result = await tool.execute({ itemType: "product", searchTerm: "faulty toaster" }, {} as never);

    expect((result as { error: string }).error).toMatch(/not available/i);
    expect(mockCaptureMessage).toHaveBeenCalledWith(
      "Tool returned error",
      expect.objectContaining({
        level: "warning",
        extra: expect.objectContaining({ tool: "checkRecalls" }),
      })
    );
  });

  it("calls Sentry.captureException when scrape throws", async () => {
    const scrapeTimeout = jest.fn().mockRejectedValueOnce(new Error("timeout"));
    jest.doMock("@/app/api/chat/tools/types", () => ({
      scrapeWithTimeout: scrapeTimeout,
    }));

    const { createRecallCheckTool } = await import("@/app/api/chat/tools/recall-check");

    const mockFirecrawl = { scrape: jest.fn() } as never;
    const tool = createRecallCheckTool({ firecrawl: mockFirecrawl });
    const result = await tool.execute({ itemType: "vehicle", searchTerm: "Ford F-150 2020" }, {} as never);

    expect((result as { error: string }).error).toBeTruthy();
  });
});

describe("app/api/chat/tools/utility-rebates", () => {
  it("calls Sentry.captureMessage when firecrawl is unavailable", async () => {
    const { createUtilityRebatesTool } = await import("@/app/api/chat/tools/utility-rebates");
    const tool = createUtilityRebatesTool({ firecrawl: null });
    const result = await tool.execute({ upgradeType: "heat pump water heater", zipCode: "90210" }, {} as never);

    expect((result as { error: string }).error).toMatch(/not available/i);
    expect(mockCaptureMessage).toHaveBeenCalledWith(
      "Tool returned error",
      expect.objectContaining({
        level: "warning",
        extra: expect.objectContaining({ tool: "findUtilityRebates" }),
      })
    );
  });
});

describe("app/api/chat/tools/product-search", () => {
  it("calls Sentry.captureMessage when firecrawl is unavailable", async () => {
    const { createProductSearchTool } = await import("@/app/api/chat/tools/product-search");
    const tool = createProductSearchTool({ firecrawl: null });
    const result = await tool.execute({ query: "copper pipe", category: "materials" }, {} as never);

    expect((result as { error: string }).error).toMatch(/not available/i);
    expect(mockCaptureMessage).toHaveBeenCalledWith(
      "Tool returned error",
      expect.objectContaining({
        level: "warning",
        extra: expect.objectContaining({ tool: "searchProducts" }),
      })
    );
  });
});

// =============================================================================
// app/api/gmail/send/route.ts
// =============================================================================

describe("app/api/gmail/send/route", () => {
  it("calls Sentry.captureException on token refresh failure", async () => {
    const { db } = await import("@/app/db/client");
    const { refreshAccessToken } = await import("@/lib/gmail");

    // Return an expired token record — gmail route does .select().from().where().limit()
    const expiredToken = {
      userId: "user-1",
      accessToken: "old-token",
      refreshToken: "refresh-token",
      expiresAt: new Date(Date.now() - 10000), // expired
      isActive: true,
      gmailAddress: "test@gmail.com",
    };
    (db.select as jest.Mock).mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([expiredToken]),
        }),
      }),
    });

    (refreshAccessToken as jest.Mock).mockRejectedValueOnce(new Error("refresh failed"));

    const { POST } = await import("@/app/api/gmail/send/route");
    const req = new Request("http://localhost/api/gmail/send", {
      method: "POST",
      body: JSON.stringify({ to: "test@example.com", subject: "Test", body: "Hello" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        extra: expect.objectContaining({ context: "gmail_token_refresh" }),
      })
    );
  });
});

// =============================================================================
// app/api/chat/route.ts
// =============================================================================

describe("app/api/chat/route", () => {
  it("calls Sentry.withServerActionInstrumentation for every POST", async () => {
    const { POST } = await import("@/app/api/chat/route");
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        type: "structured",
        diagnosis: {
          issue: { description: "Leaky faucet", category: "plumbing" },
          property: { postalCode: "90210", type: "house" },
          preferences: { diySkillLevel: "beginner", hasBasicTools: false, urgency: "flexible" },
        },
      }),
    });

    await POST(req);

    expect(mockWithServerActionInstrumentation).toHaveBeenCalledWith(
      "POST /api/chat",
      expect.objectContaining({ recordResponse: true }),
      expect.any(Function)
    );
  });

  it("sets conversation_type tag", async () => {
    const { POST } = await import("@/app/api/chat/route");
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        type: "structured",
        diagnosis: {
          issue: { description: "Leaky faucet", category: "plumbing" },
          property: { postalCode: "90210", type: "house" },
          preferences: { diySkillLevel: "beginner", hasBasicTools: false, urgency: "flexible" },
        },
      }),
    });

    await POST(req);

    expect(mockSetTag).toHaveBeenCalledWith("conversation_type", "structured");
  });

  it("calls Sentry.captureException on top-level errors", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as jest.Mock).mockRejectedValueOnce(new Error("db crash"));

    const { POST } = await import("@/app/api/chat/route");
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ type: "structured" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
    expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error));
  });
});

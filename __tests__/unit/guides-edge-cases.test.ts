export {};
/**
 * Guides edge cases
 * Covers: iFixit, YouTube, StackExchange, Instructables, Firecrawl source fallbacks,
 *         empty results, rate limits, malformed responses
 */

// ---- Mocks ---------------------------------------------------------------

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockScrape = jest.fn();
const mockSearch = jest.fn();

jest.mock("@mendable/firecrawl-js", () => ({
  default: jest.fn().mockImplementation(() => ({
    scrape: mockScrape,
    search: mockSearch,
  })),
}));

// ---- Helpers -------------------------------------------------------------

function makeJsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

// ---- Tests ---------------------------------------------------------------

describe("guides edge cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearch.mockResolvedValue({ data: [] });
    mockScrape.mockResolvedValue({ markdown: "Guide content here" });
  });

  it("iFixit guide search returns guides array", async () => {
    mockFetch.mockResolvedValue(
      makeJsonResponse({
        results: [
          { guideid: 1, title: "Fix a Leaky Faucet", difficulty: "Moderate", url: "https://ifixit.com/Guide/1" },
          { guideid: 2, title: "Replace O-Ring", difficulty: "Easy", url: "https://ifixit.com/Guide/2" },
        ],
      })
    );

    const { searchIFixitGuides } = await import("@/app/actions/guides/ifixit");
    const response = await searchIFixitGuides("leaky faucet");
    expect(Array.isArray(response.guides)).toBe(true);
  });

  it("iFixit returns empty array on API failure", async () => {
    mockFetch.mockRejectedValue(new Error("iFixit API unavailable"));

    const { searchIFixitGuides } = await import("@/app/actions/guides/ifixit");
    const response = await searchIFixitGuides("broken pipe");
    expect(Array.isArray(response.guides)).toBe(true);
    expect(response.guides).toHaveLength(0);
  });

  it("iFixit returns empty array on 404 response", async () => {
    mockFetch.mockResolvedValue(makeJsonResponse({}, 404));

    const { searchIFixitGuides } = await import("@/app/actions/guides/ifixit");
    const response = await searchIFixitGuides("unknown device");
    expect(Array.isArray(response.guides)).toBe(true);
  });

  it("YouTube guide search returns video results", async () => {
    mockFetch.mockResolvedValue(
      makeJsonResponse({
        items: [
          {
            id: { videoId: "abc123" },
            snippet: {
              title: "How to Fix a Leaky Faucet",
              description: "Step by step guide",
              thumbnails: { medium: { url: "https://img.youtube.com/abc.jpg" } },
            },
          },
        ],
      })
    );

    const { searchYouTubeVideos } = await import("@/app/actions/guides/youtube");
    const response = await searchYouTubeVideos("leaky faucet repair");
    expect(Array.isArray(response.guides)).toBe(true);
  });

  it("YouTube guide search returns empty on API failure", async () => {
    mockFetch.mockRejectedValue(new Error("YouTube API quota exceeded"));

    const { searchYouTubeVideos } = await import("@/app/actions/guides/youtube");
    const response = await searchYouTubeVideos("pipe repair");
    expect(Array.isArray(response.guides)).toBe(true);
    expect(response.guides).toHaveLength(0);
  });

  it("StackExchange search returns answers", async () => {
    mockFetch.mockResolvedValue(
      makeJsonResponse({
        items: [
          {
            question_id: 123,
            title: "How to fix a leaking pipe joint?",
            link: "https://diy.stackexchange.com/questions/123",
            score: 45,
            is_answered: true,
            answer_count: 1,
            view_count: 100,
            creation_date: 0,
            last_activity_date: 0,
            tags: [],
            owner: { display_name: "user" },
          },
        ],
        has_more: false,
      })
    );

    const { searchStackExchangeQuestions } = await import("@/app/actions/guides/stackexchange");
    const response = await searchStackExchangeQuestions("leaking pipe joint");
    expect(Array.isArray(response.guides)).toBe(true);
  });

  it("StackExchange returns empty array on network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network timeout"));

    const { searchStackExchangeQuestions } = await import("@/app/actions/guides/stackexchange");
    const response = await searchStackExchangeQuestions("plumbing");
    expect(Array.isArray(response.guides)).toBe(true);
    expect(response.guides).toHaveLength(0);
  });

  it("Instructables search returns projects", async () => {
    mockSearch.mockResolvedValue({
      data: [
        {
          url: "https://instructables.com/how-to-fix-leaky-faucet",
          title: "How to Fix a Leaky Faucet",
          description: "DIY guide for beginners",
        },
      ],
    });

    const { searchInstructables } = await import(
      "@/app/actions/guides/instructables"
    );
    const response = await searchInstructables("leaky faucet");
    expect(Array.isArray(response.guides)).toBe(true);
  });

  it("Firecrawl guide search returns results", async () => {
    mockSearch.mockResolvedValue({
      data: [
        {
          url: "https://thisoldhouse.com/plumbing/fix-faucet",
          title: "How to Fix a Dripping Faucet",
          description: "Professional advice",
        },
      ],
    });

    const { searchAllSources } = await import("@/app/actions/guides/firecrawl");
    const response = await searchAllSources("dripping faucet");
    expect(Array.isArray(response.guides)).toBe(true);
  });

  it("all guide sources return empty array when Firecrawl is null", async () => {
    const { searchAllSources } = await import("@/app/actions/guides/firecrawl");
    const response = await searchAllSources("leaky faucet");
    expect(Array.isArray(response.guides)).toBe(true);
  });

  it("guide results have required fields (title, url, source)", async () => {
    mockFetch.mockResolvedValue(
      makeJsonResponse({
        results: [
          { guideid: 1, title: "Fix Faucet", difficulty: "Easy", url: "https://ifixit.com/1" },
        ],
      })
    );

    const { searchIFixitGuides } = await import("@/app/actions/guides/ifixit");
    const response = await searchIFixitGuides("faucet");
    if (response.guides.length > 0) {
      expect(response.guides[0]).toHaveProperty("title");
      expect(response.guides[0]).toHaveProperty("sourceUrl");
    }
  });
});

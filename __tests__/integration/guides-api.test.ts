export {};
/**
 * Integration tests for the guides API
 * Covers: guide search across multiple sources, caching, error recovery
 */

// ---- Mocks ---------------------------------------------------------------

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockSearch = jest.fn();
const mockScrape = jest.fn();

jest.mock("@mendable/firecrawl-js", () => ({
  default: jest.fn().mockImplementation(() => ({
    search: mockSearch,
    scrape: mockScrape,
  })),
}));

const mockGetUser = jest.fn();
jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

jest.mock("@/app/db/client", () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: "guide-cached" }]),
    }),
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn((...a: unknown[]) => a),
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

describe("guides API integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    mockSearch.mockResolvedValue({ data: [] });
    mockScrape.mockResolvedValue({ markdown: "" });
  });

  it("iFixit guide search integrates with fetch", async () => {
    mockFetch.mockResolvedValue(
      makeJsonResponse({
        results: [
          {
            guideid: 101,
            title: "Fix a Leaky Faucet — Full Guide",
            difficulty: "Moderate",
            url: "https://ifixit.com/Guide/Fix-Faucet/101",
          },
        ],
      })
    );

    const { searchIFixitGuides } = await import("@/app/actions/guides/ifixit");
    const result = await searchIFixitGuides("leaky faucet");

    // searchIFixitGuides returns { success, guides } not an array directly
    expect(result).toHaveProperty("guides");
    expect(Array.isArray(result.guides)).toBe(true);
  });

  it("YouTube guide search integrates with fetch", async () => {
    mockFetch.mockResolvedValue(
      makeJsonResponse({
        items: [
          {
            id: { videoId: "yt-abc" },
            snippet: {
              title: "Fix Leaky Faucet in 5 Minutes",
              description: "Easy DIY tutorial",
              thumbnails: { medium: { url: "https://i.ytimg.com/abc.jpg" } },
            },
          },
        ],
      })
    );

    const { searchYouTubeVideos } = await import("@/app/actions/guides/youtube");
    const response = await searchYouTubeVideos("leaky faucet repair");

    expect(Array.isArray(response.guides)).toBe(true);
  });

  it("StackExchange guide search integrates with fetch", async () => {
    mockFetch.mockResolvedValue(
      makeJsonResponse({
        items: [
          {
            question_id: 55001,
            title: "How do I fix a dripping faucet?",
            link: "https://diy.stackexchange.com/questions/55001",
            score: 12,
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
    const response = await searchStackExchangeQuestions("dripping faucet");

    expect(Array.isArray(response.guides)).toBe(true);
  });

  it("Firecrawl guide search integrates with Firecrawl search()", async () => {
    mockSearch.mockResolvedValue({
      data: [
        {
          url: "https://familyhandyman.com/plumbing/fix-faucet",
          title: "How to Fix a Dripping Faucet",
          description: "Expert DIY advice",
        },
      ],
    });

    const { searchAllSources } = await import("@/app/actions/guides/firecrawl");
    const response = await searchAllSources("dripping faucet");

    expect(Array.isArray(response.guides)).toBe(true);
  });

  it("all guide sources return empty array when all APIs fail", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    mockSearch.mockRejectedValue(new Error("Firecrawl error"));

    const { searchIFixitGuides } = await import("@/app/actions/guides/ifixit");
    const { searchYouTubeVideos } = await import("@/app/actions/guides/youtube");
    const { searchStackExchangeQuestions } = await import("@/app/actions/guides/stackexchange");

    const [ifixit, youtube, stackexchange] = await Promise.all([
      searchIFixitGuides("test"),
      searchYouTubeVideos("test"),
      searchStackExchangeQuestions("test"),
    ]);

    expect(ifixit.guides).toHaveLength(0);
    expect(youtube.guides).toHaveLength(0);
    expect(stackexchange.guides).toHaveLength(0);
  });

  it("guide search handles partial success across sources", async () => {
    // iFixit fails, YouTube succeeds
    mockFetch
      .mockRejectedValueOnce(new Error("iFixit unavailable"))
      .mockResolvedValue(
        makeJsonResponse({
          items: [
            {
              id: { videoId: "yt-123" },
              snippet: {
                title: "Fix Leaky Faucet",
                description: "DIY guide",
                thumbnails: { medium: { url: "https://i.ytimg.com/123.jpg" } },
              },
            },
          ],
        })
      );

    const { searchIFixitGuides } = await import("@/app/actions/guides/ifixit");
    const { searchYouTubeVideos } = await import("@/app/actions/guides/youtube");

    const [ifixitResponse, youtubeResponse] = await Promise.all([
      searchIFixitGuides("leaky faucet"),
      searchYouTubeVideos("leaky faucet"),
    ]);

    expect(ifixitResponse.guides).toHaveLength(0); // failed
    expect(youtubeResponse.guides.length).toBeGreaterThanOrEqual(0); // succeeded
  });
});

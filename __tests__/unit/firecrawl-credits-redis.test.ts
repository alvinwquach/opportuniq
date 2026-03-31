const mockIncrby = jest.fn();
const mockTtl = jest.fn();
const mockExpire = jest.fn();
const mockGet = jest.fn();

jest.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: jest.fn(() => ({
      incrby: mockIncrby,
      ttl: mockTtl,
      expire: mockExpire,
      get: mockGet,
    })),
  },
}));

jest.mock("@upstash/ratelimit", () => {
  const MockRatelimit = jest.fn().mockImplementation(() => ({
    limit: jest.fn(),
  }));
  MockRatelimit.slidingWindow = jest.fn().mockReturnValue({});
  return { Ratelimit: MockRatelimit };
});

let trackFirecrawlCredits: (
  userId: string,
  creditsUsed: number
) => Promise<{ used: number; remaining: number; exceeded: boolean }>;
let getFirecrawlCreditsUsed: (userId: string) => Promise<number>;

beforeAll(async () => {
  const mod = await import("@/lib/firecrawl-limiter");
  trackFirecrawlCredits = mod.trackFirecrawlCredits;
  getFirecrawlCreditsUsed = mod.getFirecrawlCreditsUsed;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("trackFirecrawlCredits", () => {
  it("increments credit count via redis.incrby", async () => {
    mockIncrby.mockResolvedValueOnce(5);
    mockTtl.mockResolvedValueOnce(3600);
    await trackFirecrawlCredits("user-1", 5);
    expect(mockIncrby).toHaveBeenCalledWith("opportuniq:credits:user-1", 5);
  });

  it("sets 24h TTL on first increment for a user", async () => {
    mockIncrby.mockResolvedValueOnce(1);
    mockTtl.mockResolvedValueOnce(-1); // no TTL set yet
    await trackFirecrawlCredits("new-user", 1);
    expect(mockExpire).toHaveBeenCalledWith("opportuniq:credits:new-user", 86400);
  });

  it("does not reset TTL on subsequent increments", async () => {
    mockIncrby.mockResolvedValueOnce(10);
    mockTtl.mockResolvedValueOnce(50000); // TTL already set
    await trackFirecrawlCredits("existing-user", 1);
    expect(mockExpire).not.toHaveBeenCalled();
  });

  it("returns exceeded: true when over 500 daily limit", async () => {
    mockIncrby.mockResolvedValueOnce(501);
    mockTtl.mockResolvedValueOnce(3600);
    const result = await trackFirecrawlCredits("heavy-user", 1);
    expect(result.exceeded).toBe(true);
  });

  it("returns exceeded: false when under limit", async () => {
    mockIncrby.mockResolvedValueOnce(100);
    mockTtl.mockResolvedValueOnce(3600);
    const result = await trackFirecrawlCredits("light-user", 1);
    expect(result.exceeded).toBe(false);
  });

  it("returns correct remaining count", async () => {
    mockIncrby.mockResolvedValueOnce(200);
    mockTtl.mockResolvedValueOnce(3600);
    const result = await trackFirecrawlCredits("user-x", 10);
    expect(result.remaining).toBe(300);
  });
});

describe("getFirecrawlCreditsUsed", () => {
  it("returns 0 when key does not exist", async () => {
    mockGet.mockResolvedValueOnce(null);
    const result = await getFirecrawlCreditsUsed("no-such-user");
    expect(result).toBe(0);
  });

  it("returns stored value when key exists", async () => {
    mockGet.mockResolvedValueOnce(42);
    const result = await getFirecrawlCreditsUsed("user-with-credits");
    expect(result).toBe(42);
  });
});

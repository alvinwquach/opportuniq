import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

jest.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: jest.fn(() => ({})),
  },
}));

const mockLimit = jest.fn();

jest.mock("@upstash/ratelimit", () => {
  const MockRatelimit = jest.fn().mockImplementation(() => ({
    limit: mockLimit,
  }));
  MockRatelimit.slidingWindow = jest.fn().mockReturnValue({});
  return { Ratelimit: MockRatelimit };
});

// Import after mocks are set up
let checkRateLimit: (userId: string) => Promise<{ allowed: boolean; remaining: number; resetAt: number }>;

beforeAll(async () => {
  const mod = await import("@/lib/rate-limiter");
  checkRateLimit = mod.checkRateLimit;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("checkRateLimit", () => {
  it("calls ratelimit.limit with the userId", async () => {
    mockLimit.mockResolvedValueOnce({ success: true, remaining: 19, reset: 1000 });
    await checkRateLimit("user-123");
    expect(mockLimit).toHaveBeenCalledWith("user-123");
  });

  it("returns allowed: true when under limit", async () => {
    mockLimit.mockResolvedValueOnce({ success: true, remaining: 15, reset: 2000 });
    const result = await checkRateLimit("user-abc");
    expect(result.allowed).toBe(true);
  });

  it("returns allowed: false when limit exceeded", async () => {
    mockLimit.mockResolvedValueOnce({ success: false, remaining: 0, reset: 9999 });
    const result = await checkRateLimit("user-blocked");
    expect(result.allowed).toBe(false);
  });

  it("returns remaining count", async () => {
    mockLimit.mockResolvedValueOnce({ success: true, remaining: 7, reset: 5000 });
    const result = await checkRateLimit("user-xyz");
    expect(result.remaining).toBe(7);
  });

  it("returns resetAt timestamp", async () => {
    mockLimit.mockResolvedValueOnce({ success: true, remaining: 10, reset: 12345 });
    const result = await checkRateLimit("user-xyz");
    expect(result.resetAt).toBe(12345);
  });

  it("is async (returns a Promise)", () => {
    mockLimit.mockResolvedValueOnce({ success: true, remaining: 20, reset: 0 });
    const ret = checkRateLimit("user-async");
    expect(ret).toBeInstanceOf(Promise);
  });
});

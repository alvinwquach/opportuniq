/**
 * Unit tests for lib/feature-flags.ts
 */

// ─── posthog-node mock ────────────────────────────────────────────────────────

const mockIsFeatureEnabled = jest.fn();
const mockGetFeatureFlagPayload = jest.fn();

jest.mock("posthog-node", () => ({
  PostHog: jest.fn().mockImplementation(() => ({
    isFeatureEnabled: (...args: unknown[]) => mockIsFeatureEnabled(...args),
    getFeatureFlagPayload: (...args: unknown[]) => mockGetFeatureFlagPayload(...args),
  })),
}));

import { getFeatureFlag, getFeatureFlagPayload } from "@/lib/feature-flags";

// Reset the singleton client between tests by re-importing fresh
// The module caches _serverClient, so we need to isolate tests that affect it.
// Since jest.resetModules() is expensive, we simply ensure the mock always reflects
// the current mockIsFeatureEnabled implementation.

beforeEach(() => {
  jest.clearAllMocks();
  // Ensure env var is set so getServerClient() doesn't throw
  process.env.POSTHOG_API_KEY = "test-key";
});

afterEach(() => {
  delete process.env.POSTHOG_API_KEY;
});

describe("feature flags", () => {
  it("getFeatureFlag returns false when flag does not exist", async () => {
    mockIsFeatureEnabled.mockResolvedValue(undefined); // flag not found → undefined

    const result = await getFeatureFlag("nonexistent-flag", "user-1");

    expect(result).toBe(false);
  });

  it("getFeatureFlag returns true when flag enabled for user", async () => {
    mockIsFeatureEnabled.mockResolvedValue(true);

    const result = await getFeatureFlag("firecrawl-search-v2", "user-123");

    expect(result).toBe(true);
    expect(mockIsFeatureEnabled).toHaveBeenCalledWith("firecrawl-search-v2", "user-123");
  });

  it("getFeatureFlag returns false when PostHog client throws", async () => {
    mockIsFeatureEnabled.mockRejectedValue(new Error("PostHog unreachable"));

    const result = await getFeatureFlag("some-flag", "user-1");

    expect(result).toBe(false);
  });

  it("getFeatureFlag returns false when userId is empty string", async () => {
    // Empty userId is passed through — PostHog would receive it.
    // Our code just calls isFeatureEnabled and handles undefined/throw.
    mockIsFeatureEnabled.mockResolvedValue(false);

    const result = await getFeatureFlag("some-flag", "");

    expect(result).toBe(false);
  });
});

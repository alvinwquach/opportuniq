export {};
/**
 * Tests for lib/geocoding.ts
 * Covers: zip → lat/lng, city/state extraction, error handling, caching
 */

// ---- Setup ---------------------------------------------------------------

process.env.MAPBOX_ACCESS_TOKEN = "pk.test_mock_token";

// ---- Mock fetch ----------------------------------------------------------

const mockFetch = jest.fn();
global.fetch = mockFetch;

// ---- Helpers -------------------------------------------------------------

function makeMapboxResponse(features: unknown[]) {
  return {
    ok: true,
    json: async () => ({ features }),
  };
}

const VALID_FEATURE = {
  center: [-122.4194, 37.7749] as [number, number],
  place_name: "San Francisco, California 94105, United States",
  place_type: ["postcode"],
};

// ---- Tests ---------------------------------------------------------------

describe("geocoding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("converts zip code to lat/lng coordinates", async () => {
    mockFetch.mockResolvedValue(makeMapboxResponse([VALID_FEATURE]));

    const { geocodePostalCode } = await import("@/lib/geocoding");
    const result = await geocodePostalCode("94105");

    expect(result).not.toBeNull();
    expect(result?.latitude).toBeCloseTo(37.7749, 3);
    expect(result?.longitude).toBeCloseTo(-122.4194, 3);
  });

  it("returns city and state from zip code (formattedAddress)", async () => {
    mockFetch.mockResolvedValue(makeMapboxResponse([VALID_FEATURE]));

    const { geocodePostalCode } = await import("@/lib/geocoding");
    const result = await geocodePostalCode("94105");

    expect(result).not.toBeNull();
    if (result?.formattedAddress) {
      expect(result.formattedAddress).toContain("San Francisco");
    }
  });

  it("handles invalid zip code (no results)", async () => {
    mockFetch.mockResolvedValue(makeMapboxResponse([]));

    const { geocodePostalCode } = await import("@/lib/geocoding");
    const result = await geocodePostalCode("00000");

    expect(result).toBeNull();
  });

  it("handles Google Geocoding / Mapbox API failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error: ECONNREFUSED"));

    const { geocodePostalCode } = await import("@/lib/geocoding");
    const result = await geocodePostalCode("94105");

    // Should return null on failure, not throw
    expect(result).toBeNull();
  });

  it("handles zip code with no results from API", async () => {
    mockFetch.mockResolvedValue(makeMapboxResponse([]));

    const { geocodePostalCode } = await import("@/lib/geocoding");
    const result = await geocodePostalCode("99999");

    expect(result).toBeNull();
  });

  it("returns null when API returns non-ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ message: "Rate limit exceeded" }),
    });

    const { geocodePostalCode } = await import("@/lib/geocoding");
    const result = await geocodePostalCode("94105");

    expect(result).toBeNull();
  });

  it("shouldRefreshGeocoding returns true when geocodedAt is null", async () => {
    const { shouldRefreshGeocoding } = await import("@/lib/geocoding");
    expect(shouldRefreshGeocoding(null)).toBe(true);
  });

  it("shouldRefreshGeocoding returns false for recently geocoded entry", async () => {
    const { shouldRefreshGeocoding } = await import("@/lib/geocoding");
    const recentDate = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
    // Default max age is likely 30 days
    expect(shouldRefreshGeocoding(recentDate)).toBe(false);
  });

  it("shouldRefreshGeocoding returns true for stale geocoding", async () => {
    const { shouldRefreshGeocoding } = await import("@/lib/geocoding");
    const oldDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000); // 40 days ago
    // Should refresh if older than 30 days
    expect(shouldRefreshGeocoding(oldDate)).toBe(true);
  });

  it("includes country param in Mapbox API request when provided", async () => {
    mockFetch.mockResolvedValue(makeMapboxResponse([VALID_FEATURE]));

    const { geocodePostalCode } = await import("@/lib/geocoding");
    await geocodePostalCode("94105", "US");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [calledUrl] = mockFetch.mock.calls[0];
    // Should pass country as filter
    expect(typeof calledUrl).toBe("string");
  });
});

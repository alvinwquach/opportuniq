/**
 * Server-side geocoding utility using Mapbox Geocoding API
 *
 * Used to convert postal codes to latitude/longitude coordinates.
 * Coordinates are cached in the database to avoid repeated API calls.
 */

interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

interface MapboxGeocodingResponse {
  features: Array<{
    center: [number, number]; // [longitude, latitude]
    place_name: string;
    place_type: string[];
  }>;
}

/**
 * Geocode a postal code to latitude/longitude coordinates
 *
 * @param postalCode - The postal code to geocode (e.g., "95132", "SW1A 1AA")
 * @param country - ISO 3166-1 alpha-2 country code (e.g., "US", "GB")
 * @returns GeocodingResult with lat/lng or null if geocoding failed
 */
export async function geocodePostalCode(
  postalCode: string,
  country: string = "US"
): Promise<GeocodingResult | null> {
  const token = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    return null;
  }

  try {
    // Build the geocoding query
    const query = `${postalCode}, ${country}`;
    const url = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/" + encodeURIComponent(query) + ".json");
    url.searchParams.set("access_token", token);
    url.searchParams.set("types", "postcode");
    url.searchParams.set("limit", "1");

    // Add country filter for more accurate results
    if (country) {
      url.searchParams.set("country", country.toLowerCase());
    }

    // Add timeout to fetch request using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn("Mapbox geocoding request timeout - aborting");
      controller.abort();
    }, 2000); // 2 second timeout

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        // Don't use next.revalidate in server actions - it can cause issues
      });
      clearTimeout(timeoutId);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        console.warn("Mapbox geocoding request aborted due to timeout");
        return null; // Return null instead of throwing
      }
      return null; // Return null on any error
    }

    if (!response.ok) {
      return null;
    }

    const data: MapboxGeocodingResponse = await response.json();

    if (!data.features || data.features.length === 0) {
      console.warn(`No geocoding results for postal code: ${postalCode}, ${country}`);
      return null;
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.center;

    return {
      latitude,
      longitude,
      formattedAddress: feature.place_name,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if geocoding should be refreshed
 *
 * @param geocodedAt - When the location was last geocoded
 * @param maxAgeMs - Maximum age in milliseconds before refresh (default: 30 days)
 * @returns true if geocoding should be refreshed
 */
export function shouldRefreshGeocoding(
  geocodedAt: Date | null,
  maxAgeMs: number = 30 * 24 * 60 * 60 * 1000 // 30 days
): boolean {
  if (!geocodedAt) return true;

  const age = Date.now() - geocodedAt.getTime();
  return age > maxAgeMs;
}

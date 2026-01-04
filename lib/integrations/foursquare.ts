/**
 * Foursquare Places API Integration
 *
 * Free tier: 950 API calls per day
 * Documentation: https://developer.foursquare.com/docs/places-api-overview
 *
 * Usage: Find local contractors, businesses, get ratings and contact info
 */

interface FoursquarePlace {
  fsq_id: string;
  name: string;
  categories: Array<{
    id: number;
    name: string;
    icon: {
      prefix: string;
      suffix: string;
    };
  }>;
  distance?: number;
  geocodes: {
    main: {
      latitude: number;
      longitude: number;
    };
  };
  location: {
    address?: string;
    formatted_address?: string;
    locality?: string;
    postcode?: string;
    region?: string;
    country?: string;
  };
  tel?: string;
  website?: string;
  rating?: number;
  stats?: {
    total_ratings?: number;
  };
  hours?: {
    display?: string;
    is_local_holiday?: boolean;
    open_now?: boolean;
  };
  price?: number; // 1-4
}

interface FoursquareSearchParams {
  query: string;
  near?: string; // e.g., "San Francisco, CA" or "94102"
  ll?: string; // lat,lng e.g., "37.7749,-122.4194"
  radius?: number; // meters (max 100000)
  limit?: number; // max 50
  sort?: "relevance" | "rating" | "distance";
  categories?: string; // comma-separated category IDs
}

interface FoursquareSearchResponse {
  results: FoursquarePlace[];
}

/**
 * Search for places using Foursquare
 */
export async function searchFoursquare(
  params: FoursquareSearchParams
): Promise<FoursquareSearchResponse> {
  const apiKey = process.env.FOURSQUARE_API_KEY;

  if (!apiKey) {
    throw new Error("FOURSQUARE_API_KEY is not configured");
  }

  const searchParams = new URLSearchParams({
    query: params.query,
    ...(params.near && { near: params.near }),
    ...(params.ll && { ll: params.ll }),
    ...(params.radius && { radius: params.radius.toString() }),
    limit: (params.limit || 20).toString(),
    ...(params.sort && { sort: params.sort.toUpperCase() }),
    ...(params.categories && { categories: params.categories }),
  });

  const response = await fetch(
    `https://api.foursquare.com/v3/places/search?${searchParams}`,
    {
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Foursquare API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get detailed place information
 */
export async function getFoursquarePlace(fsqId: string) {
  const apiKey = process.env.FOURSQUARE_API_KEY;

  if (!apiKey) {
    throw new Error("FOURSQUARE_API_KEY is not configured");
  }

  const fields = [
    "name",
    "categories",
    "location",
    "tel",
    "website",
    "rating",
    "stats",
    "hours",
    "price",
    "description",
  ].join(",");

  const response = await fetch(
    `https://api.foursquare.com/v3/places/${fsqId}?fields=${fields}`,
    {
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Foursquare API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Find contractors for a specific issue category
 */
export async function findContractorsOnFoursquare(
  category: string,
  zipCode: string,
  radius: number = 25000
) {
  // Map issue categories to Foursquare search terms
  const categoryMap: Record<string, string> = {
    automotive: "auto repair",
    home_repair: "contractor",
    appliance: "appliance repair",
    cleaning: "cleaning service",
    yard_outdoor: "landscaping",
    safety: "locksmith",
    maintenance: "handyman",
    installation: "electrician",
    plumbing: "plumber",
    hvac: "hvac",
    roofing: "roofing",
    painting: "painter",
    flooring: "flooring",
    pest_control: "pest control",
  };

  const searchTerm = categoryMap[category] || category;

  const results = await searchFoursquare({
    query: searchTerm,
    near: zipCode,
    radius,
    limit: 20,
    sort: "relevance",
  });

  return results.results.map((place) => ({
    vendorName: place.name,
    contactInfo: {
      phone: place.tel,
      website: place.website,
      address: place.location.formatted_address,
    },
    rating: place.rating
      ? `${place.rating}/10${place.stats?.total_ratings ? ` (${place.stats.total_ratings} ratings)` : ""}`
      : undefined,
    distance: place.distance
      ? `${(place.distance / 1609).toFixed(1)} miles`
      : undefined,
    specialties: place.categories.map((cat) => cat.name),
  }));
}

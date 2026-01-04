/**
 * Google Maps Places API Integration
 *
 * Free tier: $200/month credit (~28,500 requests)
 * Documentation: https://developers.google.com/maps/documentation/places/web-service
 *
 * Usage: Find local contractors, get reviews, contact info
 */

interface GooglePlace {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number; // 0-4
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  business_status?: string;
}

interface GoogleSearchParams {
  query: string; // e.g., "plumber near 94102"
  location?: {
    lat: number;
    lng: number;
  };
  radius?: number; // meters
  type?: string; // e.g., "plumber", "electrician"
}

interface GoogleTextSearchResponse {
  results: GooglePlace[];
  status: string;
}

/**
 * Search for places using text query
 */
export async function searchGoogleMaps(params: GoogleSearchParams): Promise<GoogleTextSearchResponse> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured");
  }

  const searchParams = new URLSearchParams({
    query: params.query,
    key: apiKey,
    ...(params.location && {
      location: `${params.location.lat},${params.location.lng}`,
    }),
    ...(params.radius && { radius: params.radius.toString() }),
    ...(params.type && { type: params.type }),
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?${searchParams}`
  );

  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Maps API error: ${data.status}`);
  }

  return data;
}

/**
 * Get detailed place information
 */
export async function getPlaceDetails(placeId: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured");
  }

  const searchParams = new URLSearchParams({
    place_id: placeId,
    key: apiKey,
    fields: "name,rating,user_ratings_total,formatted_phone_number,website,opening_hours,reviews,price_level,formatted_address",
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${searchParams}`
  );

  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(`Google Maps API error: ${data.status}`);
  }

  return data.result;
}

/**
 * Find contractors for a specific issue category
 */
export async function findContractorsOnGoogleMaps(
  category: string,
  zipCode: string,
  radius: number = 25000 // 25km default
) {
  // Map issue categories to Google Places types
  const categoryMap: Record<string, string> = {
    automotive: "car_repair",
    home_repair: "general_contractor",
    appliance: "electrician",
    cleaning: "cleaning",
    yard_outdoor: "landscaper",
    safety: "locksmith",
    maintenance: "handyman",
    installation: "electrician",
  };

  const searchType = categoryMap[category] || category;
  const query = `${searchType} near ${zipCode}`;

  const results = await searchGoogleMaps({
    query,
    radius,
    type: searchType,
  });

  return results.results.map(place => ({
    vendorName: place.name,
    contactInfo: {
      phone: place.formatted_phone_number,
      website: place.website,
      address: place.formatted_address,
    },
    rating: place.rating
      ? `${place.rating} stars (${place.user_ratings_total || 0} reviews)`
      : undefined,
    specialties: place.types.filter(type => !type.includes("_")),
  }));
}

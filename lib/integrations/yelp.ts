/**
 * Yelp Fusion API Integration
 *
 * Free tier: 500 API calls per day
 * Documentation: https://docs.developer.yelp.com/reference/v3_business_search
 *
 * Usage: Find local contractors, read reviews, get contact info
 */

interface YelpBusiness {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  price?: string;
  phone: string;
  display_phone: string;
  categories: Array<{
    alias: string;
    title: string;
  }>;
  location: {
    address1: string;
    city: string;
    zip_code: string;
    state: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // meters from search location
  url: string;
}

interface YelpSearchParams {
  term: string; // e.g., "plumber", "hvac repair", "auto mechanic"
  location?: string; // e.g., "94102" or "San Francisco, CA"
  latitude?: number;
  longitude?: number;
  radius?: number; // meters (max 40000)
  limit?: number; // max 50
  sort_by?: "best_match" | "rating" | "review_count" | "distance";
}

interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
}

/**
 * Search for local businesses on Yelp
 */
export async function searchYelp(params: YelpSearchParams): Promise<YelpSearchResponse> {
  const apiKey = process.env.YELP_API_KEY;

  if (!apiKey) {
    throw new Error("YELP_API_KEY is not configured");
  }

  const searchParams = new URLSearchParams({
    term: params.term,
    ...(params.location && { location: params.location }),
    ...(params.latitude && { latitude: params.latitude.toString() }),
    ...(params.longitude && { longitude: params.longitude.toString() }),
    ...(params.radius && { radius: params.radius.toString() }),
    limit: (params.limit || 20).toString(),
    sort_by: params.sort_by || "best_match",
  });

  const response = await fetch(
    `https://api.yelp.com/v3/businesses/search?${searchParams}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Yelp API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get detailed business information including reviews
 */
export async function getYelpBusiness(businessId: string) {
  const apiKey = process.env.YELP_API_KEY;

  if (!apiKey) {
    throw new Error("YELP_API_KEY is not configured");
  }

  const response = await fetch(
    `https://api.yelp.com/v3/businesses/${businessId}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Yelp API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Find contractors for a specific issue category
 */
export async function findContractorsForIssue(
  category: string,
  zipCode: string,
  radius: number = 25000 // 25km default
) {
  // Map issue categories to Yelp search terms
  const categoryMap: Record<string, string> = {
    automotive: "auto repair",
    home_repair: "general contractor",
    appliance: "appliance repair",
    cleaning: "cleaning services",
    yard_outdoor: "landscaping",
    safety: "emergency services",
    maintenance: "handyman",
    installation: "installation services",
  };

  const searchTerm = categoryMap[category] || category;

  const results = await searchYelp({
    term: searchTerm,
    location: zipCode,
    radius,
    limit: 20,
    sort_by: "rating",
  });

  return results.businesses.map(business => ({
    vendorName: business.name,
    contactInfo: {
      phone: business.display_phone,
      website: business.url,
    },
    rating: `${business.rating} stars (${business.review_count} reviews)`,
    distance: business.distance ? `${(business.distance / 1609).toFixed(1)} miles` : undefined,
    specialties: business.categories.map(cat => cat.title),
  }));
}

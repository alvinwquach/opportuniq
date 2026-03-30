/**
 * Reusable Firecrawl JSON extraction schemas
 *
 * Used with the 'firecrawl-json-extraction' feature flag to replace
 * brittle regex parsers with LLM-powered structured extraction.
 *
 * Credit cost: 5 per scrape (1 base + 4 for JSON extraction)
 */

export const COST_ESTIMATE_SCHEMA = {
  type: "object",
  properties: {
    proMin: { type: "number", description: "Minimum professional/contractor cost in dollars" },
    proMax: { type: "number", description: "Maximum professional/contractor cost in dollars" },
    proAvg: { type: "number", description: "Average/typical professional cost in dollars" },
    diyMin: { type: "number", description: "Minimum DIY/materials-only cost in dollars" },
    diyMax: { type: "number", description: "Maximum DIY/materials-only cost in dollars" },
    diyAvg: { type: "number", description: "Average DIY cost in dollars" },
    costFactors: {
      type: "array",
      items: { type: "string" },
      description: 'Factors that affect cost (e.g., "size of repair area", "material quality")',
    },
    timeEstimate: {
      type: "object",
      properties: {
        diy: { type: "string", description: 'Estimated time for DIY (e.g., "2-4 hours")' },
        pro: { type: "string", description: 'Estimated time for professional (e.g., "1-2 hours")' },
      },
    },
    sampleSize: { type: "number", description: "Number of data points this estimate is based on" },
  },
  required: ["proMin", "proMax"],
} as const;

export const CONTRACTOR_SCHEMA = {
  type: "object",
  properties: {
    contractors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Business name" },
          phone: { type: "string", description: "Phone number" },
          address: { type: "string", description: "Business address" },
          rating: { type: "number", description: "Star rating (1-5)" },
          reviewCount: { type: "number", description: "Number of reviews" },
          specialties: {
            type: "array",
            items: { type: "string" },
            description: "Service specialties",
          },
        },
        required: ["name"],
      },
    },
  },
} as const;

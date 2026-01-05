import { z } from "zod";

// Issue categories with sub-categories for better context
export const issueCategories = [
  "plumbing",
  "electrical",
  "hvac",
  "structural",
  "roofing",
  "flooring",
  "appliance",
  "exterior",
  "auto_engine",
  "auto_body",
  "auto_interior",
  "other",
] as const;

export type IssueCategory = (typeof issueCategories)[number];

// Issue locations for home
export const homeLocations = [
  "bathroom",
  "kitchen",
  "bedroom",
  "living_room",
  "basement",
  "attic",
  "garage",
  "exterior",
  "roof",
  "foundation",
  "yard",
  "other",
] as const;

export type HomeLocation = (typeof homeLocations)[number];

// Issue locations for auto
export const autoLocations = [
  "engine",
  "transmission",
  "brakes",
  "suspension",
  "exhaust",
  "interior",
  "exterior",
  "wheels_tires",
  "electrical",
  "other",
] as const;

export type AutoLocation = (typeof autoLocations)[number];

// Property types
export const propertyTypes = ["house", "condo", "apartment", "townhouse", "mobile_home", "vehicle"] as const;
export type PropertyType = (typeof propertyTypes)[number];

// DIY skill levels
export const skillLevels = ["beginner", "intermediate", "advanced"] as const;
export type SkillLevel = (typeof skillLevels)[number];

// Urgency levels
export const urgencyLevels = ["flexible", "this_week", "urgent", "emergency"] as const;
export type UrgencyLevel = (typeof urgencyLevels)[number];

// Budget ranges
export const budgetRanges = ["under_100", "100_500", "500_1000", "1000_5000", "over_5000", "unsure"] as const;
export type BudgetRange = (typeof budgetRanges)[number];

/**
 * Structured diagnosis request schema
 * This reduces hallucination by providing explicit, typed context
 */
export const diagnosisRequestSchema = z.object({
  // Issue details - what the user is describing
  issue: z.object({
    category: z.enum(issueCategories).optional(),
    description: z.string().min(1, "Please describe the issue"),
    location: z.string().optional(), // Free text for flexibility
    symptomsObserved: z.array(z.string()).optional(), // e.g., ["water leak", "discoloration", "noise"]
  }),

  // Property context - helps with safety warnings
  property: z.object({
    type: z.enum(propertyTypes),
    yearBuilt: z.number().min(1800).max(new Date().getFullYear()).optional(),
    // Postal code is optional - may not be set for all users
    // Use union to accept valid ZIP, empty string, or undefined
    postalCode: z.union([
      z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
      z.literal(""),
    ]).optional(),
  }),

  // User context - affects recommendations
  preferences: z.object({
    diySkillLevel: z.enum(skillLevels).default("beginner"),
    urgency: z.enum(urgencyLevels).default("flexible"),
    budgetRange: z.enum(budgetRanges).optional(),
    hasBasicTools: z.boolean().default(false),
    prefersDIY: z.boolean().optional(), // null = no preference
  }),

  // Attachments - encrypted image references + optional base64 for AI vision
  attachments: z
    .array(
      z.object({
        attachmentId: z.string(),
        storagePath: z.string(),
        iv: z.string(),
        mimeType: z.string(),
        originalSize: z.number(),
        // Base64 image data for AI vision (decrypted client-side, sent for analysis)
        base64Data: z.string().optional(),
      })
    )
    .optional(),
});

export type DiagnosisRequest = z.infer<typeof diagnosisRequestSchema>;

/**
 * Follow-up message schema (after initial diagnosis)
 */
export const followUpMessageSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1),
  attachments: z
    .array(
      z.object({
        attachmentId: z.string(),
        storagePath: z.string(),
        iv: z.string(),
        mimeType: z.string(),
        originalSize: z.number(),
      })
    )
    .optional(),
});

export type FollowUpMessage = z.infer<typeof followUpMessageSchema>;

/**
 * Form-specific schema for TanStack Form
 * Uses strings for inputs that need coercion
 */
export const diagnosisFormSchema = z.object({
  // Issue
  issueCategory: z.enum(issueCategories).optional(),
  issueDescription: z.string().min(1, "Please describe the issue"),
  issueLocation: z.string().optional(),

  // Property
  propertyType: z.enum(propertyTypes),
  yearBuilt: z.string().optional(), // String for input, coerce to number
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),

  // Preferences
  diySkillLevel: z.enum(skillLevels),
  urgency: z.enum(urgencyLevels),
  budgetRange: z.enum(budgetRanges).optional(),
  hasBasicTools: z.boolean(),
  prefersDIY: z.boolean().optional(),
});

export type DiagnosisFormValues = z.infer<typeof diagnosisFormSchema>;

/**
 * Convert form values to API request format
 */
export function formToRequest(
  form: DiagnosisFormValues,
  attachments?: DiagnosisRequest["attachments"]
): DiagnosisRequest {
  return {
    issue: {
      category: form.issueCategory,
      description: form.issueDescription,
      location: form.issueLocation,
    },
    property: {
      type: form.propertyType,
      yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt, 10) : undefined,
      postalCode: form.postalCode,
    },
    preferences: {
      diySkillLevel: form.diySkillLevel,
      urgency: form.urgency,
      budgetRange: form.budgetRange,
      hasBasicTools: form.hasBasicTools,
      prefersDIY: form.prefersDIY,
    },
    attachments,
  };
}

/**
 * Display labels for UI
 */
export const labels = {
  issueCategories: {
    plumbing: "Plumbing",
    electrical: "Electrical",
    hvac: "HVAC / Climate",
    structural: "Structural",
    roofing: "Roofing",
    flooring: "Flooring",
    appliance: "Appliance",
    exterior: "Exterior",
    auto_engine: "Auto - Engine",
    auto_body: "Auto - Body",
    auto_interior: "Auto - Interior",
    other: "Other",
  } as Record<IssueCategory, string>,

  propertyTypes: {
    house: "House",
    condo: "Condo",
    apartment: "Apartment",
    townhouse: "Townhouse",
    mobile_home: "Mobile Home",
    vehicle: "Vehicle",
  } as Record<PropertyType, string>,

  skillLevels: {
    beginner: "Beginner - Basic tasks only",
    intermediate: "Intermediate - Comfortable with tools",
    advanced: "Advanced - Experienced DIYer",
  } as Record<SkillLevel, string>,

  urgencyLevels: {
    flexible: "Flexible - No rush",
    this_week: "This week",
    urgent: "Urgent - Within 24-48 hours",
    emergency: "Emergency - Immediate action needed",
  } as Record<UrgencyLevel, string>,

  budgetRanges: {
    under_100: "Under $100",
    "100_500": "$100 - $500",
    "500_1000": "$500 - $1,000",
    "1000_5000": "$1,000 - $5,000",
    over_5000: "Over $5,000",
    unsure: "Not sure",
  } as Record<BudgetRange, string>,
} as const;

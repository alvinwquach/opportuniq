export interface DIYFeasibilityData {
  skillMatch: number; // 1-10: How well does your skill match the task?
  worthDoing: number; // 1-10: Is DIY worth it vs hiring?
  riskLevel: number; // 1-10: Risk of making things worse
  timeScore: number; // 1-10: Time investment vs benefit
  savingsScore: number; // 1-10: Money saved by DIY
  skillLevel: "beginner" | "intermediate" | "advanced" | "professional";
  timeEstimate: string; // e.g., "2-4 hours"
  recommendation: "diy" | "consider" | "hire_pro";
}

/**
 * Skills required data for radial chart
 */
export interface SkillsRequiredData {
  level: "beginner" | "intermediate" | "advanced" | "professional";
  skills: string[]; // e.g., ["Basic plumbing", "Soldering"]
  toolsRequired: string[]; // e.g., ["Pipe wrench", "Soldering iron"]
  learningCurve: "low" | "medium" | "high";
}

/**
 * Cost breakdown for DIY
 */
export interface CostBreakdownData {
  materials: number;
  tools: number;
  rental?: number;
  ppe?: number;
  budgetComparison?: {
    budget: number;
    isWithinBudget: boolean;
  };
  whereToBuy?: string[]; // e.g., ["Home Depot", "Amazon"]
}

/**
 * Risk assessment data
 */
export interface RiskAssessmentData {
  level: "low" | "medium" | "high" | "critical";
  safetyRisk?: number; // 1-10
  damageRisk?: number; // 1-10
  costRisk?: number; // 1-10
  codeViolationRisk?: number; // 1-10
  consequences: string[];
  mitigations: string[];
  permitRequired?: boolean;
}

/**
 * DIY Guide source (Reddit, forums, etc.)
 */
export interface DIYGuideSource {
  title: string;
  url: string;
  source: "reddit" | "diy_stackexchange" | "instructables" | "family_handyman" | "this_old_house" | "other";
  upvotes?: number;
  comments?: number;
  excerpt?: string;
  isVerified?: boolean;
}

/**
 * Cost data for charts
 */
export interface CostChartData {
  diy: {
    min: number;
    max: number;
    avg: number;
    breakdown?: {
      materials?: number;
      tools?: number;
      ppe?: number;
      rental?: number;
    };
  } | null;
  pro: {
    min: number;
    max: number;
    avg: number;
  } | null;
  source: "homeadvisor" | "angi" | "estimate" | "user_data";
  sampleSize?: number;
  region?: string;
}

/**
 * Severity data for gauge chart
 */
export interface SeverityData {
  level: "minor" | "moderate" | "urgent" | "emergency";
  score: number; // 1-10
  label: string;
  color: string;
  description: string;
}

/**
 * Timeline/urgency data
 */
export interface TimelineData {
  urgency: "monitor" | "this_month" | "this_week" | "today" | "now" | "emergency";
  daysToAct: number | null;
  consequences: {
    immediate?: string;
    oneWeek?: string;
    oneMonth?: string;
    sixMonths?: string;
    worstCase?: string;
  };
}

/**
 * Contractor data for cards
 */
export interface ContractorData {
  name: string;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  website?: string;
  distance?: string;
  source: "yelp" | "foursquare" | "google" | "angi";
}

/**
 * Product data for purchase links
 */
export interface ProductData {
  name: string;
  price: number;
  url: string;
  retailer: string;
  category: "materials" | "tools" | "ppe";
  imageUrl?: string;
}

/**
 * Red flags data - warning signs to stop and call a pro
 */
export interface RedFlagsData {
  flags: string[];
  stopAction?: string;
}

/**
 * Complete structured diagnosis response
 */
export interface DiagnosisData {
  // Issue identification
  issue: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
  };

  // Severity and urgency
  severity: SeverityData;
  timeline: TimelineData;

  // Cost information
  costs: CostChartData;

  // DIY assessment
  diy: {
    feasibility: "easy" | "moderate" | "difficult" | "not_recommended";
    skillLevel: "beginner" | "intermediate" | "advanced" | "professional";
    timeRequired: string;
    riskIfWrong: string[];
  };

  // Safety information
  safety: {
    isEmergency: boolean;
    emergencyInstructions?: string;
    hazards: string[];
    ppeRequired: string[];
    warnings: string[];
  };

  // Red flags - when to stop and call a pro
  redFlags?: RedFlagsData;

  // Products and contractors
  products: ProductData[];
  contractors: ContractorData[];

  // Additional data
  rebates?: {
    available: boolean;
    programs: Array<{
      name: string;
      amount: string;
      url?: string;
    }>;
  };
}

/**
 * Parse severity level to score
 */
export function severityToScore(level: string): number {
  const map: Record<string, number> = {
    minor: 2,
    cosmetic: 2,
    moderate: 5,
    urgent: 7,
    serious: 7,
    critical: 9,
    emergency: 10,
  };
  return map[level.toLowerCase()] || 5;
}

/**
 * Get severity color
 */
export function severityToColor(level: string): string {
  const map: Record<string, string> = {
    minor: "#22c55e", // green
    cosmetic: "#22c55e",
    moderate: "#eab308", // yellow
    urgent: "#f97316", // orange
    serious: "#f97316",
    critical: "#ef4444", // red
    emergency: "#dc2626", // dark red
  };
  return map[level.toLowerCase()] || "#eab308";
}

/**
 * Parse urgency to days
 */
export function urgencyToDays(urgency: string): number | null {
  const map: Record<string, number | null> = {
    monitor: null,
    this_month: 30,
    this_week: 7,
    today: 1,
    now: 0,
    emergency: 0,
  };
  return map[urgency.toLowerCase()] ?? null;
}

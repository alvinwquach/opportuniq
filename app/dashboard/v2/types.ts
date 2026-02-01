/**
 * Dashboard V2 Types
 *
 * Unified types that bridge production data and demo component interfaces.
 */

// Re-export the tab type from demo components
export type DashboardTab = "overview" | "decisions" | "spending";

// =============================================================================
// STATS & PIPELINE
// =============================================================================

export interface StatCard {
  label: string;
  value: number | string;
  trend: string;
  up: boolean;
  prefix?: string;
}

export interface PipelineStage {
  stage: string;
  count: number;
  color: string;
}

export interface PipelineSummary {
  open: number;
  investigating: number;
  optionsGenerated: number;
  decided: number;
  inProgress: number;
  completed: number;
  deferred: number;
}

// =============================================================================
// ISSUES & DECISIONS
// =============================================================================

export interface OpenIssue {
  id: string;
  title: string;
  status: string;
  group: string;
  priority?: string;
}

export interface SafetyAlert {
  id: string;
  title: string;
  severity: string;
  groupName: string;
  emergencyInstructions?: string | null;
}

export interface PendingDecision {
  id: string;
  issueTitle: string;
  groupName: string;
  priority: string;
  diyOption?: {
    cost: string;
    time: string;
  };
  proOption?: {
    cost: string;
  };
  recommendation?: string;
}

export interface DeferredDecision {
  id: string;
  title: string;
  reason: string;
  date: string;
}

// =============================================================================
// GROUPS
// =============================================================================

export interface Group {
  id: string;
  name: string;
  role: string;
  issues: number;
  savings: number;
  members?: number;
}

// =============================================================================
// FINANCES
// =============================================================================

export interface Financials {
  monthlyIncome: number;
  annualIncome: number;
  hourlyRate: number;
  totalSpent: number;
  remaining: number;
  budgetUsedPercent: number;
  totalBudget: number;
}

export interface BudgetCategory {
  category: string;
  amount: number;
  color: string;
}

export interface SavingsData {
  totalSavings: number;
  successfulDiyCount: number;
}

export interface SavingsOverTime {
  month: string;
  savings: number;
  diy: number;
  avoided?: number;
}

// =============================================================================
// CALENDAR & REMINDERS
// =============================================================================

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "contractor" | "diy" | "reminder";
}

export interface Reminder {
  id: string;
  issueId?: string;
  title: string;
  groupName?: string;
  date: Date | string;
}

// =============================================================================
// GUIDES & OUTCOMES
// =============================================================================

export interface ActiveGuide {
  id: string;
  title: string;
  progress: number;
  completedSteps: number;
  totalSteps: number;
}

export interface RecentOutcome {
  id: string;
  issueTitle: string;
  success?: boolean;
  optionType: string;
  actualCost: number | null;
  costDelta: number | null;
}

// =============================================================================
// VENDORS & SHOPPING
// =============================================================================

export interface PendingVendor {
  id: string;
  vendorName: string;
  issueTitle: string;
  rating: number;
  quoteAmount: number;
}

export interface ShoppingItem {
  id: string;
  productName: string;
  storeName: string;
  estimatedCost?: number;
  inStock?: boolean;
}

// =============================================================================
// ACTIVITY
// =============================================================================

export interface Activity {
  id: string;
  message: string;
  time: string;
  avatar: string;
}

// =============================================================================
// INSIGHTS
// =============================================================================

export interface OutcomeSummary {
  diySuccessRate: number;
  totalResolved: number;
  avgCostDelta: number;
  avgResolutionTimeDays: number;
}

export interface AIInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  priority?: string;
}

// =============================================================================
// WEATHER & LOCATION
// =============================================================================

export interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    weatherDescription: string;
    isDay: boolean;
    uvIndex: number;
    precipitation: number;
    visibility: number;
  } | null;
  daily: Array<{
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    precipitationProbability: number;
    weatherCode: number;
    weatherDescription: string;
    sunrise: string;
    sunset: string;
    windSpeedMax: number;
    uvIndexMax: number;
  }> | null;
  airQuality: {
    aqi: number;
    pm25: number;
    pm10: number;
    description: string;
  } | null;
}

export interface UserLocation {
  postalCode: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

// =============================================================================
// ADAPTED DATA (for demo components)
// =============================================================================

export interface AdaptedDashboardData {
  // Header
  header: {
    userName: string;
    hourlyRate: number;
    monthlyIncome: number;
  };

  // Stats
  stats: StatCard[];

  // Safety
  safetyAlerts: SafetyAlert[];

  // Insights
  outcomeSummary: OutcomeSummary;

  // Pipeline
  pipeline: PipelineStage[];
  pipelineActiveCount: number;
  pipelineCompletedCount: number;

  // Issues & Decisions
  openIssues: OpenIssue[];
  pendingDecisions: PendingDecision[];
  deferredDecisions: DeferredDecision[];

  // Groups
  groups: Group[];

  // Finances
  financials: Financials;
  budgetCategories: BudgetCategory[];
  savingsOverTime: SavingsOverTime[];
  savings: SavingsData;

  // Calendar & Reminders
  calendarEvents: CalendarEvent[];
  reminders: Reminder[];

  // Guides & Outcomes
  activeGuides: ActiveGuide[];
  recentOutcomes: RecentOutcome[];

  // Vendors & Shopping
  pendingVendors: PendingVendor[];
  shoppingList: ShoppingItem[];

  // Activity
  recentActivity: Activity[];
  groupActivity: Activity[];

  // Weather & Location
  weatherData: WeatherData | null;
  userLocation: UserLocation | null;
}

// =============================================================================
// GRAPHQL RESPONSE TYPES
// =============================================================================

export interface DashboardDataResponse {
  user: {
    id: string;
    name: string | null;
    postalCode: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  financials: {
    monthlyIncome: number;
    annualIncome: number;
    hourlyRate: number;
    totalSpent: number;
    remaining: number;
    budgetUsedPercent: number;
    totalBudget: number;
  };
  pipelineSummary: PipelineSummary;
  openIssues: Array<{
    id: string;
    title: string;
    status: string;
    groupName: string;
    priority: string | null;
  }>;
  pendingDecisions: Array<{
    id: string;
    issueTitle: string;
    groupName: string;
    priority: string;
    optionType: string;
    costMin: number | null;
    costMax: number | null;
    timeEstimate: string | null;
    recommended: boolean;
  }>;
  safetyAlerts: SafetyAlert[];
  activeGroups: Array<{
    id: string;
    name: string;
    role: string;
    issueCount: number;
    totalSavings: number;
    memberCount: number;
  }>;
  savings: SavingsData;
  savingsOverTime: SavingsOverTime[];
  spendingByCategory: BudgetCategory[];
  calendarEvents: CalendarEvent[];
  reminders: Reminder[];
  activeGuides: ActiveGuide[];
  recentOutcomes: RecentOutcome[];
  pendingVendors: PendingVendor[];
  shoppingList: ShoppingItem[];
  recentActivity: Activity[];
  groupActivity: Activity[];
  deferredDecisions: DeferredDecision[];
  outcomeSummary: OutcomeSummary;
}

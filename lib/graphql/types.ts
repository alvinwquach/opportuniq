/**
 * GraphQL Response and Input Types
 *
 * Type definitions for GraphQL operations.
 * These match the server-side schema types.
 */

// =============================================================================
// USER TYPES
// =============================================================================

export interface MeResponse {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  city: string | null;
  stateProvince: string | null;
  postalCode: string | null;
  country: string | null;
  preferences: UserPreferences | null;
  monthlyBudget: string | null;
  emergencyBuffer: string | null;
  riskTolerance: string | null;
  createdAt: string;
  lastSeenAt: string | null;
  groupCount: number;
}

export interface UserPreferences {
  language: string | null;
  theme: string | null;
  emailNotifications: boolean | null;
  smsNotifications: boolean | null;
  weeklyDigest: boolean | null;
  unitSystem: string | null;
  currency: string | null;
}

export interface MeWithGroupsResponse extends MeResponse {
  groups: GroupListItem[];
  guides: GuideResponse[];
}

export interface UserResponse {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  preferences?: UserPreferences | null;
}

// =============================================================================
// GROUP TYPES
// =============================================================================

export interface GroupListItem {
  id: string;
  name: string;
  postalCode: string | null;
  memberCount: number;
  issueCount: number;
  activeIssueCount: number;
  createdAt: string;
}

export interface GroupResponse extends GroupListItem {
  defaultSearchRadius: number | null;
  constraints: GroupConstraintsResponse | null;
}

export interface GroupWithMembersResponse extends GroupResponse {
  members: GroupMemberResponse[];
  activeMembers: GroupMemberResponse[];
}

export interface GroupConstraintsResponse {
  id: string;
  monthlyBudget: string | null;
  emergencyBuffer: string | null;
  sharedBalance: string;
  riskTolerance: string | null;
  diyPreference: string | null;
  neverDIY: string[] | null;
}

export interface GroupMemberResponse {
  id: string;
  role: string;
  status: string;
  joinedAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

export interface GroupInvitationResponse {
  id: string;
  email: string;
  role: string;
  message: string | null;
  invitedAt: string;
  expiresAt: string | null;
  group: { id: string; name: string };
  invitedBy: GroupMemberResponse;
}

// =============================================================================
// ISSUE TYPES
// =============================================================================

export interface IssueListItem {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  status: string;
  priority: string;
  confidenceLevel: number | null;
  diagnosis: string | null;
  severity: string | null;
  urgency: string | null;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
  group: { id: string; name: string };
  createdBy: {
    id: string;
    user: { name: string | null; avatarUrl: string | null };
  };
}

export interface IssueResponse extends IssueListItem {
  assetName: string | null;
  assetDetails: unknown;
  ignoreRisk: string | null;
  warningSignsToWatch: string[] | null;
  whenToEscalate: string | null;
  emergencyInstructions: string | null;
  emergencyType: string | null;
  resolutionType: string | null;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  completedAt: string | null;
  evidenceCount: number;
  commentCount: number;
  resolvedBy: { id: string; user: { id: string; name: string | null } } | null;
}

export interface IssueWithOptionsResponse extends IssueResponse {
  options: DecisionOptionResponse[];
  decision: DecisionResponse | null;
  evidence: EvidenceResponse[];
  hypotheses: HypothesisResponse[];
  comments: CommentResponse[];
}

// =============================================================================
// DECISION TYPES
// =============================================================================

export interface DecisionOptionResponse {
  id: string;
  type: string;
  title: string;
  description: string | null;
  costMin: string | null;
  costMax: string | null;
  timeEstimate: string | null;
  riskLevel: string | null;
  diyViable: boolean;
  diyWarning: string | null;
  requiredSkills: string[] | null;
  requiredTools: string[] | null;
  requiredParts: string[] | null;
  recommended: boolean;
  reasoning: string | null;
  confidenceScore: number | null;
  ppe: { item: string; priority: string; reason: string }[] | null;
  hazards: string[] | null;
}

export interface DecisionResponse {
  id: string;
  approvedAt: string;
  selectedOption: { id: string; title: string; type: string };
  voteCount: number;
  approvalCount: number;
}

export interface DecisionOutcomeResponse {
  id: string;
  actualCost: string | null;
  actualTime: string | null;
  success: boolean;
  completedAt: string;
  costDelta: string | null;
  timeDelta: string | null;
  whatWentWell: string | null;
  whatWentWrong: string | null;
  lessonsLearned: string | null;
  wouldDoAgain: boolean | null;
  decision: DecisionResponse;
}

export interface EvidenceResponse {
  id: string;
  evidenceType: string;
  fileName: string | null;
  storageUrl: string | null;
  createdAt: string;
}

export interface HypothesisResponse {
  id: string;
  hypothesis: string | null;
  confidence: number;
  createdAt: string;
}

export interface CommentResponse {
  id: string;
  content: string | null;
  createdAt: string;
  author: {
    id: string;
    user: { id: string; name: string | null; avatarUrl: string | null };
  };
}

// =============================================================================
// GUIDE TYPES
// =============================================================================

export interface GuideResponse {
  id: string;
  title: string;
  url: string;
  source: string;
  subreddit: string | null;
  upvotes: number | null;
  commentCount: number | null;
  postAge: string | null;
  excerpt: string | null;
  relevanceScore: number | null;
  focusArea: string | null;
  wasClicked: boolean;
  wasBookmarked: boolean;
  wasHelpful: boolean | null;
  searchQuery: string | null;
  issueCategory: string | null;
  createdAt: string;
  clickedAt: string | null;
}

// =============================================================================
// FINANCE TYPES
// =============================================================================

export interface IncomeStreamResponse {
  id: string;
  source: string;
  amount: string;
  description: string | null;
  frequency: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  monthlyEquivalent: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseResponse {
  id: string;
  category: string;
  amount: string;
  description: string | null;
  date: string;
  isRecurring: boolean;
  recurringFrequency: string | null;
  nextDueDate: string | null;
  issueId: string | null;
  createdAt: string;
}

export interface BudgetResponse {
  id: string;
  category: string;
  monthlyLimit: string;
  currentSpend: string;
  remainingBudget: string;
  percentUsed: number;
  updatedAt: string;
}

export interface FinancialSummaryResponse {
  totalMonthlyIncome: string;
  totalMonthlyExpenses: string;
  netMonthlyCashFlow: string;
  totalBudgetLimit: string;
  totalBudgetSpent: string;
  emergencyFundTarget: string | null;
  emergencyFundCurrent: string | null;
}

// =============================================================================
// DASHBOARD TYPES
// =============================================================================

export interface DashboardStatsResponse {
  openIssues: number;
  pendingDecisions: number;
  diyProjectsCompleted: number;
  totalSaved: string;
  activeGroups: number;
  upcomingReminders: number;
}

export interface ResolutionStatsResponse {
  totalResolved: number;
  diyCount: number;
  hiredCount: number;
  replacedCount: number;
  deferredCount: number;
  totalSaved: string;
  averageSavings: string;
}

// =============================================================================
// PREFERENCE TYPES
// =============================================================================

export interface PreferenceHistoryResponse {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string;
  reason: string | null;
  changedBy: GroupMemberResponse | null;
  changedAt: string;
}

// =============================================================================
// INPUT TYPES
// =============================================================================

export interface UpdateProfileInput {
  name?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  monthlyBudget?: string;
  emergencyBuffer?: string;
  riskTolerance?: string;
}

export interface UpdatePreferencesInput {
  language?: string;
  theme?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  weeklyDigest?: boolean;
  unitSystem?: string;
  currency?: string;
}

export interface CreateGroupInput {
  name: string;
  postalCode?: string;
  defaultSearchRadius?: number;
}

export interface UpdateGroupInput {
  name?: string;
  postalCode?: string;
  defaultSearchRadius?: number;
}

export interface CreateIssueInput {
  groupId: string;
  title: string;
  description?: string;
  category?: string;
  subcategory?: string;
  priority?: string;
  assetName?: string;
  assetDetails?: unknown;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  priority?: string;
  status?: string;
  assetName?: string;
  assetDetails?: unknown;
}

export interface AddIncomeStreamInput {
  source: string;
  amount: string;
  frequency: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateIncomeStreamInput {
  id: string;
  source?: string;
  amount?: string;
  frequency?: string;
  description?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface AddExpenseInput {
  category: string;
  amount: string;
  description?: string;
  date: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  issueId?: string;
}

export interface UpdateExpenseInput {
  id: string;
  category?: string;
  amount?: string;
  description?: string;
  date?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
}

export interface SetBudgetInput {
  category: string;
  monthlyLimit: string;
}

export interface RecordOutcomeInput {
  decisionId: string;
  actualCost?: string;
  actualTime?: string;
  success: boolean;
  whatWentWell?: string;
  whatWentWrong?: string;
  lessonsLearned?: string;
  wouldDoAgain?: boolean;
}

// =============================================================================
// SCHEDULE TYPES
// =============================================================================

export interface ScheduleResponse {
  id: string;
  scheduledTime: string;
  estimatedDuration: number | null;
  participants: string[];
  calendarEventId: string | null;
  createdAt: string;
  updatedAt: string;
  issue: {
    id: string;
    title: string | null;
    status: string;
  };
  createdBy: {
    id: string;
    user: { name: string | null; avatarUrl: string | null };
  };
  participantMembers: {
    id: string;
    user: { name: string | null; avatarUrl: string | null };
  }[];
}

export interface ScheduleWithDetailsResponse extends ScheduleResponse {
  issue: {
    id: string;
    title: string | null;
    status: string;
    priority: string;
    group: { id: string; name: string };
  };
}

export interface CreateScheduleInput {
  issueId: string;
  scheduledTime: string;
  estimatedDuration?: number;
  participants?: string[];
}

export interface UpdateScheduleInput {
  scheduledTime?: string;
  estimatedDuration?: number;
  participants?: string[];
}

// =============================================================================
// EXPENSE SETTINGS TYPES
// =============================================================================

export interface ExpenseSettingsResponse {
  id: string;
  approvalMode: string;
  defaultThreshold: string | null;
  trustOwnerAdmin: boolean;
  moderatorThreshold: string | null;
  allowModeratorApprove: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategoryResponse {
  id: string;
  name: string;
  icon: string | null;
  approvalRule: string;
  customThreshold: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface UpdateExpenseSettingsInput {
  approvalMode?: string;
  defaultThreshold?: string;
  trustOwnerAdmin?: boolean;
  moderatorThreshold?: string;
  allowModeratorApprove?: boolean;
}

export interface CreateExpenseCategoryInput {
  name: string;
  icon?: string;
  approvalRule?: string;
  customThreshold?: string;
  sortOrder?: number;
}

export interface UpdateExpenseCategoryInput {
  name?: string;
  icon?: string;
  approvalRule?: string;
  customThreshold?: string;
  sortOrder?: number;
}

// =============================================================================
// VENDOR TYPES
// =============================================================================

export interface VendorContactResponse {
  id: string;
  vendorName: string;
  contactInfo: unknown;
  quoteAmount: string | null;
  quoteDetails: string | null;
  rating: string | null;
  reviewSummary: string | null;
  specialties: string[] | null;
  distance: string | null;
  address: string | null;
  contacted: boolean;
  emailDraft: string | null;
  createdAt: string;
}

// =============================================================================
// RESOLVE ISSUE INPUT
// =============================================================================

export interface ResolveIssueInput {
  resolutionType: string;
  resolutionNotes?: string;
}

// =============================================================================
// COMPREHENSIVE DASHBOARD DATA TYPES
// =============================================================================

export interface DashboardDataResponse {
  user: DashboardUser;
  financials: DashboardFinancials;
  stats: DashboardStatCards;
  pipelineSummary: PipelineSummary;
  openIssues: DashboardIssue[];
  safetyAlerts: SafetyAlert[];
  pendingDecisions: PendingDecision[];
  deferredDecisions: DeferredDecision[];
  groups: DashboardGroup[];
  calendarEvents: CalendarEvent[];
  reminders: Reminder[];
  activeGuides: ActiveGuide[];
  recentOutcomes: RecentOutcome[];
  outcomeSummary: OutcomeSummary;
  pendingVendors: PendingVendor[];
  shoppingList: ShoppingItem[];
  spendingByCategory: SpendingCategory[];
  savingsOverTime: MonthlySavings[];
  recentActivity: ActivityItem[];
  userLocation: UserLocation | null;
  weatherData: WeatherData | null;
}

export interface DashboardUser {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  postalCode: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface DashboardFinancials {
  monthlyIncome: number;
  annualIncome: number;
  hourlyRate: number;
  totalSpent: number;
  remaining: number;
  budgetUsedPercent: number;
  totalBudget: number;
}

export interface DashboardStatCards {
  activeIssues: number;
  activeIssuesTrend: string | null;
  pendingDecisions: number;
  pendingDecisionsTrend: string | null;
  totalSaved: number;
  totalSavedTrend: string | null;
  groupCount: number;
  groupCountTrend: string | null;
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

export interface DashboardIssue {
  id: string;
  title: string;
  status: string;
  priority: string;
  groupName: string;
  groupId: string;
  createdAt: string;
}

export interface SafetyAlert {
  id: string;
  title: string;
  severity: string;
  groupName: string;
  emergencyInstructions: string | null;
}

export interface PendingDecision {
  id: string;
  issueId: string;
  title: string;
  priority: string;
  groupName: string;
  optionType: string | null;
  costMin: number | null;
  costMax: number | null;
  timeEstimate: string | null;
  voteCount: number;
  totalMembers: number;
}

export interface DeferredDecision {
  id: string;
  title: string;
  revisitDate: string | null;
  reason: string | null;
}

export interface DashboardGroup {
  id: string;
  name: string;
  role: string;
  memberCount: number;
  issueCount: number;
  savings: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
  type: string;
  groupName: string | null;
}

export interface Reminder {
  id: string;
  issueId: string | null;
  title: string;
  groupName: string | null;
  date: string;
}

export interface ActiveGuide {
  id: string;
  title: string;
  progress: number;
  totalSteps: number;
  completedSteps: number;
}

export interface RecentOutcome {
  id: string;
  issueTitle: string;
  success: boolean;
  optionType: string;
  actualCost: number | null;
  costDelta: number | null;
}

export interface OutcomeSummary {
  diySuccessRate: number;
  totalResolved: number;
  avgCostDelta: number;
  avgResolutionTimeDays: number;
}

export interface PendingVendor {
  id: string;
  vendorName: string;
  issueTitle: string | null;
  rating: number | null;
  quoteAmount: number | null;
}

export interface ShoppingItem {
  id: string;
  productName: string;
  storeName: string | null;
  estimatedCost: number | null;
  inStock: boolean | null;
}

export interface SpendingCategory {
  category: string;
  amount: number;
  color: string;
}

export interface MonthlySavings {
  month: string;
  savings: number;
  diy: number;
  hired: number;
}

export interface ActivityItem {
  id: string;
  message: string;
  time: string;
  avatar: string | null;
  type: string | null;
}

export interface UserLocation {
  postalCode: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface WeatherData {
  current: CurrentWeather | null;
  daily: DailyWeather[] | null;
  airQuality: AirQuality | null;
}

export interface CurrentWeather {
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
}

export interface DailyWeather {
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
}

export interface AirQuality {
  aqi: number;
  pm25: number;
  pm10: number;
  description: string;
}

// =============================================================================
// FINANCES PAGE DATA TYPES
// =============================================================================

export interface FinancesPageDataResponse {
  monthlyIncome: number;
  monthlyExpenses: number;
  availableFunds: number;
  monthlyBudget: number;
  remaining: number;
  emergencyFundPercent: number;
  diySaved: number;
  pendingUrgent: number;
  incomeStreams: IncomeStreamItemResponse[];
  expenses: ExpenseItemResponse[];
  upcomingExpenses: UpcomingExpenseItemResponse[];
  spendingByCategory: SpendingCategoryDataResponse[];
  cashFlowHistory: CashFlowDataPointResponse[];
  incomeHistory: IncomeHistoryDataPointResponse[];
  expenseHistory: ExpenseHistoryDataPointResponse[];
  budgetVsActual: BudgetVsActualDataPointResponse[];
  categories: string[];
}

export interface IncomeStreamItemResponse {
  id: string;
  source: string;
  amount: number;
  frequency: string;
  isActive: boolean;
  description: string | null;
  monthlyEquivalent: number;
}

export interface ExpenseItemResponse {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  isRecurring: boolean;
  frequency: string | null;
  issueTitle: string | null;
  urgency: string | null;
}

export interface UpcomingExpenseItemResponse {
  id: string;
  category: string;
  description: string;
  amount: number;
  dueDate: string;
  urgency: string | null;
  isRecurring: boolean;
}

export interface SpendingCategoryDataResponse {
  category: string;
  amount: number;
  color: string;
}

export interface CashFlowDataPointResponse {
  month: string;
  income: number;
  expenses: number;
}

export interface IncomeHistoryDataPointResponse {
  month: string;
  total: number;
  primary: number;
  secondary: number;
}

export interface ExpenseHistoryDataPointResponse {
  month: string;
  total: number;
  recurring: number;
  oneTime: number;
}

export interface BudgetVsActualDataPointResponse {
  category: string;
  budget: number;
  actual: number;
}

// =============================================================================
// GUIDES PAGE DATA TYPES
// =============================================================================

export interface GuidesPageDataResponse {
  guides: GuideDetailResponse[];
  stats: GuideStatsResponse;
  savingsOverTime: GuideSavingsDataResponse[];
  categories: string[];
  sources: string[];
}

export interface GuideDetailResponse {
  id: string;
  title: string;
  description: string | null;
  url: string;
  source: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  timeEstimate: string;
  rating: number | null;
  viewCount: number | null;
  isVideo: boolean;
  isBookmarked: boolean;
  progress: number | null;
  completedSteps: number | null;
  totalSteps: number | null;
  author: string | null;
  createdAt: string;
}

export interface GuideStatsResponse {
  completedCount: number;
  inProgressCount: number;
  savedCount: number;
  totalGuides: number;
  totalSaved: number;
  timeSaved: string;
}

export interface GuideSavingsDataResponse {
  month: string;
  saved: number;
  wouldCost: number;
}

// =============================================================================
// ISSUES PAGE DATA TYPES
// =============================================================================

export interface IssuesPageDataResponse {
  totalSaved: number;
  diyCount: number;
  proCount: number;
  activeIssueCount: number;
  issues: IssueWithDetails[];
  savingsOverTime: MonthlySavingsPoint[];
  categoryDistribution: CategoryCount[];
  resolutionBreakdown: IssueResolutionStats;
  groups: GroupOption[];
  categories: string[];
}

export interface IssueWithDetails {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string | null;
  groupId: string;
  groupName: string;
  createdAt: string;
  updatedAt: string;
  diagnosis: string | null;
  confidence: number | null;
  diyCost: number | null;
  proCost: number | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  savedAmount: number | null;
}

export interface MonthlySavingsPoint {
  month: string;
  savings: number;
  issues: number;
}

export interface CategoryCount {
  name: string;
  value: number;
  color: string;
}

export interface IssueResolutionStats {
  diy: number;
  pro: number;
  diySuccessRate: number;
}

export interface GroupOption {
  id: string;
  name: string;
}

// =============================================================================
// CALENDAR PAGE DATA TYPES
// =============================================================================

export interface CalendarPageDataResponse {
  events: CalendarEventDetail[];
  monthStats: CalendarMonthStats;
  upcomingExpenses: CalendarUpcomingExpense[];
  totalUpcomingExpenses: number;
  eventTypeDistribution: CalendarEventTypeDistribution[];
  weeklyActivity: CalendarWeeklyActivity[];
  monthlyComparison: CalendarMonthlyComparison[];
  upcomingEvents: CalendarEventDetail[];
  schedulableIssues: CalendarSchedulableIssue[];
}

export interface CalendarEventDetail {
  id: string;
  title: string;
  date: string;
  time: string | null;
  type: string;
  isRecurring: boolean;
  recurringPattern: string | null;
  location: string | null;
  assignee: string | null;
  notes: string | null;
  estimatedCost: number | null;
  reminder: string | null;
  linkedIssueId: string | null;
  linkedIssueTitle: string | null;
  groupId: string | null;
  groupName: string | null;
}

export interface CalendarMonthStats {
  scheduledEvents: number;
  completedEvents: number;
  proVisits: number;
  diyProjects: number;
  reminders: number;
}

export interface CalendarUpcomingExpense {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: "contractor" | "diy" | "reminder" | "income" | "expense";
}

export interface CalendarEventTypeDistribution {
  name: string;
  value: number;
  color: string;
}

export interface CalendarWeeklyActivity {
  week: string;
  events: number;
  expenses: number;
}

export interface CalendarMonthlyComparison {
  month: string;
  events: number;
  completed: number;
}

export interface CalendarSchedulableIssue {
  id: string;
  title: string;
  groupName: string;
  status: string;
}

// =============================================================================
// GROUPS PAGE DATA TYPES
// =============================================================================

export interface GroupsPageDataResponse {
  totalGroups: number;
  totalMembers: number;
  totalSavings: number;
  totalIssues: number;
  activeIssueCount: number;
  resolvedIssueCount: number;
  groups: GroupWithStats[];
  selectedGroup: GroupDetails | null;
}

export interface GroupWithStats {
  id: string;
  name: string;
  postalCode: string | null;
  role: string;
  memberCount: number;
  issueCount: number;
  activeIssueCount: number;
  resolvedCount: number;
  savings: number;
  members: GroupMemberPreview[];
  createdAt: string;
}

export interface GroupMemberPreview {
  id: string;
  name: string | null;
  avatar: string | null;
  role: string;
}

export interface GroupDetails {
  id: string;
  name: string;
  postalCode: string | null;
  role: string;
  createdAt: string;
  openIssueCount: number;
  resolvedCount: number;
  balance: number;
  savings: number;
  monthlyBudget: number | null;
  monthlySpent: number;
  emergencyFund: number | null;
  members: GroupMemberDetails[];
  pendingInvitations: GroupPendingInvitation[];
  budgetUsedPercent: number;
  diyRate: number;
  contributionData: MemberContribution[];
  monthlySavingsData: GroupMonthlySavings[];
  resolutionData: GroupResolutionData[];
  recentIssues: GroupRecentIssue[];
  recentActivity: GroupActivityItem[];
}

export interface GroupMemberDetails {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string;
  joinedAt: string | null;
  contributions: number;
  issuesCreated: number;
  issuesResolved: number;
}

export interface GroupPendingInvitation {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

export interface MemberContribution {
  name: string;
  value: number;
  color: string;
}

export interface GroupMonthlySavings {
  month: string;
  savings: number;
  spent: number;
}

export interface GroupResolutionData {
  name: string;
  diy: number;
  hired: number;
}

export interface GroupRecentIssue {
  id: string;
  title: string;
  category: string | null;
  status: string;
  priority: string;
  createdAt: string;
}

export interface GroupActivityItem {
  id: string;
  type: string;
  message: string;
  memberName: string | null;
  memberAvatar: string | null;
  savings: number | null;
  timestamp: string;
}

// =============================================================================
// DIAGNOSE PAGE DATA TYPES
// =============================================================================

export interface DiagnosePageDataResponse {
  issues: DiagnoseIssue[];
  currentIssue: DiagnoseIssueDetail | null;
}

export interface DiagnoseIssue {
  id: string;
  title: string;
  icon: string | null;
  iconColor: string;
  status: string;
  category: string | null;
  createdAt: string;
  isResolved: boolean;
  confidence: number | null;
}

export interface DiagnoseIssueDetail {
  id: string;
  title: string;
  icon: string | null;
  iconColor: string;
  status: string;
  category: string | null;
  createdAt: string;
  isResolved: boolean;
  diagnosis: string | null;
  difficulty: string;
  estimatedTime: string | null;
  diyCost: number | null;
  proCost: number | null;
  confidence: number;
  safetyNote: string | null;
  chatMessages: DiagnoseChatMessage[];
  guides: DiagnoseGuide[];
  parts: DiagnosePart[];
  pros: DiagnosePro[];
}

export interface DiagnoseChatMessage {
  id: string;
  role: string;
  content: string;
  hasImage: boolean;
  hasVoice: boolean;
  visionAnalysis: boolean;
  createdAt: string;
}

export interface DiagnoseGuide {
  id: string;
  source: string;
  title: string;
  url: string | null;
  duration: string | null;
  steps: number | null;
  rating: number | null;
  icon: string;
}

export interface DiagnosePart {
  id: string;
  name: string;
  price: number;
  store: string;
  distance: string | null;
  inStock: boolean;
  storeUrl: string | null;
}

export interface DiagnosePro {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  price: number;
  available: string | null;
  source: string;
  email: string | null;
  phone: string | null;
  specialty: string | null;
}

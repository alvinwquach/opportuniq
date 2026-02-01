/**
 * Dashboard GraphQL Type Definitions
 */

export const dashboardTypes = /* GraphQL */ `
  type DashboardStats {
    openIssues: Int!
    pendingDecisions: Int!
    diyProjectsCompleted: Int!
    totalSaved: String!
    activeGroups: Int!
    upcomingReminders: Int!
  }

  type ResolutionStats {
    totalResolved: Int!
    diyCount: Int!
    hiredCount: Int!
    replacedCount: Int!
    deferredCount: Int!
    totalSaved: String!
    averageSavings: String!
  }

  # Comprehensive dashboard data for the main dashboard view
  type DashboardData {
    # User info
    user: DashboardUser!

    # Financial summary
    financials: DashboardFinancials!

    # Stats cards
    stats: DashboardStatCards!

    # Pipeline summary
    pipelineSummary: PipelineSummary!

    # Issues and decisions
    openIssues: [DashboardIssue!]!
    safetyAlerts: [SafetyAlert!]!
    pendingDecisions: [PendingDecision!]!
    deferredDecisions: [DeferredDecision!]!

    # Groups
    groups: [DashboardGroup!]!

    # Calendar and reminders
    calendarEvents: [CalendarEvent!]!
    reminders: [Reminder!]!

    # Learning and outcomes
    activeGuides: [ActiveGuide!]!
    recentOutcomes: [RecentOutcome!]!
    outcomeSummary: OutcomeSummary!

    # Vendors and shopping
    pendingVendors: [PendingVendor!]!
    shoppingList: [ShoppingItem!]!

    # Spending
    spendingByCategory: [SpendingCategory!]!
    savingsOverTime: [MonthlySavings!]!

    # Activity
    recentActivity: [ActivityItem!]!

    # Location and weather
    userLocation: UserLocation
    weatherData: WeatherData
  }

  type DashboardUser {
    id: ID!
    name: String
    email: String!
    avatarUrl: String
    postalCode: String
    city: String
    latitude: Float
    longitude: Float
  }

  type DashboardFinancials {
    monthlyIncome: Float!
    annualIncome: Float!
    hourlyRate: Float!
    totalSpent: Float!
    remaining: Float!
    budgetUsedPercent: Float!
    totalBudget: Float!
  }

  type DashboardStatCards {
    activeIssues: Int!
    activeIssuesTrend: String
    pendingDecisions: Int!
    pendingDecisionsTrend: String
    totalSaved: Float!
    totalSavedTrend: String
    groupCount: Int!
    groupCountTrend: String
  }

  type PipelineSummary {
    open: Int!
    investigating: Int!
    optionsGenerated: Int!
    decided: Int!
    inProgress: Int!
    completed: Int!
    deferred: Int!
  }

  type DashboardIssue {
    id: ID!
    title: String!
    status: String!
    priority: String!
    groupName: String!
    groupId: ID!
    createdAt: DateTime!
  }

  type SafetyAlert {
    id: ID!
    title: String!
    severity: String!
    groupName: String!
    emergencyInstructions: String
  }

  type PendingDecision {
    id: ID!
    issueId: ID!
    title: String!
    priority: String!
    groupName: String!
    optionType: String
    costMin: Float
    costMax: Float
    timeEstimate: String
    voteCount: Int!
    totalMembers: Int!
  }

  type DeferredDecision {
    id: ID!
    title: String!
    revisitDate: DateTime
    reason: String
  }

  type DashboardGroup {
    id: ID!
    name: String!
    role: String!
    memberCount: Int!
    issueCount: Int!
    savings: Float!
  }

  type CalendarEvent {
    id: ID!
    title: String!
    date: String!
    time: String
    type: String!
    groupName: String
  }

  type Reminder {
    id: ID!
    issueId: ID
    title: String!
    groupName: String
    date: DateTime!
  }

  type ActiveGuide {
    id: ID!
    title: String!
    progress: Int!
    totalSteps: Int!
    completedSteps: Int!
  }

  type RecentOutcome {
    id: ID!
    issueTitle: String!
    success: Boolean!
    optionType: String!
    actualCost: Float
    costDelta: Float
  }

  type OutcomeSummary {
    diySuccessRate: Int!
    totalResolved: Int!
    avgCostDelta: Float!
    avgResolutionTimeDays: Float!
  }

  type PendingVendor {
    id: ID!
    vendorName: String!
    issueTitle: String
    rating: Float
    quoteAmount: Float
  }

  type ShoppingItem {
    id: ID!
    productName: String!
    storeName: String
    estimatedCost: Float
    inStock: Boolean
  }

  type SpendingCategory {
    category: String!
    amount: Float!
    color: String!
  }

  type MonthlySavings {
    month: String!
    savings: Float!
    diy: Float!
    hired: Float!
  }

  type ActivityItem {
    id: ID!
    message: String!
    time: String!
    avatar: String
    type: String
  }

  type UserLocation {
    postalCode: String
    city: String
    latitude: Float
    longitude: Float
  }

  type WeatherData {
    current: CurrentWeather
    daily: [DailyWeather!]
    airQuality: AirQuality
  }

  type CurrentWeather {
    temperature: Float!
    feelsLike: Float!
    humidity: Int!
    windSpeed: Float!
    weatherCode: Int!
    weatherDescription: String!
    isDay: Boolean!
    uvIndex: Int!
    precipitation: Float!
    visibility: Float!
  }

  type DailyWeather {
    date: String!
    temperatureMax: Float!
    temperatureMin: Float!
    precipitationProbability: Int!
    weatherCode: Int!
    weatherDescription: String!
    sunrise: String!
    sunset: String!
    windSpeedMax: Float!
    uvIndexMax: Int!
  }

  type AirQuality {
    aqi: Int!
    pm25: Float!
    pm10: Float!
    description: String!
  }
`;

export const dashboardQueries = /* GraphQL */ `
  extend type Query {
    "Get aggregated dashboard statistics"
    dashboardStats: DashboardStats!

    "Get resolution statistics for a group"
    groupResolutionStats(groupId: ID!, timeRange: String): ResolutionStats!

    "Get comprehensive dashboard data for the main dashboard view"
    dashboardData: DashboardData!
  }
`;

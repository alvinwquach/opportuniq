// Re-export all mock data from organized modules

// Stats and pipeline data
export {
  stats,
  pipeline,
  budgetCategories,
  savingsOverTime,
  outcomeSummary,
} from './stats';

// Issues and activity
export {
  issues,
  openIssues,
  safetyAlerts,
  recentActivity,
  recentOutcomes,
  deferredDecisions,
  issueAnalytics,
  resolutionTypeBreakdown,
} from './issues';

// Groups and households
export {
  households,
  groups,
  groupActivity,
  budgetContributions,
} from './groups';

// Guides and tutorials
export {
  guides,
  mixedGuides,
  guideSourceInfo,
  activeGuides,
  guideAnalytics,
} from './guides';
export type { GuideSource, MixedGuide } from './guides';

// Diagnose data
export { diagnoseData } from './diagnose';

// Calendar and reminders
export { calendarEvents, reminders } from './calendar';

// Finances
export { shoppingList, pendingVendors, recentExpenses } from './finances';

// Location and weather
export { mockWeatherData, mockUserLocation } from './location';

"use client";

import amplitude from "@/amplitude";

// ============================================
// ISSUE MANAGEMENT EVENTS
// ============================================

export function trackIssueCreated(props: {
  issueId: string;
  groupId: string;
  hasPhoto: boolean;
  hasDescription: boolean;
  inputMethod: "photo" | "voice" | "video" | "upload" | "manual";
}) {
  amplitude.track("Issue Created", props);
}

export function trackIssueViewed(props: {
  issueId: string;
  groupId: string;
  status: string;
}) {
  amplitude.track("Issue Viewed", props);
}

export function trackIssueStatusChanged(props: {
  issueId: string;
  groupId: string;
  fromStatus: string;
  toStatus: string;
}) {
  amplitude.track("Issue Status Changed", props);
}

// ============================================
// DECISION FLOW EVENTS
// ============================================

export function trackDecisionOptionsViewed(props: {
  issueId: string;
  groupId: string;
  optionCount: number;
}) {
  amplitude.track("Decision Options Viewed", props);
}

export function trackDecisionMade(props: {
  issueId: string;
  groupId: string;
  optionType: "diy" | "hire" | "defer" | "ignore";
  estimatedCost?: number;
  estimatedTime?: number;
}) {
  amplitude.track("Decision Made", props);
}

export function trackDecisionVoteCast(props: {
  issueId: string;
  groupId: string;
  optionId: string;
  voteType: "approve" | "reject";
}) {
  amplitude.track("Decision Vote Cast", props);
}

export function trackOutcomeRecorded(props: {
  issueId: string;
  groupId: string;
  success: boolean;
  actualCost?: number;
  costDelta?: number;
}) {
  amplitude.track("Outcome Recorded", props);
}

// ============================================
// GROUP MANAGEMENT EVENTS
// ============================================

export function trackGroupCreated(props: {
  groupId: string;
  hasZipCode: boolean;
}) {
  amplitude.track("Group Created", props);
}

export function trackGroupViewed(props: {
  groupId: string;
  memberCount: number;
}) {
  amplitude.track("Group Viewed", props);
}

export function trackMemberInvited(props: {
  groupId: string;
  inviteMethod: "email" | "link";
}) {
  amplitude.track("Member Invited", props);
}

export function trackMemberJoined(props: {
  groupId: string;
  joinMethod: "invite" | "link";
}) {
  amplitude.track("Member Joined", props);
}

export function trackGroupSettingsUpdated(props: {
  groupId: string;
  settingsChanged: string[];
}) {
  amplitude.track("Group Settings Updated", props);
}

// ============================================
// INCOME & BUDGET EVENTS
// ============================================

export function trackIncomeAdded(props: {
  frequency: string;
  hasDescription: boolean;
}) {
  amplitude.track("Income Added", props);
}

export function trackIncomeUpdated(props: {
  streamId: string;
  fieldsChanged: string[];
}) {
  amplitude.track("Income Updated", props);
}

export function trackIncomeDeleted(props: {
  streamId: string;
}) {
  amplitude.track("Income Deleted", props);
}

export function trackBudgetCategoryAdded(props: {
  category: string;
  monthlyLimit: number;
}) {
  amplitude.track("Budget Category Added", props);
}

export function trackExpenseAdded(props: {
  category: string;
  amount: number;
  isGroupExpense: boolean;
  groupId?: string;
}) {
  amplitude.track("Expense Added", props);
}

// ============================================
// CALENDAR EVENTS
// ============================================

export function trackCalendarViewed(props: {
  view: "week" | "month" | "full";
  eventCount: number;
}) {
  amplitude.track("Calendar Viewed", props);
}

export function trackEventScheduled(props: {
  eventType: "diy" | "contractor" | "reminder";
  issueId?: string;
  groupId?: string;
}) {
  amplitude.track("Event Scheduled", props);
}

export function trackEventRescheduled(props: {
  eventId: string;
  eventType: string;
}) {
  amplitude.track("Event Rescheduled", props);
}

// ============================================
// FEATURE DISCOVERY EVENTS
// ============================================

export function trackFeatureDiscovered(props: {
  feature: string;
  source: "sidebar" | "dashboard" | "search" | "onboarding" | "tooltip";
}) {
  amplitude.track("Feature Discovered", props);
}

export function trackSearchUsed(props: {
  query: string;
  resultCount: number;
  selectedResult?: string;
}) {
  amplitude.track("Search Used", props);
}

export function trackGuideStarted(props: {
  guideId: string;
  guideTitle: string;
}) {
  amplitude.track("Guide Started", props);
}

export function trackGuideCompleted(props: {
  guideId: string;
  guideTitle: string;
  completionTime?: number;
}) {
  amplitude.track("Guide Completed", props);
}

export function trackHelpAccessed(props: {
  source: "header" | "sidebar" | "user_menu" | "contextual";
  topic?: string;
}) {
  amplitude.track("Help Accessed", props);
}

// ============================================
// NAVIGATION EVENTS
// ============================================

export function trackPageViewed(props: {
  pageName: string;
  pageType: "dashboard" | "issue" | "group" | "settings" | "admin" | "other";
}) {
  amplitude.track("Page Viewed", props);
}

export function trackQuickActionUsed(props: {
  action: string;
  source: "sidebar" | "dashboard" | "command_palette";
}) {
  amplitude.track("Quick Action Used", props);
}

// ============================================
// ONBOARDING EVENTS
// ============================================

export function trackOnboardingStarted() {
  amplitude.track("Onboarding Started");
}

export function trackOnboardingStepCompleted(props: {
  step: number;
  stepName: string;
}) {
  amplitude.track("Onboarding Step Completed", props);
}

export function trackOnboardingCompleted(props: {
  totalTime?: number;
  skippedSteps?: string[];
}) {
  amplitude.track("Onboarding Completed", props);
}

// ============================================
// ENGAGEMENT EVENTS
// ============================================

export function trackNotificationClicked(props: {
  notificationType: string;
  notificationId: string;
}) {
  amplitude.track("Notification Clicked", props);
}

export function trackReportIssueModalOpened(props: {
  source: "sidebar" | "dashboard" | "quick_action" | "empty_state";
}) {
  amplitude.track("Report Issue Modal Opened", props);
}

export function trackInputMethodSelected(props: {
  method: "photo" | "voice" | "video" | "upload";
}) {
  amplitude.track("Input Method Selected", props);
}

import { getCachedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardData } from "./actions";
import {
  NewUserDashboard,
  DashboardHeader,
  PendingInvitationsAlert,
  SafetyAlertsSection,
  AIInsightsSection,
  PipelineSummarySection,
  PendingDecisionsSection,
  OpenIssuesSection,
  EmptyStateSection,
  GroupsSection,
  CalendarSection,
  LocationMapSection,
  BudgetGlanceCard,
  ThisWeekSection,
  DraftEmailCard,
  SavingsStatsSection,
  RemindersSection,
  DeferredDecisionsSection,
  GroupActivitySection,
  ActiveGuidesSection,
  RecentOutcomesSection,
  QuickActionsSection,
  RecentActivitySection,
} from "./components";

// Enable caching to speed up compilation
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Dashboard() {
  // Use cached getUser() - dedupes calls within the same request
  // Layout already validated, but we cache to prevent duplicate API calls
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  // Fetch data with error handling
  // Note: For users with groups, this may take 5-15 seconds due to complex queries
  // Consider implementing progressive loading in the future
  let data;
  try {
    data = await getDashboardData(user.id);
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    // For timeout or database errors, show a minimal dashboard
    // Don't redirect - let user see what they can
    if (error instanceof Error && error.message.includes("timeout")) {
      // Return minimal data structure to prevent crash
      data = {
        userProfile: null,
        activeGroups: [],
        pendingGroups: [],
        incomeStreams: [],
        budgets: [],
        financials: {
          monthlyIncome: 0,
          annualIncome: 0,
          hourlyRate: 0,
          totalSpent: 0,
          remaining: 0,
          budgetUsedPercent: 0,
          totalBudget: 0,
        },
        pendingDecisions: [],
        openIssues: [],
        recentActivity: [],
        spendingByCategory: [],
        hasIncomeSetup: false,
        activeGuides: [],
        upcomingReminders: [],
        savings: { totalSavings: 0, successfulDiyCount: 0 },
        groupFinances: [],
        calendarEvents: [],
        recentOutcomes: [],
        pendingVendors: [],
        shoppingList: [],
        personalBudgets: [],
        recentPersonalExpenses: [],
        safetyAlerts: [],
        aiInsights: [],
        mapVendors: [],
        mapStores: [],
        deferredDecisions: [],
        groupActivityFeed: [],
        pipelineSummary: {
          open: 0,
          investigating: 0,
          options_generated: 0,
          decided: 0,
          in_progress: 0,
          completed: 0,
          deferred: 0,
        },
      };
    } else {
      // For other errors, don't redirect to onboarding - user already exists
      // The layout already verified the user exists, so show minimal dashboard instead
      console.error("Dashboard data fetch failed (non-timeout):", error);
      // Use the same minimal data structure as timeout case - don't redirect
      data = {
        userProfile: null,
        activeGroups: [],
        pendingGroups: [],
        incomeStreams: [],
        budgets: [],
        financials: {
          monthlyIncome: 0,
          annualIncome: 0,
          hourlyRate: 0,
          totalSpent: 0,
          remaining: 0,
          budgetUsedPercent: 0,
          totalBudget: 0,
        },
        pendingDecisions: [],
        openIssues: [],
        recentActivity: [],
        spendingByCategory: [],
        hasIncomeSetup: false,
        activeGuides: [],
        upcomingReminders: [],
        savings: { totalSavings: 0, successfulDiyCount: 0 },
        groupFinances: [],
        calendarEvents: [],
        recentOutcomes: [],
        pendingVendors: [],
        shoppingList: [],
        personalBudgets: [],
        recentPersonalExpenses: [],
        safetyAlerts: [],
        aiInsights: [],
        mapVendors: [],
        mapStores: [],
        deferredDecisions: [],
        groupActivityFeed: [],
        pipelineSummary: {
          open: 0,
          investigating: 0,
          options_generated: 0,
          decided: 0,
          in_progress: 0,
          completed: 0,
          deferred: 0,
        },
      };
    }
  }

  const {
    userProfile,
    activeGroups,
    pendingGroups,
    incomeStreams,
    financials,
    pendingDecisions,
    openIssues,
    recentActivity,
    spendingByCategory,
    hasIncomeSetup,
    activeGuides,
    upcomingReminders,
    savings,
    groupFinances,
    calendarEvents,
    recentOutcomes,
    pendingVendors,
    shoppingList,
    personalBudgets,
    recentPersonalExpenses,
    safetyAlerts,
    aiInsights,
    deferredDecisions,
    groupActivityFeed,
    pipelineSummary,
  } = data;

  // Users are considered "new" only if they haven't completed basic onboarding
  // Having no groups doesn't make someone a new user - they should still see the full dashboard
  const isNewUser = !userProfile?.postalCode;
  const firstName = userProfile?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-screen bg-[#0c0c0c] overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 overflow-hidden">
        <DashboardHeader
          firstName={firstName}
          isNewUser={isNewUser}
          hasIncomeSetup={hasIncomeSetup}
          financials={financials}
        />
        <PendingInvitationsAlert pendingGroups={pendingGroups} />
        {isNewUser ? (
          <NewUserDashboard userProfile={userProfile} />
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Main Column - Actionable items and key information */}
            <div className="space-y-6 min-w-0">
              {/* New Issue input - always visible at top like marketing preview */}
              <EmptyStateSection />

              {/* Critical: Safety alerts always visible */}
              <SafetyAlertsSection alerts={safetyAlerts} />

              {/* AI-powered insights */}
              <AIInsightsSection insights={aiInsights} />

              {/* Pipeline overview - quick glance at all issues */}
              <PipelineSummarySection summary={pipelineSummary} />

              {/* Action required: Pending decisions */}
              <PendingDecisionsSection decisions={pendingDecisions} />

              {/* Needs attention: Open issues */}
              <OpenIssuesSection issues={openIssues} />

              {/* Groups overview - shows create prompt when empty */}
              <GroupsSection groups={activeGroups} />

              {/* Location and weather with setup prompt if needed */}
              {userProfile && <LocationMapSection userProfile={userProfile} />}
            </div>

            {/* Sidebar - At-a-glance cards and quick actions */}
            <div className="space-y-4 min-w-0">
              {/* Budget at a glance - shows income setup if not configured */}
              <BudgetGlanceCard
                financials={hasIncomeSetup ? financials : null}
                pendingDecisionsCount={pendingDecisions.length}
                userId={user.id}
              />

              {/* This week's schedule with weather */}
              <ThisWeekSection
                events={calendarEvents}
                postalCode={userProfile?.postalCode}
              />

              {/* Draft emails to vendors */}
              <DraftEmailCard vendors={pendingVendors} />

              {/* Savings motivation - only shows if user has saved money */}
              <SavingsStatsSection savings={savings} />

              {/* Upcoming reminders */}
              <RemindersSection reminders={upcomingReminders} />

              {/* Deferred decisions to revisit */}
              <DeferredDecisionsSection decisions={deferredDecisions} />

              {/* Group activity feed */}
              <GroupActivitySection activities={groupActivityFeed} />

              {/* Active DIY guides */}
              <ActiveGuidesSection guides={activeGuides} />

              {/* Recent outcomes for learning */}
              <RecentOutcomesSection outcomes={recentOutcomes} />

              {/* Quick actions */}
              <QuickActionsSection />

              {/* Recent activity log */}
              <RecentActivitySection activities={recentActivity} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

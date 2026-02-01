"use client";

import { useState } from "react";
import {
  stats,
  pipeline,
  calendarEvents,
  savingsOverTime,
  openIssues,
  safetyAlerts,
  groups,
  reminders,
  activeGuides,
  recentOutcomes,
  outcomeSummary,
  mockWeatherData,
  mockUserLocation,
} from "../mockData";
import {
  DashboardHeader,
  DashboardTabs,
  StatsGrid,
  SafetyAlertsCard,
  InsightsCard,
  GroupsCard,
  ContinueLearningCard,
  BudgetGlanceCard,
  QuickActionsCard,
  SavingsStatsCard,
  IssuesTab,
  PlanningTab,
  type DashboardTab,
} from "./dashboard";

export function DashboardView() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const totalSavings = savingsOverTime[savingsOverTime.length - 1].savings;
  const monthlyIncome = 7800;
  const totalSpent = 485;
  const remaining = 800 - totalSpent;
  const hourlyRate = 45;

  return (
    <div className="p-3 sm:p-4 lg:p-5 min-h-[calc(100vh-48px)] bg-[#111111]">
      <DashboardHeader
        hourlyRate={hourlyRate}
        monthlyIncome={monthlyIncome}
      />

      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Two Column Layout - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] gap-4 lg:gap-5">
        {/* Main Content */}
        <div className="space-y-4 min-w-0 order-2 lg:order-1">
          {/* Overview tab - High-level summary */}
          {activeTab === "overview" && (
            <>
              <StatsGrid stats={stats} />
              <SafetyAlertsCard alerts={safetyAlerts} />
              <InsightsCard outcomeSummary={outcomeSummary} />

              {/* Groups + Learning side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GroupsCard groups={groups} />
                <ContinueLearningCard guides={activeGuides} />
              </div>
            </>
          )}

          {/* Issues tab - Pipeline, decisions, outcomes */}
          {activeTab === "issues" && (
            <IssuesTab
              pipeline={pipeline}
              openIssues={openIssues}
              recentOutcomes={recentOutcomes}
            />
          )}

          {/* Planning tab - Weather, calendar, reminders */}
          {activeTab === "planning" && (
            <PlanningTab
              weather={mockWeatherData}
              location={mockUserLocation}
              calendarEvents={calendarEvents}
              reminders={reminders}
            />
          )}
        </div>

        {/* Sidebar - Contextual based on active tab */}
        <div className="space-y-3 min-w-0 order-1 lg:order-2">
          {/* Always show budget at a glance */}
          <BudgetGlanceCard
            totalSpent={totalSpent}
            remaining={remaining}
            budget={800}
            monthlyIncome={monthlyIncome}
            hourlyRate={hourlyRate}
          />

          <SavingsStatsCard
            savings={{ totalSavings, successfulDiyCount: 12 }}
          />

          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  BudgetGlanceCard,
  SavingsStatsCard,
  ThisWeekCard,
  QuickActionsCard,
  DeferredDecisionsCard,
  DraftEmailCard,
  LocationWeatherCard,
} from "@/components/landing/dashboard-preview/views/dashboard";
import type { AdaptedDashboardData, DashboardTab } from "../types";

interface SidebarProps {
  activeTab: DashboardTab;
  data: AdaptedDashboardData;
}

export function Sidebar({ activeTab, data }: SidebarProps) {
  const { financials, savings, calendarEvents, deferredDecisions, pendingVendors, weatherData, userLocation } = data;

  // Calculate budget values
  const budget = financials.totalBudget || financials.monthlyIncome * 0.2;
  const totalSpent = financials.totalSpent;
  const remaining = financials.remaining;

  return (
    <div className="space-y-3 min-w-0 order-1 lg:order-2">
      {/* Always show budget at a glance */}
      <BudgetGlanceCard
        totalSpent={totalSpent}
        remaining={remaining}
        budget={budget}
        monthlyIncome={financials.monthlyIncome}
        hourlyRate={financials.hourlyRate}
      />

      <SavingsStatsCard savings={savings} />

      {/* Overview tab sidebar */}
      {activeTab === "overview" && (
        <>
          <ThisWeekCard events={calendarEvents} />
          {weatherData?.daily && weatherData?.current && userLocation && (
            <div className="hidden lg:block">
              <LocationWeatherCard
                weather={weatherData}
                location={userLocation}
              />
            </div>
          )}
          <QuickActionsCard
            onReportIssue={() => {
              window.location.href = "/dashboard/projects";
            }}
            onScheduleDIY={() => {
              window.location.href = "/dashboard/calendar";
            }}
            onBrowseGuides={() => {
              window.location.href = "/dashboard/guides";
            }}
          />
        </>
      )}

      {/* Decisions tab sidebar */}
      {activeTab === "decisions" && (
        <>
          <DeferredDecisionsCard decisions={deferredDecisions} />
          <DraftEmailCard vendors={pendingVendors} />
          <QuickActionsCard
            onReportIssue={() => {
              window.location.href = "/dashboard/projects";
            }}
            onScheduleDIY={() => {
              window.location.href = "/dashboard/calendar";
            }}
            onBrowseGuides={() => {
              window.location.href = "/dashboard/guides";
            }}
          />
        </>
      )}

      {/* Spending tab sidebar */}
      {activeTab === "spending" && (
        <>
          <ThisWeekCard events={calendarEvents} />
          <QuickActionsCard
            onReportIssue={() => {
              window.location.href = "/dashboard/projects";
            }}
            onScheduleDIY={() => {
              window.location.href = "/dashboard/calendar";
            }}
            onBrowseGuides={() => {
              window.location.href = "/dashboard/guides";
            }}
          />
        </>
      )}
    </div>
  );
}

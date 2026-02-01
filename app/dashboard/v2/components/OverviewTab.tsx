"use client";

import Link from "next/link";
import {
  StatsGrid,
  SafetyAlertsCard,
  InsightsCard,
  PipelineCard,
  OpenIssuesCard,
  GroupsCard,
  ShoppingListCard,
  RemindersCard,
  ContinueLearningCard,
  RecentOutcomesCard,
  LocationWeatherCard,
} from "@/components/landing/dashboard-preview/views/dashboard";
import type { AdaptedDashboardData } from "../types";

interface OverviewTabProps {
  data: AdaptedDashboardData;
}

export function OverviewTab({ data }: OverviewTabProps) {
  return (
    <>
      <StatsGrid stats={data.stats} />

      <SafetyAlertsCard alerts={data.safetyAlerts} />

      <InsightsCard outcomeSummary={data.outcomeSummary} />

      <PipelineCard
        pipeline={data.pipeline}
        activeCount={data.pipelineActiveCount}
        completedCount={data.pipelineCompletedCount}
      />

      <OpenIssuesCard
        issues={data.openIssues}
        onViewAll={() => {
          // Navigate to issues page
          window.location.href = "/dashboard/issues";
        }}
      />

      {/* Location/Weather Card - Only on mobile (appears in sidebar on desktop) */}
      {data.weatherData?.daily && data.weatherData?.current && data.userLocation && (
        <div className="lg:hidden">
          <LocationWeatherCard
            weather={data.weatherData}
            location={data.userLocation}
          />
        </div>
      )}

      {/* Two column row: Groups + Shopping/Reminders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GroupsCard
          groups={data.groups}
          onAddNew={() => {
            window.location.href = "/dashboard/groups/new";
          }}
        />
        <div className="space-y-4">
          <ShoppingListCard items={data.shoppingList} />
          <RemindersCard reminders={data.reminders} />
        </div>
      </div>

      {/* Continue Learning + Recent Outcomes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ContinueLearningCard guides={data.activeGuides} />
        <RecentOutcomesCard outcomes={data.recentOutcomes} />
      </div>
    </>
  );
}

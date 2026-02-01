"use client";

/**
 * Main dashboard client. Renders after server has confirmed user and passed
 * new-user vs main-dashboard; this component is only shown for returning users.
 *
 * Data: Fetched via useDashboardData (GraphQL). Loading/error states use
 * DashboardSkeleton and DashboardError; same skeleton is used in
 * app/dashboard/loading.tsx for route-level loading.
 *
 * State: activeTab (UI-only) in useState; derived data via useMemo from
 * GraphQL response. No server data stored in state.
 */
import { useState, useMemo } from "react";
import { DashboardHeader, DashboardTabs } from "@/components/landing/dashboard-preview/views/dashboard";
import { OverviewTab, DecisionsTab, SpendingTab, Sidebar } from "./components";
import { useDashboardData } from "@/lib/graphql/hooks/dashboard";
import { adaptGraphQLDashboardData } from "./adapters";
import type { DashboardTab as TabType } from "./types";

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
        <div>
          <div className="h-5 w-48 bg-[#1a1a1a] rounded mb-2" />
          <div className="h-4 w-32 bg-[#1a1a1a] rounded" />
        </div>
        <div className="h-8 w-36 bg-[#1a1a1a] rounded-full" />
      </div>

      {/* Tabs skeleton */}
      <div className="h-10 w-96 bg-[#1a1a1a] rounded-lg mb-4" />

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-4 lg:gap-6">
        <div className="space-y-4 order-2 lg:order-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-[#1a1a1a] rounded-lg" />
            ))}
          </div>
          <div className="h-40 bg-[#1a1a1a] rounded-lg" />
          <div className="h-32 bg-[#1a1a1a] rounded-lg" />
        </div>
        <div className="space-y-3 order-1 lg:order-2">
          <div className="h-36 bg-[#1a1a1a] rounded-lg" />
          <div className="h-28 bg-[#1a1a1a] rounded-lg" />
          <div className="h-24 bg-[#1a1a1a] rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Error component
function DashboardError({ error }: { error: Error }) {
  return (
    <div className="p-6 min-h-[50vh] flex items-center justify-center">
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md text-center">
        <h3 className="text-lg font-semibold text-red-400 mb-2">
          Error Loading Dashboard
        </h3>
        <p className="text-sm text-[#888] mb-4">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export function DashboardClient() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Fetch dashboard data via GraphQL
  const { data, isLoading, error } = useDashboardData();

  // Adapt GraphQL data to demo component format
  const adaptedData = useMemo(() => {
    if (!data) return null;
    return adaptGraphQLDashboardData(data);
  }, [data]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <DashboardError error={error as Error} />;
  }

  if (!adaptedData) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <DashboardHeader
        userName={adaptedData.header.userName}
        hourlyRate={adaptedData.header.hourlyRate}
        monthlyIncome={adaptedData.header.monthlyIncome}
      />

      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Two Column Layout - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-4 lg:gap-6">
        {/* Main Content */}
        <div className="space-y-4 min-w-0 order-2 lg:order-1">
          {activeTab === "overview" && <OverviewTab data={adaptedData} />}
          {activeTab === "decisions" && <DecisionsTab data={adaptedData} />}
          {activeTab === "spending" && <SpendingTab data={adaptedData} />}
        </div>

        {/* Sidebar - Contextual based on active tab */}
        <Sidebar activeTab={activeTab} data={adaptedData} />
      </div>
    </div>
  );
}

export { DashboardSkeleton, DashboardError };

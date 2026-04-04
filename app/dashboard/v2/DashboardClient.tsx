// Tell React and Next.js to run this component in the browser (client-side),
// not on the server. Without this, hooks like useState/useMemo wouldn't work.
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

// Import useState to track which tab the user has selected (re-renders UI when it changes).
// Import useMemo to cache the result of transforming server data so we don't
// recompute the transformation on every single render.
import { useState, useMemo } from "react";

// DashboardHeader renders the user's name, hourly rate, and monthly income at the top.
import { DashboardHeader } from "@/components/landing/dashboard-preview/views/dashboard";

// DashboardTabs = the tab bar (Overview / Decisions / Spending).
// OverviewTab, DecisionsTab, SpendingTab = the content areas shown under each tab.
// Sidebar = the right-hand contextual panel.
import { DashboardTabs, OverviewTab, DecisionsTab, SpendingTab, Sidebar } from "./components";

// useDashboardData is a TanStack Query custom hook that fetches all dashboard data
// from the server (via GraphQL) and returns { data, isLoading, error }.
import { useDashboardData } from "@/lib/hooks/dashboard";

// adaptGraphQLDashboardData transforms the raw GraphQL response shape into the
// shape that the display components (OverviewTab, etc.) actually understand.
import { adaptGraphQLDashboardData } from "./adapters";

// DashboardTab is the TypeScript type for valid tab names ("overview" | "decisions" | "spending").
import type { DashboardTab } from "./types";

// DashboardSkeleton: a placeholder UI shown while data is still loading.
// It renders grey boxes in the same layout as the real dashboard so the page
// doesn't feel empty during the fetch.
function DashboardSkeleton() {
  return (
    // animate-pulse makes all the grey boxes gently fade in and out (loading shimmer effect).
    <div className="p-3 sm:p-4 lg:p-6 animate-pulse">
      {/* Header skeleton: two grey boxes that represent the title/subtitle and the action button. */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
        <div>
          {/* Placeholder for the heading text */}
          <div className="h-5 w-48 bg-gray-100 rounded mb-2" />
          {/* Placeholder for the subheading text */}
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
        {/* Placeholder for the header action button */}
        <div className="h-8 w-36 bg-gray-100 rounded-full" />
      </div>

      {/* Placeholder for the tab bar */}
      <div className="h-10 w-96 bg-gray-100 rounded-lg mb-4" />

      {/* Two-column content area: main content left, sidebar right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-4 lg:gap-6">
        {/* Left column: stat cards + content blocks */}
        <div className="space-y-4 order-2 lg:order-1">
          {/* Row of 4 stat card placeholders */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {/* Create an array of 4 items to map over; each produces one grey placeholder card. */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg" />
            ))}
          </div>
          {/* Placeholder for a medium content block */}
          <div className="h-40 bg-gray-100 rounded-lg" />
          {/* Placeholder for a smaller content block */}
          <div className="h-32 bg-gray-100 rounded-lg" />
        </div>
        {/* Right column: sidebar placeholders */}
        <div className="space-y-3 order-1 lg:order-2">
          {/* Three sidebar card placeholders of decreasing height */}
          <div className="h-36 bg-gray-100 rounded-lg" />
          <div className="h-28 bg-gray-100 rounded-lg" />
          <div className="h-24 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// DashboardError: shown when the data fetch fails.
// Receives the Error object so we can display its message.
function DashboardError({ error }: { error: Error }) {
  return (
    // Center the error card vertically and horizontally in at least half the viewport.
    <div className="p-6 min-h-[50vh] flex items-center justify-center">
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md text-center">
        <h3 className="text-lg font-semibold text-red-400 mb-2">
          Error Loading Dashboard
        </h3>
        {/* Show the specific error message, or a generic fallback if none is provided. */}
        <p className="text-sm text-gray-500 mb-4">
          {error.message || "An unexpected error occurred."}
        </p>
        {/* Clicking "Retry" reloads the entire browser page to re-trigger the data fetch. */}
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

// DashboardClient is the main page-level component for the dashboard.
// It orchestrates data fetching, loading/error states, and tab switching.
export function DashboardClient() {
  // Track which tab is active. Starts on "overview". Changing this causes
  // the component to re-render so the correct tab content is shown.
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Call the custom hook that fetches all dashboard data from the server via GraphQL.
  // isLoading = true while the request is in flight.
  // error    = an Error object if the request failed, otherwise null/undefined.
  // data     = the GraphQL response once the request succeeds.
  const { data, isLoading, error } = useDashboardData();

  // Transform the raw GraphQL response into the shape the display components expect.
  // useMemo caches this result so the transformation only runs again if "data" changes,
  // not on every re-render (e.g., when the user clicks a tab).
  const adaptedData = useMemo(() => {
    // If there's no data yet (still loading), return null so we know not to render.
    if (!data) return null;
    return adaptGraphQLDashboardData(data);
  }, [data]);

  // Guard: while the fetch is in progress, show the skeleton placeholder UI.
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Guard: if the fetch failed, show the error component with the error details.
  if (error) {
    return <DashboardError error={error as Error} />;
  }

  // Guard: if the fetch succeeded but the adapter returned null (shouldn't happen
  // in normal flow, but defensive coding), fall back to the skeleton.
  if (!adaptedData) {
    return <DashboardSkeleton />;
  }

  // Happy path: data is loaded and adapted — render the full dashboard UI.
  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Pass user name, hourly rate, and monthly income down to the header display component. */}
      <DashboardHeader
        userName={adaptedData.header.userName}
        hourlyRate={adaptedData.header.hourlyRate}
        monthlyIncome={adaptedData.header.monthlyIncome}
      />

      {/* The tab bar. activeTab is the currently selected tab; setActiveTab is called
          when the user clicks a different tab, updating state and re-rendering. */}
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Two-column layout: main content on the left, sidebar on the right.
          On mobile they stack vertically; on large screens they sit side by side. */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-4 lg:gap-6">
        {/* Main content area. Only one tab is rendered at a time via conditional rendering. */}
        <div className="space-y-4 min-w-0 order-2 lg:order-1">
          {/* Show the Overview tab content only when "overview" is the active tab. */}
          {activeTab === "overview" && <OverviewTab data={adaptedData} />}
          {/* Show the Decisions tab content only when "decisions" is the active tab. */}
          {activeTab === "decisions" && <DecisionsTab data={adaptedData} />}
          {/* Show the Spending tab content only when "spending" is the active tab. */}
          {activeTab === "spending" && <SpendingTab data={adaptedData} />}
        </div>

        {/* Sidebar panel. Receives both the active tab (so it can show contextual info)
            and the full adapted data (so it has everything it might need to display). */}
        <Sidebar activeTab={activeTab} data={adaptedData} />
      </div>
    </div>
  );
}

// Export the skeleton and error components so they can be reused elsewhere,
// for example in app/dashboard/loading.tsx for the route-level loading state.
export { DashboardSkeleton, DashboardError };

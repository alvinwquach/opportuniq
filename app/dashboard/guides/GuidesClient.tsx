// Tell React and Next.js to run this component in the browser (client-side),
// not on the server. Without this, hooks like useState/useMemo wouldn't work.
"use client";

// useState  = track pieces of UI state that cause a re-render when changed.
// useMemo   = cache expensive calculations so they only rerun when their inputs change.
import { useState, useMemo } from "react";

// TabType     = TypeScript type for the active tab ("all" | "in-progress" | "completed" | "saved").
// ViewMode    = TypeScript type for the display layout ("grid" | "list").
// SourceFilter = TypeScript type for which content source is active ("all" | "youtube" | "reddit" | etc.).
// Guide       = TypeScript type describing the shape of a single guide card.
import type { TabType, ViewMode, SourceFilter, Guide } from "./types";

// guideSourceInfo = a lookup object mapping source identifiers to display metadata
// (icon, label, color) — used by GuidesHeader to show how many sources are connected.
import { guideSourceInfo } from "./types";

// Import every presentational sub-component used on this page.
// GuidesSkeleton      = loading placeholder shown while data fetches.
// GuidesEmptyState    = message shown when the user has no guides at all.
// GuidesHeader        = top banner with source count, guide count, and time-saved stats.
// GuidesSearch        = search bar and view-mode toggle.
// GuidesTabs          = tab bar (All / In Progress / Completed / Saved).
// GuidesFilters       = source and category filter chips.
// GuidesList          = the main grid or list of guide cards.
// ProgressStats       = sidebar widget with completed/in-progress/saved counts.
// CompletionRate      = sidebar donut chart showing overall completion percentage.
// SavingsChart        = sidebar chart showing money saved over time.
// TimeSavedCard       = sidebar card showing total hours saved by completing guides.
// AITipCard           = sidebar card with an AI-generated tip for the user.
// ContinueWatching    = section for guides the user has started but not finished.
// FeaturedGuides      = section for highlighted/recommended guides.
// RecentlyCompleted   = section for guides the user just finished.
import {
  GuidesSkeleton,
  GuidesEmptyState,
  GuidesHeader,
  GuidesSearch,
  GuidesTabs,
  GuidesFilters,
  GuidesList,
  ProgressStats,
  CompletionRate,
  SavingsChart,
  TimeSavedCard,
  AITipCard,
  ContinueWatching,
  FeaturedGuides,
  RecentlyCompleted,
} from "./components";

// Pure utility functions that filter and slice the guides array.
// filterGuides        = applies search query, tab, source, and category filters.
// getUniqueCategories = extracts a deduplicated list of category strings from the guides.
// getFeaturedGuides   = returns the subset of guides marked as featured/recommended.
// getInProgressGuides = returns guides with progress > 0 and progress < 100.
// getCompletedGuides  = returns guides with progress === 100.
import {
  filterGuides,
  getUniqueCategories,
  getFeaturedGuides,
  getInProgressGuides,
  getCompletedGuides,
} from "./utils";

// useGuidesPageData   = TanStack Query hook that fetches all guides, categories,
//                       stats, and savings data from the server.
//                       Returns { data, isLoading, error }.
// useBookmarkGuide    = TanStack Query mutation hook to toggle a guide's bookmarked state.
// useTrackGuideClick  = TanStack Query mutation hook to log a guide click for analytics.
import { useGuidesPageData, useBookmarkGuide, useTrackGuideClick } from "@/lib/hooks/guides";

// GuideDetailResponse = TypeScript type describing the raw server response shape for one guide.
import type { GuideDetailResponse } from "@/lib/hooks/types";

// Convert a raw server response guide object (GuideDetailResponse) into the local Guide
// shape that the display components understand. This is needed because the server returns
// some fields (like createdAt) as strings, but the display components expect Date objects.
function transformToGuide(guide: GuideDetailResponse): Guide {
  return {
    id: guide.id,
    title: guide.title,
    description: guide.description,
    url: guide.url,
    // Cast source to the narrower union type the Guide interface expects.
    source: guide.source as Guide["source"],
    category: guide.category,
    difficulty: guide.difficulty,
    timeEstimate: guide.timeEstimate,
    rating: guide.rating,
    viewCount: guide.viewCount,
    isVideo: guide.isVideo,
    isBookmarked: guide.isBookmarked,
    progress: guide.progress,
    completedSteps: guide.completedSteps,
    // Default to 5 total steps if the server didn't provide a count.
    totalSteps: guide.totalSteps ?? 5,
    author: guide.author,
    // Convert the ISO date string into a JavaScript Date object.
    createdAt: new Date(guide.createdAt),
  };
}

// GuidesClient is the page-level shell component for the Guides section.
// It owns all data fetching, UI state, and passes data down to presentational components.
export function GuidesClient() {
  // Fetch all guides data from the server. While in flight, isLoading = true.
  // On failure, error is set. On success, data contains guides, stats, categories, etc.
  const { data, isLoading, error } = useGuidesPageData();

  // Mutation hook to bookmark/unbookmark a guide.
  // Calling bookmarkMutation.mutate(...) sends the request and updates the cache.
  const bookmarkMutation = useBookmarkGuide();

  // Mutation hook to record that the user clicked on a guide (for analytics/recommendations).
  const trackClickMutation = useTrackGuideClick();

  // Which tab is selected: "all", "in-progress", "completed", or "saved".
  // Changing this filters which guides appear in the main list.
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Whether the guides are shown in a grid layout or a list layout.
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // The currently selected category filter, or null if no category is selected.
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // The currently selected source filter ("all", "youtube", "reddit", etc.).
  const [selectedSource, setSelectedSource] = useState<SourceFilter>("all");

  // The text the user has typed into the search box.
  const [searchQuery, setSearchQuery] = useState("");

  // Transform every raw server guide into the local Guide shape.
  // useMemo caches the result so the map() doesn't run on every keystroke —
  // it only reruns when data.guides changes (i.e., after a fresh server fetch).
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const allGuides = useMemo(() => {
    // If data hasn't loaded yet, return an empty array so downstream code is safe.
    if (!data?.guides) return [];
    return data.guides.map(transformToGuide);
  }, [data?.guides]);

  // Apply all active filters (tab, search, source, category) to allGuides.
  // useMemo caches this so filtering only reruns when allGuides or any filter value changes.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const filteredGuides = useMemo(() => {
    return filterGuides(allGuides, {
      searchQuery,
      selectedCategory,
      selectedSource,
      activeTab,
    });
  }, [allGuides, searchQuery, selectedCategory, selectedSource, activeTab]);

  // Build the list of available category filter options.
  // Prefer the server-provided list (already deduplicated and sorted);
  // fall back to computing it client-side from the loaded guides.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const allCategories = useMemo(() => {
    if (data?.categories) return data.categories;
    return getUniqueCategories(allGuides);
  }, [data?.categories, allGuides]);

  // Derive sub-lists used by the special sections at the top of the main column.
  // Each useMemo recalculates only when allGuides changes.
  const featuredGuides = useMemo(() => getFeaturedGuides(allGuides), [allGuides]);
  const inProgressGuides = useMemo(() => getInProgressGuides(allGuides), [allGuides]);
  const completedGuides = useMemo(() => getCompletedGuides(allGuides), [allGuides]);

  // Use stats provided by the server if available; otherwise compute them locally
  // from the loaded guides array as a fallback.
  const stats = data?.stats ?? {
    completedCount: allGuides.filter((g) => g.progress === 100).length,
    inProgressCount: allGuides.filter((g) => g.progress && g.progress > 0 && g.progress < 100).length,
    savedCount: allGuides.filter((g) => g.isBookmarked).length,
    totalGuides: allGuides.length,
    totalSaved: 0,
    timeSaved: "0h",
  };

  // Savings chart data. Fall back to an empty array if the server didn't return any.
  const savingsData = data?.savingsOverTime ?? [];

  // The search handler — currently a no-op comment because search is handled reactively:
  // the searchQuery state already feeds into filteredGuides via useMemo, so no
  // explicit "trigger search" action is needed.
  const handleSearch = () => {
    // Search is done client-side via filterGuides
    // The searchQuery state already triggers filtering
  };

  // Reset every filter back to its default state so the user sees all guides again.
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSource("all");
    setActiveTab("all");
  };

  // Toggle the bookmarked state of a guide.
  // Looks up the guide first to read its current bookmarked value, then inverts it.
  const handleBookmark = async (guideId: string) => {
    const guide = allGuides.find((g) => g.id === guideId);
    // If the guide doesn't exist in local state (shouldn't happen), bail out safely.
    if (!guide) return;

    bookmarkMutation.mutate({
      guideId,
      // Send the inverse of the current bookmarked state.
      bookmarked: !guide.isBookmarked,
    });
  };

  // Record that the user clicked on a guide (for recommendations/analytics).
  const handleClick = async (guideId: string) => {
    trackClickMutation.mutate(guideId);
  };

  // Guard: while the server request is in flight, show the skeleton placeholder.
  if (isLoading) {
    return <GuidesSkeleton />;
  }

  // Guard: if the server request failed, show a simple error message.
  if (error) {
    return (
      <div className="p-6 min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load guides. Please try again.</p>
        </div>
      </div>
    );
  }

  // Determine whether to show the special curated sections (Continue Watching,
  // Recently Completed, Featured). These are only visible when the user is on the
  // "All" tab with no active search — showing them during a search would be confusing.
  const showSpecialSections = activeTab === "all" && !searchQuery;

  // Guard: if the user has no guides and hasn't typed a search query yet,
  // show the empty state with a call-to-action to browse guides.
  if (allGuides.length === 0 && !searchQuery) {
    return <GuidesEmptyState />;
  }

  // Happy path: data loaded, filters applied — render the full guides page.
  return (
    <div className="p-6 min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
      {/* Page header section */}
      <div className="mb-6">
        {/* GuidesHeader receives aggregate counts for the top banner display. */}
        <GuidesHeader
          sourcesCount={Object.keys(guideSourceInfo).length}
          guidesCount={stats.totalGuides}
          timeSaved={stats.timeSaved}
        />

        {/* Search bar and grid/list toggle.
            searchQuery and setSearchQuery are passed so the input is controlled.
            viewMode and setViewMode control the layout toggle buttons. */}
        <GuidesSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onSearch={handleSearch}
          isSearching={false}
        />
      </div>

      {/* Two-column layout: main content on the left, sidebar stats on the right. */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main content column */}
        <div className="space-y-6">
          {/* Tab bar: All / In Progress / Completed / Saved.
              allGuides is passed so each tab can show its count badge. */}
          <GuidesTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            guides={allGuides}
          />

          {/* Source and category filter chips below the tab bar. */}
          <GuidesFilters
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={allCategories}
          />

          {/* "Continue Watching" section: guides the user has started.
              Only visible on the "All" tab with no search active. */}
          {showSpecialSections && inProgressGuides.length > 0 && (
            <ContinueWatching guides={inProgressGuides} onClick={handleClick} />
          )}

          {/* "Recently Completed" section: guides the user just finished.
              Only visible on the "All" tab with no search active. */}
          {showSpecialSections && completedGuides.length > 0 && (
            <RecentlyCompleted guides={completedGuides} onClick={handleClick} />
          )}

          {/* "Featured Guides" section: highlighted/recommended guides.
              Only visible on the "All" tab with no search active. */}
          {showSpecialSections && featuredGuides.length > 0 && (
            <FeaturedGuides guides={featuredGuides} onClick={handleClick} />
          )}

          {/* The main guide card grid or list.
              Receives the filtered set of guides plus all the context needed
              to render empty states and handle user interactions. */}
          <GuidesList
            guides={filteredGuides}
            viewMode={viewMode}
            searchQuery={searchQuery}
            activeTab={activeTab}
            onClearFilters={handleClearFilters}
            onBookmark={handleBookmark}
            onClick={handleClick}
          />
        </div>

        {/* Right sidebar column with summary stats and charts */}
        <div className="space-y-4">
          {/* Three count badges: completed, in-progress, saved. */}
          <ProgressStats
            completedCount={stats.completedCount}
            inProgressCount={stats.inProgressCount}
            savedCount={stats.savedCount}
          />

          {/* Donut chart showing completion percentage out of total guides. */}
          <CompletionRate
            completed={stats.completedCount}
            inProgress={stats.inProgressCount}
            total={stats.totalGuides}
          />

          {/* Area chart showing money saved over time from completed guides. */}
          <SavingsChart data={savingsData} />

          {/* Card showing total time saved (e.g. "14h") by following guides. */}
          <TimeSavedCard timeSaved={stats.timeSaved} />

          {/* AI-generated tip card. No props needed; the component fetches its own tip. */}
          <AITipCard />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import type { TabType, ViewMode, SourceFilter, Guide } from "./types";
import { guideSourceInfo } from "./types";
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
import {
  filterGuides,
  getUniqueCategories,
  getFeaturedGuides,
  getInProgressGuides,
  getCompletedGuides,
} from "./utils";
import { useGuidesPageData, useBookmarkGuide, useTrackGuideClick } from "@/lib/graphql/hooks/guides";
import type { GuideDetailResponse } from "@/lib/graphql/types";

// Transform GraphQL guide data to local Guide format
function transformToGuide(guide: GuideDetailResponse): Guide {
  return {
    id: guide.id,
    title: guide.title,
    description: guide.description,
    url: guide.url,
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
    totalSteps: guide.totalSteps ?? 5,
    author: guide.author,
    createdAt: new Date(guide.createdAt),
  };
}

export function GuidesClient() {
  // Fetch data via GraphQL
  const { data, isLoading, error } = useGuidesPageData();
  const bookmarkMutation = useBookmarkGuide();
  const trackClickMutation = useTrackGuideClick();

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Transform guides to local format
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const allGuides = useMemo(() => {
    if (!data?.guides) return [];
    return data.guides.map(transformToGuide);
  }, [data?.guides]);

  // Computed values
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const filteredGuides = useMemo(() => {
    return filterGuides(allGuides, {
      searchQuery,
      selectedCategory,
      selectedSource,
      activeTab,
    });
  }, [allGuides, searchQuery, selectedCategory, selectedSource, activeTab]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const allCategories = useMemo(() => {
    if (data?.categories) return data.categories;
    return getUniqueCategories(allGuides);
  }, [data?.categories, allGuides]);

  const featuredGuides = useMemo(() => getFeaturedGuides(allGuides), [allGuides]);
  const inProgressGuides = useMemo(() => getInProgressGuides(allGuides), [allGuides]);
  const completedGuides = useMemo(() => getCompletedGuides(allGuides), [allGuides]);

  // Use stats from GraphQL or compute from guides
  const stats = data?.stats ?? {
    completedCount: allGuides.filter((g) => g.progress === 100).length,
    inProgressCount: allGuides.filter((g) => g.progress && g.progress > 0 && g.progress < 100).length,
    savedCount: allGuides.filter((g) => g.isBookmarked).length,
    totalGuides: allGuides.length,
    totalSaved: 0,
    timeSaved: "0h",
  };

  // Use savings data from GraphQL
  const savingsData = data?.savingsOverTime ?? [];

  // Handlers
  const handleSearch = () => {
    // Search is done client-side via filterGuides
    // The searchQuery state already triggers filtering
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSource("all");
    setActiveTab("all");
  };

  const handleBookmark = async (guideId: string) => {
    const guide = allGuides.find((g) => g.id === guideId);
    if (!guide) return;

    bookmarkMutation.mutate({
      guideId,
      bookmarked: !guide.isBookmarked,
    });
  };

  const handleClick = async (guideId: string) => {
    trackClickMutation.mutate(guideId);
  };

  // Loading state
  if (isLoading) {
    return <GuidesSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load guides. Please try again.</p>
        </div>
      </div>
    );
  }

  // Check if showing special sections (only on "all" tab with no search)
  const showSpecialSections = activeTab === "all" && !searchQuery;

  // Empty state
  if (allGuides.length === 0 && !searchQuery) {
    return <GuidesEmptyState />;
  }

  return (
    <div className="p-6 min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
      {/* Header */}
      <div className="mb-6">
        <GuidesHeader
          sourcesCount={Object.keys(guideSourceInfo).length}
          guidesCount={stats.totalGuides}
          timeSaved={stats.timeSaved}
        />

        {/* Search */}
        <GuidesSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onSearch={handleSearch}
          isSearching={false}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Tabs */}
          <GuidesTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            guides={allGuides}
          />

          {/* Source & Category Filters */}
          <GuidesFilters
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={allCategories}
          />

          {/* Continue Watching Section (In Progress Guides) */}
          {showSpecialSections && inProgressGuides.length > 0 && (
            <ContinueWatching guides={inProgressGuides} onClick={handleClick} />
          )}

          {/* Recently Completed Section */}
          {showSpecialSections && completedGuides.length > 0 && (
            <RecentlyCompleted guides={completedGuides} onClick={handleClick} />
          )}

          {/* Featured Guides */}
          {showSpecialSections && featuredGuides.length > 0 && (
            <FeaturedGuides guides={featuredGuides} onClick={handleClick} />
          )}

          {/* Guides Grid/List */}
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

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <ProgressStats
            completedCount={stats.completedCount}
            inProgressCount={stats.inProgressCount}
            savedCount={stats.savedCount}
          />

          {/* Completion Rate Donut */}
          <CompletionRate
            completed={stats.completedCount}
            inProgress={stats.inProgressCount}
            total={stats.totalGuides}
          />

          {/* Savings Chart */}
          <SavingsChart data={savingsData} />

          {/* Time Saved */}
          <TimeSavedCard timeSaved={stats.timeSaved} />

          {/* AI Tip */}
          <AITipCard />
        </div>
      </div>
    </div>
  );
}

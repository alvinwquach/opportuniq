"use client";

import { useState } from "react";
import { mixedGuides, guideSourceInfo, guideAnalytics } from "../../mockData";
import type { TabType, SourceFilter, ViewMode } from "./types";
import {
  filterGuides,
  getUniqueCategories,
  getFeaturedGuides,
  getInProgressGuides,
  getCompletedGuides,
} from "./utils";

// Import components
import { GuidesHeader } from "./GuidesHeader";
import { GuidesSearch } from "./GuidesSearch";
import { GuidesTabs } from "./GuidesTabs";
import { GuidesFilters } from "./GuidesFilters";
import { FeaturedGuides } from "./FeaturedGuides";
import { ContinueWatching } from "./ContinueWatching";
import { RecentlyCompleted } from "./RecentlyCompleted";
import { GuidesList } from "./GuidesList";
import { AllGuidesSidebar } from "./AllGuidesSidebar";
import { FeaturedSidebar } from "./FeaturedSidebar";
import { ActiveGuidesSidebar } from "./ActiveGuidesSidebar";
import { CompletedGuidesSidebar } from "./CompletedGuidesSidebar";
import { BookmarkedGuidesSidebar } from "./BookmarkedGuidesSidebar";
import { MediaGuidesSidebar } from "./MediaGuidesSidebar";

export function GuidesView() {
  // State
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Computed values
  const filteredGuides = filterGuides(mixedGuides, {
    searchQuery,
    selectedCategory,
    selectedSource,
    activeTab,
  });

  const allCategories = getUniqueCategories(mixedGuides);
  const featuredGuides = getFeaturedGuides(mixedGuides);
  const inProgressGuides = getInProgressGuides(mixedGuides);
  const completedGuides = getCompletedGuides(mixedGuides);

  // Stats counts
  const completedCount = mixedGuides.filter((g) => g.progress === 100).length;
  const inProgressCount = mixedGuides.filter((g) => g.progress && g.progress > 0 && g.progress < 100).length;
  const savedCount = mixedGuides.filter((g) => g.isBookmarked).length;

  // Handlers
  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSource("all");
    setActiveTab("all");
  };

  // Check if showing special sections per tab
  const showContinueWatching = activeTab === "active" && inProgressGuides.length > 0;
  const showRecentlyCompleted = activeTab === "completed" && completedGuides.length > 0;
  const showFeatured = activeTab === "featured" && featuredGuides.length > 0;

  return (
    <div className="p-3 sm:p-4 lg:p-6 min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <GuidesHeader
          sourcesCount={Object.keys(guideSourceInfo).length}
          guidesCount={mixedGuides.length}
          timeSaved={guideAnalytics.timeSaved}
        />

        {/* Search */}
        <GuidesSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onSearch={handleSearch}
          isSearching={isSearching}
        />
      </div>

      {/* Two Column Layout - sidebar hidden on mobile/tablet */}
      <div className="grid xl:grid-cols-[1fr_280px] gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          {/* Tabs */}
          <GuidesTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            guides={mixedGuides}
          />

          {/* Source & Category Filters */}
          <GuidesFilters
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={allCategories}
          />

          {/* Continue Watching Section (Active tab only) */}
          {showContinueWatching && (
            <ContinueWatching guides={inProgressGuides} />
          )}

          {/* Recently Completed Section (Completed tab only) */}
          {showRecentlyCompleted && (
            <RecentlyCompleted guides={completedGuides} />
          )}

          {/* Featured Guides (Featured tab only) */}
          {showFeatured && (
            <FeaturedGuides guides={featuredGuides} />
          )}

          {/* Guides Grid/List */}
          <GuidesList
            guides={filteredGuides}
            viewMode={viewMode}
            searchQuery={searchQuery}
            activeTab={activeTab}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Right Sidebar - Hidden on mobile/tablet, shown on xl screens */}
        <div className="hidden xl:block min-w-0">
          {activeTab === "all" && (
            <AllGuidesSidebar
              completedCount={completedCount}
              inProgressCount={inProgressCount}
              savedCount={savedCount}
              timeSaved={guideAnalytics.timeSaved}
            />
          )}
          {activeTab === "featured" && (
            <FeaturedSidebar featuredGuides={featuredGuides} />
          )}
          {activeTab === "active" && (
            <ActiveGuidesSidebar inProgressGuides={inProgressGuides} />
          )}
          {activeTab === "completed" && (
            <CompletedGuidesSidebar
              completedGuides={completedGuides}
              totalSaved={1190}
              timeSaved={guideAnalytics.timeSaved}
            />
          )}
          {activeTab === "bookmarked" && (
            <BookmarkedGuidesSidebar
              bookmarkedGuides={mixedGuides.filter(g => g.isBookmarked)}
            />
          )}
          {activeTab === "videos" && (
            <MediaGuidesSidebar
              guides={mixedGuides.filter(g => g.isVideo)}
              mediaType="videos"
            />
          )}
          {activeTab === "articles" && (
            <MediaGuidesSidebar
              guides={mixedGuides.filter(g => !g.isVideo)}
              mediaType="articles"
            />
          )}
        </div>
      </div>
    </div>
  );
}

import type { Guide, TabType, SourceFilter, CategoryColorConfig } from "./types";
import { categoryColors, defaultCategoryColor } from "./types";

/**
 * Format view count into human-readable format
 */
export function formatViewCount(count?: number | null): string {
  if (!count) return "";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K views`;
  return `${count} views`;
}

/**
 * Get category color configuration
 */
export function getCategoryColors(category: string): CategoryColorConfig {
  return categoryColors[category] || defaultCategoryColor;
}

/**
 * Check if guide is in progress
 */
export function isGuideInProgress(guide: Guide): boolean {
  return Boolean(guide.progress && guide.progress > 0 && guide.progress < 100);
}

/**
 * Check if guide is completed
 */
export function isGuideCompleted(guide: Guide): boolean {
  return guide.progress === 100;
}

/**
 * Filter guides based on search query, category, source, and tab
 */
export function filterGuides(
  guides: Guide[],
  options: {
    searchQuery?: string;
    selectedCategory?: string | null;
    selectedSource?: SourceFilter;
    activeTab?: TabType;
  }
): Guide[] {
  const { searchQuery, selectedCategory, selectedSource, activeTab } = options;

  return guides.filter((guide) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !guide.title.toLowerCase().includes(query) &&
        !guide.description?.toLowerCase().includes(query) &&
        !guide.category.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory && guide.category !== selectedCategory) {
      return false;
    }

    // Source filter
    if (selectedSource && selectedSource !== "all" && guide.source !== selectedSource) {
      return false;
    }

    // Tab filters
    if (activeTab === "active") return isGuideInProgress(guide);
    if (activeTab === "completed") return isGuideCompleted(guide);
    if (activeTab === "bookmarked") return Boolean(guide.isBookmarked);
    if (activeTab === "videos") return Boolean(guide.isVideo);
    if (activeTab === "articles") return !guide.isVideo;

    return true;
  });
}

/**
 * Get unique categories from guides
 */
export function getUniqueCategories(guides: Guide[]): string[] {
  return Array.from(new Set(guides.map((g) => g.category)));
}

/**
 * Get featured guides (high rating, not started)
 */
export function getFeaturedGuides(guides: Guide[], limit = 2): Guide[] {
  return guides
    .filter((g) => !g.progress && g.rating && g.rating >= 4.5)
    .slice(0, limit);
}

/**
 * Get in-progress guides sorted by progress (most progress first)
 */
export function getInProgressGuides(guides: Guide[]): Guide[] {
  return guides
    .filter(isGuideInProgress)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0));
}

/**
 * Get completed guides
 */
export function getCompletedGuides(guides: Guide[]): Guide[] {
  return guides.filter(isGuideCompleted);
}

/**
 * Get tab counts for all tabs
 */
export function getTabCounts(guides: Guide[]): Record<TabType, number> {
  return {
    all: guides.length,
    active: guides.filter(isGuideInProgress).length,
    completed: guides.filter(isGuideCompleted).length,
    bookmarked: guides.filter((g) => g.isBookmarked).length,
    videos: guides.filter((g) => g.isVideo).length,
    articles: guides.filter((g) => !g.isVideo).length,
  };
}

/**
 * Get guide action text based on state
 */
export function getGuideActionText(guide: Guide): string {
  if (guide.isVideo) return "Watch";
  if (isGuideInProgress(guide)) return "Continue";
  if (isGuideCompleted(guide)) return "Review";
  return "Start";
}

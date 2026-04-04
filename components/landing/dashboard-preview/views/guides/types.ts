import type { GuideSource, MixedGuide } from "../../mockData";

// Tab types for guide navigation
export type TabType = "all" | "featured" | "active" | "completed" | "bookmarked" | "videos" | "articles";

// Source filter type
export type SourceFilter = "all" | GuideSource;

// View mode type
export type ViewMode = "grid" | "list";

// Difficulty levels
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// Category color configuration
export interface CategoryColorConfig {
  bg: string;
  text: string;
  icon: string;
}

// Category colors mapping
export const categoryColors: Record<string, CategoryColorConfig> = {
  Plumbing: { bg: "bg-blue-100", text: "text-blue-600", icon: "P" },
  HVAC: { bg: "bg-blue-100", text: "text-blue-600", icon: "H" },
  Garage: { bg: "bg-amber-500/20", text: "text-amber-400", icon: "G" },
  Electrical: { bg: "bg-red-500/20", text: "text-red-400", icon: "E" },
  Appliances: { bg: "bg-blue-100", text: "text-blue-600", icon: "A" },
};

// Default category color config
export const defaultCategoryColor: CategoryColorConfig = {
  bg: "bg-[#333]",
  text: "text-gray-500",
  icon: "G",
};

// Difficulty badge configuration
export const difficultyConfig: Record<DifficultyLevel, { label: string; color: string; bgColor: string }> = {
  beginner: { label: "Easy", color: "text-blue-600", bgColor: "bg-blue-100" },
  intermediate: { label: "Medium", color: "text-amber-400", bgColor: "bg-amber-500/20" },
  advanced: { label: "Hard", color: "text-red-400", bgColor: "bg-red-500/20" },
};

// Tooltip styles for all charts (consistent styling)
export const tooltipStyles = {
  wrapperStyle: { zIndex: 1000 },
  contentStyle: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    fontSize: "12px",
  },
  itemStyle: { color: "#fff" },
  labelStyle: { color: "#888" },
};

// Tab configuration
export interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  getCount: (guides: MixedGuide[]) => number;
}

// Guide filter function type
export type GuideFilterFn = (guide: MixedGuide) => boolean;

// Props interfaces for components
export interface GuidesHeaderProps {
  sourcesCount: number;
  guidesCount: number;
  timeSaved: string;
}

export interface GuidesSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onSearch: () => void;
  isSearching: boolean;
}

export interface GuidesTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  guides: MixedGuide[];
}

export interface GuidesFiltersProps {
  selectedSource: SourceFilter;
  setSelectedSource: (source: SourceFilter) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  categories: string[];
}

export interface GuideCardProps {
  guide: MixedGuide;
  viewMode: ViewMode;
}

export interface GuidesListProps {
  guides: MixedGuide[];
  viewMode: ViewMode;
  searchQuery: string;
  activeTab: TabType;
  onClearFilters: () => void;
}

export interface FeaturedGuidesProps {
  guides: MixedGuide[];
}

export interface ContinueWatchingProps {
  guides: MixedGuide[];
}

export interface RecentlyCompletedProps {
  guides: MixedGuide[];
}

export interface ProgressStatsProps {
  completedCount: number;
  inProgressCount: number;
  savedCount: number;
}

export interface TimeSavedCardProps {
  timeSaved: string;
}

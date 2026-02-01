/**
 * Types for the Guides page
 */

// Tab types for guide navigation
export type TabType = "all" | "active" | "completed" | "bookmarked" | "videos" | "articles";

// Source filter type
export type SourceFilter = "all" | GuideSource;

// View mode type
export type ViewMode = "grid" | "list";

// Difficulty levels
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// Guide sources
export type GuideSource =
  | "youtube"
  | "ifixit"
  | "thisOldHouse"
  | "familyHandyman"
  | "reddit"
  | "instructables"
  | "other";

// Category color configuration
export interface CategoryColorConfig {
  bg: string;
  text: string;
  icon: string;
}

// Category colors mapping
export const categoryColors: Record<string, CategoryColorConfig> = {
  Plumbing: { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: "💧" },
  HVAC: { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: "❄️" },
  Garage: { bg: "bg-amber-500/20", text: "text-amber-400", icon: "🚗" },
  Electrical: { bg: "bg-red-500/20", text: "text-red-400", icon: "⚡" },
  Appliances: { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: "🔌" },
  Automotive: { bg: "bg-blue-500/20", text: "text-blue-400", icon: "🚙" },
  Outdoor: { bg: "bg-green-500/20", text: "text-green-400", icon: "🌳" },
  Cleaning: { bg: "bg-cyan-500/20", text: "text-cyan-400", icon: "🧹" },
};

// Default category color config
export const defaultCategoryColor: CategoryColorConfig = {
  bg: "bg-[#333]",
  text: "text-[#888]",
  icon: "📖",
};

// Difficulty badge configuration
export const difficultyConfig: Record<DifficultyLevel, { label: string; color: string; bgColor: string }> = {
  beginner: { label: "Easy", color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
  intermediate: { label: "Medium", color: "text-amber-400", bgColor: "bg-amber-500/20" },
  advanced: { label: "Hard", color: "text-red-400", bgColor: "bg-red-500/20" },
};

// Guide source info
export const guideSourceInfo: Record<GuideSource, { name: string; icon: string; color: string }> = {
  youtube: { name: "YouTube", icon: "▶️", color: "#ff0000" },
  ifixit: { name: "iFixit", icon: "🔧", color: "#0071ce" },
  thisOldHouse: { name: "This Old House", icon: "🏠", color: "#0066cc" },
  familyHandyman: { name: "Family Handyman", icon: "🔨", color: "#c8232c" },
  reddit: { name: "Reddit", icon: "📱", color: "#ff4500" },
  instructables: { name: "Instructables", icon: "📝", color: "#fab306" },
  other: { name: "Other", icon: "📖", color: "#666666" },
};

// Tooltip styles for charts
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

// Guide interface
export interface Guide {
  id: string;
  title: string;
  description: string | null;
  url: string;
  source: GuideSource;
  category: string;
  difficulty: DifficultyLevel;
  timeEstimate: string;
  rating: number | null;
  viewCount: number | null;
  isVideo: boolean;
  isBookmarked: boolean;
  progress: number | null;
  completedSteps: number | null;
  totalSteps: number | null;
  author: string | null;
  createdAt: Date;
}

// Analytics data types
export interface GuideSavingsData {
  month: string;
  saved: number;
  wouldCost: number;
}

export interface GuideStats {
  completedCount: number;
  inProgressCount: number;
  savedCount: number;
  totalGuides: number;
  totalSaved: number;
  timeSaved: string;
}

// Page data response
export interface GuidesPageData {
  guides: Guide[];
  stats: GuideStats;
  savingsOverTime: GuideSavingsData[];
  categories: string[];
  sources: GuideSource[];
}

// Props interfaces
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
  guides: Guide[];
}

export interface GuidesFiltersProps {
  selectedSource: SourceFilter;
  setSelectedSource: (source: SourceFilter) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  categories: string[];
}

export interface GuideCardProps {
  guide: Guide;
  viewMode: ViewMode;
  onBookmark?: (id: string) => void;
  onClick?: (id: string) => void;
}

export interface GuidesListProps {
  guides: Guide[];
  viewMode: ViewMode;
  searchQuery: string;
  activeTab: TabType;
  onClearFilters: () => void;
  onBookmark?: (id: string) => void;
  onClick?: (id: string) => void;
}

export interface ProgressStatsProps {
  completedCount: number;
  inProgressCount: number;
  savedCount: number;
}

export interface TimeSavedCardProps {
  timeSaved: string;
}

export interface CompletionRateProps {
  completed: number;
  inProgress: number;
  total: number;
}

export interface SavingsChartProps {
  data: GuideSavingsData[];
}

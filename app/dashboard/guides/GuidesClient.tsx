"use client";

import { useState, useTransition } from "react";
import {
  IoSearch,
  IoBookmark,
  IoBookmarkOutline,
  IoTime,
  IoThumbsUp,
  IoArrowUpCircle,
  IoChatbubbleOutline,
  IoOpenOutline,
  IoBookOutline,
} from "react-icons/io5";
import { SiReddit } from "react-icons/si";
import { searchGuides, toggleGuideBookmark, markGuideClicked, type GuideSearchResult } from "./actions";

interface GuidesClientProps {
  initialBookmarked: GuideSearchResult[];
  initialRecent: GuideSearchResult[];
  initialHelpful: GuideSearchResult[];
}

const sourceConfig: Record<string, { icon: typeof IoBookOutline; color: string; bgColor: string; label: string }> = {
  reddit: { icon: SiReddit, color: "#ff4500", bgColor: "#ff450015", label: "Reddit" },
  diy_stackexchange: { icon: IoBookOutline, color: "#f48024", bgColor: "#f4802415", label: "DIY Stack Exchange" },
  instructables: { icon: IoBookOutline, color: "#fab306", bgColor: "#fab30615", label: "Instructables" },
  family_handyman: { icon: IoBookOutline, color: "#c8232c", bgColor: "#c8232c15", label: "Family Handyman" },
  this_old_house: { icon: IoBookOutline, color: "#0066cc", bgColor: "#0066cc15", label: "This Old House" },
  bob_vila: { icon: IoBookOutline, color: "#2e7d32", bgColor: "#2e7d3215", label: "Bob Vila" },
  doityourself: { icon: IoBookOutline, color: "#e91e63", bgColor: "#e91e6315", label: "DoItYourself" },
  hometalk: { icon: IoBookOutline, color: "#00bcd4", bgColor: "#00bcd415", label: "Hometalk" },
  diy_chatroom: { icon: IoBookOutline, color: "#9c27b0", bgColor: "#9c27b015", label: "DIY Chatroom" },
  other: { icon: IoBookOutline, color: "#5eead4", bgColor: "#5eead415", label: "Other" },
};

function GuideCard({
  guide,
  onBookmark,
  onClick,
}: {
  guide: GuideSearchResult;
  onBookmark: (id: string) => void;
  onClick: (id: string) => void;
}) {
  const config = sourceConfig[guide.source] || sourceConfig.other;
  const Icon = config.icon;

  return (
    <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors group">
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: config.bgColor }}
        >
          <Icon className="w-5 h-5" style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <a
              href={guide.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onClick(guide.id)}
              className="flex-1"
            >
              <h3 className="text-sm font-medium text-white group-hover:text-[#5eead4] transition-colors line-clamp-2">
                {guide.title}
              </h3>
            </a>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onBookmark(guide.id)}
                className="p-1.5 rounded-lg hover:bg-[#1f1f1f] transition-colors"
                title={guide.wasBookmarked ? "Remove bookmark" : "Bookmark"}
              >
                {guide.wasBookmarked ? (
                  <IoBookmark className="w-4 h-4 text-[#5eead4]" />
                ) : (
                  <IoBookmarkOutline className="w-4 h-4 text-[#666] hover:text-[#5eead4]" />
                )}
              </button>
              <a
                href={guide.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onClick(guide.id)}
                className="p-1.5 rounded-lg hover:bg-[#1f1f1f] transition-colors"
              >
                <IoOpenOutline className="w-4 h-4 text-[#666] group-hover:text-[#5eead4]" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-[#666]">
              {guide.subreddit ? `r/${guide.subreddit}` : config.label}
            </span>
            {guide.upvotes && (
              <div className="flex items-center gap-1 text-xs text-[#666]">
                <IoArrowUpCircle className="w-3.5 h-3.5" />
                {guide.upvotes}
              </div>
            )}
            {guide.commentCount && (
              <div className="flex items-center gap-1 text-xs text-[#666]">
                <IoChatbubbleOutline className="w-3.5 h-3.5" />
                {guide.commentCount}
              </div>
            )}
            {guide.issueCategory && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#1f1f1f] text-[#888]">
                {guide.issueCategory}
              </span>
            )}
          </div>

          {guide.excerpt && (
            <p className="text-xs text-[#555] mt-2 line-clamp-2">{guide.excerpt}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof IoBookmark; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 rounded-full bg-[#1f1f1f] flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-[#444]" />
      </div>
      <p className="text-sm font-medium text-[#666] mb-1">{title}</p>
      <p className="text-xs text-[#555] text-center max-w-xs">{description}</p>
    </div>
  );
}

export function GuidesClient({ initialBookmarked, initialRecent, initialHelpful }: GuidesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GuideSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookmarked" | "recent" | "helpful" | "search">("bookmarked");
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [recent] = useState(initialRecent);
  const [helpful] = useState(initialHelpful);
  const [isPending, startTransition] = useTransition();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      if (activeTab === "search") {
        setActiveTab("bookmarked");
      }
      return;
    }

    setActiveTab("search");
    setIsSearching(true);

    startTransition(async () => {
      const results = await searchGuides(query);
      setSearchResults(results);
      setIsSearching(false);
    });
  };

  const handleBookmark = async (guideId: string) => {
    startTransition(async () => {
      const newState = await toggleGuideBookmark(guideId);

      // Update local state
      setBookmarked((prev) => {
        if (newState) {
          // Add to bookmarked if not already there
          const guide = [...recent, ...helpful, ...searchResults].find((g) => g.id === guideId);
          if (guide && !prev.find((g) => g.id === guideId)) {
            return [{ ...guide, wasBookmarked: true }, ...prev];
          }
          return prev.map((g) => (g.id === guideId ? { ...g, wasBookmarked: true } : g));
        } else {
          // Remove from bookmarked
          return prev.filter((g) => g.id !== guideId);
        }
      });

      // Update search results
      setSearchResults((prev) =>
        prev.map((g) => (g.id === guideId ? { ...g, wasBookmarked: newState } : g))
      );
    });
  };

  const handleClick = async (guideId: string) => {
    startTransition(async () => {
      await markGuideClicked(guideId);
    });
  };

  const tabs = [
    { id: "bookmarked" as const, label: "Bookmarked", icon: IoBookmark, count: bookmarked.length },
    { id: "recent" as const, label: "Recent", icon: IoTime, count: recent.length },
    { id: "helpful" as const, label: "Helpful", icon: IoThumbsUp, count: helpful.length },
  ];

  const getCurrentGuides = () => {
    switch (activeTab) {
      case "search":
        return searchResults;
      case "bookmarked":
        return bookmarked;
      case "recent":
        return recent;
      case "helpful":
        return helpful;
      default:
        return [];
    }
  };

  const guides = getCurrentGuides();

  return (
    <div className="space-y-6">
      <div className="relative">
        <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
        <input
          type="text"
          placeholder="Search your saved guides..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#161616] border border-[#1f1f1f] text-white placeholder-[#555] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
        />
      </div>
      {activeTab !== "search" && (
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#5eead4]/10 text-[#5eead4] border border-[#5eead4]/30"
                    : "bg-[#161616] text-[#888] border border-[#1f1f1f] hover:border-[#2a2a2a]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? "bg-[#5eead4]/20" : "bg-[#1f1f1f]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {activeTab === "search" && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#666]">
            {isSearching ? "Searching..." : `${searchResults.length} results for "${searchQuery}"`}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchResults([]);
              setActiveTab("bookmarked");
            }}
            className="text-xs text-[#5eead4] hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
      <div className="space-y-3">
        {guides.length > 0 ? (
          guides.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={guide}
              onBookmark={handleBookmark}
              onClick={handleClick}
            />
          ))
        ) : (
          <>
            {activeTab === "search" && !isSearching && (
              <EmptyState
                icon={IoSearch}
                title="No guides found"
                description="Try a different search term or browse your bookmarked guides"
              />
            )}
            {activeTab === "bookmarked" && (
              <EmptyState
                icon={IoBookmark}
                title="No bookmarked guides"
                description="When you find helpful DIY guides during conversations, bookmark them to save them here"
              />
            )}
            {activeTab === "recent" && (
              <EmptyState
                icon={IoTime}
                title="No recently viewed guides"
                description="Guides you click on will appear here for quick access"
              />
            )}
            {activeTab === "helpful" && (
              <EmptyState
                icon={IoThumbsUp}
                title="No helpful guides marked"
                description="Mark guides as helpful to keep track of the most useful resources"
              />
            )}
          </>
        )}
      </div>
      {guides.length === 0 && activeTab === "bookmarked" && (
        <div className="p-4 rounded-xl bg-[#5eead4]/5 border border-[#5eead4]/20">
          <h4 className="text-sm font-medium text-[#5eead4] mb-2">How to find DIY guides</h4>
          <p className="text-xs text-[#888] leading-relaxed">
            Start a conversation about a home issue and we&apos;ll automatically search Reddit, DIY forums,
            and other community resources to find relevant guides and solutions. You can bookmark the
            most helpful ones to save them here.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import {
  IoBookOutline,
  IoArrowUpCircle,
  IoChatbubbleOutline,
  IoOpenOutline,
  IoBookmark,
  IoBookmarkOutline,
  IoThumbsUp,
  IoThumbsDown,
} from "react-icons/io5";
import { SiReddit } from "react-icons/si";
import { useDIYGuides } from "@/hooks/useDIYGuides";
import { trackDIYGuideClicked } from "@/lib/analytics";
import type { DIYGuide } from "@/app/db/schema/diy-guides";

interface DIYGuideLinksProps {
  content: string;
  conversationId?: string | null;
  className?: string;
}

// Source icons and colors
const sourceConfig: Record<string, { icon: typeof IoBookOutline; color: string; bgColor: string }> = {
  reddit: { icon: SiReddit, color: "#ff4500", bgColor: "#ff450020" },
  diy_stackexchange: { icon: IoBookOutline, color: "#f48024", bgColor: "#f4802420" },
  instructables: { icon: IoBookOutline, color: "#fab306", bgColor: "#fab30620" },
  family_handyman: { icon: IoBookOutline, color: "#c8232c", bgColor: "#c8232c20" },
  this_old_house: { icon: IoBookOutline, color: "#0066cc", bgColor: "#0066cc20" },
  bob_vila: { icon: IoBookOutline, color: "#2e7d32", bgColor: "#2e7d3220" },
  other: { icon: IoBookOutline, color: "#5eead4", bgColor: "#5eead420" },
};

export function DIYGuideLinks({ content, conversationId, className }: DIYGuideLinksProps) {
  const { guides, isLoading, markClicked, toggleBookmark, markHelpful } = useDIYGuides(conversationId || null);

  const handleGuideClick = (guide: DIYGuide) => {
    markClicked(guide.id);
    trackDIYGuideClicked({
      conversationId,
      guideTitle: guide.title,
      guideSource: guide.subreddit ? `r/${guide.subreddit}` : guide.source,
      url: guide.url,
    });
  };

  if (isLoading) {
    return null; // Don't show loading state - guides will appear when ready
  }

  if (guides.length === 0) {
    return null;
  }

  return (
    <div className={`mt-4 ${className || ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <IoBookOutline className="w-4 h-4 text-[#5eead4]" />
        <h4 className="text-sm font-medium text-white">Community DIY Guides</h4>
        <span className="text-xs text-[#888888]">({guides.length})</span>
      </div>
      <div className="space-y-2">
        {guides.slice(0, 5).map((guide) => {
          const config = sourceConfig[guide.source] || sourceConfig.other;
          const Icon = config.icon;

          return (
            <div
              key={guide.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#5eead4]/50 transition-colors group"
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: config.bgColor }}
              >
                <Icon className="w-4 h-4" style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={guide.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleGuideClick(guide)}
                  className="flex items-start justify-between gap-2"
                >
                  <span className="text-sm text-white group-hover:text-[#5eead4] transition-colors line-clamp-2">
                    {guide.title}
                  </span>
                  <IoOpenOutline className="w-4 h-4 text-[#888888] group-hover:text-[#5eead4] flex-shrink-0 mt-0.5" />
                </a>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-[#888888]">
                    {guide.subreddit ? `r/${guide.subreddit}` : guide.source.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                  {guide.upvotes && (
                    <div className="flex items-center gap-1 text-xs text-[#888888]">
                      <IoArrowUpCircle className="w-3 h-3" />
                      {guide.upvotes}
                    </div>
                  )}
                  {guide.commentCount && (
                    <div className="flex items-center gap-1 text-xs text-[#888888]">
                      <IoChatbubbleOutline className="w-3 h-3" />
                      {guide.commentCount}
                    </div>
                  )}
                </div>
                {guide.excerpt && (
                  <p className="text-xs text-[#666666] mt-1 line-clamp-2">
                    {guide.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => toggleBookmark(guide.id)}
                    className="flex items-center gap-1 text-xs text-[#888888] hover:text-[#5eead4] transition-colors"
                    title={guide.wasBookmarked ? "Remove bookmark" : "Bookmark"}
                  >
                    {guide.wasBookmarked ? (
                      <IoBookmark className="w-3.5 h-3.5 text-[#5eead4]" />
                    ) : (
                      <IoBookmarkOutline className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {guide.wasClicked && guide.wasHelpful === null && (
                    <>
                      <span className="text-xs text-[#666666]">Helpful?</span>
                      <button
                        onClick={() => markHelpful(guide.id, true)}
                        className="text-[#888888] hover:text-[#22c55e] transition-colors"
                        title="Yes, helpful"
                      >
                        <IoThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => markHelpful(guide.id, false)}
                        className="text-[#888888] hover:text-[#ef4444] transition-colors"
                        title="Not helpful"
                      >
                        <IoThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {guide.wasHelpful === true && (
                    <span className="text-xs text-[#22c55e] flex items-center gap-1">
                      <IoThumbsUp className="w-3 h-3" /> Helpful
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {guides.length > 5 && (
        <button className="mt-2 text-xs text-[#5eead4] hover:underline">
          Show {guides.length - 5} more guides
        </button>
      )}
    </div>
  );
}

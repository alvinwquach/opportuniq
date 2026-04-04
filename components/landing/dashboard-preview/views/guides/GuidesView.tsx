"use client";

import { useState } from "react";
import {
  IoPlayCircleOutline,
  IoBookmarkOutline,
  IoBookmark,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoStarOutline,
  IoSparklesOutline,
  IoSearchOutline,
} from "react-icons/io5";
import { mixedGuides, guideSourceInfo, guideAnalytics } from "../../mockData";
import type { MixedGuide } from "../../mockData";
import { isGuideInProgress, isGuideCompleted, getGuideActionText, getCategoryColors } from "./utils";
import { difficultyConfig } from "./types";
import { useDarkMode } from "../../DarkModeContext";

// ── Category nav ──────────────────────────────────────────────────────────────

const categories = ["All", ...Array.from(new Set(mixedGuides.map((g) => g.category)))];

// ── Source badge ──────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: MixedGuide["source"] }) {
  const info = guideSourceInfo[source];
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${info.bgColor} ${info.color}`}>
      {info.icon} {info.name}
    </span>
  );
}

// ── Guide row ─────────────────────────────────────────────────────────────────

function GuideRow({ guide }: { guide: MixedGuide }) {
  const dark = useDarkMode();
  const inProgress = isGuideInProgress(guide);
  const completed  = isGuideCompleted(guide);
  const action     = getGuideActionText(guide);
  const diff       = difficultyConfig[guide.difficulty];
  const catConfig  = getCategoryColors(guide.category);

  return (
    <div className={`flex items-start gap-3 px-5 py-3.5 border-b transition-colors group ${completed ? "opacity-70" : ""} ${
      dark ? "border-white/[0.06] hover:bg-white/[0.03]" : "border-gray-100 hover:bg-gray-50"
    }`}>
      {/* Icon / thumbnail */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${catConfig.bg}`}>
        {guide.isVideo
          ? <IoPlayCircleOutline className="w-5 h-5 text-red-500" />
          : <span>{catConfig.icon}</span>
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <SourceBadge source={guide.source} />
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${diff.bgColor} ${diff.color}`}>
            {diff.label}
          </span>
          {inProgress && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600">
              In Progress
            </span>
          )}
          {completed && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-600">
              <IoCheckmarkCircle className="w-2.5 h-2.5" />Done
            </span>
          )}
        </div>

        <p className={`text-sm font-medium leading-snug truncate group-hover:text-blue-500 transition-colors ${dark ? "text-gray-200" : "text-gray-900"}`}>
          {guide.title}
        </p>

        <div className={`flex items-center gap-3 mt-1 text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>
          <span className="flex items-center gap-0.5">
            <IoTimeOutline className="w-3 h-3" />{guide.timeEstimate}
          </span>
          {guide.rating && (
            <span className="flex items-center gap-0.5">
              <IoStarOutline className="w-3 h-3 text-amber-400" />{guide.rating}
            </span>
          )}
          {guide.totalSteps && <span>{guide.totalSteps} steps</span>}
          {guide.author && <span className="truncate">by {guide.author}</span>}
        </div>

        {/* Progress bar */}
        {inProgress && guide.progress !== undefined && (
          <div className="mt-2">
            <div className={`h-1 rounded-full overflow-hidden w-full max-w-[200px] ${dark ? "bg-white/[0.06]" : "bg-gray-100"}`}>
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${guide.progress}%` }}
              />
            </div>
            <p className={`text-[10px] mt-0.5 ${dark ? "text-gray-600" : "text-gray-400"}`}>{guide.progress}% complete</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button className={`p-1.5 transition-colors rounded hover:text-amber-400 ${dark ? "text-gray-700" : "text-gray-300"}`}>
          {guide.isBookmarked
            ? <IoBookmark className="w-4 h-4 text-amber-400" />
            : <IoBookmarkOutline className="w-4 h-4" />
          }
        </button>
        <button className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
          completed
            ? dark ? "text-gray-500 border border-white/10 hover:bg-white/[0.06]" : "text-gray-400 border border-gray-200 hover:bg-gray-50"
            : "bg-blue-600 text-white hover:bg-blue-500"
        }`}>
          {completed ? "Review" : action}
        </button>
      </div>
    </div>
  );
}

// ── Main GuidesView ───────────────────────────────────────────────────────────

export function GuidesView() {
  const dark = useDarkMode();
  const b = dark ? "border-white/[0.06]" : "border-gray-100";
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = mixedGuides.filter((g) => {
    const matchCat = activeCategory === "All" || g.category === activeCategory;
    const matchSearch = !search ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const completedCount  = mixedGuides.filter(isGuideCompleted).length;
  const inProgressCount = mixedGuides.filter(isGuideInProgress).length;
  const savedCount      = mixedGuides.filter((g) => g.isBookmarked).length;

  return (
    <div className={`flex h-full overflow-hidden ${dark ? "bg-[#111111]" : "bg-white"}`}>

      {/* ── Left: category nav ── */}
      <div className={`w-[180px] flex-shrink-0 border-r flex flex-col h-full ${b} ${dark ? "bg-[#141414]" : "bg-white"}`}>
        <div className={`px-4 py-3 border-b ${b}`}>
          <p className={`text-xs font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>Guides</p>
          <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>{mixedGuides.length} available</p>
        </div>

        {/* Category list */}
        <nav className="flex-1 scrollbar-auto-hide py-2">
          {categories.map((cat) => {
            const count = cat === "All"
              ? mixedGuides.length
              : mixedGuides.filter((g) => g.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
                  isActive
                    ? dark ? "bg-blue-600/10 text-blue-400" : "bg-blue-100/60 text-gray-900"
                    : dark ? "text-gray-500 hover:bg-white/[0.04] hover:text-gray-300" : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  isActive
                    ? dark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"
                    : dark ? "bg-white/[0.06] text-gray-600" : "bg-gray-100 text-gray-500"
                }`}>{count}</span>
              </button>
            );
          })}
        </nav>

        {/* Progress summary */}
        <div className={`border-t px-4 py-3 space-y-2 ${b}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Your Progress</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-green-500">
                <IoCheckmarkCircle className="w-3 h-3" />Completed
              </span>
              <span className={`font-bold ${dark ? "text-gray-200" : "text-gray-900"}`}>{completedCount}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-blue-500">
                <IoPlayCircleOutline className="w-3 h-3" />In Progress
              </span>
              <span className={`font-bold ${dark ? "text-gray-200" : "text-gray-900"}`}>{inProgressCount}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-amber-500">
                <IoBookmark className="w-3 h-3" />Saved
              </span>
              <span className={`font-bold ${dark ? "text-gray-200" : "text-gray-900"}`}>{savedCount}</span>
            </div>
          </div>
          <div className={`mt-2 p-2 rounded-lg border ${dark ? "bg-emerald-50 border-emerald-100" : "bg-emerald-50 border-emerald-100"}`}>
            <p className="text-[10px] text-emerald-500 font-medium">DIY time saved</p>
            <p className="text-sm font-bold text-emerald-500">{guideAnalytics.timeSaved}</p>
          </div>
        </div>
      </div>

      {/* ── Right: guide list ── */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Search bar */}
        <div className={`px-4 py-3 border-b ${b}`}>
          <div className="relative">
            <IoSearchOutline className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${dark ? "text-gray-600" : "text-gray-400"}`} />
            <input
              type="text"
              placeholder="Search guides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 border transition-colors ${
                dark
                  ? "bg-white/[0.06] border-white/10 text-gray-200 focus:bg-white/[0.08]"
                  : "bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-400 focus:bg-white"
              }`}
            />
          </div>
        </div>

        {/* In progress — pinned at top if any */}
        {inProgressCount > 0 && activeCategory === "All" && !search && (
          <>
            <div className={`px-5 py-2 border-b ${b}`}>
              <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Continue</p>
            </div>
            {mixedGuides.filter(isGuideInProgress).map((g) => (
              <GuideRow key={g.id} guide={g} />
            ))}
            <div className={`px-5 py-2 border-b ${b}`}>
              <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>All Guides</p>
            </div>
          </>
        )}

        {/* Guide list */}
        <div className="flex-1 scrollbar-auto-hide">
          {filtered.filter((g) => !(activeCategory === "All" && !search && isGuideInProgress(g))).map((g) => (
            <GuideRow key={g.id} guide={g} />
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center px-8">
              <IoSparklesOutline className={`w-8 h-8 mb-2 ${dark ? "text-gray-700" : "text-gray-300"}`} />
              <p className={`text-sm ${dark ? "text-gray-500" : "text-gray-500"}`}>No guides found</p>
              <p className={`text-xs mt-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>Try a different category or search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

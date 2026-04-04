"use client";

import {
  IoTimeOutline,
  IoCheckmarkCircle,
  IoPlayCircleOutline,
  IoBookmark,
  IoBookmarkOutline,
  IoStar,
  IoEyeOutline,
  IoOpenOutline,
} from "react-icons/io5";
import type { GuideCardProps } from "../types";
import { guideSourceInfo, difficultyConfig } from "../types";
import { getCategoryColors, formatViewCount, isGuideInProgress, isGuideCompleted, getGuideActionText } from "../utils";

export function GuideCard({ guide, viewMode, onBookmark, onClick }: GuideCardProps) {
  const sourceInfo = guideSourceInfo[guide.source] || guideSourceInfo.other;
  const catConfig = getCategoryColors(guide.category);
  const inProgress = isGuideInProgress(guide);
  const completed = isGuideCompleted(guide);
  const actionText = getGuideActionText(guide);
  const diffConfig = difficultyConfig[guide.difficulty] || difficultyConfig.beginner;

  const handleClick = () => {
    if (onClick) onClick(guide.id);
    if (guide.url) window.open(guide.url, "_blank", "noopener,noreferrer");
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmark) onBookmark(guide.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-gray-100 rounded-xl border border-gray-200 p-4 hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer group ${
        viewMode === "list" ? "flex items-start gap-4" : ""
      } ${completed ? "opacity-80" : ""}`}
    >
      {/* Thumbnail for list view or video */}
      {(viewMode === "list" || guide.isVideo) && (
        <div className="flex-shrink-0 relative">
          <div
            className={`${viewMode === "list" ? "w-24 h-16" : "w-full h-32 mb-3"} rounded-lg ${catConfig.bg} flex items-center justify-center overflow-hidden`}
          >
            {guide.isVideo ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <IoPlayCircleOutline className="w-6 h-6 text-red-600" />
                </div>
              </div>
            ) : (
              <span className="text-2xl">{catConfig.icon}</span>
            )}
          </div>
          {guide.isVideo && (
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-gray-900 text-[9px] font-medium rounded">
              {guide.timeEstimate}
            </span>
          )}
        </div>
      )}

      <div className={viewMode === "list" ? "flex-1 min-w-0" : ""}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {viewMode === "grid" && !guide.isVideo && (
              <div className={`w-8 h-8 rounded-lg ${catConfig.bg} flex items-center justify-center text-base`}>
                {catConfig.icon}
              </div>
            )}
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#333] text-gray-500">
              {sourceInfo.icon} {sourceInfo.name}
            </span>
            {/* Difficulty badge */}
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${diffConfig.bgColor} ${diffConfig.color}`}>
              {diffConfig.label}
            </span>
            {inProgress && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-600">
                In Progress
              </span>
            )}
            {completed && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-600 flex items-center gap-0.5">
                <IoCheckmarkCircle className="w-3 h-3" />
                Done
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmark}
              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              {guide.isBookmarked ? (
                <IoBookmark className="w-4 h-4 text-blue-600" />
              ) : (
                <IoBookmarkOutline className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (guide.url) window.open(guide.url, "_blank", "noopener,noreferrer");
              }}
              className="p-1 text-gray-500 hover:text-gray-900 hover:bg-[#333] rounded transition-colors"
            >
              <IoOpenOutline className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4
          className={`text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors ${
            viewMode === "list" ? "truncate" : "line-clamp-2"
          }`}
        >
          {guide.title}
        </h4>

        {/* Description */}
        {guide.description && viewMode === "grid" && (
          <p className="text-[11px] text-gray-500 mb-2 line-clamp-2">{guide.description}</p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-2">
          {guide.rating && (
            <span className="flex items-center gap-0.5">
              <IoStar className="w-3 h-3 text-amber-400 fill-amber-400" />
              {guide.rating}
            </span>
          )}
          {guide.viewCount && (
            <span className="flex items-center gap-0.5">
              <IoEyeOutline className="w-3 h-3" />
              {formatViewCount(guide.viewCount)}
            </span>
          )}
          {!guide.isVideo && (
            <span className="flex items-center gap-0.5">
              <IoTimeOutline className="w-3 h-3" />
              {guide.timeEstimate}
            </span>
          )}
          {guide.totalSteps && <span>{guide.totalSteps} steps</span>}
          {guide.author && <span className="truncate">by {guide.author}</span>}
        </div>

        {/* Progress bar */}
        {inProgress && guide.totalSteps && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
              <span>
                {guide.completedSteps} of {guide.totalSteps} steps
              </span>
              <span className="font-semibold text-blue-600">{guide.progress}%</span>
            </div>
            <div className="h-1.5 bg-[#333] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                style={{ width: `${guide.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${catConfig.bg} ${catConfig.text}`}>
            {guide.category}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              inProgress
                ? "bg-blue-600 text-gray-900 hover:bg-blue-700"
                : completed
                ? "border border-gray-200 text-gray-500 hover:bg-[#333]"
                : "bg-blue-600 text-gray-900 hover:bg-blue-700"
            }`}
          >
            {!completed && <IoPlayCircleOutline className="w-3.5 h-3.5" />}
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
}

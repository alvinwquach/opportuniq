"use client";

import {
  IoPlayCircleOutline,
  IoTimeOutline,
  IoArrowForward,
} from "react-icons/io5";
import { guideSourceInfo } from "../../mockData";
import type { ContinueWatchingProps } from "./types";
import { getCategoryColors } from "./utils";

export function ContinueWatching({ guides }: ContinueWatchingProps) {
  if (guides.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IoPlayCircleOutline className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Continue Where You Left Off</h3>
        </div>
        <span className="text-xs text-gray-500">{guides.length} in progress</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {guides.map((guide) => {
          const sourceInfo = guideSourceInfo[guide.source];
          const catConfig = getCategoryColors(guide.category);
          return (
            <div
              key={guide.id}
              className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-4 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="flex-shrink-0 relative">
                  <div
                    className={`w-16 h-12 rounded-lg ${catConfig.bg} flex items-center justify-center overflow-hidden`}
                  >
                    {guide.isVideo ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <IoPlayCircleOutline className="w-5 h-5 text-red-600" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xl">{catConfig.icon}</span>
                    )}
                  </div>
                  {/* Progress indicator overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${guide.progress}%` }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-gray-100 text-gray-700">
                      {sourceInfo.icon} {sourceInfo.name}
                    </span>
                    <span className="text-[9px] text-gray-500">
                      {guide.completedSteps}/{guide.totalSteps} steps
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                    {guide.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <IoTimeOutline className="w-3 h-3" />
                      <span>{guide.timeEstimate}</span>
                    </div>
                    <button className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700 transition-colors group/btn">
                      Continue
                      <IoArrowForward className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold text-blue-600">{guide.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                    style={{ width: `${guide.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

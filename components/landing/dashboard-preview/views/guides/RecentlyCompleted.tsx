"use client";

import {
  IoCheckmarkCircle,
  IoTimeOutline,
  IoStar,
  IoRefreshOutline,
} from "react-icons/io5";
import { guideSourceInfo } from "../../mockData";
import type { RecentlyCompletedProps } from "./types";
import { getCategoryColors } from "./utils";

export function RecentlyCompleted({ guides }: RecentlyCompletedProps) {
  if (guides.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IoCheckmarkCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Recently Completed</h3>
        </div>
        <span className="text-xs text-gray-500">{guides.length} finished</span>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {guides.slice(0, 3).map((guide) => {
          const sourceInfo = guideSourceInfo[guide.source];
          const catConfig = getCategoryColors(guide.category);
          return (
            <div
              key={guide.id}
              className="bg-white rounded-xl border border-blue-200 p-3 hover:border-blue-400 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-2">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg ${catConfig.bg} flex items-center justify-center text-base flex-shrink-0`}
                >
                  {catConfig.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <IoCheckmarkCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[9px] font-medium text-blue-600">Completed</span>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {guide.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500">
                    <span className="flex items-center gap-0.5">
                      {sourceInfo.icon} {sourceInfo.name}
                    </span>
                    {guide.rating && (
                      <span className="flex items-center gap-0.5">
                        <IoStar className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        {guide.rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-1 text-[9px] text-gray-500">
                  <IoTimeOutline className="w-3 h-3" />
                  <span>{guide.timeEstimate}</span>
                </div>
                <button className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-900 transition-colors">
                  <IoRefreshOutline className="w-3 h-3" />
                  Review
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

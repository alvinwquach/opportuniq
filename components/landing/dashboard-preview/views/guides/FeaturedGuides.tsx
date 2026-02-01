"use client";

import {
  IoTimeOutline,
  IoStarOutline,
  IoStar,
  IoArrowForward,
} from "react-icons/io5";
import { guideSourceInfo } from "../../mockData";
import type { FeaturedGuidesProps } from "./types";
import { getCategoryColors, formatViewCount } from "./utils";

export function FeaturedGuides({ guides }: FeaturedGuidesProps) {
  if (guides.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <IoStarOutline className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Recommended For You</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {guides.map((guide) => {
          const sourceInfo = guideSourceInfo[guide.source];
          const catConfig = getCategoryColors(guide.category);
          return (
            <div
              key={guide.id}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-xl border-2 border-emerald-500/30 p-4 hover:border-emerald-500/50 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-lg ${catConfig.bg} flex items-center justify-center text-lg`}
                  >
                    {guide.isVideo ? "▶️" : catConfig.icon}
                  </div>
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#333] text-[#888]">
                      {sourceInfo.icon} {sourceInfo.name}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <IoStar className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] text-[#888]">{guide.rating}</span>
                      {guide.viewCount && (
                        <span className="text-[10px] text-[#666] ml-1">
                          • {formatViewCount(guide.viewCount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-[#666]">
                  <IoTimeOutline className="w-3 h-3" />
                  {guide.timeEstimate}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-emerald-400 transition-colors line-clamp-2">
                {guide.title}
              </h4>
              <p className="text-[11px] text-[#666] mb-3 line-clamp-2">{guide.description}</p>
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${catConfig.bg} ${catConfig.text}`}
                >
                  {guide.category}
                </span>
                <button className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold hover:text-emerald-300 transition-colors group/btn">
                  {guide.isVideo ? "Watch" : "Start"}
                  <IoArrowForward className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

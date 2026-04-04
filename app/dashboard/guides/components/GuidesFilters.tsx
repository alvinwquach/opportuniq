"use client";

import { IoFilterOutline } from "react-icons/io5";
import type { GuidesFiltersProps, GuideSource } from "../types";
import { guideSourceInfo } from "../types";
import { getCategoryColors } from "../utils";

export function GuidesFilters({
  selectedSource,
  setSelectedSource,
  selectedCategory,
  setSelectedCategory,
  categories,
}: GuidesFiltersProps) {
  return (
    <div className="flex flex-col gap-3 bg-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm">
      {/* Source Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-500">Source:</span>
        <button
          onClick={() => setSelectedSource("all")}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
            selectedSource === "all"
              ? "bg-blue-600 text-gray-900 shadow-sm"
              : "bg-[#333] text-gray-500 hover:bg-[#444]"
          }`}
        >
          All Sources
        </button>
        {(Object.keys(guideSourceInfo) as GuideSource[]).map((source) => {
          const info = guideSourceInfo[source];
          return (
            <button
              key={source}
              onClick={() => setSelectedSource(source)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                selectedSource === source
                  ? "bg-blue-600 text-gray-900 shadow-sm"
                  : "bg-[#333] text-gray-500 hover:opacity-80"
              }`}
            >
              <span className="text-[10px]">{info.icon}</span>
              {info.name}
            </button>
          );
        })}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <IoFilterOutline className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs font-medium text-gray-500">Category:</span>
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
            selectedCategory === null
              ? "bg-blue-600 text-gray-900 shadow-sm"
              : "bg-[#333] text-gray-500 hover:bg-[#444]"
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const catConfig = getCategoryColors(cat);
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-gray-900 shadow-sm"
                  : `${catConfig.bg} ${catConfig.text} hover:opacity-80`
              }`}
            >
              <span className="text-[10px]">{catConfig.icon}</span>
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

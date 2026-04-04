"use client";

import {
  IoStarOutline,
  IoTrendingUpOutline,
  IoSparkles,
  IoFlameOutline,
  IoTimeOutline,
  IoSchoolOutline,
  IoPlayCircleOutline,
} from "react-icons/io5";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import type { MixedGuide } from "../../mockData";
import { difficultyData } from "./data";

interface FeaturedSidebarProps {
  featuredGuides: MixedGuide[];
}

export function FeaturedSidebar({ featuredGuides }: FeaturedSidebarProps) {
  // Group by category
  const byCategory = featuredGuides.reduce((acc, guide) => {
    const cat = guide.category || "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  // Find highest rated
  const topRated = [...featuredGuides]
    .filter(g => g.rating)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  // Calculate total time
  const totalMinutes = featuredGuides.reduce((sum, guide) => {
    const match = guide.timeEstimate?.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  // Video vs Article count
  const videoCount = featuredGuides.filter(g => g.isVideo).length;
  const articleCount = featuredGuides.length - videoCount;

  return (
    <div className="space-y-4">
      {/* Featured Summary */}
      <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoStarOutline className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-medium text-gray-900">Featured For You</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-amber-200 text-center">
            <p className="text-xl font-bold text-amber-600">{featuredGuides.length}</p>
            <p className="text-[9px] text-gray-500">Recommended</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-amber-200 text-center">
            <p className="text-xl font-bold text-amber-600">
              {totalMinutes > 60 ? `${Math.floor(totalMinutes / 60)}h` : `${totalMinutes}m`}
            </p>
            <p className="text-[9px] text-gray-500">Total Time</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-3 text-center">
          Curated based on your home profile and past repairs
        </p>
      </div>

      {/* Top Rated */}
      {topRated.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <IoFlameOutline className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-medium text-gray-900">Highest Rated</h3>
          </div>
          <div className="space-y-2">
            {topRated.map((guide, index) => (
              <div
                key={guide.id}
                className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:border-amber-200 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold text-xs">#{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{guide.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        <IoStarOutline className="w-3 h-3 text-amber-600" />
                        <span className="text-[10px] text-amber-600 font-medium">{guide.rating}</span>
                      </div>
                      <span className="text-[10px] text-gray-500">• {guide.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Mix */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Content Mix</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <IoPlayCircleOutline className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-blue-600">{videoCount}</p>
            <p className="text-[9px] text-gray-500">Videos</p>
          </div>
          <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200 text-center">
            <IoSchoolOutline className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-purple-600">{articleCount}</p>
            <p className="text-[9px] text-gray-500">Articles</p>
          </div>
        </div>
      </div>

      {/* By Difficulty */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoTrendingUpOutline className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-900">By Difficulty</h3>
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={difficultyData} layout="vertical">
              <XAxis type="number" hide />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2">
          {difficultyData.map((d) => (
            <div key={d.level} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-[9px] text-gray-500">{d.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      {topCategories.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">By Category</h3>
          <div className="space-y-2">
            {topCategories.map(([category, count]) => (
              <div
                key={category}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="text-xs text-gray-500">{category}</span>
                <span className="text-xs font-medium text-amber-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <IoSparkles className="w-4 h-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-blue-600">Our Pick</p>
            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
              Based on your home profile, we recommend starting with plumbing basics - they&apos;re the most common DIY wins.
            </p>
            <button className="mt-2 w-full px-3 py-2 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
              Start Top Pick
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

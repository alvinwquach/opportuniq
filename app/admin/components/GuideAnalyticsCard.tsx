"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface GuideAnalyticsProps {
  stats: {
    total: number;
    clicked: number;
    bookmarked: number;
    helpfulYes: number;
    helpfulNo: number;
    bySource: { source: string; count: number }[];
    byCategory: { category: string; count: number }[];
  };
}

const SOURCE_COLORS: Record<string, string> = {
  youtube: "#ff0000",
  reddit: "#ff4500",
  instructables: "#f9a825",
  family_handyman: "#4caf50",
  this_old_house: "#2196f3",
  ifixit: "#00bcd4",
  other: "#9e9e9e",
};

const tooltipStyle = {
  backgroundColor: "#171717",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "8px",
  fontSize: "12px",
};

export function GuideAnalyticsCard({ stats }: GuideAnalyticsProps) {
  const clickRate = stats.total > 0 ? Math.round((stats.clicked / stats.total) * 100) : 0;
  const bookmarkRate = stats.total > 0 ? Math.round((stats.bookmarked / stats.total) * 100) : 0;
  const helpfulRate = (stats.helpfulYes + stats.helpfulNo) > 0
    ? Math.round((stats.helpfulYes / (stats.helpfulYes + stats.helpfulNo)) * 100)
    : 0;

  const sourceData = stats.bySource.slice(0, 5).map(s => ({
    name: s.source.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    value: s.count,
    color: SOURCE_COLORS[s.source] || "#9e9e9e",
  }));

  const categoryData = stats.byCategory.slice(0, 6).map(c => ({
    name: c.category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    count: c.count,
  }));

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-white">Guide Analytics</h2>
          <p className="text-[10px] text-[#666]">DIY guide engagement metrics</p>
        </div>
        <span className="text-[10px] text-[#666] uppercase tracking-wider">
          {stats.total} total
        </span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#111111] rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-emerald-400">{clickRate}%</p>
          <p className="text-[9px] text-[#666]">Click Rate</p>
        </div>
        <div className="bg-[#111111] rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-emerald-400">{bookmarkRate}%</p>
          <p className="text-[9px] text-[#666]">Bookmarked</p>
        </div>
        <div className="bg-[#111111] rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-emerald-400">{helpfulRate}%</p>
          <p className="text-[9px] text-[#666]">Helpful</p>
        </div>
      </div>

      {/* Source Distribution */}
      <div className="mb-4">
        <p className="text-[10px] text-[#888] mb-2">By Source</p>
        {sourceData.length > 0 ? (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  dataKey="value"
                  stroke="none"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#888" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-[#666] text-xs">
            No guide data yet
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {sourceData.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[9px] text-[#888]">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <p className="text-[10px] text-[#888] mb-2">By Category</p>
        {categoryData.length > 0 ? (
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 60, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#888", fontSize: 9 }}
                  width={55}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(255,255,255,0.06)" }}
                />
                <Bar dataKey="count" fill="#3ECF8E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-28 flex items-center justify-center text-[#666] text-xs">
            No category data yet
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { IoConstruct, IoCheckmarkCircle, IoHourglass } from "react-icons/io5";

interface IssueDecisionAnalyticsProps {
  stats: {
    totalIssues: number;
    openIssues: number;
    completedIssues: number;
    inProgressIssues: number;
    totalDecisions: number;
    approvedDecisions: number;
    byStatus: { status: string; count: number }[];
    byCategory: { category: string; count: number }[];
    byResolutionType: { type: string; count: number }[];
    avgResolutionDays: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  open: "#f59e0b",
  investigating: "#249361",
  options_generated: "#3ECF8E",
  decided: "#06b6d4",
  in_progress: "#3ECF8E",
  completed: "#10b981",
  deferred: "#6b7280",
};

const RESOLUTION_COLORS: Record<string, string> = {
  diy: "#10b981",
  hire: "#3ECF8E",
  defer: "#f59e0b",
  replace: "#249361",
};

const tooltipStyle = {
  backgroundColor: "#171717",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "8px",
  fontSize: "12px",
};

export function IssueDecisionAnalyticsCard({ stats }: IssueDecisionAnalyticsProps) {
  const completionRate = stats.totalIssues > 0
    ? Math.round((stats.completedIssues / stats.totalIssues) * 100)
    : 0;

  const decisionRate = stats.totalDecisions > 0
    ? Math.round((stats.approvedDecisions / stats.totalDecisions) * 100)
    : 0;

  const statusData = stats.byStatus.map(s => ({
    name: s.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    value: s.count,
    color: STATUS_COLORS[s.status] || "#6b7280",
  }));

  const categoryData = stats.byCategory.slice(0, 5).map(c => ({
    name: c.category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    count: c.count,
  }));

  const resolutionData = stats.byResolutionType.map(r => ({
    name: r.type.toUpperCase(),
    value: r.count,
    color: RESOLUTION_COLORS[r.type] || "#6b7280",
  }));

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-white">Issues & Decisions</h2>
          <p className="text-[10px] text-[#666]">Project tracking and resolution</p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <IoConstruct className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-[#111111] rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-white">{stats.totalIssues}</p>
          <p className="text-[9px] text-[#666]">Total</p>
        </div>
        <div className="bg-[#111111] rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <IoHourglass className="w-3 h-3 text-amber-400" />
            <p className="text-lg font-bold text-amber-400">{stats.openIssues}</p>
          </div>
          <p className="text-[9px] text-[#666]">Open</p>
        </div>
        <div className="bg-[#111111] rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-emerald-400">{stats.inProgressIssues}</p>
          <p className="text-[9px] text-[#666]">Active</p>
        </div>
        <div className="bg-[#111111] rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <IoCheckmarkCircle className="w-3 h-3 text-emerald-400" />
            <p className="text-lg font-bold text-emerald-400">{stats.completedIssues}</p>
          </div>
          <p className="text-[9px] text-[#666]">Done</p>
        </div>
      </div>

      {/* Rates */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-[#111111] rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-[#666]">Completion Rate</span>
            <span className="text-sm font-bold text-emerald-400">{completionRate}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
        <div className="bg-[#111111] rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-[#666]">Decision Rate</span>
            <span className="text-sm font-bold text-emerald-400">{decisionRate}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${decisionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Avg Resolution Time */}
      {stats.avgResolutionDays > 0 && (
        <div className="bg-[#111111] rounded-lg p-2.5 mb-4 text-center">
          <p className="text-sm font-bold text-white">{stats.avgResolutionDays.toFixed(1)} days</p>
          <p className="text-[9px] text-[#666]">Avg resolution time</p>
        </div>
      )}

      {/* Status Distribution */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-[#888] mb-2">By Status</p>
          {statusData.length > 0 ? (
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={18}
                    outerRadius={35}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-[#666] text-[10px]">
              No data
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] text-[#888] mb-2">Resolution Type</p>
          {resolutionData.length > 0 ? (
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resolutionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={18}
                    outerRadius={35}
                    dataKey="value"
                    stroke="none"
                  >
                    {resolutionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-[#666] text-[10px]">
              No data
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] text-[#888] mb-2">Top Categories</p>
          <div className="space-y-1.5">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] text-[#888] w-20 truncate">{c.name}</span>
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${(c.count / Math.max(...categoryData.map(x => x.count))) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-[9px] text-[#666] w-6 text-right">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

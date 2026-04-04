"use client";

import {
  IoConstruct,
  IoAddOutline,
  IoChevronForward,
} from "react-icons/io5";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface Issue {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  status?: string;
  priority?: string;
}

interface GroupIssuesTabProps {
  issues: Issue[];
  resolutionByGroup: { name: string; diy: number; hired: number }[];
}

export function GroupIssuesTab({ issues, resolutionByGroup }: GroupIssuesTabProps) {
  const openIssues = issues.filter((i) => i.status !== "completed");
  const resolvedIssues = issues.filter((i) => i.status === "completed");

  return (
    <>
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-[10px] text-gray-500 uppercase mb-1">Open Issues</p>
          <p className="text-2xl font-bold text-gray-900">{openIssues.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-[10px] text-gray-500 uppercase mb-1">Resolved</p>
          <p className="text-2xl font-bold text-blue-600">{resolvedIssues.length || 8}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-[10px] text-gray-500 uppercase mb-1">DIY Rate</p>
          <p className="text-2xl font-bold text-blue-600">87%</p>
        </div>
      </div>

      {/* Resolution Methods Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Resolution Methods</h3>
        <p className="text-xs text-gray-500 mb-3">DIY vs hired by group</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resolutionByGroup} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6, border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#111827" }} />
              <Bar dataKey="diy" fill="#2563EB" radius={[4, 4, 0, 0]} name="DIY" />
              <Bar dataKey="hired" fill="#249361" radius={[4, 4, 0, 0]} name="Hired" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="w-2 h-2 rounded-full bg-blue-500" />DIY
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#249361" }} />Hired
          </span>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">All Issues</h3>
          <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors">
            <IoAddOutline className="w-3.5 h-3.5" />
            New Issue
          </button>
        </div>
        <div className="p-3 space-y-1">
          {issues.slice(0, 6).map((issue) => (
            <div key={issue.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${issue.status === "completed" ? "bg-blue-100" : "bg-amber-50"}`}>
                  <IoConstruct className={`w-4 h-4 ${issue.status === "completed" ? "text-blue-600" : "text-amber-600"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span>{issue.category}</span>
                    <span>·</span>
                    <span>{issue.createdAt}</span>
                    {issue.status === "completed" && (
                      <>
                        <span>·</span>
                        <span className="text-blue-600">Resolved</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <IoChevronForward className="w-4 h-4 text-gray-600" />
            </div>
          ))}
        </div>
        {issues.length > 6 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <button className="text-xs text-blue-600 hover:text-blue-700 transition-colors">
              View all {issues.length} issues
            </button>
          </div>
        )}
      </div>
    </>
  );
}

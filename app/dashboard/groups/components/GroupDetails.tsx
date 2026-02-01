"use client";

import { useState } from "react";
import {
  IoSettingsOutline,
  IoPersonAddOutline,
  IoConstruct,
  IoCheckmarkCircle,
  IoWallet,
  IoTrendingUp,
  IoLocation,
  IoEllipsisVertical,
  IoShield,
  IoTrash,
  IoMailOutline,
  IoCopyOutline,
  IoChevronForward,
  IoAddOutline,
  IoPeople,
} from "react-icons/io5";
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
  AreaChart,
  Area,
  Line,
} from "recharts";
import type { GroupDetails as GroupDetailsType } from "@/lib/graphql/types";
import Link from "next/link";

// Role display helpers
const roleColors: Record<string, string> = {
  coordinator: "bg-emerald-500/20 text-emerald-400",
  collaborator: "bg-emerald-500/20 text-emerald-400",
  participant: "bg-emerald-500/20 text-emerald-400",
  contributor: "bg-emerald-500/20 text-emerald-400",
  observer: "bg-[#333] text-[#888]",
};

const roleLabels: Record<string, string> = {
  coordinator: "Coordinator",
  collaborator: "Collaborator",
  participant: "Participant",
  contributor: "Contributor",
  observer: "Observer",
};

interface GroupDetailsProps {
  group: GroupDetailsType;
  onOpenSettings: () => void;
  onOpenInvite: () => void;
  onOpenContributionHistory: () => void;
  onChangeRole: (memberId: string, currentRole: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export function GroupDetails({
  group,
  onOpenSettings,
  onOpenInvite,
  onOpenContributionHistory,
  onChangeRole,
  onRemoveMember,
}: GroupDetailsProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "resolved":
        return <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />;
      case "contribution":
        return <IoWallet className="w-4 h-4 text-emerald-400" />;
      case "invitation":
        return <IoPersonAddOutline className="w-4 h-4 text-emerald-400" />;
      default:
        return <IoConstruct className="w-4 h-4 text-amber-400" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case "resolved":
      case "contribution":
      case "invitation":
        return "bg-emerald-500/20";
      default:
        return "bg-amber-500/20";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1d ago";
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-white">{group.name}</h2>
            <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${roleColors[group.role] || roleColors.observer}`}>
              {roleLabels[group.role] || group.role}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#666]">
            {group.postalCode && (
              <span className="flex items-center gap-1">
                <IoLocation className="w-3.5 h-3.5" />
                {group.postalCode}
              </span>
            )}
            <span>{group.members.length} members</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#888] border border-[#2a2a2a] hover:border-[#333] hover:text-white rounded-lg transition-colors"
          >
            <IoSettingsOutline className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={onOpenInvite}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 rounded-lg transition-colors"
          >
            <IoPersonAddOutline className="w-4 h-4" />
            Invite
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoConstruct className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] text-[#666] uppercase">Open</span>
          </div>
          <div className="text-xl font-semibold text-white">{group.openIssueCount}</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-[#666] uppercase">Resolved</span>
          </div>
          <div className="text-xl font-semibold text-white">{group.resolvedCount}</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoWallet className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-[#666] uppercase">Balance</span>
          </div>
          <div className="text-xl font-semibold text-white">${group.balance.toLocaleString()}</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IoTrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-[#666] uppercase">Saved</span>
          </div>
          <div className="text-xl font-semibold text-emerald-400">${group.savings.toLocaleString()}</div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden mb-5">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
          <h3 className="text-sm font-medium text-white">Members ({group.members.length})</h3>
          <button
            onClick={onOpenInvite}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <IoPersonAddOutline className="w-3.5 h-3.5" />
            Add Member
          </button>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-3">
            {group.members.map((member) => {
              const isMenuOpen = openMenuId === member.id;
              return (
                <div
                  key={member.id}
                  className="relative flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg hover:bg-[#151515] transition-colors group min-w-[200px] border border-[#2a2a2a]"
                >
                  <div className="w-10 h-10 rounded-full bg-[#333] border border-[#2a2a2a] flex items-center justify-center text-lg">
                    {member.avatar || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{member.name || "Member"}</p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${roleColors[member.role] || roleColors.observer}`}
                        title={`${roleLabels[member.role] || member.role}`}
                      >
                        {roleLabels[member.role] || member.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : member.id);
                    }}
                    className="p-1.5 text-[#555] hover:text-white hover:bg-[#333] rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <IoEllipsisVertical className="w-4 h-4" />
                  </button>
                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-40 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] shadow-lg py-1 z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeRole(member.id, member.role);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#888] hover:bg-[#252525] hover:text-white"
                      >
                        <IoShield className="w-3.5 h-3.5" />
                        Change Role
                      </button>
                      {member.role !== "coordinator" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveMember(member.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          <IoTrash className="w-3.5 h-3.5" />
                          Remove Member
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Pending Invitations inline */}
            {group.pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg min-w-[200px]"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <IoMailOutline className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{inv.email}</p>
                  <p className="text-[10px] text-amber-400">
                    Pending · {roleLabels[inv.role] || inv.role}
                  </p>
                </div>
                <button className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded transition-colors">
                  <IoCopyOutline className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Shared Budget */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-[#1a1a1a] rounded-xl border border-emerald-500/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IoWallet className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-medium text-white">Shared Budget</h3>
            </div>
            <button
              onClick={onOpenContributionHistory}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View History
            </button>
          </div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-emerald-400">${group.balance.toLocaleString()}</p>
              <p className="text-xs text-[#666]">Available balance</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">
                ${group.monthlySpent.toLocaleString()}{" "}
                <span className="text-[#555] font-normal">/ ${group.monthlyBudget?.toLocaleString() || "0"}</span>
              </p>
              <p className="text-[10px] text-[#666]">Monthly spent</p>
            </div>
          </div>
          <div className="h-2 bg-[#333] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(group.budgetUsedPercent, 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-emerald-500/20">
            <div className="text-center">
              <p className="text-lg font-semibold text-white">${group.emergencyFund?.toLocaleString() || "0"}</p>
              <p className="text-[10px] text-[#666]">Emergency Fund</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-white">{group.diyRate}%</p>
              <p className="text-[10px] text-[#666]">DIY Rate</p>
            </div>
          </div>
        </div>

        {/* Member Contributions Pie Chart */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <h3 className="text-sm font-medium text-white mb-3">Member Contributions</h3>
          {group.contributionData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="h-28 w-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={group.contributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {group.contributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        fontSize: 10,
                        borderRadius: 6,
                        border: "1px solid #2a2a2a",
                        backgroundColor: "#1a1a1a",
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, "Share"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {group.contributionData.map((member) => (
                  <div key={member.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: member.color }} />
                      <span className="text-xs text-[#888]">{member.name}</span>
                    </div>
                    <span className="text-xs font-medium text-white">{member.value.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-28 flex items-center justify-center text-xs text-[#666]">
              No contribution data yet
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Monthly Savings Trend */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <h3 className="text-sm font-medium text-white mb-1">Monthly Savings</h3>
          <p className="text-xs text-[#666] mb-3">Savings vs spending over time</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={group.monthlySavingsData}>
                <defs>
                  <linearGradient id="savingsGradientGroup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#666" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#666" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 10,
                    borderRadius: 6,
                    border: "1px solid #2a2a2a",
                    backgroundColor: "#1a1a1a",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#3ECF8E"
                  strokeWidth={2}
                  fill="url(#savingsGradientGroup)"
                  name="Saved"
                />
                <Line type="monotone" dataKey="spent" stroke="#ef4444" strokeWidth={2} dot={false} name="Spent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[10px] text-[#888]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Saved
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-[#888]">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Spent
            </span>
          </div>
        </div>

        {/* Resolution Methods Chart */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <h3 className="text-sm font-medium text-white mb-1">Resolution Methods</h3>
          <p className="text-xs text-[#666] mb-3">DIY vs hired by group</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={group.resolutionData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#666" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#666" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 10,
                    borderRadius: 6,
                    border: "1px solid #2a2a2a",
                    backgroundColor: "#1a1a1a",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="diy" fill="#3ECF8E" radius={[4, 4, 0, 0]} name="DIY" />
                <Bar dataKey="hired" fill="#249361" radius={[4, 4, 0, 0]} name="Hired" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[10px] text-[#888]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              DIY
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-[#888]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#249361" }} />
              Hired
            </span>
          </div>
        </div>
      </div>

      {/* Recent Issues & Activity Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent Issues */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-white">Recent Issues</h3>
            <Link
              href="/dashboard/diagnose"
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <IoAddOutline className="w-3.5 h-3.5" />
              New
            </Link>
          </div>
          <div className="p-3 space-y-1">
            {group.recentIssues.length > 0 ? (
              group.recentIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#0f0f0f] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <IoConstruct className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{issue.title}</p>
                      <p className="text-[10px] text-[#666]">
                        {issue.category || "General"} · {formatTimestamp(issue.createdAt)}
                      </p>
                    </div>
                  </div>
                  <IoChevronForward className="w-4 h-4 text-[#555]" />
                </Link>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-[#666]">No issues yet</div>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-white">Recent Activity</h3>
          </div>
          <div className="p-4 space-y-3">
            {group.recentActivity.length > 0 ? (
              group.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityBgColor(activity.type)}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-sm text-white">{activity.message}</p>
                    <p className="text-xs text-[#555]">
                      {formatTimestamp(activity.timestamp)}
                      {activity.savings ? ` · Saved $${activity.savings}` : ""}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-[#666]">No activity yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Close menu when clicking outside */}
      {openMenuId && <div className="fixed inset-0 z-[9998]" onClick={() => setOpenMenuId(null)} />}
    </div>
  );
}

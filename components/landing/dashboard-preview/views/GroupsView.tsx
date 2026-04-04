"use client";

import { useState } from "react";
import {
  IoAddOutline,
  IoPeople,
  IoLocation,
  IoPersonAddOutline,
  IoSettingsOutline,
  IoCheckmarkCircle,
  IoWallet,
  IoConstruct,
  IoTrendingUp,
  IoShield,
  IoPersonCircle,
  IoHammer,
  IoEye,
  IoMailOutline,
  IoEllipsisVertical,
  IoFolderOutline,
  IoCalendarOutline,
  IoShieldCheckmarkOutline,
  IoArrowUpOutline,
  IoAlertOutline,
} from "react-icons/io5";
import { households, issues } from "../mockData";
import { getRoleColor, getRoleLabel } from "./groups/config";

type GroupTab = "overview" | "issues" | "budget";

// ── Activity feed data ────────────────────────────────────────────────────────

const activityFeed = [
  {
    id: "1",
    icon: IoCheckmarkCircle,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    text: "Alex resolved \u201cLeaky faucet\u201d",
    sub: "Saved $152 · DIY",
    time: "2h ago",
  },
  {
    id: "2",
    icon: IoWallet,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    text: "Jamie contributed $300",
    sub: "Shared budget",
    time: "1d ago",
  },
  {
    id: "3",
    icon: IoPersonAddOutline,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    text: "friend@example.com invited",
    sub: "As Contributor",
    time: "2d ago",
  },
  {
    id: "4",
    icon: IoConstruct,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    text: "New issue: \u201cAC not cooling\u201d",
    sub: "High priority · Open",
    time: "3d ago",
  },
  {
    id: "5",
    icon: IoCheckmarkCircle,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    text: "Sam resolved \u201cGarage door\u201d",
    sub: "Hired Pro · $210",
    time: "5d ago",
  },
  {
    id: "6",
    icon: IoFolderOutline,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
    text: "\u201cFlickering lights\u201d updated",
    sub: "Investigating",
    time: "1w ago",
  },
];

// ── Role config ───────────────────────────────────────────────────────────────

type GroupRole = "coordinator" | "collaborator" | "participant" | "contributor" | "observer";

const roleInfo: Record<GroupRole, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  coordinator: { label: "Coordinator", icon: IoShield },
  collaborator: { label: "Collaborator", icon: IoPersonCircle },
  participant: { label: "Participant", icon: IoHammer },
  contributor: { label: "Contributor", icon: IoWallet },
  observer: { label: "Observer", icon: IoEye },
};

// ── Left panel: group list ────────────────────────────────────────────────────

function GroupList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const totalSavings = households.reduce((s, h) => s + h.savings, 0);

  return (
    <div className="w-[220px] flex-shrink-0 flex flex-col h-full border-r border-gray-100 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-900">Groups</p>
          <p className="text-[10px] text-gray-400">{households.length} households</p>
        </div>
        <button className="w-7 h-7 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors">
          <IoAddOutline className="w-4 h-4" />
        </button>
      </div>

      {/* Group rows */}
      <div className="flex-1 overflow-y-auto py-1">
        {households.map((h) => {
          const isSelected = selectedId === h.id;
          return (
            <button
              key={h.id}
              onClick={() => onSelect(h.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 ${
                isSelected ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <IoPeople className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{h.name}</p>
                <p className="text-[10px] text-gray-400">{h.members.length} members · {h.issueCount} issues</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Total saved</span>
          <span className="font-semibold text-blue-600">${totalSavings.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// ── Center panel: group detail ────────────────────────────────────────────────

function GroupDetail({
  group,
  activeTab,
  onTabChange,
}: {
  group: typeof households[0];
  activeTab: GroupTab;
  onTabChange: (tab: GroupTab) => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const tabs: { id: GroupTab; label: string }[] = [
    { id: "overview", label: "Members" },
    { id: "issues", label: "Issues" },
    { id: "budget", label: "Budget" },
  ];

  const groupIssues = issues.filter((_, i) => i < group.issueCount);

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
      {/* Group header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">{group.name}</h2>
              <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getRoleColor(group.members[0]?.role || "participant")}`}>
                {getRoleLabel(group.members[0]?.role || "participant")}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
              <span className="flex items-center gap-1"><IoLocation className="w-3 h-3" />90210</span>
              <span>{group.members.length} members</span>
              <span>{group.issueCount} open issues</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors">
              <IoSettingsOutline className="w-3.5 h-3.5" />
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors">
              <IoPersonAddOutline className="w-3.5 h-3.5" />
              Invite
            </button>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex items-center gap-2 mt-3">
          {[
            { icon: IoConstruct, label: `${group.issueCount} open`, color: "text-amber-600 bg-amber-50" },
            { icon: IoCheckmarkCircle, label: "8 resolved", color: "text-green-600 bg-green-50" },
            { icon: IoWallet, label: "$1,250 balance", color: "text-blue-600 bg-blue-50" },
            { icon: IoTrendingUp, label: `$${group.savings.toLocaleString()} saved`, color: "text-blue-600 bg-blue-50" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${color}`}>
              <Icon className="w-3 h-3" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`py-2.5 px-1 mr-5 text-xs font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "overview" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Members ({group.members.length})</p>
              <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors">
                <IoPersonAddOutline className="w-3 h-3" />Add
              </button>
            </div>
            <div className="space-y-1.5">
              {group.members.map((member) => {
                const info = roleInfo[member.role as GroupRole];
                const RoleIcon = info?.icon ?? IoPersonCircle;
                const isMenuOpen = openMenuId === member.id;
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group relative"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-base flex-shrink-0">
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <div className="flex items-center gap-1">
                        <RoleIcon className="w-2.5 h-2.5 text-gray-400" />
                        <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getRoleColor(member.role)}`}>
                          {getRoleLabel(member.role)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : member.id); }}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IoEllipsisVertical className="w-3.5 h-3.5" />
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-50">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">
                          <IoShield className="w-3.5 h-3.5" />Change Role
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Pending invite 1 */}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-100">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <IoMailOutline className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">friend@example.com</p>
                  <p className="text-[10px] text-amber-600">Pending · Contributor · Expires in 3 days</p>
                </div>
                <button className="flex-shrink-0 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-300 rounded-md hover:bg-amber-100 transition-colors">
                  Resend
                </button>
              </div>
              {/* Pending invite 2 */}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-100">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <IoMailOutline className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">neighbor@example.com</p>
                  <p className="text-[10px] text-amber-600">Pending · Observer · Expires in 1 day</p>
                </div>
                <button className="flex-shrink-0 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-300 rounded-md hover:bg-amber-100 transition-colors">
                  Resend
                </button>
              </div>
            </div>

            {/* Group Preferences card */}
            <div className="mt-4 rounded-lg border border-gray-100 p-3 space-y-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Group Settings</p>
              <div className="flex flex-wrap gap-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">Risk:</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">Moderate</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">DIY:</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">Prefer DIY</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">Exclude:</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-100">Never DIY: Electrical</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">Radius:</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">25mi radius</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "issues" && (
          <div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{groupIssues.filter(i => i.status !== 'completed').length}</p>
                <p className="text-[10px] text-gray-400">Open</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-lg font-bold text-green-600">8</p>
                <p className="text-[10px] text-gray-400">Resolved</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-lg font-bold text-blue-600">87%</p>
                <p className="text-[10px] text-gray-400">DIY rate</p>
              </div>
            </div>
            <div className="space-y-1">
              {issues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${issue.status === 'completed' ? 'bg-green-400' : issue.priority === 'high' ? 'bg-red-400' : 'bg-amber-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{issue.title}</p>
                    <p className="text-[10px] text-gray-400">{issue.category} · {issue.createdAt}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                    issue.status === 'completed' ? 'bg-gray-100 text-gray-400'
                    : issue.status === 'open' ? 'bg-blue-50 text-blue-600'
                    : 'bg-amber-50 text-amber-600'
                  }`}>
                    {issue.status === 'completed' ? 'Done' : issue.status === 'open' ? 'Open' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "budget" && (
          <div className="space-y-4">
            <div className="rounded-xl p-4 bg-blue-50 border border-blue-100">
              <p className="text-xs text-gray-500 mb-1">Monthly Budget</p>
              <p className="text-2xl font-bold text-gray-900">$800</p>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Used</span><span>$340 / $800</span>
                </div>
                <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "42.5%" }} />
                </div>
              </div>
            </div>

            {/* Current Balance with trend */}
            <div className="rounded-lg p-3 bg-white border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5">Current Balance</p>
                <p className="text-lg font-bold text-gray-900">$1,250</p>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <IoArrowUpOutline className="w-4 h-4" />
                <span className="text-xs font-semibold">+$300</span>
              </div>
            </div>

            {/* Emergency Buffer */}
            <div className="rounded-lg p-3 bg-green-50 border border-green-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <IoShieldCheckmarkOutline className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800">$2,000 Emergency Buffer</p>
                <p className="text-[10px] text-green-600">Protected — not included in monthly budget</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contributions</p>
              {[
                { name: "Alex", amount: 150, avatar: "👤" },
                { name: "Jamie", amount: 300, avatar: "👩" },
                { name: "Sam", amount: 100, avatar: "🧑" },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm">{c.avatar}</div>
                  <span className="flex-1 text-sm text-gray-800">{c.name}</span>
                  <span className="text-sm font-semibold text-gray-900">${c.amount}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg p-3 bg-green-50 border border-green-100 flex items-center justify-between">
              <span className="text-xs text-gray-600">Total saved by group</span>
              <span className="text-sm font-bold text-green-600">${group.savings.toLocaleString()}</span>
            </div>

            {/* Risk tolerance impact note */}
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
              <IoAlertOutline className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-400">Risk level affects DIY recommendations for this group</p>
            </div>
          </div>
        )}
      </div>

      {openMenuId && <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />}
    </div>
  );
}

// ── Right panel: activity feed ────────────────────────────────────────────────

function ActivityPanel({ groupName }: { groupName: string }) {
  return (
    <div className="w-[220px] flex-shrink-0 flex flex-col h-full border-l border-gray-100 bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">Activity</p>
        <p className="text-[10px] text-gray-400">{groupName}</p>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {activityFeed.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex gap-3 px-4 py-2.5 relative">
              {/* Connector line */}
              {i < activityFeed.length - 1 && (
                <div className="absolute left-[26px] top-10 bottom-0 w-px bg-gray-100" />
              )}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 z-10 ${item.iconBg}`}>
                <Icon className={`w-3 h-3 ${item.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-800 leading-snug">{item.text}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
                <p className="text-[10px] text-gray-300 mt-0.5">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-gray-100 space-y-2">
        {/* Group Constraints summary */}
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Group Constraints</p>
          <div className="flex flex-wrap gap-1">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
              DIY preferred
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
              ⚡ No electrical DIY
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <IoCalendarOutline className="w-3 h-3" />
          Next: AC inspection · Thu
        </div>
      </div>
    </div>
  );
}

// ── Main GroupsView ───────────────────────────────────────────────────────────

export function GroupsView() {
  const [selectedId, setSelectedId] = useState<string>(households[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<GroupTab>("overview");

  const selectedGroup = households.find((h) => h.id === selectedId) ?? households[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setActiveTab("overview");
  };

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <GroupList selectedId={selectedId} onSelect={handleSelect} />
      {selectedGroup && (
        <>
          <GroupDetail group={selectedGroup} activeTab={activeTab} onTabChange={setActiveTab} />
          <ActivityPanel groupName={selectedGroup.name} />
        </>
      )}
    </div>
  );
}

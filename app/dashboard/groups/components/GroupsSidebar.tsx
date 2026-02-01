"use client";

import { IoPeople, IoAddOutline } from "react-icons/io5";
import type { GroupWithStats } from "@/lib/graphql/types";

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

interface GroupsSidebarProps {
  groups: GroupWithStats[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: () => void;
  totalSavings: number;
}

export function GroupsSidebar({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  totalSavings,
}: GroupsSidebarProps) {
  return (
    <div className="w-[280px] flex-shrink-0 overflow-y-auto p-4 border-r border-[#2a2a2a] bg-[#0f0f0f]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Groups</h2>
          <p className="text-xs text-[#666]">Manage your households</p>
        </div>
        <button
          onClick={onCreateGroup}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
        >
          <IoAddOutline className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Group Cards */}
      <div className="space-y-2">
        {groups.map((group) => {
          const isSelected = selectedGroupId === group.id;
          return (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className={`w-full text-left bg-[#1a1a1a] rounded-xl border overflow-hidden hover:border-[#333] transition-all ${
                isSelected ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-[#2a2a2a]"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2a2a2a]">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <IoPeople className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{group.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-[#666]">{group.memberCount} members</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${roleColors[group.role] || roleColors.observer}`}>
                        {roleLabels[group.role] || group.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Members & Stats Row */}
              <div className="px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5">
                    {group.members.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        className="w-6 h-6 rounded-full bg-[#333] border-2 border-[#1a1a1a] flex items-center justify-center text-xs"
                        title={`${member.name || "Member"} (${roleLabels[member.role] || member.role})`}
                      >
                        {member.avatar || "?"}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <div className="text-right">
                    <p className="text-[#555]">Issues</p>
                    <p className="font-semibold text-white">{group.issueCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#555]">Saved</p>
                    <p className="font-semibold text-emerald-400">${group.savings.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{groups.length}</p>
            <p className="text-[10px] text-[#666]">Groups</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">${totalSavings.toLocaleString()}</p>
            <p className="text-[10px] text-[#666]">Total Saved</p>
          </div>
        </div>
      </div>
    </div>
  );
}

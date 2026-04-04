"use client";

import { IoAddOutline, IoPeople } from "react-icons/io5";
import { getRoleColor, getRoleLabel } from "./config";
import type { GroupTab } from "./GroupTabs";

interface Household {
  id: string;
  name: string;
  members: Array<{ id: string; name: string; role: string; avatar: string }>;
  issueCount: number;
  savings: number;
}

interface GroupsSidebarProps {
  households: Household[];
  selectedGroup: string | null;
  totalSavings: number;
  onSelectGroup: (id: string) => void;
  onTabChange: (tab: GroupTab) => void;
  onNewGroup: () => void;
}

export function GroupsSidebar({
  households,
  selectedGroup,
  totalSavings,
  onSelectGroup,
  onTabChange,
  onNewGroup,
}: GroupsSidebarProps) {
  return (
    <div className="hidden lg:block w-[280px] shrink-0 scrollbar-auto-hide p-4 border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Groups</h2>
          <p className="text-xs text-gray-500">Manage your households</p>
        </div>
        <button
          onClick={onNewGroup}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-900 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
        >
          <IoAddOutline className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Household Cards */}
      <div className="space-y-2">
        {households.map((household) => {
          const isSelected = selectedGroup === household.id;
          const userRole = household.members[0]?.role || "participant";
          return (
            <button
              key={household.id}
              onClick={() => {
                onSelectGroup(household.id);
                onTabChange("overview");
              }}
              className={`w-full text-left bg-white rounded-xl border overflow-hidden hover:border-gray-300 transition-all ${
                isSelected ? "border-blue-500/50 ring-1 ring-blue-500/20" : "border-gray-200"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <IoPeople className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{household.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-500">{household.members.length} members</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getRoleColor(userRole)}`}>
                        {getRoleLabel(userRole)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Members & Stats Row */}
              <div className="px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5">
                    {household.members.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs"
                        title={`${member.name} (${getRoleLabel(member.role)})`}
                      >
                        {member.avatar}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <div className="text-right">
                    <p className="text-gray-600">Issues</p>
                    <p className="font-semibold text-gray-900">{household.issueCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Saved</p>
                    <p className="font-semibold text-blue-600">${household.savings.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{households.length}</p>
            <p className="text-[10px] text-gray-500">Groups</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">${totalSavings.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500">Total Saved</p>
          </div>
        </div>
      </div>
    </div>
  );
}

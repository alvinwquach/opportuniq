"use client";

import {
  IoCalendarOutline,
  IoConstructOutline,
  IoPersonOutline,
  IoAlertCircleOutline,
  IoCashOutline,
  IoFilterOutline,
} from "react-icons/io5";

export function TimelineSidebar() {
  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Next 7 Days</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
            <p className="text-lg font-bold text-white">5</p>
            <p className="text-[10px] text-[#666]">Events</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
            <p className="text-lg font-bold text-red-400">$2,595</p>
            <p className="text-[10px] text-[#666]">Expenses</p>
          </div>
        </div>
      </div>

      {/* By Type */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">By Type</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg">
            <div className="flex items-center gap-2">
              <IoConstructOutline className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-[#888]">DIY</span>
            </div>
            <span className="text-xs font-medium text-white">1</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg">
            <div className="flex items-center gap-2">
              <IoPersonOutline className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-[#888]">Pro Visits</span>
            </div>
            <span className="text-xs font-medium text-white">2</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg">
            <div className="flex items-center gap-2">
              <IoAlertCircleOutline className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-[#888]">Reminders</span>
            </div>
            <span className="text-xs font-medium text-white">2</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg">
            <div className="flex items-center gap-2">
              <IoCashOutline className="w-4 h-4 text-red-400" />
              <span className="text-xs text-[#888]">Expenses</span>
            </div>
            <span className="text-xs font-medium text-white">1</span>
          </div>
        </div>
      </div>

      {/* Quick Filter */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoFilterOutline className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-white">Quick Filter</h3>
        </div>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            All Events
          </button>
          <button className="w-full text-left px-3 py-2 text-xs text-[#888] hover:bg-[#252525] hover:text-white rounded-lg transition-colors">
            Today Only
          </button>
          <button className="w-full text-left px-3 py-2 text-xs text-[#888] hover:bg-[#252525] hover:text-white rounded-lg transition-colors">
            This Week
          </button>
          <button className="w-full text-left px-3 py-2 text-xs text-[#888] hover:bg-[#252525] hover:text-white rounded-lg transition-colors">
            Needs Confirmation
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  IoRepeat,
  IoCalendarOutline,
  IoTrendingUpOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";

export function RecurringSidebar() {
  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Overview</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#888]">Active Events</span>
            <span className="text-sm font-semibold text-emerald-400">5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#888]">Paused</span>
            <span className="text-sm font-semibold text-amber-400">1</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#888]">This Month</span>
            <span className="text-sm font-semibold text-white">3</span>
          </div>
        </div>
      </div>

      {/* Upcoming Recurrences */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Coming Up</h3>
        <div className="space-y-2">
          <div className="p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
            <p className="text-xs font-medium text-white">HVAC Filter</p>
            <p className="text-[10px] text-[#666] mt-0.5">Jan 29 · In 2 days</p>
          </div>
          <div className="p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
            <p className="text-xs font-medium text-white">Gutter Inspection</p>
            <p className="text-[10px] text-[#666] mt-0.5">Jan 31 · In 4 days</p>
          </div>
          <div className="p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
            <p className="text-xs font-medium text-white">Smoke Detector Test</p>
            <p className="text-[10px] text-[#666] mt-0.5">Feb 1 · In 5 days</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <IoTrendingUpOutline className="w-4 h-4 text-emerald-400 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-emerald-400">Pro Tip</p>
            <p className="text-[10px] text-[#888] mt-1">
              Set up recurring events for regular maintenance to catch issues early and save on repair costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

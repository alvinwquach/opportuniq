"use client";

import {
  IoLinkOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircle,
  IoCalendarOutline,
} from "react-icons/io5";

export function LinkedIssuesSidebar() {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoCalendarOutline className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-[#888]">Scheduled</span>
            </div>
            <span className="text-sm font-semibold text-emerald-400">2</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoAlertCircleOutline className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-[#888]">Need Scheduling</span>
            </div>
            <span className="text-sm font-semibold text-amber-400">2</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle className="w-4 h-4 text-[#888]" />
              <span className="text-xs text-[#888]">Resolved</span>
            </div>
            <span className="text-sm font-semibold text-[#888]">1</span>
          </div>
        </div>
      </div>

      {/* Savings */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-[#1a1a1a] rounded-xl border border-emerald-500/20 p-4">
        <h3 className="text-sm font-medium text-white mb-3">Potential Savings</h3>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">$750</p>
          <p className="text-[10px] text-[#666] mt-1">From scheduled repairs</p>
        </div>
        <div className="mt-3 pt-3 border-t border-emerald-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#888]">Already saved</span>
            <span className="font-medium text-emerald-400">$95</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#888] hover:bg-[#252525] hover:text-white rounded-lg transition-colors">
            <IoLinkOutline className="w-4 h-4" />
            Link issue to event
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#888] hover:bg-[#252525] hover:text-white rounded-lg transition-colors">
            <IoCalendarOutline className="w-4 h-4" />
            Schedule all open issues
          </button>
        </div>
      </div>
    </div>
  );
}

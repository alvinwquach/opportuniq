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
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoCalendarOutline className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Scheduled</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">2</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoAlertCircleOutline className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-gray-500">Need Scheduling</span>
            </div>
            <span className="text-sm font-semibold text-amber-600">2</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Resolved</span>
            </div>
            <span className="text-sm font-semibold text-gray-500">1</span>
          </div>
        </div>
      </div>

      {/* Savings */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Potential Savings</h3>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">$750</p>
          <p className="text-[10px] text-gray-500 mt-1">From scheduled repairs</p>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Already saved</span>
            <span className="font-medium text-blue-600">$95</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
            <IoLinkOutline className="w-4 h-4" />
            Link issue to event
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
            <IoCalendarOutline className="w-4 h-4" />
            Schedule all open issues
          </button>
        </div>
      </div>
    </div>
  );
}

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
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Overview</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Active Events</span>
            <span className="text-sm font-semibold text-blue-600">5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Paused</span>
            <span className="text-sm font-semibold text-amber-600">1</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">This Month</span>
            <span className="text-sm font-semibold text-gray-900">3</span>
          </div>
        </div>
      </div>

      {/* Upcoming Recurrences */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Coming Up</h3>
        <div className="space-y-2">
          <div className="p-2.5 bg-white rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-900">HVAC Filter</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Jan 29 · In 2 days</p>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-900">Gutter Inspection</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Jan 31 · In 4 days</p>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-900">Smoke Detector Test</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Feb 1 · In 5 days</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <IoTrendingUpOutline className="w-4 h-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-blue-600">Pro Tip</p>
            <p className="text-[10px] text-gray-500 mt-1">
              Set up recurring events for regular maintenance to catch issues early and save on repair costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

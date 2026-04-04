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
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Next 7 Days</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-lg font-bold text-gray-900">5</p>
            <p className="text-[10px] text-gray-500">Events</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-lg font-bold text-red-600">$2,595</p>
            <p className="text-[10px] text-gray-500">Expenses</p>
          </div>
        </div>
      </div>

      {/* By Type */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">By Type</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <IoConstructOutline className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">DIY</span>
            </div>
            <span className="text-xs font-medium text-gray-900">1</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <IoPersonOutline className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Pro Visits</span>
            </div>
            <span className="text-xs font-medium text-gray-900">2</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <IoAlertCircleOutline className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-gray-500">Reminders</span>
            </div>
            <span className="text-xs font-medium text-gray-900">2</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <IoCashOutline className="w-4 h-4 text-red-600" />
              <span className="text-xs text-gray-500">Expenses</span>
            </div>
            <span className="text-xs font-medium text-gray-900">1</span>
          </div>
        </div>
      </div>

      {/* Quick Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoFilterOutline className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">Quick Filter</h3>
        </div>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg">
            All Events
          </button>
          <button className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
            Today Only
          </button>
          <button className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
            This Week
          </button>
          <button className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
            Needs Confirmation
          </button>
        </div>
      </div>
    </div>
  );
}

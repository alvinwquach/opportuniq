"use client";

import {
  IoRepeat,
  IoAddOutline,
  IoConstructOutline,
  IoPersonOutline,
  IoAlertCircleOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoEllipsisVertical,
  IoCheckmarkCircle,
  IoPauseCircle,
  IoPlayCircle,
  IoPencil,
  IoTrash,
} from "react-icons/io5";
import { useState } from "react";

// Recurring events data
const recurringEvents = [
  {
    id: "1",
    title: "HVAC Filter Change",
    type: "diy",
    pattern: "Every 3 months",
    nextDate: "Jan 29, 2025",
    lastCompleted: "Oct 29, 2024",
    status: "active",
    estimatedCost: 45,
    notes: "Replace 20x25x1 filter. Check for dust buildup.",
  },
  {
    id: "2",
    title: "Gutter Inspection",
    type: "reminder",
    pattern: "Every 6 months",
    nextDate: "Jan 31, 2025",
    lastCompleted: "Jul 31, 2024",
    status: "active",
    estimatedCost: 0,
    notes: "Check for debris and ensure proper drainage.",
  },
  {
    id: "3",
    title: "Smoke Detector Test",
    type: "reminder",
    pattern: "Monthly",
    nextDate: "Feb 1, 2025",
    lastCompleted: "Jan 1, 2025",
    status: "active",
    estimatedCost: 0,
    notes: "Test all smoke detectors. Replace batteries if needed.",
  },
  {
    id: "4",
    title: "Pest Control",
    type: "contractor",
    pattern: "Quarterly",
    nextDate: "Mar 15, 2025",
    lastCompleted: "Dec 15, 2024",
    status: "active",
    estimatedCost: 120,
    notes: "Schedule with ABC Pest Control.",
  },
  {
    id: "5",
    title: "Lawn Mowing",
    type: "diy",
    pattern: "Weekly (Spring-Fall)",
    nextDate: "Apr 1, 2025",
    lastCompleted: "Nov 15, 2024",
    status: "paused",
    estimatedCost: 0,
    notes: "Seasonal - paused for winter.",
  },
  {
    id: "6",
    title: "Water Heater Flush",
    type: "diy",
    pattern: "Annually",
    nextDate: "Jun 1, 2025",
    lastCompleted: "Jun 1, 2024",
    status: "active",
    estimatedCost: 0,
    notes: "Drain and flush sediment from water heater.",
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "contractor": return IoPersonOutline;
    case "diy": return IoConstructOutline;
    case "reminder": return IoAlertCircleOutline;
    case "expense": return IoCashOutline;
    default: return IoCalendarOutline;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "contractor": return "bg-blue-100 text-blue-600 border-blue-200";
    case "diy": return "bg-blue-100 text-blue-600 border-blue-200";
    case "reminder": return "bg-amber-100 text-amber-600 border-amber-200";
    case "expense": return "bg-red-100 text-red-600 border-red-200";
    default: return "bg-gray-100 text-gray-500 border-gray-200";
  }
};

export function RecurringTab() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const activeCount = recurringEvents.filter(e => e.status === "active").length;
  const pausedCount = recurringEvents.filter(e => e.status === "paused").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Recurring Events</h3>
          <p className="text-xs text-gray-500">{activeCount} active, {pausedCount} paused</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-900 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
          <IoAddOutline className="w-4 h-4" />
          Add Recurring
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-lg font-bold text-gray-900">{recurringEvents.length}</p>
          <p className="text-[10px] text-gray-500">Total Events</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-lg font-bold text-blue-600">{activeCount}</p>
          <p className="text-[10px] text-gray-500">Active</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-lg font-bold text-amber-600">{pausedCount}</p>
          <p className="text-[10px] text-gray-500">Paused</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-lg font-bold text-gray-900">$165</p>
          <p className="text-[10px] text-gray-500">Monthly Avg</p>
        </div>
      </div>

      {/* Recurring Events List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">All Recurring Events</h4>
          <select className="px-2 py-1 text-xs bg-white border border-gray-200 rounded text-gray-500 focus:outline-none">
            <option>All Types</option>
            <option>DIY</option>
            <option>Pro Visits</option>
            <option>Reminders</option>
          </select>
        </div>

        <div className="divide-y divide-gray-200">
          {recurringEvents.map((event) => {
            const Icon = getTypeIcon(event.type);
            const isMenuOpen = openMenuId === event.id;
            const isPaused = event.status === "paused";

            return (
              <div
                key={event.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${isPaused ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getTypeColor(event.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-medium text-gray-900">{event.title}</h5>
                          {isPaused && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded">
                              Paused
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <IoRepeat className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-xs text-gray-500">{event.pattern}</span>
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(isMenuOpen ? null : event.id)}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        >
                          <IoEllipsisVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-8 w-36 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-50">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                              <IoPencil className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            {isPaused ? (
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-600 hover:bg-blue-50">
                                <IoPlayCircle className="w-3.5 h-3.5" />
                                Resume
                              </button>
                            ) : (
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-600 hover:bg-amber-50">
                                <IoPauseCircle className="w-3.5 h-3.5" />
                                Pause
                              </button>
                            )}
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                              <IoTrash className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-[10px] text-gray-600">Next</p>
                        <p className="text-xs font-medium text-gray-900">{event.nextDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-600">Last Completed</p>
                        <p className="text-xs text-gray-500">{event.lastCompleted}</p>
                      </div>
                      {event.estimatedCost > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-600">Est. Cost</p>
                          <p className="text-xs text-gray-500">${event.estimatedCost}</p>
                        </div>
                      )}
                    </div>

                    {event.notes && (
                      <p className="text-xs text-gray-500 mt-2">{event.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Close menu when clicking outside */}
      {openMenuId && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}

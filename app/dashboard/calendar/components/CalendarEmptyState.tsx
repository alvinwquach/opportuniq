"use client";

import { IoCalendarOutline, IoAddOutline } from "react-icons/io5";

interface CalendarEmptyStateProps {
  onAddEvent: () => void;
}

export function CalendarEmptyState({ onAddEvent }: CalendarEmptyStateProps) {
  return (
    <div className="p-6 min-h-[calc(100vh-48px)] bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-6">
          <IoCalendarOutline className="w-10 h-10 text-[#444]" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          No Events Scheduled
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Your calendar is empty. Schedule DIY projects, contractor visits, and
          reminders to keep track of your home maintenance tasks.
        </p>
        <button
          onClick={onAddEvent}
          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-gray-900 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
        >
          <IoAddOutline className="w-5 h-5" />
          Add Your First Event
        </button>
      </div>
    </div>
  );
}

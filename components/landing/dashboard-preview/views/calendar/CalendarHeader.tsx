"use client";

import { useRef, useEffect, useState } from "react";
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoChevronDownOutline,
  IoDownloadOutline,
  IoAddOutline,
  IoSyncOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoClose,
  IoGridOutline,
  IoListOutline,
} from "react-icons/io5";
import { ViewMode } from "./types";
import { monthNames, monthNamesShort, calendarSyncStatus } from "./data";

interface CalendarHeaderProps {
  currentYear: number;
  currentMonth: number;
  viewMode: ViewMode;
  isCurrentMonth: boolean;
  weekDisplayText: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onGoToToday: () => void;
  onGoToMonth: (year: number, month: number) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onAddEvent: () => void;
  setCurrentYear: (year: number) => void;
}

export function CalendarHeader({
  currentYear,
  currentMonth,
  viewMode,
  isCurrentMonth,
  weekDisplayText,
  onPrevMonth,
  onNextMonth,
  onPrevWeek,
  onNextWeek,
  onGoToToday,
  onGoToMonth,
  onViewModeChange,
  onAddEvent,
  setCurrentYear,
}: CalendarHeaderProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showSyncStatus, setShowSyncStatus] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const syncStatusRef = useRef<HTMLDivElement>(null);
  const todayDate = new Date();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
        setShowMonthPicker(false);
      }
      if (syncStatusRef.current && !syncStatusRef.current.contains(event.target as Node)) {
        setShowSyncStatus(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoToMonth = (month: number) => {
    onGoToMonth(currentYear, month);
    setShowMonthPicker(false);
  };

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Month/Year with Picker */}
        <div className="relative" ref={monthPickerRef}>
          <button
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {viewMode === 'month' ? (
              <span>{monthNames[currentMonth]} {currentYear}</span>
            ) : (
              <span>{weekDisplayText}</span>
            )}
            <IoChevronDownOutline className={`w-4 h-4 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
          </button>

          {showMonthPicker && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-md z-50 p-4 w-[280px]">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                <button
                  onClick={() => setCurrentYear(currentYear - 1)}
                  className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                >
                  <IoChevronBackOutline className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-gray-900">{currentYear}</span>
                <button
                  onClick={() => setCurrentYear(currentYear + 1)}
                  className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                >
                  <IoChevronForwardOutline className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {monthNamesShort.map((month, index) => {
                  const isSelected = currentMonth === index;
                  const isCurrent = todayDate.getMonth() === index && todayDate.getFullYear() === currentYear;
                  return (
                    <button
                      key={month}
                      onClick={() => handleGoToMonth(index)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : isCurrent
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-100'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {month}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-center">
                <button
                  onClick={() => {
                    onGoToToday();
                    setShowMonthPicker(false);
                  }}
                  className="px-4 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Jump to Today
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Prev/Next Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={viewMode === 'month' ? onPrevMonth : onPrevWeek}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <IoChevronBackOutline className="w-4 h-4" />
          </button>
          <button
            onClick={viewMode === 'month' ? onNextMonth : onNextWeek}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <IoChevronForwardOutline className="w-4 h-4" />
          </button>
        </div>

        {/* Today Button */}
        {!isCurrentMonth && (
          <button
            onClick={onGoToToday}
            className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 text-xs font-medium rounded-full transition-colors"
          >
            Today
          </button>
        )}
        {isCurrentMonth && viewMode === 'month' && (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">Today</span>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => onViewModeChange('month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'month' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <IoGridOutline className="w-3.5 h-3.5" />
            Month
          </button>
          <button
            onClick={() => onViewModeChange('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'week' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <IoListOutline className="w-3.5 h-3.5" />
            Week
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Sync Status */}
        <div className="relative" ref={syncStatusRef}>
          <button
            onClick={() => setShowSyncStatus(!showSyncStatus)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 border border-gray-200 hover:bg-white rounded-lg transition-colors"
          >
            <IoSyncOutline className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Synced</span>
          </button>

          {showSyncStatus && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-md z-50 p-4 w-[260px]">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Calendar Sync</h4>
              <div className="space-y-3">
                {calendarSyncStatus.map((sync, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {sync.status === 'synced' && <IoCheckmarkCircleOutline className="w-4 h-4 text-blue-600" />}
                      {sync.status === 'syncing' && <IoSyncOutline className="w-4 h-4 text-amber-600 animate-spin" />}
                      {sync.status === 'error' && <IoWarningOutline className="w-4 h-4 text-red-600" />}
                      {sync.status === 'disconnected' && <IoClose className="w-4 h-4 text-gray-500" />}
                      <span className="text-xs text-gray-900">{sync.provider}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{sync.lastSync}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                  <IoAddOutline className="w-4 h-4" />
                  Connect Calendar
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {}}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 border border-gray-200 hover:bg-white rounded-lg transition-colors"
        >
          <IoDownloadOutline className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button
          onClick={onAddEvent}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-900 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <IoAddOutline className="w-4 h-4" />
          <span className="hidden sm:inline">Add Event</span>
        </button>
      </div>
    </div>
  );
}

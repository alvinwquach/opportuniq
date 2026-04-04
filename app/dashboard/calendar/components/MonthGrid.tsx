"use client";

import {
  IoEllipsisHorizontal,
  IoRepeat,
  IoCalendarOutline,
  IoPencil,
  IoTrash,
  IoConstruct,
  IoWallet,
  IoTrendingUp,
  IoAlertCircle,
} from "react-icons/io5";
import type { CalendarDay, CalendarEvent, EventType } from "../types";

interface MonthGridProps {
  calendarDays: CalendarDay[];
  today: number;
  isCurrentMonth: boolean;
  draggedEvent: string | null;
  dragOverDate: number | null;
  openMenuId: string | null;
  onDragStart: (eventId: string) => void;
  onDragOver: (e: React.DragEvent, date: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, date: number) => void;
  onEventClick: (eventId: string) => void;
  onMenuToggle: (eventId: string | null) => void;
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getEventColor = (type: string) => {
  switch (type) {
    case "contractor":
      return "bg-blue-100 border-blue-500/30 text-blue-600";
    case "diy":
      return "bg-blue-100 border-blue-500/30 text-blue-600";
    case "reminder":
      return "bg-amber-500/20 border-amber-500/30 text-amber-400";
    case "income":
      return "bg-blue-100 border-blue-500/30 text-blue-600";
    case "expense":
      return "bg-red-500/20 border-red-500/30 text-red-400";
    default:
      return "bg-[#333] border-[#444] text-gray-500";
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case "contractor":
      return IoConstruct;
    case "diy":
      return IoConstruct;
    case "reminder":
      return IoAlertCircle;
    case "income":
      return IoTrendingUp;
    case "expense":
      return IoWallet;
    default:
      return IoWallet;
  }
};

export function MonthGrid({
  calendarDays,
  today,
  isCurrentMonth,
  draggedEvent,
  dragOverDate,
  openMenuId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onEventClick,
  onMenuToggle,
}: MonthGridProps) {
  return (
    <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {weekDays.map((day, idx) => (
          <div
            key={day}
            className={`px-3 py-2.5 text-center border-r border-gray-200 last:border-r-0 ${idx === 0 || idx === 6 ? "bg-gray-50" : ""}`}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {day}
            </p>
          </div>
        ))}
      </div>

      {/* Calendar days grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const isToday =
            isCurrentMonth && day.date === today && !day.isOtherMonth;
          const isOtherMonth = day.isOtherMonth;
          const isWeekend = index % 7 === 0 || index % 7 === 6;
          const isDragOver = dragOverDate === day.date && !isOtherMonth;

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border-r border-b border-gray-200 last:border-r-0 transition-colors ${
                isDragOver
                  ? "bg-blue-100 ring-2 ring-blue-500 ring-inset"
                  : isOtherMonth
                    ? "bg-gray-50"
                    : isToday
                      ? "bg-blue-50"
                      : isWeekend
                        ? "bg-gray-50 hover:bg-gray-100"
                        : "bg-gray-100 hover:bg-gray-100"
              }`}
              onDragOver={(e) => !isOtherMonth && onDragOver(e, day.date)}
              onDragLeave={onDragLeave}
              onDrop={(e) => !isOtherMonth && onDrop(e, day.date)}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium ${
                    isToday
                      ? "w-7 h-7 flex items-center justify-center bg-blue-500 text-gray-900 rounded-full"
                      : isOtherMonth
                        ? "text-[#444]"
                        : "text-gray-900"
                  }`}
                >
                  {day.date}
                </span>
              </div>
              {!isOtherMonth && (
                <div className="space-y-1">
                  {day.events.slice(0, 2).map((event) => {
                    const EventIcon = getEventIcon(event.type);
                    const isRecurring = event.isRecurring;
                    return (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={() => onDragStart(event.id)}
                        className={`p-1.5 rounded text-[10px] border ${getEventColor(event.type)} cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative ${draggedEvent === event.id ? "opacity-50" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event.id);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <EventIcon className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="font-medium truncate flex-1">
                            {event.title}
                          </span>
                          {isRecurring && (
                            <IoRepeat className="w-2.5 h-2.5 flex-shrink-0 opacity-60" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMenuToggle(
                                openMenuId === event.id ? null : event.id
                              );
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <IoEllipsisHorizontal className="w-3 h-3" />
                          </button>
                        </div>
                        {event.time && (
                          <span className="text-[9px] opacity-75 mt-0.5 block">
                            {event.time}
                          </span>
                        )}
                        {openMenuId === event.id && (
                          <div className="absolute right-0 top-6 z-20 w-28 bg-gray-100 rounded-lg border border-gray-200 shadow-lg py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick(event.id);
                                onMenuToggle(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 hover:bg-[#333] transition-colors"
                            >
                              <IoCalendarOutline className="w-3 h-3" />
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMenuToggle(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 hover:bg-[#333] transition-colors"
                            >
                              <IoPencil className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMenuToggle(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <IoTrash className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {day.events.length > 2 && (
                    <div className="text-[10px] text-gray-500 font-medium px-1 cursor-pointer hover:text-blue-600">
                      +{day.events.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

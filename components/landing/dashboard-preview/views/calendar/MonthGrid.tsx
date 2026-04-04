"use client";

import { IoEllipsisHorizontal, IoRepeat, IoCalendarOutline, IoPencil, IoTrash } from "react-icons/io5";
import { CalendarDay } from "./types";
import { extendedEvents } from "./data";
import { getEventColor, getEventIcon } from "./utils";
import { useDarkMode } from "../../DarkModeContext";

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

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  const dark = useDarkMode();
  const b = dark ? "border-white/[0.06]" : "border-gray-200";

  return (
    <div className={`rounded-xl border overflow-hidden ${dark ? "bg-[#1a1a1a] border-white/[0.06]" : "bg-white border-gray-200"}`}>
      {/* Week day headers */}
      <div className={`grid grid-cols-7 border-b ${b} ${dark ? "bg-[#1a1a1a]" : "bg-white"}`}>
        {weekDays.map((day, idx) => (
          <div key={day} className={`px-3 py-2.5 text-center border-r last:border-r-0 ${b} ${idx === 0 || idx === 6 ? dark ? 'bg-white/[0.02]' : 'bg-gray-50' : ''}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? "text-gray-600" : "text-gray-500"}`}>{day}</p>
          </div>
        ))}
      </div>

      {/* Calendar days grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const isToday = isCurrentMonth && day.date === today && !day.isOtherMonth;
          const isOtherMonth = day.isOtherMonth;
          const isWeekend = index % 7 === 0 || index % 7 === 6;
          const isDragOver = dragOverDate === day.date && !isOtherMonth;

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border-r border-b last:border-r-0 transition-colors ${b} ${
                isDragOver ? 'bg-blue-500/20 ring-2 ring-blue-500 ring-inset' :
                isOtherMonth ? dark ? 'bg-white/[0.01]' : 'bg-gray-50' :
                isToday ? dark ? 'bg-blue-500/10' : 'bg-blue-50' :
                isWeekend ? dark ? 'bg-white/[0.02] hover:bg-white/[0.04]' : 'bg-gray-100 hover:bg-white' :
                dark ? 'bg-transparent hover:bg-white/[0.03]' : 'bg-white hover:bg-gray-100'
              }`}
              onDragOver={(e) => !isOtherMonth && onDragOver(e, day.date)}
              onDragLeave={onDragLeave}
              onDrop={(e) => !isOtherMonth && onDrop(e, day.date)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  isToday ? 'w-7 h-7 flex items-center justify-center bg-blue-500 text-white rounded-full' :
                  isOtherMonth ? dark ? 'text-gray-700' : 'text-gray-300' : dark ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {day.date}
                </span>
              </div>
              {!isOtherMonth && (
                <div className="space-y-1">
                  {day.events.slice(0, 2).map((event) => {
                    const EventIcon = getEventIcon(event.type);
                    const extendedEvent = extendedEvents.find(e => e.id === event.id);
                    const isRecurring = extendedEvent?.isRecurring;
                    return (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={() => onDragStart(event.id)}
                        className={`p-1.5 rounded text-[10px] border ${getEventColor(event.type)} cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative ${draggedEvent === event.id ? 'opacity-50' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event.id);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <EventIcon className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="font-medium truncate flex-1">{event.title}</span>
                          {isRecurring && <IoRepeat className="w-2.5 h-2.5 flex-shrink-0 opacity-60" />}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMenuToggle(openMenuId === event.id ? null : event.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <IoEllipsisHorizontal className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[9px] opacity-75 mt-0.5 block">{event.time}</span>
                        {openMenuId === event.id && (
                          <div className={`absolute right-0 top-6 z-20 w-28 rounded-lg border shadow-lg py-1 ${dark ? "bg-[#252525] border-white/10" : "bg-white border-gray-200"}`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick(event.id);
                                onMenuToggle(null);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${dark ? "text-gray-400 hover:bg-white/[0.06]" : "text-gray-500 hover:bg-gray-100"}`}
                            >
                              <IoCalendarOutline className="w-3 h-3" />
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMenuToggle(null);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${dark ? "text-gray-400 hover:bg-white/[0.06]" : "text-gray-500 hover:bg-gray-100"}`}
                            >
                              <IoPencil className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMenuToggle(null);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${dark ? "text-red-400 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50"}`}
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
                    <div className={`text-[10px] font-medium px-1 cursor-pointer ${dark ? "text-gray-600 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}>
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

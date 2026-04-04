"use client";

import { IoRepeat } from "react-icons/io5";
import { extendedEvents, weekDays } from "./data";
import { getEventColor } from "./utils";

interface WeekGridProps {
  weekDays: Date[];
  todayDate: Date;
  onDragStart: (eventId: string) => void;
  onDrop: (e: React.DragEvent, date: number) => void;
  onEventClick: (eventId: string) => void;
}

export function WeekGrid({
  weekDays: weekDaysDates,
  todayDate,
  onDragStart,
  onDrop,
  onEventClick,
}: WeekGridProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-8 border-b border-gray-200 bg-white">
        <div className="px-3 py-2.5 text-center border-r border-gray-200">
          <p className="text-xs font-semibold text-gray-500">Time</p>
        </div>
        {weekDaysDates.map((day, idx) => {
          const isToday = day.toDateString() === todayDate.toDateString();
          const isWeekend = idx === 0 || idx === 6;
          return (
            <div key={idx} className={`px-3 py-2.5 text-center border-r border-gray-200 last:border-r-0 ${isWeekend ? 'bg-gray-50' : ''}`}>
              <p className="text-[10px] font-medium text-gray-500 uppercase">{weekDays[idx]}</p>
              <p className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>{day.getDate()}</p>
            </div>
          );
        })}
      </div>

      {/* Time slots */}
      <div className="max-h-[600px] overflow-y-auto">
        {Array.from({ length: 14 }, (_, i) => i + 6).map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-gray-200 min-h-[50px]">
            <div className="px-3 py-2 text-right border-r border-gray-200 bg-white">
              <span className="text-xs text-gray-500">{hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}</span>
            </div>
            {weekDaysDates.map((day, idx) => {
              const isWeekend = idx === 0 || idx === 6;
              // Mock: show events at specific hours
              const hasEvent = (idx === 1 && hour === 10) || (idx === 3 && hour === 14);
              const event = hasEvent ? (idx === 1 ? extendedEvents[0] : extendedEvents[1]) : null;
              return (
                <div
                  key={idx}
                  className={`border-r border-gray-200 last:border-r-0 p-1 ${isWeekend ? 'bg-gray-50' : 'bg-white hover:bg-gray-100'}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, day.getDate())}
                >
                  {event && (
                    <div
                      draggable
                      onDragStart={() => onDragStart(event.id)}
                      onClick={() => onEventClick(event.id)}
                      className={`p-2 rounded text-xs border ${getEventColor(event.type)} cursor-grab active:cursor-grabbing h-full hover:shadow-md transition-all`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium truncate">{event.title}</span>
                        {event.isRecurring && <IoRepeat className="w-3 h-3 flex-shrink-0 opacity-60" />}
                      </div>
                      <span className="text-[10px] opacity-75">{event.time}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { IoRepeat, IoConstruct, IoWallet, IoTrendingUp, IoAlertCircle } from "react-icons/io5";
import type { CalendarEvent } from "../types";

interface WeekGridProps {
  weekDays: Date[];
  todayDate: Date;
  events: CalendarEvent[];
  onDragStart: (eventId: string) => void;
  onDrop: (e: React.DragEvent, date: number) => void;
  onEventClick: (eventId: string) => void;
}

const weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

export function WeekGrid({
  weekDays,
  todayDate,
  events,
  onDragStart,
  onDrop,
  onEventClick,
}: WeekGridProps) {
  // Group events by day for the week view
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  return (
    <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
        <div className="px-3 py-2.5 text-center border-r border-gray-200">
          <p className="text-xs font-semibold text-gray-500">Time</p>
        </div>
        {weekDays.map((day, idx) => {
          const isToday = day.toDateString() === todayDate.toDateString();
          const isWeekend = idx === 0 || idx === 6;
          return (
            <div
              key={idx}
              className={`px-3 py-2.5 text-center border-r border-gray-200 last:border-r-0 ${isWeekend ? "bg-gray-50" : ""}`}
            >
              <p className="text-[10px] font-medium text-gray-500 uppercase">
                {weekDayNames[idx]}
              </p>
              <p
                className={`text-lg font-semibold ${isToday ? "text-blue-600" : "text-gray-900"}`}
              >
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time slots */}
      <div className="max-h-[600px] overflow-y-auto">
        {Array.from({ length: 14 }, (_, i) => i + 6).map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-8 border-b border-gray-200 min-h-[50px]"
          >
            <div className="px-3 py-2 text-right border-r border-gray-200 bg-gray-50">
              <span className="text-xs text-gray-500">
                {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"}
              </span>
            </div>
            {weekDays.map((day, idx) => {
              const isWeekend = idx === 0 || idx === 6;
              const dayEvents = getEventsForDay(day);
              // Find event for this hour (if any)
              const hourEvent = dayEvents.find((event) => {
                if (!event.time) return false;
                const eventHour = parseInt(event.time.split(":")[0]);
                const isPM = event.time.toLowerCase().includes("pm");
                const hour24 =
                  isPM && eventHour !== 12
                    ? eventHour + 12
                    : !isPM && eventHour === 12
                      ? 0
                      : eventHour;
                return hour24 === hour;
              });

              return (
                <div
                  key={idx}
                  className={`border-r border-gray-200 last:border-r-0 p-1 ${isWeekend ? "bg-gray-50" : "bg-gray-100 hover:bg-gray-100"}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, day.getDate())}
                >
                  {hourEvent && (
                    <div
                      draggable
                      onDragStart={() => onDragStart(hourEvent.id)}
                      onClick={() => onEventClick(hourEvent.id)}
                      className={`p-2 rounded text-xs border ${getEventColor(hourEvent.type)} cursor-grab active:cursor-grabbing h-full hover:shadow-md transition-all`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium truncate">
                          {hourEvent.title}
                        </span>
                        {hourEvent.isRecurring && (
                          <IoRepeat className="w-3 h-3 flex-shrink-0 opacity-60" />
                        )}
                      </div>
                      <span className="text-[10px] opacity-75">
                        {hourEvent.time}
                      </span>
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

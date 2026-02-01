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
      return "bg-emerald-500/20 border-emerald-500/30 text-emerald-400";
    case "diy":
      return "bg-emerald-500/20 border-emerald-500/30 text-emerald-400";
    case "reminder":
      return "bg-amber-500/20 border-amber-500/30 text-amber-400";
    case "income":
      return "bg-emerald-500/20 border-emerald-500/30 text-emerald-400";
    case "expense":
      return "bg-red-500/20 border-red-500/30 text-red-400";
    default:
      return "bg-[#333] border-[#444] text-[#888]";
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
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-8 border-b border-[#2a2a2a] bg-[#0f0f0f]">
        <div className="px-3 py-2.5 text-center border-r border-[#2a2a2a]">
          <p className="text-xs font-semibold text-[#666]">Time</p>
        </div>
        {weekDays.map((day, idx) => {
          const isToday = day.toDateString() === todayDate.toDateString();
          const isWeekend = idx === 0 || idx === 6;
          return (
            <div
              key={idx}
              className={`px-3 py-2.5 text-center border-r border-[#2a2a2a] last:border-r-0 ${isWeekend ? "bg-[#0a0a0a]" : ""}`}
            >
              <p className="text-[10px] font-medium text-[#666] uppercase">
                {weekDayNames[idx]}
              </p>
              <p
                className={`text-lg font-semibold ${isToday ? "text-emerald-400" : "text-white"}`}
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
            className="grid grid-cols-8 border-b border-[#2a2a2a] min-h-[50px]"
          >
            <div className="px-3 py-2 text-right border-r border-[#2a2a2a] bg-[#0f0f0f]">
              <span className="text-xs text-[#666]">
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
                  className={`border-r border-[#2a2a2a] last:border-r-0 p-1 ${isWeekend ? "bg-[#0a0a0a]" : "bg-[#1a1a1a] hover:bg-[#252525]"}`}
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

"use client";

import {
  IoSunnyOutline,
  IoCloudOutline,
  IoRainyOutline,
  IoChevronForward,
} from "react-icons/io5";
import { calendarEvents } from "../../mockData";

// Mini weather forecast for planning
const weekForecast = [
  { day: "Today", icon: IoSunnyOutline, high: 72, low: 58, good: true },
  { day: "Tue", icon: IoCloudOutline, high: 68, low: 55, good: true },
  { day: "Wed", icon: IoRainyOutline, high: 62, low: 52, good: false },
  { day: "Thu", icon: IoSunnyOutline, high: 70, low: 56, good: true },
  { day: "Fri", icon: IoCloudOutline, high: 65, low: 54, good: true },
];

export function CalendarSidebar() {
  return (
    <div className="space-y-4">
      {/* This Month Stats */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">This Month</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
            <p className="text-lg font-bold text-white">7</p>
            <p className="text-[10px] text-[#666]">Scheduled</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
            <p className="text-lg font-bold text-emerald-400">3</p>
            <p className="text-[10px] text-[#666]">Completed</p>
          </div>
        </div>
      </div>

      {/* Weather for Planning */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Weather</h3>
          <span className="text-[10px] text-[#666]">Plan outdoor work</span>
        </div>
        <div className="space-y-2">
          {weekForecast.map((day) => {
            const Icon = day.icon;
            return (
              <div
                key={day.day}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  day.good ? "bg-[#0f0f0f]" : "bg-amber-500/10 border border-amber-500/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${day.good ? "text-[#888]" : "text-amber-400"}`} />
                  <span className="text-xs text-white">{day.day}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white">{day.high}°</span>
                  <span className="text-xs text-[#555]">{day.low}°</span>
                  {!day.good && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                      Rain
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Coming Up</h3>
          <button className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5">
            View all <IoChevronForward className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2">
          {calendarEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 p-2.5 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] hover:bg-[#151515] cursor-pointer transition-colors"
            >
              <div
                className={`w-1 h-8 rounded-full ${
                  event.type === "contractor"
                    ? "bg-blue-500"
                    : event.type === "diy"
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{event.title}</p>
                <p className="text-[10px] text-[#666]">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Types Legend */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Legend</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-[#888]">DIY</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[10px] text-[#888]">Pro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[10px] text-[#888]">Reminder</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-[10px] text-[#888]">Expense</span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { IoCalendar, IoConstruct, IoCall, IoNotifications } from "react-icons/io5";
import { WeekCalendarView } from "../WeekCalendarView";

interface CalendarEvent {
  id: string;
  issueId: string;
  title: string;
  date: Date | string;
  time?: string | null;
  type: "diy" | "contractor" | "reminder";
}

interface CalendarSectionProps {
  events: CalendarEvent[];
}

export function CalendarSection({ events }: CalendarSectionProps) {
  return (
    <section className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <IoCalendar className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-white">Schedule</h2>
            <p className="text-[10px] text-[#9a9a9a]">
              {events.length} upcoming event{events.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Link
          href="/calendar"
          className="text-xs text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors"
        >
          Full Calendar
        </Link>
      </div>

      {/* Week View */}
      <WeekCalendarView events={events} />

      {/* Upcoming Events List */}
      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#1f1f1f] space-y-2">
          {events.slice(0, 3).map((event) => (
            <Link
              key={event.id}
              href={`/issues/${event.issueId}`}
              className="flex items-center gap-3 p-2 -mx-1 rounded-lg hover:bg-[#1f1f1f] transition-colors group"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  event.type === "diy"
                    ? "bg-[#00D4FF]/10"
                    : event.type === "contractor"
                    ? "bg-purple-500/10"
                    : "bg-amber-500/10"
                }`}
              >
                {event.type === "diy" ? (
                  <IoConstruct className="w-3.5 h-3.5 text-[#00D4FF]" />
                ) : event.type === "contractor" ? (
                  <IoCall className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <IoNotifications className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate group-hover:text-[#00D4FF] transition-colors">
                  {event.title}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#9a9a9a]">
                  <span>
                    {new Date(event.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {event.time && (
                    <>
                      <span className="text-[#333]">·</span>
                      <span>{event.time}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-[#9a9a9a]">No upcoming events</p>
          <Link
            href="/issues"
            className="text-[10px] text-[#00D4FF] hover:text-[#00D4FF]/80 mt-1 inline-block"
          >
            Schedule a DIY project →
          </Link>
        </div>
      )}
    </section>
  );
}

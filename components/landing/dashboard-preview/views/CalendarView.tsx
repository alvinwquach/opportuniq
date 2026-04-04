"use client";

import { useState } from "react";
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoAddOutline,
  IoHammerOutline,
  IoPersonOutline,
  IoNotificationsOutline,
  IoRepeatOutline,
  IoRepeat,
  IoLocationOutline,
  IoCheckmarkCircleOutline,
  IoPeopleOutline,
} from "react-icons/io5";
import {
  MonthGrid,
  extendedEvents,
  monthNames,
  generateCalendarDays,
} from "./calendar";
import { useDarkMode } from "../DarkModeContext";

// ── Upcoming event card ───────────────────────────────────────────────────────

type EventType = "diy" | "contractor" | "reminder";

const typeConfig: Record<EventType, { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; dot: string }> = {
  diy:        { label: "DIY",       icon: IoHammerOutline, bg: "bg-blue-50",   text: "text-blue-600",  dot: "bg-blue-400" },
  contractor: { label: "Pro Visit", icon: IoPersonOutline, bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-400" },
  reminder:   { label: "Reminder",  icon: IoNotificationsOutline, bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
};

// Mock status data keyed by event id
const eventStatusMock: Record<string, { label: string; color: string; textColor: string }> = {
  "1": { label: "Confirmed",   color: "bg-green-100",  textColor: "text-green-700" },
  "2": { label: "Scheduled",   color: "bg-blue-100",   textColor: "text-blue-700"  },
  "3": { label: "In Progress", color: "bg-purple-100", textColor: "text-purple-700" },
};

// Mock status dot colors
const statusDotColor: Record<string, string> = {
  "Confirmed":   "bg-green-500",
  "Scheduled":   "bg-blue-500",
  "In Progress": "bg-purple-500",
};

// Mock location overrides keyed by event id (supplements or overrides event.location)
const eventLocationMock: Record<string, string> = {
  "1": "123 Main St",
  "2": "Home - Kitchen",
};

// Mock participants for DIY events keyed by event id
const eventParticipantsMock: Record<string, string[]> = {
  "2": ["JM", "AS"],
};

function UpcomingEvent({ event }: { event: typeof extendedEvents[0] }) {
  const dark = useDarkMode();
  const cfg = typeConfig[event.type as EventType] ?? typeConfig.reminder;
  const Icon = cfg.icon;
  const status = eventStatusMock[event.id];
  const location = eventLocationMock[event.id];
  const participants = eventParticipantsMock[event.id];
  return (
    <div className={`flex items-start gap-3 py-3 border-b last:border-0 ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <Icon className={`w-4 h-4 ${cfg.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className={`text-sm font-medium leading-snug ${dark ? "text-gray-200" : "text-gray-900"}`}>{event.title}</p>
          {event.isRecurring && <IoRepeat className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${dark ? "text-gray-700" : "text-gray-300"}`} />}
        </div>
        <p className={`text-[10px] mt-0.5 ${dark ? "text-gray-600" : "text-gray-400"}`}>{event.date} · {event.time}</p>
        {(event.estimatedCost ?? 0) > 0 && (
          <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>Est. ${event.estimatedCost}</p>
        )}
        {/* Status badge */}
        {status && (
          <div className="flex items-center gap-1 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDotColor[status.label]}`} />
            <span className={`text-[10px] font-medium ${status.textColor}`}>{status.label}</span>
          </div>
        )}
        {/* Location */}
        {location && (
          <div className="flex items-center gap-1 mt-0.5">
            <IoLocationOutline className={`w-3 h-3 flex-shrink-0 ${dark ? "text-gray-600" : "text-gray-400"}`} />
            <span className={`text-[10px] truncate ${dark ? "text-gray-600" : "text-gray-400"}`}>{location}</span>
          </div>
        )}
        {/* Participants avatar pills */}
        {participants && participants.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <IoPeopleOutline className={`w-3 h-3 flex-shrink-0 ${dark ? "text-gray-600" : "text-gray-400"}`} />
            <div className="flex items-center gap-0.5">
              {participants.map((initials) => (
                <span
                  key={initials}
                  className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-400 text-[8px] font-bold flex items-center justify-center flex-shrink-0"
                >
                  {initials}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    </div>
  );
}

// ── DIY Sessions mock data ─────────────────────────────────────────────────────

const diySessionsMock = [
  {
    id: "diy-1",
    task: "Replace faucet cartridge",
    date: "Sat Apr 5",
    duration: "2hrs",
    participants: ["JM"],
  },
  {
    id: "diy-2",
    task: "Paint garage door",
    date: "Sun Apr 6",
    duration: "3hrs",
    participants: ["JM", "AS"],
  },
];

type FilterType = "all" | "diy" | "contractor" | "reminder";
type ContractorStatusFilter = "all" | "confirmed" | "scheduled";

// ── Main CalendarView ─────────────────────────────────────────────────────────

export function CalendarView() {
  const dark = useDarkMode();
  const b = dark ? "border-white/[0.06]" : "border-gray-100";
  const todayDate = new Date();
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth());
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [contractorStatusFilter, setContractorStatusFilter] = useState<ContractorStatusFilter>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<number | null>(null);

  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  const isCurrentMonth =
    currentYear === todayDate.getFullYear() && currentMonth === todayDate.getMonth();
  const today = todayDate.getDate();

  const goToPrev = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const goToNext = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };
  const goToToday = () => {
    setCurrentYear(todayDate.getFullYear());
    setCurrentMonth(todayDate.getMonth());
  };

  const filters: { id: FilterType; label: string; dot?: string }[] = [
    { id: "all",        label: "All" },
    { id: "diy",        label: "DIY",       dot: "bg-blue-400" },
    { id: "contractor", label: "Pro Visit",  dot: "bg-indigo-400" },
    { id: "reminder",   label: "Reminder",  dot: "bg-amber-400" },
  ];

  // Upcoming: next 3 events from mock data
  const upcomingEvents = extendedEvents.slice(0, 3);

  // Recurring events summary
  const recurringEvents = extendedEvents.filter((e) => e.isRecurring);

  return (
    <div className={`flex h-full overflow-hidden ${dark ? "bg-[#111111]" : "bg-white"}`}>

      {/* ── Main panel ── */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">

        {/* Header */}
        <div className={`flex flex-col border-b ${b}`}>
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={goToPrev}
                  className={`p-1.5 rounded transition-colors ${dark ? "text-gray-500 hover:text-gray-300 hover:bg-white/[0.06]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
                >
                  <IoChevronBackOutline className="w-4 h-4" />
                </button>
                <button
                  onClick={goToNext}
                  className={`p-1.5 rounded transition-colors ${dark ? "text-gray-500 hover:text-gray-300 hover:bg-white/[0.06]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
                >
                  <IoChevronForwardOutline className="w-4 h-4" />
                </button>
              </div>
              <h2 className={`text-base font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>
                {monthNames[currentMonth]} {currentYear}
              </h2>
              {!isCurrentMonth && (
                <button
                  onClick={goToToday}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${dark ? "text-gray-500 border-white/10 hover:bg-white/[0.06]" : "text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                >
                  Today
                </button>
              )}
              {isCurrentMonth && (
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${dark ? "text-blue-400 bg-blue-500/20" : "text-blue-600 bg-blue-50"}`}>
                  Today
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Filter chips */}
              <div className="flex items-center gap-1">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                      activeFilter === f.id
                        ? "bg-blue-600 text-white"
                        : dark ? "text-gray-500 hover:bg-white/[0.06] hover:text-gray-300" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    {f.dot && (
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        activeFilter === f.id ? "bg-white" : f.dot
                      }`} />
                    )}
                    {f.label}
                  </button>
                ))}
              </div>

              <div className={`w-px h-4 ${dark ? "bg-white/10" : "bg-gray-200"}`} />

              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
                <IoAddOutline className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Event Status sub-filter — only visible when contractor filter is active */}
          {activeFilter === "contractor" && (
            <div className="flex items-center gap-1 px-5 pb-2">
              <span className={`text-[10px] mr-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>Status:</span>
              {(["all", "confirmed", "scheduled"] as ContractorStatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setContractorStatusFilter(s)}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors capitalize ${
                    contractorStatusFilter === s
                      ? "bg-indigo-100 text-indigo-700"
                      : dark ? "text-gray-600 hover:bg-white/[0.06] hover:text-gray-400" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  }`}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <MonthGrid
            calendarDays={calendarDays}
            today={today}
            isCurrentMonth={isCurrentMonth}
            draggedEvent={draggedEvent}
            dragOverDate={dragOverDate}
            openMenuId={openMenuId}
            onDragStart={setDraggedEvent}
            onDragOver={(e, date) => { e.preventDefault(); setDragOverDate(date); }}
            onDragLeave={() => setDragOverDate(null)}
            onDrop={(e, date) => { e.preventDefault(); setDraggedEvent(null); setDragOverDate(null); }}
            onEventClick={() => {}}
            onMenuToggle={(id) => setOpenMenuId(id)}
          />
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className={`w-[220px] flex-shrink-0 border-l flex flex-col h-full ${b} ${dark ? "bg-[#141414]" : "bg-white"}`}>

        {/* Google Calendar Sync status card */}
        <div className={`px-4 py-3 border-b flex items-center gap-2 ${b}`}>
          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border ${dark ? "bg-[#252525] border-white/10" : "bg-white border-gray-200"}`}>
            <span className="text-[11px] font-bold" style={{ color: "#4285F4" }}>G</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>Google Calendar</span>
              <span className="flex items-center gap-0.5">
                <IoCheckmarkCircleOutline className="w-3 h-3 text-green-500" />
                <span className="text-[10px] font-medium text-green-500">Connected</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>Last synced 2 min ago</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${dark ? "text-indigo-400 bg-indigo-500/20" : "text-indigo-600 bg-indigo-50"}`}>2 imported</span>
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className={`px-4 py-3 border-b ${b}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${dark ? "text-gray-600" : "text-gray-500"}`}>Upcoming</p>
          <p className={`text-[10px] ${dark ? "text-gray-700" : "text-gray-400"}`}>{monthNames[currentMonth]}</p>
        </div>
        <div className="px-4 overflow-y-auto">
          {upcomingEvents.map((e) => (
            <UpcomingEvent key={e.id} event={e} />
          ))}
        </div>

        {/* DIY Sessions */}
        <div className={`border-t px-4 py-3 ${b}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${dark ? "text-gray-600" : "text-gray-500"}`}>DIY Sessions</p>
          <div className="space-y-2">
            {diySessionsMock.map((session) => (
              <div key={session.id} className={`rounded-lg px-2.5 py-2 ${dark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                <p className={`text-[11px] font-medium leading-snug truncate ${dark ? "text-gray-200" : "text-gray-800"}`}>{session.task}</p>
                <p className={`text-[10px] mt-0.5 ${dark ? "text-gray-600" : "text-gray-500"}`}>{session.date} · {session.duration}</p>
                <div className="flex items-center gap-1 mt-1">
                  <IoPeopleOutline className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <div className="flex items-center gap-0.5">
                    {session.participants.map((initials) => (
                      <span
                        key={initials}
                        className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-400 text-[8px] font-bold flex items-center justify-center flex-shrink-0"
                      >
                        {initials}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring */}
        <div className={`border-t px-4 py-3 ${b}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${dark ? "text-gray-600" : "text-gray-500"}`}>Recurring</p>
          <div className="space-y-1.5">
            {recurringEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-2">
                <IoRepeatOutline className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? "text-gray-700" : "text-gray-300"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] truncate ${dark ? "text-gray-400" : "text-gray-700"}`}>{e.title}</p>
                  <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>{e.recurringPattern}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className={`border-t px-4 py-3 ${b}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-2 ${dark ? "text-gray-700" : "text-gray-400"}`}>Legend</p>
          <div className="space-y-1.5">
            {Object.entries(typeConfig).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <Icon className={`w-3 h-3 flex-shrink-0 ${cfg.text}`} />
                  <span className={`text-[10px] ${dark ? "text-gray-500" : "text-gray-500"}`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {openMenuId && <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />}
    </div>
  );
}

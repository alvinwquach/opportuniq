"use client";

import { useState, useEffect, useCallback } from "react";
import { IoCalendar, IoTime, IoConstruct, IoPeople, IoHome, IoBriefcase, IoAdd, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackCalendarViewed } from "@/lib/analytics";

type EventType = "contractor" | "diy" | "wfh" | "away";

interface CalendarEvent {
  id: string;
  date: Date;
  type: EventType;
  title: string;
  time?: string;
  groupName?: string;
}

interface CalendarDialogProps {
  events: CalendarEvent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const eventConfig = {
  contractor: {
    icon: IoConstruct,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    label: "Contractor",
  },
  diy: {
    icon: IoPeople,
    color: "text-green-400",
    bg: "bg-green-500/10",
    label: "DIY Task",
  },
  wfh: {
    icon: IoHome,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    label: "WFH",
  },
  away: {
    icon: IoBriefcase,
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    label: "Away",
  },
};

function getDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE, MMM d");
}

export function CalendarDialog({ events, open, onOpenChange }: CalendarDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Track when calendar dialog opens
  useEffect(() => {
    if (open) {
      trackCalendarViewed({ view: "month", eventCount: events.length });
    }
  }, [open, events.length]);

  // Get events for selected date
  const selectedEvents = events.filter(
    (event) =>
      selectedDate &&
      event.date.getDate() === selectedDate.getDate() &&
      event.date.getMonth() === selectedDate.getMonth() &&
      event.date.getFullYear() === selectedDate.getFullYear()
  );

  // Get dates that have events for calendar highlighting
  const datesWithEvents = events.map((event) => event.date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0c0c0c] border-[#1f1f1f] sm:max-w-125 p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-white flex items-center gap-2">
            <IoCalendar className="w-4 h-4 text-[#00D4FF]" />
            Calendar
          </DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 divide-x divide-[#1f1f1f]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate || new Date());
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-1.5 rounded-md text-[#666] hover:text-white hover:bg-[#1f1f1f] transition-colors"
              >
                <IoChevronBack className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-white">
                {format(selectedDate || new Date(), "MMMM yyyy")}
              </span>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate || new Date());
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-1.5 rounded-md text-[#666] hover:text-white hover:bg-[#1f1f1f] transition-colors"
              >
                <IoChevronForward className="w-4 h-4" />
              </button>
            </div>
            {/* Custom calendar grid */}
            <div>
              <div className="grid grid-cols-7 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="h-9 w-9 flex items-center justify-center text-[#666] text-xs font-medium">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {(() => {
                  const currentDate = selectedDate || new Date();
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const days = [];

                  // Empty cells for days before the first day of the month
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
                  }

                  // Days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const isSelected = selectedDate &&
                      date.getDate() === selectedDate.getDate() &&
                      date.getMonth() === selectedDate.getMonth() &&
                      date.getFullYear() === selectedDate.getFullYear();
                    const isTodayDate = isToday(date);
                    const hasEvent = datesWithEvents.some(
                      (d) => d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
                    );

                    days.push(
                      <button
                        key={day}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "h-9 w-9 rounded-md text-sm font-normal transition-colors flex items-center justify-center",
                          isSelected
                            ? "bg-[#00D4FF] text-[#0c0c0c]"
                            : isTodayDate
                            ? "bg-[#1f1f1f] text-white"
                            : hasEvent
                            ? "bg-[#00D4FF]/20 text-white"
                            : "text-[#888] hover:bg-[#1f1f1f] hover:text-white"
                        )}
                      >
                        {day}
                      </button>
                    );
                  }

                  return days;
                })()}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#1f1f1f] grid grid-cols-2 gap-2">
              {Object.entries(eventConfig).map(([type, config]) => (
                <div key={type} className="flex items-center gap-1.5 text-[10px] text-[#666]">
                  <config.icon className="h-3 w-3" />
                  <span>{config.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-white">
                  {selectedDate ? getDateLabel(selectedDate) : "Select a date"}
                </p>
                {selectedDate && (
                  <p className="text-[10px] text-[#555]">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </p>
                )}
              </div>
            </div>
            {selectedEvents.length === 0 ? (
              <div className="py-8 text-center">
                <IoTime className="w-8 h-8 text-[#333] mx-auto mb-2" />
                <p className="text-sm text-[#555]">No events</p>
                <button
                  onClick={() => {
                  }}
                  className="mt-3 flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-md bg-[#1f1f1f] text-[#888] hover:text-white hover:bg-[#2a2a2a] transition-colors text-[11px]"
                >
                  <IoAdd className="w-3 h-3" />
                  Add event
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-62.5 overflow-y-auto">
                {selectedEvents.map((event) => {
                  const config = eventConfig[event.type];
                  const Icon = config.icon;

                  return (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                            config.bg
                          )}
                        >
                          <Icon className={cn("w-3.5 h-3.5", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">{event.title}</p>
                          {event.time && (
                            <p className="text-[10px] text-[#666] flex items-center gap-1 mt-0.5">
                              <IoTime className="w-3 h-3" />
                              {event.time}
                            </p>
                          )}
                          {event.groupName && (
                            <p className="text-[10px] text-[#555] mt-0.5">{event.groupName}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => {
              }}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors text-sm"
            >
              <IoAdd className="w-4 h-4" />
              Add Event
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CalendarButton({
  events,
  onOpenCalendar,
}: {
  events: CalendarEvent[];
  onOpenCalendar: () => void;
}) {
  const now = new Date();
  const weekFromNow = addDays(now, 7);
  const upcomingEvents = events.filter((e) => e.date >= now && e.date <= weekFromNow);
  const todayEvents = upcomingEvents.filter((e) => isToday(e.date));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onOpenCalendar}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#888] hover:text-white hover:bg-[#1f1f1f] transition-colors"
        >
          <IoCalendar className="h-4 w-4" />
          <span className="text-[12px] hidden sm:inline">
            {todayEvents.length > 0
              ? `${todayEvents.length} today`
              : format(now, "EEE, MMM d, yyyy")}
          </span>
          {todayEvents.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Calendar</TooltipContent>
    </Tooltip>
  );
}

export function CalendarPreview({ events }: { events: CalendarEvent[] }) {
  const [open, setOpen] = useState(false);

  const handleOpenCalendar = useCallback(() => {
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
  }, []);

  return (
    <>
      <CalendarButton events={events} onOpenCalendar={handleOpenCalendar} />
      <CalendarDialog events={events} open={open} onOpenChange={handleOpenChange} />
    </>
  );
}

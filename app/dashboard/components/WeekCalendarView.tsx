import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  date: Date | string;
  type: "diy" | "contractor" | "reminder";
  title: string;
  issueId: string;
}

interface WeekCalendarViewProps {
  events: CalendarEvent[];
}

export function WeekCalendarView({ events }: WeekCalendarViewProps) {
  // Get the current week (Sunday to Saturday)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }

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

  const isToday = (day: Date) => {
    return (
      day.getDate() === now.getDate() &&
      day.getMonth() === now.getMonth() &&
      day.getFullYear() === now.getFullYear()
    );
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day, index) => {
        const dayEvents = getEventsForDay(day);
        const today = isToday(day);

        return (
          <div
            key={index}
            className={cn(
              "text-center py-2 px-1 rounded-lg",
              today ? "bg-[#00D4FF]/10 border border-[#00D4FF]/30" : "bg-[#1a1a1a]"
            )}
          >
            <p className="text-[9px] text-[#666] uppercase">
              {day.toLocaleDateString(undefined, { weekday: "short" }).charAt(0)}
            </p>
            <p className={cn("text-sm font-medium", today ? "text-[#00D4FF]" : "text-white")}>
              {day.getDate()}
            </p>
            {dayEvents.length > 0 && (
              <div className="flex justify-center gap-0.5 mt-1">
                {dayEvents.slice(0, 3).map((event, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      event.type === "diy" ? "bg-[#00D4FF]" :
                      event.type === "contractor" ? "bg-purple-400" :
                      "bg-amber-400"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

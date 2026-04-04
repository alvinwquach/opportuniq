import { IoCalendar, IoTime, IoCheckmarkCircle } from "react-icons/io5";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "contractor" | "diy" | "reminder";
}

interface ThisWeekCardProps {
  events: CalendarEvent[];
  maxEvents?: number;
}

export function ThisWeekCard({ events, maxEvents = 2 }: ThisWeekCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IoCalendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
          <h3 className="text-xs sm:text-sm font-medium text-gray-900">This Week</h3>
        </div>
      </div>
      <div className="space-y-2">
        {events.slice(0, maxEvents).map((event) => (
          <div key={event.id} className="flex items-center gap-2 p-2 rounded-md bg-white border border-gray-200 text-[10px] sm:text-xs">
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center flex-shrink-0 ${
              event.type === "contractor" ? "bg-blue-100" : event.type === "diy" ? "bg-blue-100" : "bg-amber-50"
            }`}>
              {event.type === "contractor" ? (
                <IoTime className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
              ) : (
                <IoCheckmarkCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{event.title}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">{event.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

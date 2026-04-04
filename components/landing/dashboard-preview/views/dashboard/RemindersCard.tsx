import { IoNotifications } from "react-icons/io5";

interface Reminder {
  id: string;
  title: string;
  date: Date | string;
}

interface RemindersCardProps {
  reminders: Reminder[];
  maxItems?: number;
}

export function RemindersCard({ reminders, maxItems = 2 }: RemindersCardProps) {
  if (reminders.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <IoNotifications className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
        <h3 className="text-xs sm:text-sm font-medium text-gray-900">Upcoming</h3>
      </div>
      <div className="space-y-2">
        {reminders.slice(0, maxItems).map((reminder) => (
          <div key={reminder.id} className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs text-gray-700 truncate">{reminder.title}</p>
            <span className="text-[9px] sm:text-[10px] text-amber-600 font-medium flex-shrink-0 ml-2">
              {new Date(reminder.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

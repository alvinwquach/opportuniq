"use client";

import Link from "next/link";
import { IoNotifications } from "react-icons/io5";

interface Reminder {
  issueId: string;
  title: string;
  groupName: string;
  date: Date | string;
}

interface RemindersSectionProps {
  reminders: Reminder[];
}

export function RemindersSection({ reminders }: RemindersSectionProps) {
  if (reminders.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <IoNotifications className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-medium text-white">Upcoming Reminders</h3>
      </div>
      <div className="space-y-2">
        {reminders.slice(0, 3).map((reminder, index) => (
          <Link
            key={index}
            href={`/issues/${reminder.issueId}`}
            className="block p-2.5 -mx-1 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <p className="text-xs text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {reminder.title}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-gray-400">{reminder.groupName}</span>
              <span className="text-[10px] text-[#333]">·</span>
              <span className="text-[10px] text-amber-400">
                {new Date(reminder.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

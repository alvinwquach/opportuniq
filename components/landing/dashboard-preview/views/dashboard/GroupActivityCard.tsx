"use client";

import { IoPeopleOutline } from "react-icons/io5";

interface Activity {
  id: string;
  message: string;
  time: string;
  avatar: string;
}

interface GroupActivityCardProps {
  activities: Activity[];
}

export function GroupActivityCard({ activities }: GroupActivityCardProps) {
  if (activities.length === 0) return null;

  return (
    <div className="p-3 sm:p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <IoPeopleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-white">Group Activity</h3>
          <p className="text-[9px] sm:text-[10px] text-[#9a9a9a]">Recent updates</p>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {activities.slice(0, 4).map((activity) => (
          <div key={activity.id} className="flex items-start gap-2 sm:gap-2.5">
            <span className="text-sm sm:text-base flex-shrink-0">{activity.avatar}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-[#a3a3a3] leading-relaxed">
                {activity.message}
              </p>
              <p className="text-[9px] sm:text-[10px] text-[#666] mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

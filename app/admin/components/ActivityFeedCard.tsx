"use client";

import { IoPersonAdd, IoMail, IoCheckmark, IoShare } from "react-icons/io5";

type ActivityType = "user_joined" | "invite_sent" | "invite_accepted" | "referral";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  time: string;
}

interface ActivityFeedCardProps {
  activities: Activity[];
}

const activityIcons: Record<ActivityType, { icon: typeof IoPersonAdd; color: string; bg: string }> = {
  user_joined: { icon: IoPersonAdd, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  invite_sent: { icon: IoMail, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  invite_accepted: { icon: IoCheckmark, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  referral: { icon: IoShare, color: "text-emerald-400", bg: "bg-emerald-500/20" },
};

export function ActivityFeedCard({ activities }: ActivityFeedCardProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-3">
        <h3 className="text-xs font-medium text-white mb-3">Recent Activity</h3>
        <div className="flex items-center justify-center py-6 text-[#666] text-xs">
          No recent activity
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-3">
      <h3 className="text-xs font-medium text-white mb-3">Recent Activity</h3>
      <div className="space-y-2">
        {activities.slice(0, 5).map((activity) => {
          const { icon: Icon, color, bg } = activityIcons[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-2 p-2 rounded-lg bg-[#111111] border border-white/[0.06]"
            >
              <div className={`w-6 h-6 rounded ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className={`w-3 h-3 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white truncate">{activity.title}</p>
                <p className="text-[10px] text-[#666] truncate">{activity.subtitle}</p>
              </div>
              <span className="text-[9px] text-[#555] flex-shrink-0">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

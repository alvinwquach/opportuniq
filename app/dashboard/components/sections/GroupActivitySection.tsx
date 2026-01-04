"use client";

import { IoChatbubble, IoAlertCircle, IoCash, IoPersonAdd, IoCheckmarkCircle } from "react-icons/io5";

interface GroupActivity {
  type: "issue_created" | "expense_added" | "member_joined" | "decision_made";
  actorName: string | null;
  description: string;
  groupName: string;
  timestamp: Date | string;
}

interface GroupActivitySectionProps {
  activities: GroupActivity[];
}

export function GroupActivitySection({ activities }: GroupActivitySectionProps) {
  if (activities.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <div className="flex items-center gap-2 mb-3">
        <IoChatbubble className="w-4 h-4 text-green-400" />
        <h3 className="text-sm font-medium text-white">Group Activity</h3>
      </div>
      <div className="space-y-3">
        {activities.slice(0, 5).map((activity, index) => (
          <div key={index} className="flex items-start gap-2.5">
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                activity.type === "issue_created"
                  ? "bg-orange-500/10"
                  : activity.type === "expense_added"
                  ? "bg-purple-500/10"
                  : activity.type === "member_joined"
                  ? "bg-green-500/10"
                  : "bg-[#1f1f1f]"
              }`}
            >
              {activity.type === "issue_created" && (
                <IoAlertCircle className="w-3 h-3 text-orange-400" />
              )}
              {activity.type === "expense_added" && (
                <IoCash className="w-3 h-3 text-purple-400" />
              )}
              {activity.type === "member_joined" && (
                <IoPersonAdd className="w-3 h-3 text-green-400" />
              )}
              {activity.type === "decision_made" && (
                <IoCheckmarkCircle className="w-3 h-3 text-[#00D4FF]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white">
                <span className="text-[#a3a3a3]">{activity.actorName || "Someone"}</span>{" "}
                {activity.description}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-[#9a9a9a]">{activity.groupName}</span>
                <span className="text-[10px] text-[#333]">·</span>
                <span className="text-[10px] text-[#9a9a9a]">
                  {new Date(activity.timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { ActivityItem } from "../ActivityItem";

interface Activity {
  type: "issue" | "decision" | "expense";
  title: string;
  description: string;
  timestamp: Date;
  groupName: string;
}

interface RecentActivitySectionProps {
  activities: Activity[];
}

export function RecentActivitySection({ activities }: RecentActivitySectionProps) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h3>
      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          No recent activity yet. Report an issue or make a decision to see updates here.
        </p>
      )}
    </div>
  );
}

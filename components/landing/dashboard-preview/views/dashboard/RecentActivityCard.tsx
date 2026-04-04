interface Activity {
  id: string;
  avatar: string;
  message: string;
  time: string;
}

interface RecentActivityCardProps {
  activities: Activity[];
  maxItems?: number;
}

export function RecentActivityCard({ activities, maxItems = 3 }: RecentActivityCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
      <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-3">Recent Activity</h3>
      <div className="space-y-2">
        {activities.slice(0, maxItems).map((activity) => (
          <div key={activity.id} className="flex items-start gap-2">
            <span className="text-xs sm:text-sm flex-shrink-0">{activity.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-700 leading-snug line-clamp-2">{activity.message}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

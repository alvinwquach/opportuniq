import { IoAlertCircle, IoCheckmarkCircle, IoCash } from "react-icons/io5";

interface ActivityItemProps {
  activity: {
    type: "issue" | "decision" | "expense";
    title: string;
    description: string;
    timestamp: Date;
    groupName: string;
  };
}

function getTimeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const getIcon = () => {
    switch (activity.type) {
      case "issue":
        return <IoAlertCircle className="w-3.5 h-3.5 text-orange-400" />;
      case "decision":
        return <IoCheckmarkCircle className="w-3.5 h-3.5 text-green-400" />;
      case "expense":
        return <IoCash className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-md bg-[#1f1f1f] flex items-center justify-center shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white truncate">{activity.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-[#555]">{activity.groupName}</span>
          <span className="text-[10px] text-[#333]">·</span>
          <span className="text-[10px] text-[#555]">{getTimeAgo(activity.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

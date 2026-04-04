import { IoAlertCircle, IoChevronForward } from "react-icons/io5";

interface OpenIssue {
  id: string;
  title: string;
  group: string;
  status: string;
}

interface OpenIssuesCardProps {
  issues: OpenIssue[];
  onViewAll?: () => void;
}

export function OpenIssuesCard({ issues, onViewAll }: OpenIssuesCardProps) {
  if (issues.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-gray-900">Open Issues</h3>
        <span
          className="text-[10px] sm:text-xs text-blue-600 cursor-pointer hover:text-blue-700"
          onClick={onViewAll}
        >
          View all
        </span>
      </div>
      <div className="space-y-2">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <IoAlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{issue.title}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">
                {issue.group} · {issue.status === "investigating" ? "Analyzing..." : "Open"}
              </p>
            </div>
            <IoChevronForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

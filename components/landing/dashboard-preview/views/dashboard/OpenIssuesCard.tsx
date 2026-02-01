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
    <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-white">Open Issues</h3>
        <span
          className="text-[10px] sm:text-xs text-emerald-400 cursor-pointer hover:text-emerald-300"
          onClick={onViewAll}
        >
          View all
        </span>
      </div>
      <div className="space-y-2">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-[#252525] transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <IoAlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-white truncate">{issue.title}</p>
              <p className="text-[10px] sm:text-xs text-[#888]">
                {issue.group} · {issue.status === "investigating" ? "Analyzing..." : "Open"}
              </p>
            </div>
            <IoChevronForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#666] flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

import { IoWarning, IoCheckmarkCircle, IoAlertCircle, IoChevronForward } from "react-icons/io5";

interface OpenIssue {
  id: string;
  title: string;
  group: string;
  status: string;
}

interface DecisionsTabProps {
  openIssues: OpenIssue[];
  onViewAll?: () => void;
}

export function DecisionsTab({ openIssues, onViewAll }: DecisionsTabProps) {
  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IoWarning className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
            <h3 className="text-xs sm:text-sm font-medium text-gray-900">Awaiting Your Decision</h3>
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500">2 issues</span>
        </div>
        <div className="space-y-2">
          <div className="p-2 sm:p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start justify-between mb-1">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-medium text-gray-900">Ceiling crack in bedroom</p>
                <p className="text-[9px] sm:text-[10px] text-gray-500">Cosmetic only</p>
              </div>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full flex-shrink-0 ml-2">
                low
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] mt-2 flex-wrap">
              <span className="px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                DIY: $25 · 2h
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                Pro: $200
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-blue-600">
              <IoCheckmarkCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Recommended: DIY
            </div>
          </div>
          <div className="p-2 sm:p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start justify-between mb-1">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-medium text-gray-900">Dishwasher not draining</p>
                <p className="text-[9px] sm:text-[10px] text-gray-500">Check filter first</p>
              </div>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full flex-shrink-0 ml-2">
                moderate
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] mt-2 flex-wrap">
              <span className="px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                DIY: $0 · 30min
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                Pro: $150
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-blue-600">
              <IoCheckmarkCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Recommended: DIY
            </div>
          </div>
        </div>
      </div>

      {openIssues.length > 0 && (
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
            {openIssues.map((issue) => (
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
      )}
    </>
  );
}

import { IoCamera, IoCalendar, IoBook } from "react-icons/io5";

interface QuickActionsCardProps {
  onReportIssue?: () => void;
  onScheduleDIY?: () => void;
  onBrowseGuides?: () => void;
}

export function QuickActionsCard({
  onReportIssue,
  onScheduleDIY,
  onBrowseGuides,
}: QuickActionsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
      <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
      <div className="space-y-1">
        <button
          onClick={onReportIssue}
          className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <IoCamera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-900">Report Issue</p>
        </button>
        <button
          onClick={onScheduleDIY}
          className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <IoCalendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-900">Schedule DIY</p>
        </button>
        <button
          onClick={onBrowseGuides}
          className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <IoBook className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-900">Browse Guides</p>
        </button>
      </div>
    </div>
  );
}

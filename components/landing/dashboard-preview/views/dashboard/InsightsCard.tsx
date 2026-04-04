import { IoBulb, IoTrendingUp, IoTrendingDown } from "react-icons/io5";

interface OutcomeSummary {
  diySuccessRate: number;
  totalResolved: number;
  avgResolutionTimeDays: number;
  avgCostDelta: number;
}

interface InsightsCardProps {
  outcomeSummary: OutcomeSummary;
}

export function InsightsCard({ outcomeSummary }: InsightsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <IoBulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-900">Insights</h3>
          <p className="text-[10px] sm:text-xs text-gray-500">Patterns from your decisions</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div className="p-2.5 sm:p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs font-medium text-gray-900">DIY Success Rate</span>
            <span className="text-xs sm:text-sm font-semibold text-blue-600">{outcomeSummary.diySuccessRate}%</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-gray-500">{outcomeSummary.totalResolved} resolved · from outcomes</p>
          <div className="flex items-center gap-1 mt-2">
            <IoTrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
            <span className="text-[9px] sm:text-[10px] text-blue-600">Improving</span>
          </div>
        </div>
        <div className="p-2.5 sm:p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs font-medium text-gray-900">Avg Resolution Time</span>
            <span className="text-xs sm:text-sm font-semibold text-amber-600">{outcomeSummary.avgResolutionTimeDays} days</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-gray-500">Avg cost delta ${outcomeSummary.avgCostDelta} vs estimate</p>
          <div className="flex items-center gap-1 mt-2">
            <IoTrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" />
            <span className="text-[9px] sm:text-[10px] text-amber-600">Under budget</span>
          </div>
        </div>
      </div>
    </div>
  );
}

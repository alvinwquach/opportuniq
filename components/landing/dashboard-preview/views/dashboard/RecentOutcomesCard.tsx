import { IoCheckmarkCircle } from "react-icons/io5";

interface Outcome {
  id: string;
  issueTitle: string;
  optionType: string;
  actualCost: number | null;
  costDelta: number | null;
}

interface RecentOutcomesCardProps {
  outcomes: Outcome[];
}

export function RecentOutcomesCard({ outcomes }: RecentOutcomesCardProps) {
  if (outcomes.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <IoCheckmarkCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
        <h3 className="text-xs sm:text-sm font-medium text-gray-900">Recent Wins</h3>
      </div>
      <div className="space-y-2">
        {outcomes.map((outcome) => (
          <div key={outcome.id} className="p-2 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] sm:text-xs text-gray-900 truncate flex-1">{outcome.issueTitle}</p>
              <IoCheckmarkCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 flex-shrink-0 ml-2" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] flex-wrap">
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{outcome.optionType.toUpperCase()}</span>
              {outcome.actualCost !== null && <span className="text-gray-500">${outcome.actualCost}</span>}
              {outcome.costDelta !== null && outcome.costDelta < 0 && (
                <span className="text-blue-600 font-medium">saved ${Math.abs(outcome.costDelta)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

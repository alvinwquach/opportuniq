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
    <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <IoCheckmarkCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
        <h3 className="text-xs sm:text-sm font-medium text-white">Recent Wins</h3>
      </div>
      <div className="space-y-2">
        {outcomes.map((outcome) => (
          <div key={outcome.id} className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] sm:text-xs text-white truncate flex-1">{outcome.issueTitle}</p>
              <IoCheckmarkCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0 ml-2" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] flex-wrap">
              <span className="px-1.5 py-0.5 bg-[#2a2a2a] text-[#888] rounded">{outcome.optionType.toUpperCase()}</span>
              {outcome.actualCost !== null && <span className="text-[#888]">${outcome.actualCost}</span>}
              {outcome.costDelta !== null && outcome.costDelta < 0 && (
                <span className="text-emerald-400 font-medium">saved ${Math.abs(outcome.costDelta)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

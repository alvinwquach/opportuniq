import {
  IoCash,
  IoTimer,
  IoConstruct,
  IoWarning,
  IoTrendingUp,
} from "react-icons/io5";
import type { DynamicOpportunityCost } from "../types";

interface CostCardProps {
  opportunityCost: DynamicOpportunityCost;
  userTimeValue: number;
  onTimeValueChange: (value: number) => void;
}

export function CostCard({ opportunityCost, userTimeValue, onTimeValueChange }: CostCardProps) {
  return (
    <div className="ml-11 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border border-neutral-300 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoCash className="w-4 h-4 text-emerald-700" />
            <span className="text-sm font-semibold text-neutral-900">Opportunity Cost Analysis</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="hourly-value-input" className="text-neutral-600">Your rate:</label>
            <div className="flex items-center">
              <span className="text-neutral-500 mr-1">$</span>
              <input
                id="hourly-value-input"
                type="number"
                value={userTimeValue}
                onChange={(e) => onTimeValueChange(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 px-2 py-1 bg-neutral-50 border border-neutral-300 rounded text-neutral-900 text-center text-sm"
                min={0}
              />
              <span className="text-neutral-500 ml-1">/hr</span>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
              <IoTimer className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-blue-600 font-medium mb-1">Time Cost</p>
              <p className="text-xl font-bold text-blue-700">
                ${(opportunityCost.timeValue * opportunityCost.estimatedHours).toLocaleString()}
              </p>
              <p className="text-xs text-blue-500 mt-1">{opportunityCost.estimatedHours}h × ${userTimeValue}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-amber-50 border border-amber-100">
              <IoConstruct className="w-5 h-5 text-amber-700 mx-auto mb-2" />
              <p className="text-xs text-amber-700 font-medium mb-1">Materials</p>
              <p className="text-xl font-bold text-amber-700">
                ${opportunityCost.materialCost.toLocaleString()}
              </p>
              <p className="text-xs text-amber-500 mt-1">Estimated</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-50 border border-red-100">
              <IoWarning className="w-5 h-5 text-red-600 mx-auto mb-2" />
              <p className="text-xs text-red-600 font-medium mb-1">Risk Cost</p>
              <p className="text-xl font-bold text-red-700">
                ${opportunityCost.riskCost.toLocaleString()}
              </p>
              <p className="text-xs text-red-500 mt-1">If issues arise</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-blue-100 border border-blue-200">
              <IoTrendingUp className="w-5 h-5 text-blue-700 mx-auto mb-2" />
              <p className="text-xs text-blue-700 font-medium mb-1">Total Impact</p>
              <p className="text-2xl font-bold text-blue-700">
                ${opportunityCost.totalCost.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <p className="text-xs text-neutral-600 text-center">
              This represents the full opportunity cost of doing this project yourself, including your time value,
              material costs, and potential risk exposure if things don&apos;t go as planned.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

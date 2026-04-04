"use client";

import { useState } from "react";
import { IoCalculator, IoCheckmarkCircle, IoWarning, IoAlertCircle } from "react-icons/io5";

interface WhatIfScenarioProps {
  availableFunds: number;
}

export function WhatIfScenario({ availableFunds }: WhatIfScenarioProps) {
  const [repairCost, setRepairCost] = useState<string>("");

  const cost = parseFloat(repairCost) || 0;
  const afterRepair = availableFunds - cost;
  const canAfford = afterRepair >= 0;
  const isComfortable = afterRepair >= 500;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <IoCalculator className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-medium text-gray-900">Can I Afford This Repair?</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Enter repair cost</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="number"
              value={repairCost}
              onChange={(e) => setRepairCost(e.target.value)}
              placeholder="0"
              className="w-full pl-7 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {cost > 0 && (
          <div className={`p-4 rounded-lg border ${
            !canAfford ? 'bg-red-50 border-red-200' :
            !isComfortable ? 'bg-amber-50 border-amber-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              {!canAfford && <IoAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
              {canAfford && !isComfortable && <IoWarning className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
              {isComfortable && <IoCheckmarkCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}

              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  !canAfford ? 'text-red-600' :
                  !isComfortable ? 'text-amber-600' :
                  'text-blue-600'
                }`}>
                  {!canAfford ? "Can't afford right now" :
                   !isComfortable ? "Possible, but tight" :
                   "Yes, you can afford this!"}
                </p>

                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Available now</span>
                    <span className="text-gray-900 font-medium">${Math.round(availableFunds).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Repair cost</span>
                    <span className="text-red-600 font-medium">-${Math.round(cost).toLocaleString()}</span>
                  </div>
                  <div className="pt-1 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-gray-500">After repair</span>
                    <span className={`font-semibold ${afterRepair < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      ${Math.round(afterRepair).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!canAfford && (
                  <p className="text-xs text-red-600/80 mt-2">
                    You&apos;d need ${Math.abs(Math.round(afterRepair))} more to cover this.
                  </p>
                )}
                {canAfford && !isComfortable && (
                  <p className="text-xs text-amber-600/80 mt-2">
                    This would leave you with a thin margin. Consider if it&apos;s urgent.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!cost && (
          <p className="text-xs text-gray-600 text-center py-2">
            Enter an amount to see if it fits your budget
          </p>
        )}
      </div>
    </div>
  );
}

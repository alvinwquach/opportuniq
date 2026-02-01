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
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
      <div className="flex items-center gap-2 mb-4">
        <IoCalculator className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-medium text-white">Can I Afford This Repair?</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-[#888] mb-1.5">Enter repair cost</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] text-sm">$</span>
            <input
              type="number"
              value={repairCost}
              onChange={(e) => setRepairCost(e.target.value)}
              placeholder="0"
              className="w-full pl-7 pr-3 py-2.5 text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {cost > 0 && (
          <div className={`p-4 rounded-lg border ${
            !canAfford ? 'bg-red-500/10 border-red-500/20' :
            !isComfortable ? 'bg-amber-500/10 border-amber-500/20' :
            'bg-emerald-500/10 border-emerald-500/20'
          }`}>
            <div className="flex items-start gap-3">
              {!canAfford && <IoAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
              {canAfford && !isComfortable && <IoWarning className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />}
              {isComfortable && <IoCheckmarkCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}

              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  !canAfford ? 'text-red-400' :
                  !isComfortable ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {!canAfford ? "Can't afford right now" :
                   !isComfortable ? "Possible, but tight" :
                   "Yes, you can afford this!"}
                </p>

                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#888]">Available now</span>
                    <span className="text-white font-medium">${Math.round(availableFunds).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#888]">Repair cost</span>
                    <span className="text-red-400 font-medium">-${Math.round(cost).toLocaleString()}</span>
                  </div>
                  <div className="pt-1 border-t border-[#2a2a2a] flex items-center justify-between">
                    <span className="text-[#888]">After repair</span>
                    <span className={`font-semibold ${afterRepair < 0 ? 'text-red-400' : 'text-white'}`}>
                      ${Math.round(afterRepair).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!canAfford && (
                  <p className="text-xs text-red-400/80 mt-2">
                    You'd need ${Math.abs(Math.round(afterRepair))} more to cover this.
                  </p>
                )}
                {canAfford && !isComfortable && (
                  <p className="text-xs text-amber-400/80 mt-2">
                    This would leave you with a thin margin. Consider if it's urgent.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!cost && (
          <p className="text-xs text-[#555] text-center py-2">
            Enter an amount to see if it fits your budget
          </p>
        )}
      </div>
    </div>
  );
}

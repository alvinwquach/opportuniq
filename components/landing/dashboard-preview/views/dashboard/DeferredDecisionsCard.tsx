"use client";

import { IoPauseCircleOutline, IoChevronForward } from "react-icons/io5";

interface DeferredDecision {
  id: string;
  title: string;
  reason: string;
  date: string;
}

interface DeferredDecisionsCardProps {
  decisions: DeferredDecision[];
}

export function DeferredDecisionsCard({ decisions }: DeferredDecisionsCardProps) {
  if (decisions.length === 0) return null;

  return (
    <div className="p-3 sm:p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <IoPauseCircleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-white">Deferred</h3>
            <p className="text-[9px] sm:text-[10px] text-[#9a9a9a]">{decisions.length} on hold</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {decisions.slice(0, 3).map((decision) => (
          <button
            key={decision.id}
            className="w-full flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors group text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-medium text-white truncate group-hover:text-amber-400 transition-colors">
                {decision.title}
              </p>
              <p className="text-[9px] sm:text-[10px] text-[#9a9a9a]">
                {decision.reason} · {decision.date}
              </p>
            </div>
            <IoChevronForward className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#666] group-hover:text-amber-400 transition-colors flex-shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
}

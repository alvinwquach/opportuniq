"use client";

import Link from "next/link";
import { IoTime } from "react-icons/io5";

interface DeferredDecision {
  id: string;
  issueId: string;
  issueTitle: string;
  groupName: string;
  daysUntilRevisit: number;
}

interface DeferredDecisionsSectionProps {
  decisions: DeferredDecision[];
}

export function DeferredDecisionsSection({ decisions }: DeferredDecisionsSectionProps) {
  if (decisions.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <div className="flex items-center gap-2 mb-3">
        <IoTime className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-medium text-white">Deferred Decisions</h3>
      </div>
      <div className="space-y-2">
        {decisions.slice(0, 4).map((decision) => (
          <Link
            key={decision.id}
            href={`/issues/${decision.issueId}`}
            className="block p-2.5 -mx-1 rounded-lg hover:bg-[#1f1f1f] transition-colors group"
          >
            <p className="text-xs text-white group-hover:text-[#00D4FF] transition-colors truncate">
              {decision.issueTitle}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-[#9a9a9a]">{decision.groupName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  decision.daysUntilRevisit <= 0
                    ? "bg-red-500/20 text-red-400"
                    : decision.daysUntilRevisit <= 7
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {decision.daysUntilRevisit <= 0
                  ? "Overdue"
                  : decision.daysUntilRevisit === 1
                  ? "Tomorrow"
                  : `${decision.daysUntilRevisit}d`}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

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
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <IoTime className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-medium text-white">Deferred Decisions</h3>
      </div>
      <div className="space-y-2">
        {decisions.slice(0, 4).map((decision) => (
          <Link
            key={decision.id}
            href={`/dashboard/projects/${decision.issueId}`}
            className="block p-2.5 -mx-1 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <p className="text-xs text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {decision.issueTitle}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-gray-400">{decision.groupName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  decision.daysUntilRevisit <= 0
                    ? "bg-red-500/20 text-red-400"
                    : decision.daysUntilRevisit <= 7
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-blue-100 text-blue-600"
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

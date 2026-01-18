"use client";

import Link from "next/link";
import { IoChevronForward, IoThumbsUp } from "react-icons/io5";
import type { PendingDecision } from "@/app/dashboard/types";

interface PendingDecisionsSectionProps {
  decisions: PendingDecision[];
}

export function PendingDecisionsSection({ decisions }: PendingDecisionsSectionProps) {
  if (decisions.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-white">Pending Decisions</h2>
        <Link
          href="/decisions"
          className="text-xs text-[#9a9a9a] hover:text-white transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {decisions.map(({ issue, option, group }) => (
          <Link
            key={issue.id}
            href={`/issues/${issue.id}`}
            className="block p-4 rounded-xl bg-[#161616] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#9a9a9a] uppercase tracking-wider">
                    {group.name}
                  </span>
                  {issue.priority === "urgent" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                      Urgent
                    </span>
                  )}
                </div>
                <h3 className="text-sm text-white font-medium truncate group-hover:text-[#00D4FF] transition-colors">
                  {issue.title}
                </h3>
                <p className="text-xs text-[#9a9a9a] mt-1">
                  {option.type === "diy" ? "DIY" : option.type === "hire" ? "Hire" : option.type}
                  {option.costMin && option.costMax && (
                    <span className="text-[#a3a3a3]">
                      {" "}· ${Number(option.costMin).toFixed(0)} - ${Number(option.costMax).toFixed(0)}
                    </span>
                  )}
                  {option.timeEstimate && (
                    <span className="text-[#9a9a9a]"> · {option.timeEstimate}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-[#9a9a9a]">
                  <IoThumbsUp className="w-3.5 h-3.5" />
                  <span>0/1</span>
                </div>
                <IoChevronForward className="w-4 h-4 text-[#666] group-hover:text-[#00D4FF] transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

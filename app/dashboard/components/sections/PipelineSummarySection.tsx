"use client";

import Link from "next/link";
import { IoGrid } from "react-icons/io5";
import { PipelineColumn } from "../PipelineColumn";

interface PipelineSummary {
  open: number;
  investigating: number;
  options_generated: number;
  decided: number;
  in_progress: number;
  completed: number;
  deferred: number;
}

interface PipelineSummarySectionProps {
  summary: PipelineSummary;
}

export function PipelineSummarySection({ summary }: PipelineSummarySectionProps) {
  const hasActiveIssues =
    summary.open > 0 ||
    summary.investigating > 0 ||
    summary.in_progress > 0;

  if (!hasActiveIssues) return null;

  const activeCount =
    summary.open +
    summary.investigating +
    summary.options_generated +
    summary.decided +
    summary.in_progress;

  return (
    <section className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center">
            <IoGrid className="w-4 h-4 text-[#00D4FF]" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-white">Project Pipeline</h2>
            <p className="text-[10px] text-[#9a9a9a]">
              {activeCount} active · {summary.completed} completed
            </p>
          </div>
        </div>
        <Link
          href="/projects"
          className="text-xs text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors"
        >
          View Board
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <PipelineColumn
          label="Open"
          count={summary.open}
          color="orange"
          href="/issues?status=open"
        />
        <PipelineColumn
          label="Analyzing"
          count={summary.investigating}
          color="purple"
          href="/issues?status=investigating"
        />
        <PipelineColumn
          label="Options Ready"
          count={summary.options_generated}
          color="blue"
          href="/issues?status=options_generated"
        />
        <PipelineColumn
          label="Decided"
          count={summary.decided}
          color="teal"
          href="/issues?status=decided"
        />
        <PipelineColumn
          label="In Progress"
          count={summary.in_progress}
          color="green"
          href="/issues?status=in_progress"
        />
        <PipelineColumn
          label="Completed"
          count={summary.completed}
          color="gray"
          href="/issues?status=completed"
        />
      </div>
    </section>
  );
}

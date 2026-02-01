"use client";

import {
  IoWarning,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoChevronForward,
  IoGrid,
  IoTrendingUp,
} from "react-icons/io5";

interface PipelineStage {
  stage: string;
  count: number;
  color: string;
}

interface OpenIssue {
  id: string;
  title: string;
  group: string;
  status: string;
  priority?: string;
}

interface Outcome {
  id: string;
  issueTitle: string;
  success: boolean;
  optionType: string;
  actualCost: number;
  costDelta: number;
}

interface IssuesTabProps {
  pipeline: PipelineStage[];
  openIssues: OpenIssue[];
  recentOutcomes: Outcome[];
  onViewAllIssues?: () => void;
}

export function IssuesTab({ pipeline, openIssues, recentOutcomes, onViewAllIssues }: IssuesTabProps) {
  const activeCount = pipeline.filter(s => s.stage !== 'Completed').reduce((sum, s) => sum + s.count, 0);
  const completedCount = pipeline.find(s => s.stage === 'Completed')?.count || 0;

  return (
    <>
      {/* Pipeline Card */}
      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <IoGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-white">Project Pipeline</h3>
              <p className="text-[10px] sm:text-xs text-[#888]">{activeCount} active · {completedCount} completed</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {pipeline.map((stage, i) => (
            <div
              key={i}
              className="bg-[#0f0f0f] rounded-lg p-2 sm:p-3 border border-[#2a2a2a]"
            >
              <div className="text-[10px] sm:text-xs text-[#888] mb-1 truncate">{stage.stage}</div>
              <div className="text-base sm:text-lg font-semibold text-white">{stage.count}</div>
              <div
                className="h-1 rounded-full mt-2"
                style={{ backgroundColor: stage.color }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Awaiting Decision */}
      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IoWarning className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-medium text-white">Awaiting Your Decision</h3>
          </div>
          <span className="text-[10px] sm:text-xs text-[#888]">2 issues</span>
        </div>
        <div className="space-y-2">
          <div className="p-2 sm:p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start justify-between mb-1">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-medium text-white">Ceiling crack in bedroom</p>
                <p className="text-[9px] sm:text-[10px] text-[#888]">Cosmetic only</p>
              </div>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-[#2a2a2a] text-[#888] rounded-full flex-shrink-0 ml-2">
                low
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] mt-2 flex-wrap">
              <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                DIY: $25 · 2h
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 bg-[#2a2a2a] text-[#888] rounded">
                Pro: $200
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400">
              <IoCheckmarkCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Recommended: DIY
            </div>
          </div>
          <div className="p-2 sm:p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start justify-between mb-1">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-medium text-white">Dishwasher not draining</p>
                <p className="text-[9px] sm:text-[10px] text-[#888]">Check filter first</p>
              </div>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full flex-shrink-0 ml-2">
                moderate
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] mt-2 flex-wrap">
              <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                DIY: $0 · 30min
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 bg-[#2a2a2a] text-[#888] rounded">
                Pro: $150
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400">
              <IoCheckmarkCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Recommended: DIY
            </div>
          </div>
        </div>
      </div>

      {/* Open Issues */}
      {openIssues.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-medium text-white">Open Issues</h3>
            <span
              className="text-[10px] sm:text-xs text-emerald-400 cursor-pointer hover:text-emerald-300"
              onClick={onViewAllIssues}
            >
              View all
            </span>
          </div>
          <div className="space-y-2">
            {openIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-[#252525] transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <IoAlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white truncate">{issue.title}</p>
                  <p className="text-[10px] sm:text-xs text-[#888]">
                    {issue.group} · {issue.status === "investigating" ? "Analyzing..." : "Open"}
                  </p>
                </div>
                <IoChevronForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#666] flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Outcomes */}
      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IoTrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-medium text-white">Recent Outcomes</h3>
          </div>
        </div>
        <div className="space-y-2">
          {recentOutcomes.map((outcome) => (
            <div
              key={outcome.id}
              className="flex items-center justify-between p-2 rounded-lg bg-[#0f0f0f]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <IoCheckmarkCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{outcome.issueTitle}</p>
                  <p className="text-[10px] text-[#888]">
                    {outcome.optionType === 'diy' ? 'DIY' : 'Pro'} · ${outcome.actualCost}
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-400 flex-shrink-0">
                Saved ${Math.abs(outcome.costDelta)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

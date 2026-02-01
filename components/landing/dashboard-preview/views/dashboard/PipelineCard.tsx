import { IoGrid } from "react-icons/io5";

interface PipelineStage {
  stage: string;
  count: number;
  color: string;
}

interface PipelineCardProps {
  pipeline: PipelineStage[];
  activeCount?: number;
  completedCount?: number;
}

export function PipelineCard({ pipeline, activeCount = 5, completedCount = 8 }: PipelineCardProps) {
  return (
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
  );
}

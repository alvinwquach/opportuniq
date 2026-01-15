"use client";

interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  color?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  label,
  value,
  total,
  color = "#5eead4",
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] text-[#999]">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-white">{value}</span>
          {showPercentage && (
            <span className="text-[11px] text-[#555]">{percentage}%</span>
          )}
        </div>
      </div>
      <div className="h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

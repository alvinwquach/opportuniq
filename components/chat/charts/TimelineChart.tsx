"use client";

import { useMemo } from "react";
import { IoTime, IoWarning, IoFlash, IoSkull } from "react-icons/io5";
import type { TimelineData } from "@/lib/types/diagnosis";

interface TimelineChartProps {
  data: TimelineData;
  className?: string;
}

const urgencyConfig: Record<string, { icon: typeof IoTime; color: string; label: string; position: number }> = {
  monitor: { icon: IoTime, color: "#22c55e", label: "Monitor", position: 0 },
  this_month: { icon: IoTime, color: "#5eead4", label: "This Month", position: 20 },
  this_week: { icon: IoWarning, color: "#eab308", label: "This Week", position: 50 },
  today: { icon: IoFlash, color: "#f97316", label: "Today", position: 75 },
  now: { icon: IoSkull, color: "#ef4444", label: "Right Now", position: 90 },
  emergency: { icon: IoSkull, color: "#dc2626", label: "Emergency", position: 100 },
};

export function TimelineChart({ data, className }: TimelineChartProps) {
  const config = urgencyConfig[data.urgency] || urgencyConfig.monitor;
  const Icon = config.icon;

  const timelineSteps = useMemo(() => {
    const steps = [];

    if (data.consequences.immediate) {
      steps.push({ label: "Now", text: data.consequences.immediate, color: "#ef4444" });
    }
    if (data.consequences.oneWeek) {
      steps.push({ label: "1 Week", text: data.consequences.oneWeek, color: "#f97316" });
    }
    if (data.consequences.oneMonth) {
      steps.push({ label: "1 Month", text: data.consequences.oneMonth, color: "#eab308" });
    }
    if (data.consequences.sixMonths) {
      steps.push({ label: "6 Months", text: data.consequences.sixMonths, color: "#22c55e" });
    }
    if (data.consequences.worstCase) {
      steps.push({ label: "Worst Case", text: data.consequences.worstCase, color: "#dc2626" });
    }

    return steps;
  }, [data.consequences]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-white">Time to Act</h4>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5"
          style={{ backgroundColor: `${config.color}20`, color: config.color }}
        >
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </span>
      </div>
      <div className="relative mb-4">
        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${config.position}%`,
              background: `linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444)`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-[#666666]">
          <span>Monitor</span>
          <span>Week</span>
          <span>Today</span>
          <span>Now</span>
        </div>
      </div>
      {data.daysToAct !== null && data.daysToAct >= 0 && (
        <div className="text-center mb-4">
          <div className="text-3xl font-bold" style={{ color: config.color }}>
            {data.daysToAct === 0 ? "NOW" : data.daysToAct}
          </div>
          {data.daysToAct > 0 && (
            <div className="text-xs text-[#888888]">
              day{data.daysToAct !== 1 ? "s" : ""} to address
            </div>
          )}
        </div>
      )}
      {timelineSteps.length > 0 && (
        <div className="space-y-3 mt-4">
          <span className="text-xs text-[#888888]">What happens if you wait:</span>
          <div className="space-y-2">
            {timelineSteps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]"
              >
                <div
                  className="w-16 shrink-0 text-xs font-medium text-center py-1 rounded"
                  style={{ backgroundColor: `${step.color}20`, color: step.color }}
                >
                  {step.label}
                </div>
                <p className="text-xs text-[#888888] leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

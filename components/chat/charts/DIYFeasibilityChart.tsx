"use client";

import { useMemo } from "react";
import type { DIYFeasibilityData } from "@/lib/types/diagnosis";

interface DIYFeasibilityChartProps {
  data: DIYFeasibilityData;
  className?: string;
}

export function DIYFeasibilityChart({ data, className }: DIYFeasibilityChartProps) {
  const factors = useMemo(() => {
    return [
      { label: "Skill Match", value: data.skillMatch, icon: "wrench" },
      { label: "Worth Doing", value: data.worthDoing, icon: "check" },
      { label: "Low Risk", value: 10 - data.riskLevel, icon: "shield" },
      { label: "Time Fit", value: data.timeScore, icon: "clock" },
      { label: "Savings", value: data.savingsScore, icon: "dollar" },
    ];
  }, [data]);

  const overallScore = useMemo(() => {
    const avg = factors.reduce((sum, f) => sum + f.value, 0) / factors.length;
    return Math.round(avg * 10) / 10;
  }, [factors]);

  const recommendation = useMemo(() => {
    if (overallScore >= 7) return { text: "Great DIY candidate", color: "#22c55e" };
    if (overallScore >= 5) return { text: "Consider carefully", color: "#eab308" };
    if (overallScore >= 3) return { text: "Challenging DIY", color: "#f97316" };
    return { text: "Hire a professional", color: "#ef4444" };
  }, [overallScore]);

  const getBarColor = (value: number) => {
    if (value >= 7) return "#22c55e";
    if (value >= 5) return "#5eead4";
    if (value >= 3) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-white">DIY Feasibility</h4>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${recommendation.color}20`, color: recommendation.color }}
        >
          {overallScore}/10
        </span>
      </div>
      <div className="space-y-3">
        {factors.map((factor, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#888888]">{factor.label}</span>
              <span className="text-white font-medium">{factor.value}/10</span>
            </div>
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${factor.value * 10}%`,
                  backgroundColor: getBarColor(factor.value),
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-[#2a2a2a]">
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: recommendation.color }}
          />
          <span className="text-sm font-medium" style={{ color: recommendation.color }}>
            {recommendation.text}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-6 text-xs text-[#888888]">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#5eead4]" />
          <span>Skill: {data.skillLevel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]" />
          <span>Time: {data.timeEstimate}</span>
        </div>
      </div>
    </div>
  );
}

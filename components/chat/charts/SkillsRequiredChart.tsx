"use client";

import { useMemo } from "react";
import type { SkillsRequiredData } from "@/lib/types/diagnosis";

interface SkillsRequiredChartProps {
  data: SkillsRequiredData;
  className?: string;
}

const skillLevelConfig: Record<string, { color: string; label: string; percentage: number }> = {
  beginner: { color: "#22c55e", label: "Beginner Friendly", percentage: 25 },
  intermediate: { color: "#eab308", label: "Some Experience Needed", percentage: 50 },
  advanced: { color: "#f97316", label: "Experienced DIYer", percentage: 75 },
  professional: { color: "#ef4444", label: "Professional Required", percentage: 95 },
};

export function SkillsRequiredChart({ data, className }: SkillsRequiredChartProps) {
  const config = skillLevelConfig[data.level] || skillLevelConfig.intermediate;

  const levels = useMemo(() => [
    { key: "beginner", label: "Beginner", active: data.level === "beginner" },
    { key: "intermediate", label: "Intermediate", active: data.level === "intermediate" },
    { key: "advanced", label: "Advanced", active: data.level === "advanced" },
    { key: "professional", label: "Pro Only", active: data.level === "professional" },
  ], [data.level]);

  const activeIndex = levels.findIndex(l => l.active);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-white">Skills Required</h4>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
          style={{ backgroundColor: `${config.color}20`, color: config.color }}
        >
          {data.level}
        </span>
      </div>
      <div className="relative mb-4">
        <div className="h-2 bg-[#1a1a1a] rounded-full">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${config.percentage}%`,
              backgroundColor: config.color,
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {levels.map((level, i) => (
            <div key={level.key} className="flex flex-col items-center">
              <div
                className="w-2 h-2 rounded-full mb-1 transition-colors"
                style={{
                  backgroundColor: i <= activeIndex ? config.color : "#2a2a2a",
                }}
              />
              <span
                className="text-[10px] transition-colors"
                style={{
                  color: level.active ? config.color : "#666666",
                  fontWeight: level.active ? 600 : 400,
                }}
              >
                {level.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center mb-4">
        <span className="text-sm" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>
      {data.skills && data.skills.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-[#888888]">Skills needed:</span>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.slice(0, 4).map((skill, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-md bg-[#1a1a1a] text-[#888888] border border-[#2a2a2a]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      {data.toolsRequired && data.toolsRequired.length > 0 && (
        <div className="mt-3 space-y-2">
          <span className="text-xs text-[#888888]">Tools needed:</span>
          <div className="flex flex-wrap gap-1.5">
            {data.toolsRequired.slice(0, 4).map((tool, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-md bg-[#5eead4]/10 text-[#5eead4] border border-[#5eead4]/20"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

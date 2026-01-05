"use client";

import { useMemo } from "react";
import { IoWarning, IoCheckmarkCircle, IoAlertCircle, IoSkull, IoShield } from "react-icons/io5";
import type { RiskAssessmentData } from "@/lib/types/diagnosis";

interface RiskAssessmentChartProps {
  data: RiskAssessmentData;
  className?: string;
}

const riskConfig: Record<string, { icon: typeof IoWarning; color: string; label: string }> = {
  low: { icon: IoCheckmarkCircle, color: "#22c55e", label: "Low Risk" },
  medium: { icon: IoWarning, color: "#eab308", label: "Medium Risk" },
  high: { icon: IoAlertCircle, color: "#f97316", label: "High Risk" },
  critical: { icon: IoSkull, color: "#ef4444", label: "Critical Risk" },
};

export function RiskAssessmentChart({ data, className }: RiskAssessmentChartProps) {
  const config = riskConfig[data.level] || riskConfig.medium;
  const Icon = config.icon;

  const riskCategories = useMemo(() => {
    const categories = [];

    if (data.safetyRisk !== undefined) {
      categories.push({
        name: "Safety Risk",
        score: data.safetyRisk,
        description: "Risk of injury",
      });
    }
    if (data.damageRisk !== undefined) {
      categories.push({
        name: "Property Damage",
        score: data.damageRisk,
        description: "Risk of making it worse",
      });
    }
    if (data.costRisk !== undefined) {
      categories.push({
        name: "Cost Overrun",
        score: data.costRisk,
        description: "Unexpected expenses",
      });
    }
    if (data.codeViolationRisk !== undefined) {
      categories.push({
        name: "Code Violation",
        score: data.codeViolationRisk,
        description: "Permit issues",
      });
    }

    return categories;
  }, [data]);

  const getRiskColor = (score: number) => {
    if (score <= 3) return "#22c55e";
    if (score <= 5) return "#eab308";
    if (score <= 7) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-white">Risk Assessment</h4>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5"
          style={{ backgroundColor: `${config.color}20`, color: config.color }}
        >
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </span>
      </div>
      <div className="space-y-3">
        {riskCategories.map((category, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#888888]">{category.name}</span>
              <span
                className="font-medium"
                style={{ color: getRiskColor(category.score) }}
              >
                {category.score}/10
              </span>
            </div>
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${category.score * 10}%`,
                  backgroundColor: getRiskColor(category.score),
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {data.consequences && data.consequences.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
          <div className="flex items-center gap-2 mb-2">
            <IoAlertCircle className="w-4 h-4 text-[#ef4444] flex-shrink-0" />
            <span className="text-xs font-medium text-[#ef4444]">If things go wrong:</span>
          </div>
          <ul className="space-y-1.5 ml-6">
            {data.consequences.slice(0, 3).map((consequence, i) => (
              <li key={i} className="text-xs text-[#888888] list-disc list-outside">
                {consequence}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.mitigations && data.mitigations.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20">
          <div className="flex items-center gap-2 mb-2">
            <IoShield className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
            <span className="text-xs font-medium text-[#22c55e]">Reduce your risk:</span>
          </div>
          <ul className="space-y-1.5 ml-6">
            {data.mitigations.slice(0, 3).map((tip, i) => (
              <li key={i} className="text-xs text-[#888888] list-disc list-outside">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.permitRequired && (
        <div className="mt-3 p-3 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20">
          <div className="flex items-center gap-2">
            <IoWarning className="w-4 h-4 text-[#f97316] flex-shrink-0" />
            <span className="text-xs text-[#f97316]">Permit may be required in your area</span>
          </div>
        </div>
      )}
    </div>
  );
}

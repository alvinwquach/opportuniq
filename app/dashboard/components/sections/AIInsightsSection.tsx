"use client";

import { IoBulb, IoTrendingUp, IoTrendingDown, IoPulse } from "react-icons/io5";
import { cn } from "@/lib/utils";

interface AIInsight {
  title: string;
  description: string;
  metric?: string;
  trend?: "improving" | "declining" | "stable";
}

interface AIInsightsSectionProps {
  insights: AIInsight[];
}

export function AIInsightsSection({ insights }: AIInsightsSectionProps) {
  if (insights.length === 0) return null;

  return (
    <section className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <IoBulb className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-white">AI Insights</h2>
          <p className="text-[10px] text-gray-400">Patterns from your decisions</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={cn(
              "p-3 rounded-lg",
              insight.trend === "improving"
                ? "bg-green-500/5 border border-green-500/20"
                : insight.trend === "declining"
                ? "bg-amber-500/5 border border-amber-500/20"
                : "bg-gray-100 border border-gray-200"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white">{insight.title}</span>
              {insight.metric && (
                <span
                  className={cn(
                    "text-sm font-semibold",
                    insight.trend === "improving"
                      ? "text-green-400"
                      : insight.trend === "declining"
                      ? "text-amber-400"
                      : "text-[#a3a3a3]"
                  )}
                >
                  {insight.metric}
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#a3a3a3]">{insight.description}</p>
            {insight.trend && (
              <div className="flex items-center gap-1 mt-2">
                {insight.trend === "improving" ? (
                  <IoTrendingUp className="w-3 h-3 text-green-400" />
                ) : insight.trend === "declining" ? (
                  <IoTrendingDown className="w-3 h-3 text-amber-400" />
                ) : (
                  <IoPulse className="w-3 h-3 text-gray-400" />
                )}
                <span
                  className={cn(
                    "text-[10px]",
                    insight.trend === "improving"
                      ? "text-green-400"
                      : insight.trend === "declining"
                      ? "text-amber-400"
                      : "text-gray-400"
                  )}
                >
                  {insight.trend === "improving"
                    ? "Improving"
                    : insight.trend === "declining"
                    ? "Needs attention"
                    : "Stable"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

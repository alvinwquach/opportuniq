"use client";

import { useEffect, useState, useCallback } from "react";
import {
  IoReload,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoFlash,
  IoTime,
  IoCash,
  IoShield,
} from "react-icons/io5";
import { cn } from "@/lib/utils";

/**
 * AI Streaming Card
 *
 * Displays streaming AI analysis results in the dashboard.
 * NOT for landing page - this uses real streaming data.
 *
 * Features:
 * - Progressive reveal as data streams in
 * - Skeleton states for unloaded sections
 * - Error handling
 * - Smooth transitions
 */

interface AnalysisResult {
  diagnosis?: string;
  recommendation?: "diy" | "hire" | "defer";
  confidence?: number;
  estimatedSavings?: number;
  timeEstimate?: string;
  riskLevel?: "low" | "medium" | "high";
  options?: {
    type: "diy" | "hire" | "defer";
    costMin: number;
    costMax: number;
    timeEstimate: string;
    pros: string[];
    cons: string[];
  }[];
}

interface AIStreamingCardProps {
  issueId: string;
  className?: string;
  onComplete?: (result: AnalysisResult) => void;
}

export function AIStreamingCard({ issueId, className, onComplete }: AIStreamingCardProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate streaming for now - replace with real EventSource
  useEffect(() => {
    let mounted = true;

    const simulateStream = async () => {
      // In production, this would be:
      // const eventSource = new EventSource(`/api/analyze/${issueId}`);

      // Simulate progressive data arrival
      await delay(500);
      if (!mounted) return;
      setResult({ diagnosis: "Analyzing image..." });

      await delay(800);
      if (!mounted) return;
      setResult(prev => ({
        ...prev,
        diagnosis: "Hairline settling crack detected. Cosmetic issue, not structural.",
      }));

      await delay(600);
      if (!mounted) return;
      setResult(prev => ({
        ...prev,
        recommendation: "diy",
        confidence: 87,
      }));

      await delay(700);
      if (!mounted) return;
      setResult(prev => ({
        ...prev,
        estimatedSavings: 200,
        timeEstimate: "30 minutes",
        riskLevel: "low",
      }));

      await delay(500);
      if (!mounted) return;
      setResult(prev => ({
        ...prev,
        options: [
          {
            type: "diy",
            costMin: 15,
            costMax: 30,
            timeEstimate: "30 minutes",
            pros: ["Low cost", "Quick fix", "Learn a skill"],
            cons: ["Requires spackling tools"],
          },
          {
            type: "hire",
            costMin: 150,
            costMax: 300,
            timeEstimate: "1-2 hours",
            pros: ["Professional finish", "No effort"],
            cons: ["Higher cost", "Scheduling required"],
          },
        ],
      }));

      setIsStreaming(false);
    };

    simulateStream();

    return () => {
      mounted = false;
    };
  }, [issueId]);

  useEffect(() => {
    if (!isStreaming && result && onComplete) {
      onComplete(result);
    }
  }, [isStreaming, result, onComplete]);

  if (error) {
    return (
      <div className={cn("p-6 rounded-xl bg-red-500/10 border border-red-500/20", className)}>
        <div className="flex items-center gap-3">
          <IoAlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-400">Analysis failed</p>
            <p className="text-xs text-red-400/70">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl bg-[#161616] border border-[#1f1f1f] overflow-hidden", className)}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isStreaming ? "bg-cyan-500/10" : "bg-emerald-500/10"
          )}>
            {isStreaming ? (
              <IoReload className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : (
              <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {isStreaming ? "Analyzing..." : "Analysis Complete"}
            </p>
            <p className="text-xs text-[#666]">
              {isStreaming ? "AI is reviewing your issue" : "Ready to decide"}
            </p>
          </div>
        </div>

        {result?.confidence && !isStreaming && (
          <div className="text-right">
            <p className="text-xs text-[#666]">Confidence</p>
            <p className="text-sm font-medium text-white">{result.confidence}%</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Diagnosis */}
        <div className={cn(
          "transition-opacity duration-500",
          result?.diagnosis ? "opacity-100" : "opacity-30"
        )}>
          <p className="text-xs font-medium uppercase tracking-wider text-[#555] mb-2">
            Diagnosis
          </p>
          {result?.diagnosis ? (
            <p className="text-sm text-white leading-relaxed">{result.diagnosis}</p>
          ) : (
            <div className="space-y-2">
              <div className="h-4 bg-[#1f1f1f] rounded animate-pulse w-full" />
              <div className="h-4 bg-[#1f1f1f] rounded animate-pulse w-3/4" />
            </div>
          )}
        </div>

        {/* Recommendation Badge */}
        {result?.recommendation && (
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-500",
            result.recommendation === "diy" && "bg-emerald-500/10 border border-emerald-500/20",
            result.recommendation === "hire" && "bg-blue-500/10 border border-blue-500/20",
            result.recommendation === "defer" && "bg-amber-500/10 border border-amber-500/20"
          )}>
            <IoFlash className={cn(
              "w-4 h-4",
              result.recommendation === "diy" && "text-emerald-400",
              result.recommendation === "hire" && "text-blue-400",
              result.recommendation === "defer" && "text-amber-400"
            )} />
            <span className={cn(
              "text-sm font-medium",
              result.recommendation === "diy" && "text-emerald-400",
              result.recommendation === "hire" && "text-blue-400",
              result.recommendation === "defer" && "text-amber-400"
            )}>
              {result.recommendation === "diy" && "DIY Recommended"}
              {result.recommendation === "hire" && "Hire a Professional"}
              {result.recommendation === "defer" && "Can Wait"}
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className={cn(
          "grid grid-cols-3 gap-3 transition-opacity duration-500",
          result?.estimatedSavings ? "opacity-100" : "opacity-30"
        )}>
          <div className="p-3 rounded-lg bg-[#1a1a1a]">
            <IoCash className="w-4 h-4 text-emerald-400 mb-1" />
            {result?.estimatedSavings ? (
              <p className="text-lg font-semibold text-white">~${result.estimatedSavings}</p>
            ) : (
              <div className="h-6 bg-[#1f1f1f] rounded animate-pulse w-16" />
            )}
            <p className="text-xs text-[#555]">Potential savings</p>
          </div>

          <div className="p-3 rounded-lg bg-[#1a1a1a]">
            <IoTime className="w-4 h-4 text-cyan-400 mb-1" />
            {result?.timeEstimate ? (
              <p className="text-lg font-semibold text-white">{result.timeEstimate}</p>
            ) : (
              <div className="h-6 bg-[#1f1f1f] rounded animate-pulse w-16" />
            )}
            <p className="text-xs text-[#555]">Time estimate</p>
          </div>

          <div className="p-3 rounded-lg bg-[#1a1a1a]">
            <IoShield className="w-4 h-4 text-amber-400 mb-1" />
            {result?.riskLevel ? (
              <p className={cn(
                "text-lg font-semibold capitalize",
                result.riskLevel === "low" && "text-emerald-400",
                result.riskLevel === "medium" && "text-amber-400",
                result.riskLevel === "high" && "text-red-400"
              )}>
                {result.riskLevel}
              </p>
            ) : (
              <div className="h-6 bg-[#1f1f1f] rounded animate-pulse w-12" />
            )}
            <p className="text-xs text-[#555]">Risk level</p>
          </div>
        </div>

        {/* Options (when fully loaded) */}
        {result?.options && !isStreaming && (
          <div className="space-y-3 pt-2">
            <p className="text-xs font-medium uppercase tracking-wider text-[#555]">
              Your Options
            </p>
            {result.options.map((option, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg border transition-colors cursor-pointer",
                  option.type === "diy" && "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40",
                  option.type === "hire" && "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40",
                  option.type === "defer" && "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-sm font-medium",
                    option.type === "diy" && "text-emerald-400",
                    option.type === "hire" && "text-blue-400",
                    option.type === "defer" && "text-amber-400"
                  )}>
                    {option.type === "diy" && "Do It Yourself"}
                    {option.type === "hire" && "Hire Professional"}
                    {option.type === "defer" && "Wait & Monitor"}
                  </span>
                  <span className="text-xs text-[#888]">
                    ${option.costMin} - ${option.costMax}
                  </span>
                </div>
                <p className="text-xs text-[#666]">{option.timeEstimate}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

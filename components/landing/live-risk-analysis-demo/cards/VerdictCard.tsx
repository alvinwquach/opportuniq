import {
  IoSparkles,
  IoAlertCircle,
  IoShield,
  IoTime,
  IoCash,
} from "react-icons/io5";
import { cn } from "@/lib/utils";
import type { SummaryMetrics, DemoScenario, DynamicOpportunityCost } from "../types";

interface VerdictCardProps {
  scenario: DemoScenario;
  summaryMetrics: SummaryMetrics;
  opportunityCost: DynamicOpportunityCost;
}

export function VerdictCard({ scenario, summaryMetrics, opportunityCost }: VerdictCardProps) {
  return (
    <div className="ml-11 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={cn(
        "rounded-2xl border-2 overflow-hidden shadow-sm",
        summaryMetrics.complexity === "High"
          ? "bg-red-50 border-red-200"
          : summaryMetrics.complexity === "Moderate"
            ? "bg-amber-50 border-amber-200"
            : "bg-emerald-50 border-emerald-200"
      )}>
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              summaryMetrics.complexity === "High" ? "bg-red-100" :
              summaryMetrics.complexity === "Moderate" ? "bg-amber-100" : "bg-emerald-100"
            )}>
              <IoSparkles className={cn(
                "w-6 h-6",
                summaryMetrics.complexity === "High" ? "text-red-600" :
                summaryMetrics.complexity === "Moderate" ? "text-amber-700" : "text-emerald-700"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-neutral-900">Final Verdict</h3>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-semibold",
                  summaryMetrics.complexity === "High" ? "bg-red-200 text-red-800" :
                  summaryMetrics.complexity === "Moderate" ? "bg-amber-200 text-amber-800" : "bg-emerald-200 text-emerald-800"
                )}>
                  {summaryMetrics.complexity} Complexity
                </span>
              </div>
              <p className="text-sm text-neutral-700 mb-4">
                {summaryMetrics.complexity === "High"
                  ? "This task has significant risks. Consider hiring a professional or proceed with extreme caution."
                  : summaryMetrics.complexity === "Moderate"
                    ? "This task is manageable with proper preparation. Ensure you have all safety equipment."
                    : "This task is straightforward. Follow standard safety practices and you should be fine."}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/70 border border-neutral-200">
                  <IoAlertCircle className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-neutral-600">High Risks:</span>
                  <span className="font-semibold text-neutral-900">{summaryMetrics.highRisks}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/70 border border-neutral-200">
                  <IoShield className="w-3.5 h-3.5 text-teal-700" />
                  <span className="text-neutral-600">PPE Items:</span>
                  <span className="font-semibold text-neutral-900">{summaryMetrics.requiredPPE}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/70 border border-neutral-200">
                  <IoTime className="w-3.5 h-3.5 text-violet-600" />
                  <span className="text-neutral-600">Time:</span>
                  <span className="font-semibold text-neutral-900">{scenario.timeEstimate}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/70 border border-neutral-200">
                  <IoCash className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-neutral-600">Impact:</span>
                  <span className="font-semibold text-neutral-900">${opportunityCost.totalCost.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      summaryMetrics.complexity === "High" ? "bg-red-500" :
                      summaryMetrics.complexity === "Moderate" ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${scenario.confidenceScore}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-neutral-600">
                  {scenario.confidenceScore}% confidence
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

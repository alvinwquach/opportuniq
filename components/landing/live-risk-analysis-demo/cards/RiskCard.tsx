import {
  IoShield,
  IoHardwareChip,
  IoWarning,
  IoCheckmarkCircle,
  IoCloseCircle,
} from "react-icons/io5";
import { cn } from "@/lib/utils";
import type { DemoScenario } from "../types";

interface RiskCardProps {
  scenario: DemoScenario;
  riskChartRef: React.RefObject<SVGSVGElement | null>;
}

export function RiskCard({ scenario, riskChartRef }: RiskCardProps) {
  return (
    <div className="ml-11 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border border-neutral-300 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoShield className="w-4 h-4 text-amber-700" />
            <span className="text-sm font-semibold text-neutral-900">Risk Assessment</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-500" /> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-amber-500" /> Med
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-red-500" /> High
            </span>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <svg ref={riskChartRef} className="w-full h-48" />
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
            <div>
              <h4 className="text-xs font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
                <IoHardwareChip className="w-3.5 h-3.5 text-blue-700" />
                Safety Equipment
              </h4>
              <div className="space-y-1.5">
                {scenario.safetyEquipment.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.name}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg text-xs",
                        item.required ? "bg-red-50 border border-red-200" : "bg-neutral-50 border border-neutral-100"
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5", item.required ? "text-red-600" : "text-neutral-500")} />
                      <span className="text-neutral-700 flex-1">{item.name}</span>
                      {item.required && <span className="text-red-600 font-medium">Required</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
                <IoWarning className="w-3.5 h-3.5 text-amber-700" />
                Potential Complications
              </h4>
              <div className="space-y-1.5">
                {scenario.complications.map((comp) => (
                  <div key={comp.issue} className="flex items-start gap-2 text-xs">
                    {comp.impact === "high" ? (
                      <IoCloseCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                    ) : comp.impact === "medium" ? (
                      <IoWarning className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                    ) : (
                      <IoCheckmarkCircle className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                    )}
                    <span className="text-neutral-700">{comp.issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

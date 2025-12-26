"use client";

import { Sparkles, AlertTriangle, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { StreamingCard } from "./StreamingCard";
import type { Scenario } from "./types";

interface ResponseCardsProps {
  scenario: Scenario;
  visibleCards: string[];
}

function getUrgencyColor(urgency: string): string {
  if (urgency.includes("HIGH")) return "text-red-400";
  if (urgency.includes("MEDIUM")) return "text-orange-400";
  return "text-green-400";
}

export function ResponseCards({ scenario, visibleCards }: ResponseCardsProps) {
  return (
    <div className="space-y-4">
      {visibleCards.includes("diagnosis") && (
        <StreamingCard icon={Sparkles} title="Diagnosis" variant="default">
          <p className="text-sm text-slate-300 mb-3">
            {scenario.diagnosis.description}
          </p>
          <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400">
            <span className={cn("font-medium", getUrgencyColor(scenario.diagnosis.urgency))}>
              Urgency: {scenario.diagnosis.urgency}
            </span>
            <span>•</span>
            <span>{scenario.diagnosis.timeline}</span>
            <span>•</span>
            <span>Confidence: {scenario.diagnosis.confidence}%</span>
          </div>
        </StreamingCard>
      )}
      {visibleCards.includes("risks") && (
        <StreamingCard icon={AlertTriangle} title="What could go wrong?" variant="warning">
          <ul className="space-y-2">
            {scenario.risks.map((risk, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </StreamingCard>
      )}
      {visibleCards.includes("budget") && (
        <StreamingCard icon={DollarSign} title="Budget Analysis" variant="success">
          <p className="text-sm text-slate-300 mb-2">
            {scenario.budget.estimatedCost}
          </p>
          <p className="text-xs text-slate-400">
            {scenario.budget.recommendation}
          </p>
        </StreamingCard>
      )}
      {visibleCards.includes("options") && (
        <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h4 className="font-semibold text-base mb-4 text-white">Your Options</h4>
          <div className="space-y-3">
            {scenario.options.map((option, i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-700 bg-slate-800/30">
                <p className="font-medium text-sm text-white mb-1">{option.name}</p>
                <p className="text-xs text-slate-400 mb-1">{option.type}</p>
                <p className="text-xs text-slate-400">{option.details}</p>
                {option.steps && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs font-semibold text-slate-400 mb-2">Step-by-step:</p>
                    <ol className="space-y-1.5">
                      {option.steps.map((step, idx) => (
                        <li key={idx} className="text-xs text-slate-400 flex gap-2">
                          <span className="text-emerald-400 font-medium">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
          {scenario.tradeoffs && (
            <div className="mt-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
              <p className="text-xs font-semibold text-slate-400 mb-3">Compare approaches:</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-emerald-400 mb-2">DIY Approach</p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    <li>Cost: {scenario.tradeoffs.diy.cost}</li>
                    <li>Time: {scenario.tradeoffs.diy.time}</li>
                    <li>Difficulty: {scenario.tradeoffs.diy.difficulty}</li>
                    <li>Safety: {scenario.tradeoffs.diy.safety}</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-400 mb-2">Professional Service</p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    <li>Cost: {scenario.tradeoffs.professional.cost}</li>
                    <li>Time: {scenario.tradeoffs.professional.time}</li>
                    <li>Difficulty: {scenario.tradeoffs.professional.difficulty}</li>
                    <li>Safety: {scenario.tradeoffs.professional.safety}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

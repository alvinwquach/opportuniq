"use client";

import type { Scenario } from "./types";

interface ScenarioGridProps {
  scenarios: Scenario[];
  onScenarioSelect: (scenario: Scenario) => void;
}

export function ScenarioGrid({ scenarios, onScenarioSelect }: ScenarioGridProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400 mb-4">
        Select a common issue to see how OpportuniQ analyzes it:
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onScenarioSelect(scenario)}
            className="group p-4 rounded-xl border border-slate-700 bg-slate-800/30 hover:bg-slate-800 hover:border-emerald-500/50 transition-all text-left"
          >
            <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
              {scenario.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

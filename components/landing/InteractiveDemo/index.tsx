"use client";

import { useState, useMemo } from "react";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, scenarios } from "./data";
import { useStreamingResponse } from "./useStreamingResponse";
import { CategoryFilter } from "./CategoryFilter";
import { ScenarioGrid } from "./ScenarioGrid";
import { ResponseCards } from "./ResponseCards";
import { TypingIndicator } from "./TypingIndicator";
import type { Scenario } from "./types";

export function InteractiveDemo() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const { visibleCards, isStreaming, startStreaming, reset } = useStreamingResponse();

  const filteredScenarios = useMemo(() => {
    if (activeCategory === "all") return scenarios;
    return scenarios.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    startStreaming();
  };

  const handleReset = () => {
    setSelectedScenario(null);
    reset();
  };

  return (
    <section className="relative py-32 md:py-40 bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            Try the Demo
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-white">
            See how it works
          </h2>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Select any common repair issue to see instant diagnosis, parts recommendations, and budget analysis
          </p>
        </header>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-slate-600" />
                    <div className="h-3 w-3 rounded-full bg-slate-600" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">Diagnosis</span>
                </div>
                {selectedScenario && (
                  <button
                    onClick={handleReset}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Try another issue
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 space-y-6 min-h-125 max-h-175 overflow-y-auto">
              {!selectedScenario && (
                <>
                  <CategoryFilter
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                  />
                  <ScenarioGrid
                    scenarios={filteredScenarios}
                    onScenarioSelect={handleScenarioSelect}
                  />
                </>
              )}
              {selectedScenario && (
                <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="max-w-[85%] p-4 rounded-xl bg-emerald-600 text-white shadow-lg">
                    <p className="text-sm font-medium">{selectedScenario.prompt}</p>
                  </div>
                </div>
              )}

              {selectedScenario && visibleCards.length > 0 && (
                <ResponseCards scenario={selectedScenario} visibleCards={visibleCards} />
              )}
              {isStreaming && visibleCards.length < 4 && <TypingIndicator />}
            </div>
            <div className="border-t border-slate-800 p-4 bg-slate-900/80">
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  placeholder="Describe your project, repair, or maintenance task..."
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-500 placeholder:text-slate-600 cursor-not-allowed"
                />
                <Button
                  disabled
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg bg-slate-700 cursor-not-allowed opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {!selectedScenario && (
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500 max-w-2xl mx-auto">
                These scenarios show pre-configured examples. The full app analyzes photos, videos, and any project, repair, or maintenance task.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

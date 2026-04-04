"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  IoChevronForward,
  IoCheckmarkCircle,
  IoPlay,
  IoPerson,
  IoAnalytics,
} from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import { cn } from "@/lib/utils";

import type { DemoScenario, SummaryMetrics, DynamicOpportunityCost } from "./types";
import { DEMO_SCENARIOS } from "./data";
import { useMapbox } from "./hooks/useMapbox";
import { useRiskChart } from "./hooks/useRiskChart";
import { useStreamingAnalysis } from "./hooks/useStreamingAnalysis";
import { LocationCard } from "./cards/LocationCard";
import { RiskCard } from "./cards/RiskCard";
import { ResourcesCard } from "./cards/ResourcesCard";
import { CostCard } from "./cards/CostCard";
import { VerdictCard } from "./cards/VerdictCard";

export function LiveRiskAnalysisDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [userTimeValue, setUserTimeValue] = useState(50);

  // Initialize streaming analysis
  const {
    isStreaming,
    streamedText,
    analysisComplete,
    visibleCards,
    startStreaming,
    resetAnalysis,
  } = useStreamingAnalysis({
    scenario: selectedScenario,
    sectionRef,
  });

  // Initialize mapbox
  const { mapContainerRef, resetMap } = useMapbox({
    scenario: selectedScenario,
    isVisible: visibleCards.includes("location"),
  });

  // Initialize risk chart
  const { riskChartRef } = useRiskChart({
    risks: selectedScenario.risks,
    isVisible: visibleCards.includes("risks"),
  });

  // Calculate summary metrics
  const summaryMetrics: SummaryMetrics = useMemo(() => {
    const highRisks = selectedScenario.risks.filter((r) => r.severity === "high").length;
    const mediumRisks = selectedScenario.risks.filter((r) => r.severity === "medium").length;
    const requiredPPE = selectedScenario.safetyEquipment.filter((e) => e.required).length;
    const highComplications = selectedScenario.complications.filter((c) => c.impact === "high").length;

    let complexity: "Low" | "Moderate" | "High" = "Low";
    if (highRisks >= 2 || highComplications >= 2) {
      complexity = "High";
    } else if (highRisks >= 1 || mediumRisks >= 2) {
      complexity = "Moderate";
    }

    return { highRisks, mediumRisks, requiredPPE, highComplications, complexity };
  }, [selectedScenario]);

  // Calculate dynamic opportunity cost
  const dynamicOpportunityCost: DynamicOpportunityCost = useMemo(() => {
    const base = selectedScenario.opportunityCost;
    const timeValue = userTimeValue * base.estimatedHours;
    return {
      ...base,
      timeValue: userTimeValue,
      totalCost: timeValue + base.materialCost + base.riskCost,
    };
  }, [selectedScenario, userTimeValue]);

  // Handle scenario change
  const handleScenarioChange = useCallback((scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    resetAnalysis();
    resetMap();
  }, [resetAnalysis, resetMap]);

  return (
    <section
      ref={sectionRef}
      id="live-demo"
      className="relative py-20 md:py-28 overflow-hidden bg-neutral-50"
    >
      <div className="relative container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 mb-4 tracking-tight">
            See the Analysis in Action
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
            Watch how OpportuniQ researches your project with location-aware intelligence.
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
          {DEMO_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleScenarioChange(scenario)}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
                selectedScenario.id === scenario.id
                  ? "bg-blue-700 text-white shadow-md"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
              )}
            >
              {scenario.title}
            </button>
          ))}
        </div>

        {/* Conversational Flow Container */}
        <div className="space-y-4">
          {/* User Message Bubble */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
              <IoPerson className="w-4 h-4 text-neutral-600" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-md border border-neutral-200 px-4 py-3 shadow-sm">
              <p className="text-sm text-neutral-900">
                I want to <span className="font-medium text-blue-700">{selectedScenario.title.toLowerCase()}</span> in{" "}
                <span className="font-medium">{selectedScenario.location.name}</span>
              </p>
            </div>
          </div>

          {/* AI Streaming Panel */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center shrink-0">
              <IoAnalytics className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-neutral-900 rounded-2xl rounded-tl-md overflow-hidden shadow-lg">
                <div className="px-4 py-3 border-b border-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs text-neutral-500 font-mono">analysis.stream</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isStreaming && (
                      <div className="flex items-center gap-2 text-blue-400">
                        <ImSpinner8 className="w-3 h-3 animate-spin" />
                        <span className="text-xs font-mono">analyzing</span>
                      </div>
                    )}
                    {analysisComplete && (
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <IoCheckmarkCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-mono">complete</span>
                      </div>
                    )}
                    {!isStreaming && !analysisComplete && (
                      <button
                        onClick={startStreaming}
                        className="px-2.5 py-1 bg-blue-700 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5"
                      >
                        <IoPlay className="w-3 h-3" />
                        Run
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 h-36 overflow-y-auto font-mono text-xs bg-neutral-900/50">
                  {streamedText.length === 0 && !isStreaming && (
                    <p className="text-neutral-500">
                      <span className="text-blue-400">$</span> Waiting to analyze &quot;{selectedScenario.title}&quot;...
                    </p>
                  )}
                  {streamedText.map((text, i) => (
                    <div key={`stream-${i}-${text.slice(0, 10)}`} className="flex items-start gap-2 mb-1.5">
                      <IoChevronForward className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                      <span className="text-neutral-300">{text}</span>
                    </div>
                  ))}
                  {isStreaming && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-4 bg-blue-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location Card */}
          {visibleCards.includes("location") && (
            <LocationCard scenario={selectedScenario} mapContainerRef={mapContainerRef} />
          )}

          {/* Risk Assessment Card */}
          {visibleCards.includes("risks") && (
            <RiskCard scenario={selectedScenario} riskChartRef={riskChartRef} />
          )}

          {/* Resources Card */}
          {visibleCards.includes("resources") && (
            <ResourcesCard scenario={selectedScenario} />
          )}

          {/* Cost Analysis Card */}
          {visibleCards.includes("cost") && (
            <CostCard
              opportunityCost={dynamicOpportunityCost}
              userTimeValue={userTimeValue}
              onTimeValueChange={setUserTimeValue}
            />
          )}

          {/* Verdict Card */}
          {visibleCards.includes("verdict") && (
            <VerdictCard
              scenario={selectedScenario}
              summaryMetrics={summaryMetrics}
              opportunityCost={dynamicOpportunityCost}
            />
          )}
        </div>
        <p className="text-xs text-neutral-500 text-center mt-8">
          Demo analysis for illustration purposes. Actual results will vary based on your specific project and location.
        </p>
      </div>
    </section>
  );
}

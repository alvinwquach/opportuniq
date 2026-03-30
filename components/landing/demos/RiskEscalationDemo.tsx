"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

/**
 * Risk Escalation Demo
 *
 * Interaction: User clicks through a sequence of "wrong steps" in a repair scenario.
 * A cost meter climbs from $200 to $2,000+ as mistakes compound.
 *
 * 5-second insight: "One wrong move can 10x the cost. This tool catches that BEFORE I start."
 *
 * Why it converts: Creates urgency. Shows the product prevents expensive mistakes.
 * Fear of loss is a stronger motivator than promise of gain.
 */

interface Step {
  id: number;
  action: string;
  consequence: string;
  costIncrease: number;
  riskLevel: "safe" | "warning" | "danger" | "critical";
}

const SCENARIO = {
  title: "Water Heater Rumbling",
  initialCost: 200,
  steps: [
    {
      id: 1,
      action: "Skip checking the pressure valve",
      consequence: "Pressure builds undetected",
      costIncrease: 0,
      riskLevel: "warning" as const,
    },
    {
      id: 2,
      action: "Flush sediment anyway",
      consequence: "Disturbed rust clogs drain valve",
      costIncrease: 150,
      riskLevel: "warning" as const,
    },
    {
      id: 3,
      action: "Force the stuck valve open",
      consequence: "Valve breaks, water floods",
      costIncrease: 400,
      riskLevel: "danger" as const,
    },
    {
      id: 4,
      action: "Delayed shutoff response",
      consequence: "Subfloor water damage",
      costIncrease: 1200,
      riskLevel: "critical" as const,
    },
  ],
};

const RISK_COLORS = {
  safe: "#00FF88",
  warning: "#FF8800",
  danger: "#FF4444",
  critical: "#FF0000",
};

export function RiskEscalationDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalCost, setTotalCost] = useState(SCENARIO.initialCost);
  const [showReset, setShowReset] = useState(false);


  // Animate meter when cost changes
  useEffect(() => {
    if (!meterRef.current) return;

    const maxCost = 2000;
    const percentage = Math.min((totalCost / maxCost) * 100, 100);

    gsap.to(meterRef.current, {
      width: `${percentage}%`,
      duration: 0.6,
      ease: "power2.out",
    });
  }, [totalCost]);

  const handleNextStep = useCallback(() => {
    if (currentStep >= SCENARIO.steps.length) {
      setShowReset(true);
      return;
    }

    const step = SCENARIO.steps[currentStep];
    setTotalCost(prev => prev + step.costIncrease);
    setCurrentStep(prev => prev + 1);

    if (currentStep === SCENARIO.steps.length - 1) {
      setShowReset(true);
    }
  }, [currentStep]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setTotalCost(SCENARIO.initialCost);
    setShowReset(false);
  }, []);

  const getCurrentRiskLevel = () => {
    if (currentStep === 0) return "safe";
    return SCENARIO.steps[currentStep - 1].riskLevel;
  };

  const riskColor = RISK_COLORS[getCurrentRiskLevel()];


  return (
    <section className="relative py-16 lg:py-24 bg-black">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
              Don&apos;t Make It Worse
            </h2>
            <p className="text-base text-neutral-400 leading-relaxed mb-4">
              Click through to see how one mistake compounds into the next.
              A $200 fix becomes a $2,000 disaster in four bad decisions.
            </p>
            <p className="text-sm text-neutral-600">
              Opportuniq asks the right questions before you touch anything.
            </p>
          </div>

          {/* Interactive Demo */}
          <div ref={containerRef}>
            <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-6">
              {/* Scenario Title */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: riskColor }}
                />
                <span className="text-sm font-medium text-white">{SCENARIO.title}</span>
              </div>

              {/* Cost Meter */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-neutral-500">Repair Cost</span>
                  <span
                    className="text-lg font-mono font-bold transition-colors duration-300"
                    style={{ color: riskColor }}
                  >
                    ${totalCost.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    ref={meterRef}
                    className="h-full rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: riskColor,
                      width: `${(SCENARIO.initialCost / 2000) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-neutral-600">
                  <span>$0</span>
                  <span>$2,000</span>
                </div>
              </div>

              {/* Steps Timeline */}
              <div className="space-y-3 mb-6">
                {SCENARIO.steps.map((step, index) => {
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        isCompleted
                          ? "bg-neutral-900/80 border-neutral-700"
                          : isCurrent
                          ? "bg-neutral-900 border-neutral-600"
                          : "bg-neutral-900/30 border-neutral-800/50 opacity-40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted
                              ? "bg-red-500/20 text-red-400"
                              : "bg-neutral-800 text-neutral-500"
                          }`}
                        >
                          {isCompleted ? "✕" : step.id}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-white">{step.action}</div>
                          {isCompleted && (
                            <div className="text-xs text-red-400 mt-1">
                              {step.consequence}
                              {step.costIncrease > 0 && (
                                <span className="ml-2 font-mono">+${step.costIncrease}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              {showReset ? (
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] text-sm font-medium border border-[#00F0FF]/30 hover:bg-[#00F0FF]/20 transition-colors"
                >
                  Reset Demo
                </button>
              ) : (
                <button
                  onClick={handleNextStep}
                  className="w-full py-3 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: `${riskColor}15`,
                    color: riskColor,
                    borderWidth: 1,
                    borderColor: `${riskColor}30`,
                  }}
                >
                  {currentStep === 0 ? "Start: Make First Mistake" : "Continue: Make Next Mistake"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { IoTime, IoCalculator, IoTrendingUp, IoCheckmarkCircle } from "react-icons/io5";

const EXAMPLE_OPTIONS = [
  {
    type: "DIY",
    title: "DIY Brake Pad Replacement",
    costMin: 45,
    costMax: 80,
    timeEstimate: "2-3 hours",
    riskLevel: "medium",
    recommended: true,
  },
  {
    type: "Hire",
    title: "Professional Brake Service",
    costMin: 150,
    costMax: 300,
    timeEstimate: "Same day",
    riskLevel: "low",
    recommended: false,
  },
  {
    type: "Defer",
    title: "Monitor & Defer",
    costMin: 0,
    costMax: 0,
    timeEstimate: "Check in 2 weeks",
    riskLevel: "high",
    recommended: false,
  },
];

const FEATURES = [
  {
    icon: IoCalculator,
    title: "Cost Range Estimates",
    description: "Every option shows min/max cost estimates based on parts, labor, and your location. No surprises.",
  },
  {
    icon: IoTime,
    title: "Time Investment",
    description: "See how long each option takes—from 30-minute quick fixes to full weekend projects.",
  },
  {
    icon: IoTrendingUp,
    title: "What-If Simulations",
    description: "Run scenarios: What if parts cost 30% more? What if you need to hire after a failed DIY attempt?",
  },
  {
    icon: IoCheckmarkCircle,
    title: "Smart Recommendation",
    description: "Based on your skill level, budget, and risk tolerance, OpportuniQ highlights the best option for you.",
  },
];

export default function OpportunityCostPage() {
  const [selectedOption, setSelectedOption] = useState(EXAMPLE_OPTIONS[0]);

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-6">
            <IoTime className="w-4 h-4" />
            Every Diagnosis Includes Options
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-neutral-900 mb-6 tracking-tight">
            Opportunity Cost Calculator
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Every diagnosis generates multiple options: DIY, hire a pro, defer, or replace. Each option includes cost estimates, time requirements, and risk assessment so you can make the right call.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>
      <section className="py-20 px-6 border-t border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
                Multiple options, one diagnosis
              </h2>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                OpportuniQ doesn&apos;t just tell you what&apos;s wrong—it generates actionable options with full cost breakdowns. Compare DIY vs. hiring to see what actually makes sense for your situation.
              </p>

              <div className="space-y-3">
                {EXAMPLE_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedOption.type === option.type
                        ? "border-amber-300 bg-amber-50"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-neutral-900">{option.title}</span>
                      {option.recommended && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span>${option.costMin}-${option.costMax}</span>
                      <span>•</span>
                      <span>{option.timeEstimate}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-neutral-900">{selectedOption.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedOption.type === "DIY"
                      ? "bg-emerald-100 text-emerald-700"
                      : selectedOption.type === "Hire"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}>
                    {selectedOption.type}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Cost Range</span>
                  <span className="text-neutral-900 font-mono font-semibold">
                    ${selectedOption.costMin} - ${selectedOption.costMax}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Time Estimate</span>
                  <span className="text-neutral-900">{selectedOption.timeEstimate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Risk Level</span>
                  <span className={`font-medium ${
                    selectedOption.riskLevel === "low" ? "text-emerald-600" :
                    selectedOption.riskLevel === "medium" ? "text-amber-600" : "text-red-600"
                  }`}>
                    {selectedOption.riskLevel.charAt(0).toUpperCase() + selectedOption.riskLevel.slice(1)}
                  </span>
                </div>
                <div className="h-px bg-neutral-200" />
                {selectedOption.type === "DIY" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-700">Required Tools:</p>
                    <div className="flex flex-wrap gap-2">
                      {["Floor Jack", "Lug Wrench", "C-Clamp", "Socket Set"].map((tool) => (
                        <span key={tool} className="text-xs px-2 py-1 rounded bg-neutral-100 text-neutral-600">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedOption.type === "Hire" && (
                  <div className="text-sm text-neutral-600">
                    <p className="font-medium text-neutral-700 mb-2">What&apos;s Included:</p>
                    <p>Parts, labor, and warranty. We can find rated mechanics near you.</p>
                  </div>
                )}
                {selectedOption.type === "Defer" && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-sm text-amber-700">
                      <strong>Warning:</strong> Deferring brake work increases stopping distance. Set a reminder to re-evaluate.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
              Make informed decisions
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto">
              OpportuniQ factors in your skill level, budget constraints, and timeline to recommend the best path forward.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-neutral-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
            Stop guessing, start deciding
          </h2>
          <p className="text-neutral-600 mb-8">
            Get multiple options with real cost and time estimates for every repair.
          </p>
          <WaitlistModal>
            <Button className="h-12 px-8 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>
    </div>
  );
}

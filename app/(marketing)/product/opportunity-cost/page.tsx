"use client";

import { useState } from "react";
import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { IoTimeOutline, IoCalculatorOutline, IoTrendingUpOutline, IoCheckmarkCircle, IoChevronForward } from "react-icons/io5";

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
    icon: IoCalculatorOutline,
    title: "Cost Range Estimates",
    description: "Every option shows min/max cost estimates based on parts, labor, and your location. No surprises.",
  },
  {
    icon: IoTimeOutline,
    title: "Time Investment",
    description: "See how long each option takes—from 30-minute quick fixes to full weekend projects.",
  },
  {
    icon: IoTrendingUpOutline,
    title: "What-If Simulations",
    description: "Run scenarios: What if parts cost 30% more? What if you need to hire after a failed DIY attempt?",
  },
  {
    icon: IoCheckmarkCircle,
    title: "Smart Recommendation",
    description: "Based on your skill level, budget, and risk tolerance, OpportunIQ highlights the best option for you.",
  },
];

export default function OpportunityCostPage() {
  const [selectedOption, setSelectedOption] = useState(EXAMPLE_OPTIONS[0]);

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm text-neutral-500 mb-6">
            <Link href="/product" className="hover:text-blue-400 transition-colors">
              Product
            </Link>
            <IoChevronForward className="w-3 h-3" />
            <span className="text-neutral-300">Opportunity Cost</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-mono mb-6">
            <IoCalculatorOutline className="w-4 h-4" />
            Opportunity Cost
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Know the true{" "}
            <span className="text-blue-400">
              cost of every option
            </span>
          </h1>

          <p className="text-lg text-neutral-200 max-w-2xl mx-auto mb-10">
            Every diagnosis generates multiple options: DIY, hire a pro, defer, or replace.
            Each option includes cost estimates, time requirements, and risk assessment so you
            can make the right call.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 font-mono font-bold bg-blue-500 hover:bg-blue-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              Get Early Access
            </Button>
          </WaitlistModal>
        </div>
      </section>

      {/* Options Demo */}
      <section className="py-20 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Multiple options, one diagnosis
              </h2>
              <p className="text-neutral-300 mb-8">
                OpportunIQ doesn&apos;t just tell you what&apos;s wrong—it generates actionable
                options with full cost breakdowns. Compare DIY vs. hiring to see what actually
                makes sense for your situation.
              </p>

              <div className="space-y-3">
                {EXAMPLE_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedOption.type === option.type
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white">{option.title}</span>
                      {option.recommended && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
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

            <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">{selectedOption.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedOption.type === "DIY"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : selectedOption.type === "Hire"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-neutral-500/20 text-neutral-400"
                  }`}>
                    {selectedOption.type}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Cost Range</span>
                  <span className="text-white font-mono font-semibold">
                    ${selectedOption.costMin} - ${selectedOption.costMax}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Time Estimate</span>
                  <span className="text-white">{selectedOption.timeEstimate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Risk Level</span>
                  <span className={`font-medium ${
                    selectedOption.riskLevel === "low" ? "text-emerald-400" :
                    selectedOption.riskLevel === "medium" ? "text-amber-400" : "text-red-400"
                  }`}>
                    {selectedOption.riskLevel.charAt(0).toUpperCase() + selectedOption.riskLevel.slice(1)}
                  </span>
                </div>
                <div className="h-px bg-neutral-800" />
                {selectedOption.type === "DIY" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-300">Required Tools:</p>
                    <div className="flex flex-wrap gap-2">
                      {["Floor Jack", "Lug Wrench", "C-Clamp", "Socket Set"].map((tool) => (
                        <span key={tool} className="text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-400">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedOption.type === "Hire" && (
                  <div className="text-sm text-neutral-400">
                    <p className="font-medium text-neutral-300 mb-2">What&apos;s Included:</p>
                    <p>Parts, labor, and warranty. We can find rated mechanics near you.</p>
                  </div>
                )}
                {selectedOption.type === "Defer" && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-sm text-amber-400">
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
      <section className="py-16 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Make informed decisions
            </h2>
            <p className="text-neutral-300 max-w-xl mx-auto">
              OpportunIQ factors in your skill level, budget constraints, and timeline to recommend the best path forward.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-neutral-900 border border-neutral-700">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-neutral-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Stop guessing, start deciding
          </h2>
          <p className="text-neutral-300 mb-8">
            Get multiple options with real cost and time estimates for every repair.
          </p>
          <WaitlistModal>
            <Button className="h-14 px-8 font-mono font-bold text-lg bg-blue-500 hover:bg-blue-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(20,184,166,0.4)]">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>
    </>
  );
}

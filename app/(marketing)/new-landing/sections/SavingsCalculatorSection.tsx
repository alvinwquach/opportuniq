"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, animateCounter } from "@/lib/gsap";
import { IoCalculator, IoTrendingUp } from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger);

export function SavingsCalculatorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);

  const [repairs, setRepairs] = useState(4);
  const [avgCost, setAvgCost] = useState(500);
  const [hourlyRate, setHourlyRate] = useState(50);

  // Calculate savings
  const overPaymentSaved = repairs * avgCost * 0.35; // 35% average overpayment avoided
  const timeSaved = repairs * 14 * hourlyRate; // 14 hours saved per issue
  const wrongDecisions = repairs * 0.73 * 200; // 73% wrong decisions avoided, $200 avg
  const totalSavings = Math.round(overPaymentSaved + timeSaved * 0.1 + wrongDecisions * 0.5);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 80%",
        },
      });

      // Calculator slide in
      gsap.from(calculatorRef.current, {
        opacity: 0,
        x: -50,
        duration: 0.8,
        scrollTrigger: {
          trigger: calculatorRef.current,
          start: "top 75%",
        },
      });

      // Result slide in
      gsap.from(resultRef.current, {
        opacity: 0,
        x: 50,
        duration: 0.8,
        scrollTrigger: {
          trigger: resultRef.current,
          start: "top 75%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Animate total when it changes
  useEffect(() => {
    if (totalRef.current) {
      animateCounter(totalRef.current, totalSavings, {
        duration: 0.8,
        prefix: "$",
        decimals: 0,
      });
    }
  }, [totalSavings]);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]"
    >
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section heading */}
        <div ref={headingRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
            <IoCalculator className="w-4 h-4" />
            <span>Calculate Your Savings</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            See how much you could save
          </h2>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            Adjust the sliders to match your situation and see your potential
            annual savings.
          </p>
        </div>

        {/* Calculator */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div
            ref={calculatorRef}
            className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5"
          >
            <h3 className="text-xl font-semibold text-white mb-8">
              Your Home Profile
            </h3>

            {/* Repairs per year */}
            <div className="mb-8">
              <div className="flex justify-between mb-3">
                <label htmlFor="new-landing-repairs" className="text-sm text-neutral-400">
                  Repairs per year
                </label>
                <span className="text-sm font-medium text-emerald-400">
                  {repairs}
                </span>
              </div>
              <input
                id="new-landing-repairs"
                type="range"
                min="1"
                max="12"
                value={repairs}
                onChange={(e) => setRepairs(parseInt(e.target.value))}
                aria-label="Number of repairs per year"
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-neutral-600 mt-1">
                <span>1</span>
                <span>12</span>
              </div>
            </div>

            {/* Average repair cost */}
            <div className="mb-8">
              <div className="flex justify-between mb-3">
                <label htmlFor="new-landing-avg-cost" className="text-sm text-neutral-400">
                  Average repair cost
                </label>
                <span className="text-sm font-medium text-emerald-400">
                  ${avgCost}
                </span>
              </div>
              <input
                id="new-landing-avg-cost"
                type="range"
                min="100"
                max="2000"
                step="100"
                value={avgCost}
                onChange={(e) => setAvgCost(parseInt(e.target.value))}
                aria-label="Average repair cost in dollars"
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-neutral-600 mt-1">
                <span>$100</span>
                <span>$2,000</span>
              </div>
            </div>

            {/* Hourly rate */}
            <div>
              <div className="flex justify-between mb-3">
                <label htmlFor="new-landing-hourly-rate" className="text-sm text-neutral-400">
                  Your hourly value
                </label>
                <span className="text-sm font-medium text-emerald-400">
                  ${hourlyRate}/hr
                </span>
              </div>
              <input
                id="new-landing-hourly-rate"
                type="range"
                min="15"
                max="150"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                aria-label="Your hourly rate in dollars"
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-neutral-600 mt-1">
                <span>$15</span>
                <span>$150</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div
            ref={resultRef}
            className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20"
          >
            <h3 className="text-xl font-semibold text-white mb-8">
              Your Estimated Savings
            </h3>

            {/* Breakdown */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-sm text-white">Overpayment avoided</div>
                  <div className="text-xs text-neutral-500">
                    35% avg markup eliminated
                  </div>
                </div>
                <div className="text-lg font-semibold text-emerald-400">
                  ${Math.round(overPaymentSaved).toLocaleString()}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-sm text-white">Time value saved</div>
                  <div className="text-xs text-neutral-500">
                    {repairs * 14} hours of research
                  </div>
                </div>
                <div className="text-lg font-semibold text-emerald-400">
                  ${Math.round(timeSaved * 0.1).toLocaleString()}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-sm text-white">Better decisions</div>
                  <div className="text-xs text-neutral-500">
                    Optimal DIY vs hire choices
                  </div>
                </div>
                <div className="text-lg font-semibold text-emerald-400">
                  ${Math.round(wrongDecisions * 0.5).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-emerald-300 mb-1">
                    Total Annual Savings
                  </div>
                  <div className="text-4xl font-bold text-white">
                    <span ref={totalRef}>${totalSavings.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <IoTrendingUp className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-500 mt-4 text-center">
              Based on average homeowner data. Your actual savings may vary.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

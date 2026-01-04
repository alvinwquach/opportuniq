"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as d3 from "d3";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Opportunity Cost Calculator (Refined)
 *
 * The core "aha" moment - simplified for calm, clarity, and confidence.
 * Single unified panel, generous spacing, slower animations.
 */

interface ProjectScenario {
  name: string;
  proCost: number;
  materialsCost: number;
  diyHours: number;
}

const PRESET_SCENARIOS: ProjectScenario[] = [
  { name: "Leaky Faucet", proCost: 175, materialsCost: 25, diyHours: 1 },
  { name: "Ceiling Fan", proCost: 250, materialsCost: 80, diyHours: 2 },
  { name: "Drywall Patch", proCost: 200, materialsCost: 30, diyHours: 1.5 },
  { name: "Garbage Disposal", proCost: 350, materialsCost: 150, diyHours: 2 },
];

export function OpportunityCostCalculator() {
  const sectionRef = useRef<HTMLElement>(null);
  const gaugeRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // User inputs
  const [hourlyRate, setHourlyRate] = useState(50);
  const [selectedScenario, setSelectedScenario] = useState<ProjectScenario>(PRESET_SCENARIOS[0]);

  // Calculated values
  const proCost = selectedScenario.proCost;
  const materialsCost = selectedScenario.materialsCost;
  const diyHours = selectedScenario.diyHours;
  const timeCost = hourlyRate * diyHours;
  const totalDiyCost = materialsCost + timeCost;
  const savings = proCost - totalDiyCost;
  const worthDiy = savings > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Gentle entrance animation
  useEffect(() => {
    if (!contentRef.current || !mounted) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(contentRef.current, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      }
    );
  }, [mounted]);

  // Animated gauge - slower, calmer
  useEffect(() => {
    if (!gaugeRef.current || !mounted) return;

    const svg = d3.select(gaugeRef.current);
    svg.selectAll("*").remove();

    const width = 240;
    const height = 140;
    const radius = 90;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height - 10})`);

    // Background arc - softer color
    const backgroundArc = d3.arc()
      .innerRadius(radius - 16)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append("path")
      .attr("d", backgroundArc as never)
      .attr("fill", "#262626");

    // Value arc
    const maxSavings = proCost;
    const normalizedValue = Math.max(-1, Math.min(1, savings / maxSavings));
    const endAngle = (normalizedValue * Math.PI) / 2;

    const valueArc = d3.arc<{ endAngle: number }>()
      .innerRadius(radius - 14)
      .outerRadius(radius - 2)
      .startAngle(-Math.PI / 2)
      .endAngle(d => d.endAngle)
      .cornerRadius(8);

    const path = g.append("path")
      .datum({ endAngle: -Math.PI / 2 })
      .attr("fill", worthDiy ? "#22c55e" : "#f87171")
      .attr("d", valueArc);

    // Slower animation (1200ms instead of 800ms)
    path.transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attrTween("d", function(d) {
        const interpolate = d3.interpolate(d.endAngle, endAngle);
        return (t: number) => {
          d.endAngle = interpolate(t);
          return valueArc(d) || "";
        };
      });

    // Center verdict
    g.append("text")
      .attr("y", -35)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("letter-spacing", "0.05em")
      .attr("fill", "#a3a3a3")
      .text(worthDiy ? "YOU SAVE" : "PRO SAVES");

    g.append("text")
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("font-size", "28px")
      .attr("font-weight", "600")
      .attr("fill", worthDiy ? "#4ade80" : "#f87171")
      .text(`$${Math.abs(savings).toFixed(0)}`);

  }, [mounted, savings, proCost, worthDiy]);

  if (!mounted) return null;

  return (
    <section
      ref={sectionRef}
      id="calculator"
      className="relative py-24 sm:py-32 bg-black"
    >
      <div className="container mx-auto px-6 max-w-3xl">
        <div ref={contentRef} className="opacity-0">
          {/* Header - simpler, no badge */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-3 tracking-tight">
              Your Time Has a Price
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg max-w-lg mx-auto">
              Set your hourly value. See the true cost of each choice.
            </p>
          </div>

          {/* Single unified card */}
          <div className="bg-neutral-950 rounded-2xl border border-neutral-800/60 p-6 sm:p-8">
            {/* Hourly Rate - prominent slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-neutral-400">Your hourly value</label>
                <div className="text-right">
                  <span className="text-2xl font-semibold text-white">${hourlyRate}</span>
                  <span className="text-neutral-500 text-sm">/hr</span>
                </div>
              </div>
              <input
                type="range"
                min="15"
                max="150"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:w-5
                  [&::-moz-range-thumb]:h-5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:cursor-pointer"
                aria-label="Set your hourly rate"
              />
              <div className="flex justify-between text-xs text-neutral-600 mt-1">
                <span>$15</span>
                <span>$150</span>
              </div>
            </div>

            {/* Project Selection - simple pills */}
            <div className="mb-8">
              <label className="text-sm text-neutral-400 block mb-3">Choose a project</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.name}
                    onClick={() => setSelectedScenario(scenario)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                      selectedScenario.name === scenario.name
                        ? "bg-white text-black font-medium"
                        : "bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700/60"
                    }`}
                    aria-pressed={selectedScenario.name === scenario.name}
                  >
                    {scenario.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-neutral-800/60 mb-8" />

            {/* Results area */}
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              {/* Left: Gauge */}
              <div className="flex justify-center">
                <svg ref={gaugeRef} className="w-60 h-36" aria-hidden="true" />
              </div>

              {/* Right: Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Pro quote</span>
                  <span className="text-white font-medium">${proCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">DIY materials</span>
                  <span className="text-white font-medium">${materialsCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Your time ({diyHours}h)</span>
                  <span className="text-amber-400 font-medium">${timeCost}</span>
                </div>
                <div className="h-px bg-neutral-800/60" />
                <div className="flex justify-between">
                  <span className="text-neutral-400 text-sm">True DIY cost</span>
                  <span className="text-white font-semibold text-lg">${totalDiyCost}</span>
                </div>
              </div>
            </div>

            {/* Verdict - cleaner */}
            <div
              className={`mt-8 p-4 rounded-xl text-center transition-colors duration-500 ${
                worthDiy
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              <p className={`text-lg font-medium ${worthDiy ? "text-green-400" : "text-red-400"}`}>
                {worthDiy ? "DIY makes sense" : "Hire a pro"}
              </p>
              <p className="text-neutral-400 text-sm mt-1">
                {worthDiy
                  ? `You save $${savings.toFixed(0)} by doing it yourself`
                  : `Hiring saves you $${Math.abs(savings).toFixed(0)} in real cost`}
              </p>
            </div>
          </div>

          {/* Subtle footnote */}
          <p className="text-center text-neutral-600 text-xs mt-6">
            You set your time value once. OpportunIQ calculates the rest for every decision.
          </p>
        </div>
      </div>
    </section>
  );
}

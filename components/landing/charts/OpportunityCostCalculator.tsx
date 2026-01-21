"use client";

import { useEffect, useRef, useState } from "react";
import { select } from "d3-selection";
import { arc } from "d3-shape";
import { interpolate } from "d3-interpolate";
import { easeCubicOut } from "d3-ease";
import "d3-transition";


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
  const gaugeRef = useRef<SVGSVGElement>(null);
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

  // Animated gauge
  useEffect(() => {
    if (!gaugeRef.current || !mounted) return;

    const svg = select(gaugeRef.current);
    svg.selectAll("*").remove();

    const width = 240;
    const height = 140;
    const radius = 90;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height - 10})`);

    // Background arc - light gray for light mode
    const backgroundArc = arc()
      .innerRadius(radius - 16)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append("path")
      .attr("d", backgroundArc as never)
      .attr("fill", "#e5e5e5");

    // Value arc
    const maxSavings = proCost;
    const normalizedValue = Math.max(-1, Math.min(1, savings / maxSavings));
    const endAngleValue = (normalizedValue * Math.PI) / 2;

    const valueArc = arc<{ endAngle: number }>()
      .innerRadius(radius - 14)
      .outerRadius(radius - 2)
      .startAngle(-Math.PI / 2)
      .endAngle(d => d.endAngle)
      .cornerRadius(8);

    const path = g.append("path")
      .datum({ endAngle: -Math.PI / 2 })
      .attr("fill", worthDiy ? "#059669" : "#dc2626")
      .attr("d", valueArc);

    // Animation
    path.transition()
      .duration(1200)
      .ease(easeCubicOut)
      .attrTween("d", function(d) {
        const interpolator = interpolate(d.endAngle, endAngleValue);
        return (t: number) => {
          d.endAngle = interpolator(t);
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
      .attr("fill", "#737373")
      .text(worthDiy ? "YOU SAVE" : "PRO SAVES");

    g.append("text")
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("font-size", "28px")
      .attr("font-weight", "600")
      .attr("fill", worthDiy ? "#059669" : "#dc2626")
      .text(`$${Math.abs(savings).toFixed(0)}`);

  }, [mounted, savings, proCost, worthDiy]);

  if (!mounted) return null;

  return (
    <section
      id="calculator"
      className="relative py-24 sm:py-32 bg-neutral-50"
    >
      <div className="container mx-auto px-6 max-w-3xl">
        <div>
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 mb-3 tracking-tight">
              Your Time Has a Price
            </h2>
            <p className="text-neutral-600 text-base sm:text-lg max-w-lg mx-auto">
              Set your hourly value. See the true cost of each choice.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-lg shadow-neutral-200/50">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="hourly-rate-slider" className="text-sm text-neutral-600">Your hourly value</label>
                <div className="text-right">
                  <span className="text-2xl font-semibold text-neutral-900">${hourlyRate}</span>
                  <span className="text-neutral-600 text-sm">/hr</span>
                </div>
              </div>
              <input
                id="hourly-rate-slider"
                type="range"
                min="15"
                max="150"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-teal-700
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:w-5
                  [&::-moz-range-thumb]:h-5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-teal-700
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-neutral-600 mt-1">
                <span>$15</span>
                <span>$150</span>
              </div>
            </div>
            <fieldset className="mb-8">
              <legend className="text-sm text-neutral-600 block mb-3">Choose a project</legend>
              <div className="flex flex-wrap gap-2">
                {PRESET_SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.name}
                    onClick={() => setSelectedScenario(scenario)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                      selectedScenario.name === scenario.name
                        ? "bg-teal-700 text-white font-medium"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                    aria-pressed={selectedScenario.name === scenario.name}
                  >
                    {scenario.name}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="h-px bg-neutral-200 mb-8" />
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center">
                <svg ref={gaugeRef} className="w-60 h-36" aria-hidden="true" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Pro quote</span>
                  <span className="text-neutral-900 font-medium">${proCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">DIY materials</span>
                  <span className="text-neutral-900 font-medium">${materialsCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Your time ({diyHours}h)</span>
                  <span className="text-amber-700 font-medium">${timeCost}</span>
                </div>
                <div className="h-px bg-neutral-200" />
                <div className="flex justify-between">
                  <span className="text-neutral-600 text-sm">True DIY cost</span>
                  <span className="text-neutral-900 font-semibold text-lg">${totalDiyCost}</span>
                </div>
              </div>
            </div>
            <div
              className={`mt-8 p-4 rounded-xl text-center transition-colors duration-500 ${
                worthDiy
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p className={`text-lg font-medium ${worthDiy ? "text-emerald-700" : "text-red-700"}`}>
                {worthDiy ? "DIY makes sense" : "Hire a pro"}
              </p>
              <p className="text-neutral-600 text-sm mt-1">
                {worthDiy
                  ? `You save $${savings.toFixed(0)} by doing it yourself`
                  : `Hiring saves you $${Math.abs(savings).toFixed(0)} in real cost`}
              </p>
            </div>
          </div>
          <p className="text-center text-neutral-600 text-xs mt-6">
            You set your time value once. OpportunIQ calculates the rest for every decision.
          </p>
        </div>
      </div>
    </section>
  );
}

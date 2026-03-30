"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as d3 from "d3";
import { IoScale, IoWarning, IoCash, IoTime, IoShield, IoConstruct, IoPeople } from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Decision Comparison
 *
 * Side-by-side comparison of DIY vs Hire showing:
 * - Cost breakdown
 * - Time investment
 * - Risk factors
 * - Quality expectations
 */

interface ComparisonMetric {
  name: string;
  diy: number;
  hire: number;
  unit: string;
  icon: React.ReactNode;
  lowerIsBetter: boolean;
}

interface ComparisonScenario {
  name: string;
  metrics: ComparisonMetric[];
  diyVerdict: string;
  hireVerdict: string;
}

interface NormalizedMetric extends ComparisonMetric {
  diyNorm: number;
  hireNorm: number;
  diyWins: boolean;
  hireWins: boolean;
}

const SCENARIOS: ComparisonScenario[] = [
  {
    name: "Leaky Faucet Repair",
    metrics: [
      { name: "Total Cost", diy: 35, hire: 175, unit: "$", icon: <IoCash className="w-4 h-4" />, lowerIsBetter: true },
      { name: "Time", diy: 60, hire: 5, unit: "min", icon: <IoTime className="w-4 h-4" />, lowerIsBetter: true },
      { name: "Risk Level", diy: 2, hire: 1, unit: "/10", icon: <IoWarning className="w-4 h-4" />, lowerIsBetter: true },
      { name: "Skill Required", diy: 3, hire: 0, unit: "/10", icon: <IoConstruct className="w-4 h-4" />, lowerIsBetter: true },
      { name: "Warranty", diy: 0, hire: 90, unit: "days", icon: <IoShield className="w-4 h-4" />, lowerIsBetter: false },
    ],
    diyVerdict: "Great starter project with low risk",
    hireVerdict: "Quick but pricey for simple fix",
  },
  {
    name: "Electrical Panel Upgrade",
    metrics: [
      { name: "Total Cost", diy: 800, hire: 2500, unit: "$", icon: <IoCash className="w-4 h-4" />, lowerIsBetter: true },
      { name: "Time", diy: 480, hire: 30, unit: "min", icon: <IoTime className="w-4 h-4" />, lowerIsBetter: true },
      { name: "Risk Level", diy: 9, hire: 2, unit: "/10", icon: <IoWarning className="w-4 h-4" />, lowerIsBetter: true },
      { name: "Skill Required", diy: 9, hire: 0, unit: "/10", icon: <IoConstruct className="w-4 h-4" />, lowerIsBetter: true },
      { name: "Warranty", diy: 0, hire: 365, unit: "days", icon: <IoShield className="w-4 h-4" />, lowerIsBetter: false },
    ],
    diyVerdict: "STOP: Requires licensed electrician",
    hireVerdict: "Required by code in most areas",
  },
  {
    name: "Interior Paint Room",
    metrics: [
      { name: "Total Cost", diy: 150, hire: 500, unit: "$", icon: <IoCash className="w-4 h-4" />, lowerIsBetter: true },
      { name: "Time", diy: 360, hire: 15, unit: "min", icon: <IoTime className="w-4 h-4" />, lowerIsBetter: true },
      { name: "Risk Level", diy: 1, hire: 1, unit: "/10", icon: <IoWarning className="w-4 h-4" />, lowerIsBetter: true },
      { name: "Skill Required", diy: 4, hire: 0, unit: "/10", icon: <IoConstruct className="w-4 h-4" />, lowerIsBetter: true },
      { name: "Warranty", diy: 0, hire: 180, unit: "days", icon: <IoShield className="w-4 h-4" />, lowerIsBetter: false },
    ],
    diyVerdict: "Satisfying project, big savings",
    hireVerdict: "Pro finish, minimal hassle",
  },
];

export function DecisionComparison() {
  const sectionRef = useRef<HTMLElement>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const [activeScenario, setActiveScenario] = useState(0);
  const [animated, setAnimated] = useState(false);

  const scenario = SCENARIOS[activeScenario];


  useEffect(() => {
    if (!chartRef.current) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();

    const width = 420;
    const height = 260;
    const margin = { top: 25, right: 60, bottom: 20, left: 90 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yScale = d3.scaleBand()
      .domain(scenario.metrics.map(m => m.name))
      .range([0, innerHeight])
      .padding(0.4);

    // Find max value for each metric to normalize
    const normalizedData = scenario.metrics.map(m => {
      const maxVal = Math.max(m.diy, m.hire);
      return {
        ...m,
        diyNorm: m.diy / maxVal,
        hireNorm: m.hire / maxVal,
        diyWins: m.lowerIsBetter ? m.diy <= m.hire : m.diy >= m.hire,
        hireWins: m.lowerIsBetter ? m.hire <= m.diy : m.hire >= m.diy,
      };
    });

    const barHeight = yScale.bandwidth() / 2 - 2;

    // Row labels
    g.selectAll(".row-label")
      .data(normalizedData)
      .enter()
      .append("text")
      .attr("class", "row-label")
      .attr("x", -10)
      .attr("y", d => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#9ca3af")
      .attr("font-size", "12px")
      .text(d => d.name);

    // DIY bars (top of each row)
    const diyBars = g.selectAll(".diy-bar")
      .data(normalizedData)
      .enter()
      .append("g")
      .attr("class", "diy-bar");

    diyBars.append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.name) || 0)
      .attr("width", 0)
      .attr("height", barHeight)
      .attr("rx", 3)
      .attr("fill", d => d.diyWins ? "#22c55e" : "#6b7280");

    diyBars.append("text")
      .attr("x", 5)
      .attr("y", d => (yScale(d.name) || 0) + barHeight / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("opacity", 0)
      .text(d => `${d.unit === "$" ? "$" : ""}${d.diy}${d.unit !== "$" ? d.unit : ""}`);

    // Hire bars (bottom of each row)
    const hireBars = g.selectAll(".hire-bar")
      .data(normalizedData)
      .enter()
      .append("g")
      .attr("class", "hire-bar");

    hireBars.append("rect")
      .attr("x", 0)
      .attr("y", d => (yScale(d.name) || 0) + barHeight + 4)
      .attr("width", 0)
      .attr("height", barHeight)
      .attr("rx", 3)
      .attr("fill", d => d.hireWins && !d.diyWins ? "#3b82f6" : "#4b5563");

    hireBars.append("text")
      .attr("x", 5)
      .attr("y", d => (yScale(d.name) || 0) + barHeight + 4 + barHeight / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("opacity", 0)
      .text(d => `${d.unit === "$" ? "$" : ""}${d.hire}${d.unit !== "$" ? d.unit : ""}`);

    // Legend
    g.append("rect")
      .attr("x", innerWidth - 80)
      .attr("y", -20)
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 2)
      .attr("fill", "#22c55e");

    g.append("text")
      .attr("x", innerWidth - 64)
      .attr("y", -14)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#9ca3af")
      .attr("font-size", "11px")
      .text("DIY");

    g.append("rect")
      .attr("x", innerWidth - 30)
      .attr("y", -20)
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 2)
      .attr("fill", "#3b82f6");

    g.append("text")
      .attr("x", innerWidth - 14)
      .attr("y", -14)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#9ca3af")
      .attr("font-size", "11px")
      .text("Hire");

    // Animation trigger
    if (sectionRef.current && !animated) {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        onEnter: () => {
          setAnimated(true);

          // Animate DIY bars
          diyBars.selectAll("rect")
            .transition()
            .duration(800)
            .delay((_, i) => i * 100)
            .attr("width", (d: unknown) => (d as NormalizedMetric).diyNorm * innerWidth);

          diyBars.selectAll("text")
            .transition()
            .duration(400)
            .delay((_, i) => i * 100 + 600)
            .attr("opacity", 1);

          // Animate Hire bars
          hireBars.selectAll("rect")
            .transition()
            .duration(800)
            .delay((_, i) => i * 100 + 50)
            .attr("width", (d: unknown) => (d as NormalizedMetric).hireNorm * innerWidth);

          hireBars.selectAll("text")
            .transition()
            .duration(400)
            .delay((_, i) => i * 100 + 650)
            .attr("opacity", 1);
        },
      });
    } else if (animated) {
      // If already animated, show immediately
      diyBars.selectAll("rect").attr("width", (d: unknown) => (d as NormalizedMetric).diyNorm * innerWidth);
      diyBars.selectAll("text").attr("opacity", 1);
      hireBars.selectAll("rect").attr("width", (d: unknown) => (d as NormalizedMetric).hireNorm * innerWidth);
      hireBars.selectAll("text").attr("opacity", 1);
    }

  }, [activeScenario, animated]);


  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-black overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-black to-black" />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
            <IoScale className="w-4 h-4" />
            Side-by-Side Comparison
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
            DIY vs Hire:{" "}
            <span className="text-blue-400">The Full Picture</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-400">
            Cost is just one factor. Compare time, risk, skill, and warranty to make the smart choice.
          </p>
        </div>

        {/* Scenario Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setActiveScenario(i)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeScenario === i
                  ? "bg-blue-500/20 border border-blue-500/40 text-blue-400"
                  : "bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:border-gray-600"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 lg:p-8">
          <svg ref={chartRef} className="w-full" />

          {/* Verdicts */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <IoConstruct className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">DIY Verdict</span>
              </div>
              <p className="text-sm text-gray-300">{scenario.diyVerdict}</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <IoPeople className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">Hire Verdict</span>
              </div>
              <p className="text-sm text-gray-300">{scenario.hireVerdict}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

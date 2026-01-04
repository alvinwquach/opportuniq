"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

/**
 * Insight Charts Demo
 *
 * Additional meaningful charts:
 * - Hidden Costs Waterfall (what people forget)
 * - Skill vs Complexity Matrix
 * - ROI by Project Type
 * - Learning Curve (first time vs repeat)
 * - Contractor Availability by Season
 * - Decision Confidence breakdown
 */

// Hidden costs people forget when DIYing
const HIDDEN_COSTS = [
  { name: "Base Materials", value: 150, type: "base" },
  { name: "Tools Needed", value: 85, type: "add" },
  { name: "Your Time", value: 225, type: "add" },
  { name: "Trip to Store", value: 35, type: "add" },
  { name: "Potential Redo", value: 120, type: "add" },
  { name: "True Total", value: 615, type: "total" },
];

// When to DIY based on skill & complexity
const SKILL_MATRIX = [
  { project: "Change AC Filter", skill: 1, complexity: 1, recommendation: "diy" },
  { project: "Fix Running Toilet", skill: 2, complexity: 2, recommendation: "diy" },
  { project: "Patch Drywall", skill: 3, complexity: 2, recommendation: "diy" },
  { project: "Install Ceiling Fan", skill: 3, complexity: 4, recommendation: "maybe" },
  { project: "Replace Faucet", skill: 3, complexity: 3, recommendation: "diy" },
  { project: "Electrical Panel", skill: 5, complexity: 5, recommendation: "hire" },
  { project: "Roof Repair", skill: 4, complexity: 5, recommendation: "hire" },
  { project: "Gas Line Work", skill: 5, complexity: 5, recommendation: "hire" },
  { project: "Build Deck", skill: 4, complexity: 4, recommendation: "maybe" },
  { project: "Paint Room", skill: 2, complexity: 2, recommendation: "diy" },
];

// ROI by project type (savings vs effort)
const ROI_DATA = [
  { type: "Minor Plumbing", avgSavings: 180, effort: 2, projects: 45 },
  { type: "HVAC Maintenance", avgSavings: 120, effort: 1, projects: 32 },
  { type: "Cosmetic Fixes", avgSavings: 95, effort: 2, projects: 67 },
  { type: "Electrical (Simple)", avgSavings: 150, effort: 3, projects: 23 },
  { type: "Outdoor/Garden", avgSavings: 200, effort: 3, projects: 41 },
];

// First time vs repeat DIY
const LEARNING_CURVE = [
  { attempt: "1st Time", time: 4.5, cost: 280, mistakes: 2.1 },
  { attempt: "2nd Time", time: 2.8, cost: 165, mistakes: 0.8 },
  { attempt: "3rd Time", time: 1.9, cost: 120, mistakes: 0.3 },
  { attempt: "4th+", time: 1.2, cost: 95, mistakes: 0.1 },
];

// Contractor availability/pricing by season
const SEASONAL_DATA = [
  { month: "Jan", availability: 85, pricing: 92 },
  { month: "Feb", availability: 82, pricing: 94 },
  { month: "Mar", availability: 65, pricing: 105 },
  { month: "Apr", availability: 45, pricing: 115 },
  { month: "May", availability: 35, pricing: 125 },
  { month: "Jun", availability: 30, pricing: 130 },
  { month: "Jul", availability: 28, pricing: 135 },
  { month: "Aug", availability: 32, pricing: 128 },
  { month: "Sep", availability: 50, pricing: 112 },
  { month: "Oct", availability: 60, pricing: 108 },
  { month: "Nov", availability: 75, pricing: 98 },
  { month: "Dec", availability: 88, pricing: 90 },
];

export function InsightChartsDemo() {
  const waterfallRef = useRef<SVGSVGElement>(null);
  const matrixRef = useRef<SVGSVGElement>(null);
  const roiRef = useRef<SVGSVGElement>(null);
  const learningRef = useRef<SVGSVGElement>(null);
  const seasonalRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hidden Costs Waterfall Chart
  useEffect(() => {
    if (!waterfallRef.current || !mounted) return;

    const svg = d3.select(waterfallRef.current);
    svg.selectAll("*").remove();

    const width = 320;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Calculate running totals
    let runningTotal = 0;
    const waterfallData = HIDDEN_COSTS.map((d, i) => {
      const start = d.type === "total" ? 0 : runningTotal;
      const end = d.type === "total" ? d.value : runningTotal + d.value;
      if (d.type !== "total") runningTotal += d.value;
      return { ...d, start, end };
    });

    const xScale = d3.scaleBand()
      .domain(HIDDEN_COSTS.map(d => d.name))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, 700])
      .range([innerHeight, 0]);

    // Bars
    g.selectAll(".bar")
      .data(waterfallData)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.name) || 0)
      .attr("y", d => yScale(Math.max(d.start, d.end)))
      .attr("width", xScale.bandwidth())
      .attr("height", d => Math.abs(yScale(d.start) - yScale(d.end)))
      .attr("fill", d => d.type === "base" ? "#3b82f6" : d.type === "total" ? "#ef4444" : "#f59e0b")
      .attr("rx", 2);

    // Connector lines
    waterfallData.slice(0, -1).forEach((d, i) => {
      const next = waterfallData[i + 1];
      if (next.type !== "total") {
        g.append("line")
          .attr("x1", (xScale(d.name) || 0) + xScale.bandwidth())
          .attr("x2", xScale(next.name) || 0)
          .attr("y1", yScale(d.end))
          .attr("y2", yScale(d.end))
          .attr("stroke", "#525252")
          .attr("stroke-dasharray", "2,2");
      }
    });

    // Value labels
    g.selectAll(".value")
      .data(waterfallData)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d.name) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.end) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", d => d.type === "total" ? "#ef4444" : "#e5e5e5")
      .attr("font-size", 9)
      .attr("font-weight", d => d.type === "total" ? 600 : 400)
      .text(d => `$${d.value}`);

    // X axis
    g.selectAll(".x-label")
      .data(HIDDEN_COSTS)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d.name) || 0) + xScale.bandwidth() / 2)
      .attr("y", innerHeight + 12)
      .attr("text-anchor", "middle")
      .attr("fill", "#737373")
      .attr("font-size", 7)
      .each(function(d) {
        const words = d.name.split(" ");
        const text = d3.select(this);
        text.text("");
        words.forEach((word, i) => {
          text.append("tspan")
            .attr("x", (xScale(d.name) || 0) + xScale.bandwidth() / 2)
            .attr("dy", i === 0 ? 0 : 9)
            .text(word);
        });
      });

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d}`))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#262626").attr("x2", innerWidth))
      .call(g => g.selectAll(".tick text").attr("fill", "#737373").attr("font-size", 8));

  }, [mounted]);

  // Skill vs Complexity Matrix
  useEffect(() => {
    if (!matrixRef.current || !mounted) return;

    const svg = d3.select(matrixRef.current);
    svg.selectAll("*").remove();

    const width = 320;
    const height = 240;
    const margin = { top: 30, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 6]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 6]).range([innerHeight, 0]);

    // Zones
    // DIY zone (bottom-left)
    g.append("rect")
      .attr("x", 0)
      .attr("y", yScale(3))
      .attr("width", xScale(3))
      .attr("height", innerHeight - yScale(3))
      .attr("fill", "#22c55e")
      .attr("opacity", 0.15);

    // Maybe zone (middle)
    g.append("rect")
      .attr("x", xScale(2))
      .attr("y", yScale(5))
      .attr("width", xScale(3))
      .attr("height", yScale(2) - yScale(5))
      .attr("fill", "#f59e0b")
      .attr("opacity", 0.15);

    // Hire zone (top-right)
    g.append("rect")
      .attr("x", xScale(3.5))
      .attr("y", 0)
      .attr("width", innerWidth - xScale(3.5))
      .attr("height", yScale(3.5))
      .attr("fill", "#ef4444")
      .attr("opacity", 0.15);

    // Zone labels
    g.append("text").attr("x", xScale(1)).attr("y", yScale(1)).attr("fill", "#22c55e").attr("font-size", 10).attr("font-weight", 500).text("DIY Zone");
    g.append("text").attr("x", xScale(3)).attr("y", yScale(3.5)).attr("fill", "#f59e0b").attr("font-size", 10).attr("font-weight", 500).text("Maybe");
    g.append("text").attr("x", xScale(4.5)).attr("y", yScale(5)).attr("fill", "#ef4444").attr("font-size", 10).attr("font-weight", 500).text("Hire Out");

    // Points
    const colorMap: Record<string, string> = { diy: "#22c55e", maybe: "#f59e0b", hire: "#ef4444" };
    g.selectAll(".point")
      .data(SKILL_MATRIX)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.complexity))
      .attr("cy", d => yScale(d.skill))
      .attr("r", 5)
      .attr("fill", d => colorMap[d.recommendation])
      .attr("stroke", "#000")
      .attr("stroke-width", 1);

    // Axes
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .call(g => g.select(".domain").attr("stroke", "#525252"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#525252"))
      .call(g => g.selectAll(".tick text").attr("fill", "#737373").attr("font-size", 8));

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .call(g => g.select(".domain").attr("stroke", "#525252"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#525252"))
      .call(g => g.selectAll(".tick text").attr("fill", "#737373").attr("font-size", 8));

    // Axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#a3a3a3")
      .attr("font-size", 10)
      .text("Project Complexity →");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -35)
      .attr("text-anchor", "middle")
      .attr("fill", "#a3a3a3")
      .attr("font-size", 10)
      .text("Skill Required →");

  }, [mounted]);

  // ROI by Project Type
  useEffect(() => {
    if (!roiRef.current || !mounted) return;

    const svg = d3.select(roiRef.current);
    svg.selectAll("*").remove();

    const width = 320;
    const height = 180;
    const margin = { top: 15, right: 50, bottom: 30, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yScale = d3.scaleBand()
      .domain(ROI_DATA.map(d => d.type))
      .range([0, innerHeight])
      .padding(0.25);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(ROI_DATA, d => d.avgSavings) || 250])
      .range([0, innerWidth]);

    // Labels
    g.selectAll(".label")
      .data(ROI_DATA)
      .enter()
      .append("text")
      .attr("x", -5)
      .attr("y", d => (yScale(d.type) || 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#a3a3a3")
      .attr("font-size", 9)
      .text(d => d.type);

    // Bars with gradient based on effort
    g.selectAll(".bar")
      .data(ROI_DATA)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.type) || 0)
      .attr("width", d => xScale(d.avgSavings))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => d.effort <= 2 ? "#22c55e" : d.effort <= 3 ? "#3b82f6" : "#f59e0b")
      .attr("rx", 2);

    // Value labels
    g.selectAll(".value")
      .data(ROI_DATA)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.avgSavings) + 5)
      .attr("y", d => (yScale(d.type) || 0) + yScale.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#e5e5e5")
      .attr("font-size", 9)
      .text(d => `$${d.avgSavings}`);

  }, [mounted]);

  // Learning Curve
  useEffect(() => {
    if (!learningRef.current || !mounted) return;

    const svg = d3.select(learningRef.current);
    svg.selectAll("*").remove();

    const width = 320;
    const height = 180;
    const margin = { top: 20, right: 20, bottom: 35, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(LEARNING_CURVE.map(d => d.attempt))
      .range([0, innerWidth])
      .padding(0.4);

    const yScaleTime = d3.scaleLinear()
      .domain([0, 5])
      .range([innerHeight, 0]);

    const yScaleCost = d3.scaleLinear()
      .domain([0, 300])
      .range([innerHeight, 0]);

    // Time bars
    g.selectAll(".time-bar")
      .data(LEARNING_CURVE)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.attempt) || 0)
      .attr("y", d => yScaleTime(d.time))
      .attr("width", xScale.bandwidth() / 2 - 2)
      .attr("height", d => innerHeight - yScaleTime(d.time))
      .attr("fill", "#8b5cf6")
      .attr("rx", 2);

    // Cost bars
    g.selectAll(".cost-bar")
      .data(LEARNING_CURVE)
      .enter()
      .append("rect")
      .attr("x", d => (xScale(d.attempt) || 0) + xScale.bandwidth() / 2 + 2)
      .attr("y", d => yScaleCost(d.cost))
      .attr("width", xScale.bandwidth() / 2 - 2)
      .attr("height", d => innerHeight - yScaleCost(d.cost))
      .attr("fill", "#22c55e")
      .attr("rx", 2);

    // X axis
    g.selectAll(".x-label")
      .data(LEARNING_CURVE)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d.attempt) || 0) + xScale.bandwidth() / 2)
      .attr("y", innerHeight + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#737373")
      .attr("font-size", 9)
      .text(d => d.attempt);

    // Value labels on bars
    g.selectAll(".time-label")
      .data(LEARNING_CURVE)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d.attempt) || 0) + xScale.bandwidth() / 4)
      .attr("y", d => yScaleTime(d.time) - 4)
      .attr("text-anchor", "middle")
      .attr("fill", "#8b5cf6")
      .attr("font-size", 8)
      .text(d => `${d.time}h`);

    g.selectAll(".cost-label")
      .data(LEARNING_CURVE)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d.attempt) || 0) + xScale.bandwidth() * 0.75)
      .attr("y", d => yScaleCost(d.cost) - 4)
      .attr("text-anchor", "middle")
      .attr("fill", "#22c55e")
      .attr("font-size", 8)
      .text(d => `$${d.cost}`);

  }, [mounted]);

  // Seasonal Availability
  useEffect(() => {
    if (!seasonalRef.current || !mounted) return;

    const svg = d3.select(seasonalRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 160;
    const margin = { top: 20, right: 45, bottom: 30, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(SEASONAL_DATA.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.1);

    const yScaleAvail = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);
    const yScalePrice = d3.scaleLinear().domain([80, 140]).range([innerHeight, 0]);

    // Availability bars
    g.selectAll(".avail-bar")
      .data(SEASONAL_DATA)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.month) || 0)
      .attr("y", d => yScaleAvail(d.availability))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScaleAvail(d.availability))
      .attr("fill", d => d.availability > 70 ? "#22c55e" : d.availability > 40 ? "#f59e0b" : "#ef4444")
      .attr("opacity", 0.7)
      .attr("rx", 2);

    // Price line
    const line = d3.line<typeof SEASONAL_DATA[0]>()
      .x(d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .y(d => yScalePrice(d.pricing))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(SEASONAL_DATA)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Price points
    g.selectAll(".price-point")
      .data(SEASONAL_DATA)
      .enter()
      .append("circle")
      .attr("cx", d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr("cy", d => yScalePrice(d.pricing))
      .attr("r", 3)
      .attr("fill", "#f59e0b");

    // X axis
    g.selectAll(".x-label")
      .data(SEASONAL_DATA)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr("y", innerHeight + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#737373")
      .attr("font-size", 8)
      .text(d => d.month);

    // Left Y axis (availability)
    g.append("g")
      .call(d3.axisLeft(yScaleAvail).ticks(4).tickFormat(d => `${d}%`))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").remove())
      .call(g => g.selectAll(".tick text").attr("fill", "#22c55e").attr("font-size", 8));

    // Right Y axis (pricing)
    g.append("g")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(yScalePrice).ticks(4).tickFormat(d => `${d}%`))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").remove())
      .call(g => g.selectAll(".tick text").attr("fill", "#f59e0b").attr("font-size", 8));

    // Best time indicator
    g.append("rect")
      .attr("x", xScale("Dec") || 0)
      .attr("y", 0)
      .attr("width", xScale.bandwidth() * 3)
      .attr("height", innerHeight)
      .attr("fill", "#22c55e")
      .attr("opacity", 0.1);

    g.append("text")
      .attr("x", (xScale("Jan") || 0) + xScale.bandwidth() / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", "#22c55e")
      .attr("font-size", 8)
      .text("Best time");

  }, [mounted]);

  if (!mounted) return null;

  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-neutral-950 via-amber-950/10 to-black">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
            The Hidden Math of Every Decision
          </h2>
          <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
            Most people only see the surface cost. We show you everything—the hidden expenses,
            the learning curve, the best timing, and exactly when DIY makes sense.
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Hidden Costs Waterfall */}
          <div className="bg-neutral-900/80 rounded-xl border border-neutral-800 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-1">The True Cost of DIY</h3>
              <p className="text-xs text-neutral-500">What most people forget to calculate</p>
            </div>
            <svg ref={waterfallRef} viewBox="0 0 320 200" className="w-full" />
            <div className="mt-3 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                <span className="text-neutral-500">Materials</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                <span className="text-neutral-500">Hidden Costs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                <span className="text-neutral-500">True Total</span>
              </div>
            </div>
          </div>

          {/* Skill vs Complexity */}
          <div className="bg-neutral-900/80 rounded-xl border border-neutral-800 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-1">When to DIY vs Hire</h3>
              <p className="text-xs text-neutral-500">Based on skill required & project complexity</p>
            </div>
            <svg ref={matrixRef} viewBox="0 0 320 240" className="w-full" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* ROI by Project */}
          <div className="bg-neutral-900/80 rounded-xl border border-neutral-800 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-1">Best ROI Projects</h3>
              <p className="text-xs text-neutral-500">Average savings by type</p>
            </div>
            <svg ref={roiRef} viewBox="0 0 320 180" className="w-full" />
            <div className="mt-2 flex items-center justify-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-green-500" />
                <span className="text-neutral-500">Easy</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-blue-500" />
                <span className="text-neutral-500">Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-amber-500" />
                <span className="text-neutral-500">Hard</span>
              </div>
            </div>
          </div>

          {/* Learning Curve */}
          <div className="bg-neutral-900/80 rounded-xl border border-neutral-800 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-1">The Learning Curve</h3>
              <p className="text-xs text-neutral-500">First time vs repeat attempts</p>
            </div>
            <svg ref={learningRef} viewBox="0 0 320 180" className="w-full" />
            <div className="mt-2 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-purple-500" />
                <span className="text-neutral-500">Time</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-green-500" />
                <span className="text-neutral-500">Cost</span>
              </div>
            </div>
          </div>

          {/* Seasonal - Spans full width on mobile */}
          <div className="bg-neutral-900/80 rounded-xl border border-neutral-800 p-5 md:col-span-1">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-1">Best Time to Hire</h3>
              <p className="text-xs text-neutral-500">Contractor availability & pricing</p>
            </div>
            <svg ref={seasonalRef} viewBox="0 0 400 160" className="w-full" />
            <div className="mt-2 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-green-500" />
                <span className="text-neutral-500">Availability</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-neutral-500">Pricing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Insight callout */}
        <div className="bg-gradient-to-r from-cyan-950/30 to-purple-950/30 rounded-xl border border-cyan-900/30 p-6 text-center">
          <p className="text-neutral-300 text-sm leading-relaxed max-w-2xl mx-auto">
            <span className="text-cyan-400 font-medium">The insight:</span> A $150 repair can cost $615 when you add tools, time, and mistakes.
            But that same repair done the 4th time? Just $95. Opportuniq tells you which one you&apos;re signing up for.
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import * as d3 from "d3";

/**
 * Ledger Timeline Demo - Expanded with many charts
 *
 * Shows decision history with multiple D3 visualizations:
 * - Timeline entries
 * - Cumulative savings area chart
 * - Decision pie chart
 * - Category breakdown
 * - Time spent analysis
 * - Success rate by type
 * - Monthly activity calendar heatmap
 */

interface LedgerEntry {
  id: string;
  date: string;
  issue: string;
  decision: "diy" | "outsource" | "defer";
  outcome: "success" | "partial" | "issue";
  saved: number;
  timeSpent: string;
  category: string;
}

const LEDGER_DATA: LedgerEntry[] = [
  { id: "1", date: "Dec 28", issue: "Dishwasher drain clog", decision: "diy", outcome: "success", saved: 150, timeSpent: "25 min", category: "plumbing" },
  { id: "2", date: "Dec 20", issue: "Furnace clicking", decision: "outsource", outcome: "success", saved: 0, timeSpent: "2 hrs", category: "hvac" },
  { id: "3", date: "Dec 12", issue: "Garage door squeak", decision: "diy", outcome: "success", saved: 120, timeSpent: "15 min", category: "mechanical" },
  { id: "4", date: "Dec 5", issue: "Kitchen faucet drip", decision: "defer", outcome: "partial", saved: 0, timeSpent: "—", category: "plumbing" },
  { id: "5", date: "Nov 28", issue: "Bathroom sink clog", decision: "diy", outcome: "success", saved: 95, timeSpent: "20 min", category: "plumbing" },
  { id: "6", date: "Nov 15", issue: "AC filter change", decision: "diy", outcome: "success", saved: 40, timeSpent: "5 min", category: "hvac" },
];

const DECISION_COLORS = {
  diy: "#22c55e",
  outsource: "#3b82f6",
  defer: "#f59e0b",
};

const OUTCOME_CONFIG = {
  success: { label: "Resolved", color: "#22c55e" },
  partial: { label: "Pending", color: "#f59e0b" },
  issue: { label: "Issue", color: "#ef4444" },
};

// Category data for charts
const CATEGORY_DATA = [
  { category: "Plumbing", count: 45, savings: 1240 },
  { category: "HVAC", count: 23, savings: 680 },
  { category: "Electrical", count: 18, savings: 520 },
  { category: "Mechanical", count: 31, savings: 890 },
  { category: "Cosmetic", count: 27, savings: 340 },
];

// Monthly activity for heatmap
const MONTHLY_ACTIVITY = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  count: Math.floor(Math.random() * 4),
}));

// Time distribution
const TIME_DISTRIBUTION = [
  { range: "< 15 min", count: 34 },
  { range: "15-30 min", count: 28 },
  { range: "30-60 min", count: 18 },
  { range: "1-2 hrs", count: 12 },
  { range: "2+ hrs", count: 8 },
];

// Success by category
const SUCCESS_BY_CATEGORY = [
  { category: "Plumbing", rate: 92 },
  { category: "HVAC", rate: 78 },
  { category: "Electrical", rate: 65 },
  { category: "Mechanical", rate: 88 },
  { category: "Cosmetic", rate: 96 },
];

export function LedgerTimelineDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const savingsChartRef = useRef<SVGSVGElement>(null);
  const pieChartRef = useRef<SVGSVGElement>(null);
  const categoryChartRef = useRef<SVGSVGElement>(null);
  const timeChartRef = useRef<SVGSVGElement>(null);
  const successChartRef = useRef<SVGSVGElement>(null);
  const heatmapRef = useRef<SVGSVGElement>(null);
  const entriesRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const totals = LEDGER_DATA.reduce(
    (acc, entry) => ({
      saved: acc.saved + entry.saved,
      count: acc.count + 1,
      diyCount: acc.diyCount + (entry.decision === "diy" ? 1 : 0),
      successCount: acc.successCount + (entry.outcome === "success" ? 1 : 0),
    }),
    { saved: 0, count: 0, diyCount: 0, successCount: 0 }
  );


  // Animate entries appearing
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setVisibleCount(prev => {
        if (prev >= LEDGER_DATA.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Cumulative Savings Area Chart
  useEffect(() => {
    if (!savingsChartRef.current) return;

    const svg = d3.select(savingsChartRef.current);
    svg.selectAll("*").remove();

    const width = 240;
    const height = 100;
    const margin = { top: 10, right: 10, bottom: 20, left: 35 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    let cumulative = 0;
    const savingsData = LEDGER_DATA.slice().reverse().map((entry, i) => {
      cumulative += entry.saved;
      return { index: i, total: cumulative };
    });

    const xScale = d3.scaleLinear().domain([0, savingsData.length - 1]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, d3.max(savingsData, d => d.total) || 100]).range([innerHeight, 0]);

    // Gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient").attr("id", "savingsGrad").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#22c55e").attr("stop-opacity", 0.4);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#22c55e").attr("stop-opacity", 0);

    // Area
    const area = d3.area<{ index: number; total: number }>()
      .x(d => xScale(d.index))
      .y0(innerHeight)
      .y1(d => yScale(d.total))
      .curve(d3.curveMonotoneX);

    g.append("path").datum(savingsData).attr("fill", "url(#savingsGrad)").attr("d", area);

    // Line
    const line = d3.line<{ index: number; total: number }>()
      .x(d => xScale(d.index))
      .y(d => yScale(d.total))
      .curve(d3.curveMonotoneX);

    g.append("path").datum(savingsData).attr("fill", "none").attr("stroke", "#22c55e").attr("stroke-width", 2).attr("d", line);

    // Points
    g.selectAll(".point")
      .data(savingsData)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.index))
      .attr("cy", d => yScale(d.total))
      .attr("r", 3)
      .attr("fill", "#22c55e");

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(3).tickFormat(d => `$${d}`))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").remove())
      .call(g => g.selectAll(".tick text").attr("fill", "#737373").attr("font-size", 8));

  }, []);

  // Decision Pie Chart
  useEffect(() => {
    if (!pieChartRef.current) return;

    const svg = d3.select(pieChartRef.current);
    svg.selectAll("*").remove();

    const width = 120;
    const height = 120;
    const radius = 50;

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const decisionCounts = [
      { type: "DIY", count: totals.diyCount, color: "#22c55e" },
      { type: "Hired", count: LEDGER_DATA.filter(d => d.decision === "outsource").length, color: "#3b82f6" },
      { type: "Deferred", count: LEDGER_DATA.filter(d => d.decision === "defer").length, color: "#f59e0b" },
    ];

    const pie = d3.pie<typeof decisionCounts[0]>().value(d => d.count).sort(null);
    const arc = d3.arc<d3.PieArcDatum<typeof decisionCounts[0]>>().innerRadius(radius - 20).outerRadius(radius);

    g.selectAll(".arc")
      .data(pie(decisionCounts))
      .enter()
      .append("path")
      .attr("d", arc as unknown as string)
      .attr("fill", d => d.data.color);

    // Center text
    g.append("text").attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("fill", "#fff").attr("font-size", 16).attr("font-weight", 600).text(totals.count);
    g.append("text").attr("text-anchor", "middle").attr("y", 14).attr("fill", "#737373").attr("font-size", 8).text("total");

  }, [totals]);

  // Category Breakdown Bar Chart
  useEffect(() => {
    if (!categoryChartRef.current) return;

    const svg = d3.select(categoryChartRef.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 120;
    const margin = { top: 5, right: 40, bottom: 5, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yScale = d3.scaleBand().domain(CATEGORY_DATA.map(d => d.category)).range([0, innerHeight]).padding(0.3);
    const xScale = d3.scaleLinear().domain([0, d3.max(CATEGORY_DATA, d => d.count) || 50]).range([0, innerWidth]);

    // Labels
    g.selectAll(".label")
      .data(CATEGORY_DATA)
      .enter()
      .append("text")
      .attr("x", -5)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#a3a3a3")
      .attr("font-size", 8)
      .text(d => d.category);

    // Bars
    g.selectAll(".bar")
      .data(CATEGORY_DATA)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.category) || 0)
      .attr("width", d => xScale(d.count))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#3b82f6")
      .attr("rx", 2);

    // Count labels
    g.selectAll(".count")
      .data(CATEGORY_DATA)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.count) + 4)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#e5e5e5")
      .attr("font-size", 9)
      .text(d => d.count);

  }, []);

  // Time Distribution
  useEffect(() => {
    if (!timeChartRef.current) return;

    const svg = d3.select(timeChartRef.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 100;
    const margin = { top: 10, right: 10, bottom: 25, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand().domain(TIME_DISTRIBUTION.map(d => d.range)).range([0, innerWidth]).padding(0.2);
    const yScale = d3.scaleLinear().domain([0, d3.max(TIME_DISTRIBUTION, d => d.count) || 40]).range([innerHeight, 0]);

    // Bars
    g.selectAll(".bar")
      .data(TIME_DISTRIBUTION)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.range) || 0)
      .attr("y", d => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.count))
      .attr("fill", "#8b5cf6")
      .attr("rx", 2);

    // X axis labels
    g.selectAll(".x-label")
      .data(TIME_DISTRIBUTION)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d.range) || 0) + xScale.bandwidth() / 2)
      .attr("y", innerHeight + 12)
      .attr("text-anchor", "middle")
      .attr("fill", "#737373")
      .attr("font-size", 7)
      .text(d => d.range);

  }, []);

  // Success Rate by Category
  useEffect(() => {
    if (!successChartRef.current) return;

    const svg = d3.select(successChartRef.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 120;
    const margin = { top: 5, right: 30, bottom: 5, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yScale = d3.scaleBand().domain(SUCCESS_BY_CATEGORY.map(d => d.category)).range([0, innerHeight]).padding(0.3);
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

    // Background bars
    g.selectAll(".bg-bar")
      .data(SUCCESS_BY_CATEGORY)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.category) || 0)
      .attr("width", innerWidth)
      .attr("height", yScale.bandwidth())
      .attr("fill", "#262626")
      .attr("rx", 2);

    // Labels
    g.selectAll(".label")
      .data(SUCCESS_BY_CATEGORY)
      .enter()
      .append("text")
      .attr("x", -5)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#a3a3a3")
      .attr("font-size", 8)
      .text(d => d.category);

    // Success bars
    g.selectAll(".bar")
      .data(SUCCESS_BY_CATEGORY)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.category) || 0)
      .attr("width", d => xScale(d.rate))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => d.rate >= 90 ? "#22c55e" : d.rate >= 75 ? "#f59e0b" : "#ef4444")
      .attr("rx", 2);

    // Rate labels
    g.selectAll(".rate")
      .data(SUCCESS_BY_CATEGORY)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.rate) + 4)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#e5e5e5")
      .attr("font-size", 9)
      .text(d => `${d.rate}%`);

  }, []);

  // Activity Heatmap (Calendar style)
  useEffect(() => {
    if (!heatmapRef.current) return;

    const svg = d3.select(heatmapRef.current);
    svg.selectAll("*").remove();

    const width = 220;
    const height = 60;
    const cellSize = 12;
    const cols = 10;

    const g = svg.append("g").attr("transform", "translate(5, 5)");

    const colorScale = d3.scaleLinear<string>()
      .domain([0, 1, 2, 3])
      .range(["#1a1a1a", "#22c55e33", "#22c55e66", "#22c55e"]);

    g.selectAll(".cell")
      .data(MONTHLY_ACTIVITY)
      .enter()
      .append("rect")
      .attr("x", (d, i) => (i % cols) * (cellSize + 2))
      .attr("y", (d, i) => Math.floor(i / cols) * (cellSize + 2))
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", d => colorScale(d.count))
      .attr("rx", 2);

  }, []);

  // Animate entries with GSAP
  useEffect(() => {
    if (!entriesRef.current) return;
    const entries = entriesRef.current.querySelectorAll(".ledger-entry");
    entries.forEach((entry, i) => {
      if (i < visibleCount) {
        gsap.to(entry, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" });
      }
    });
  }, [visibleCount]);


  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-neutral-950 via-emerald-950/15 to-black">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Every Decision. <span className="text-emerald-400">Logged Forever.</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Track what you&apos;ve done. See your savings compound. Next time it happens, you&apos;ll know exactly what worked.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - Stats Cards & Small Charts */}
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-900/60 rounded-xl p-3 border border-neutral-800">
                <div className="text-2xl font-mono font-bold text-emerald-400">${totals.saved}</div>
                <div className="text-[10px] text-neutral-500">Total Saved</div>
              </div>
              <div className="bg-neutral-900/60 rounded-xl p-3 border border-neutral-800">
                <div className="text-2xl font-mono font-bold text-white">{totals.count}</div>
                <div className="text-[10px] text-neutral-500">Decisions</div>
              </div>
              <div className="bg-neutral-900/60 rounded-xl p-3 border border-neutral-800">
                <div className="text-2xl font-mono font-bold text-blue-400">{Math.round((totals.successCount / totals.count) * 100)}%</div>
                <div className="text-[10px] text-neutral-500">Success</div>
              </div>
              <div className="bg-neutral-900/60 rounded-xl p-3 border border-neutral-800">
                <div className="text-2xl font-mono font-bold text-emerald-400">{Math.round((totals.diyCount / totals.count) * 100)}%</div>
                <div className="text-[10px] text-neutral-500">DIY Rate</div>
              </div>
            </div>

            {/* Decision Pie */}
            <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800">
              <h4 className="text-xs font-medium text-neutral-300 mb-2">Decision Types</h4>
              <svg ref={pieChartRef} viewBox="0 0 120 120" className="w-full max-w-[120px] mx-auto" />
              <div className="flex justify-center gap-3 mt-2">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-green-500" /><span className="text-[9px] text-neutral-500">DIY</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue-500" /><span className="text-[9px] text-neutral-500">Hired</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-amber-500" /><span className="text-[9px] text-neutral-500">Defer</span></div>
              </div>
            </div>

            {/* Activity Heatmap */}
            <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800">
              <h4 className="text-xs font-medium text-neutral-300 mb-2">This Month&apos;s Activity</h4>
              <svg ref={heatmapRef} viewBox="0 0 220 60" className="w-full" />
            </div>
          </div>

          {/* Middle-Left - Timeline */}
          <div ref={containerRef} className="lg:col-span-1">
            <div className="bg-neutral-900/80 rounded-xl border border-neutral-800 p-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-800">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-sm font-medium text-white">Decision Hub</span>
                <span className="text-xs text-neutral-500 ml-auto">{LEDGER_DATA.length} entries</span>
              </div>

              <div ref={entriesRef} className="space-y-2 max-h-[400px] overflow-y-auto">
                {LEDGER_DATA.map((entry, index) => {
                  const isSelected = selectedEntry?.id === entry.id;
                  const decisionColor = DECISION_COLORS[entry.decision];
                  const outcomeConfig = OUTCOME_CONFIG[entry.outcome];

                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntry(isSelected ? null : entry)}
                      className={`ledger-entry relative pl-6 pr-3 py-3 rounded-lg cursor-pointer transition-all duration-200
                        ${isSelected ? "bg-neutral-800/80" : "bg-neutral-900/40 hover:bg-neutral-900/70"}`}
                      style={{ opacity: 0, transform: "translateX(-10px)" }}
                    >
                      <div className="absolute left-1.5 top-4 w-3 h-3 rounded-full border-2 bg-black" style={{ borderColor: decisionColor }} />
                      {index < LEDGER_DATA.length - 1 && (
                        <div className="absolute left-[11px] top-7 w-px h-[calc(100%-8px)] bg-neutral-800" />
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm text-white font-medium truncate">{entry.issue}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">{entry.date}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: `${decisionColor}20`, color: decisionColor }}>
                            {entry.decision.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-neutral-700 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Time</span>
                            <span className="text-neutral-300">{entry.timeSpent}</span>
                          </div>
                          {entry.saved > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-500">Saved</span>
                              <span className="text-emerald-400 font-mono font-semibold">${entry.saved}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Middle-Right - More Charts */}
          <div className="space-y-4">
            {/* Savings Over Time */}
            <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-neutral-300">Cumulative Savings</h4>
                <span className="text-xs font-mono text-emerald-400">+${totals.saved}</span>
              </div>
              <svg ref={savingsChartRef} viewBox="0 0 240 100" className="w-full" />
            </div>

            {/* Category Breakdown */}
            <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800">
              <h4 className="text-xs font-medium text-neutral-300 mb-2">Issues by Category</h4>
              <svg ref={categoryChartRef} viewBox="0 0 200 120" className="w-full" />
            </div>

            {/* Time Distribution */}
            <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800">
              <h4 className="text-xs font-medium text-neutral-300 mb-2">Time Spent Distribution</h4>
              <svg ref={timeChartRef} viewBox="0 0 200 100" className="w-full" />
            </div>
          </div>

          {/* Right Column - Success Rates */}
          <div className="space-y-4">
            {/* Success by Category */}
            <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800">
              <h4 className="text-xs font-medium text-neutral-300 mb-2">DIY Success by Category</h4>
              <svg ref={successChartRef} viewBox="0 0 200 120" className="w-full" />
            </div>

            {/* Key Insights */}
            <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800">
              <h4 className="text-xs font-medium text-neutral-300 mb-3">Your Patterns</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Most common</span>
                  <span className="text-xs text-white">Plumbing</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Best success</span>
                  <span className="text-xs text-emerald-400">Cosmetic (96%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Avg time</span>
                  <span className="text-xs text-white">23 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Avg savings</span>
                  <span className="text-xs text-emerald-400">$67/decision</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800">
              <h4 className="text-xs font-medium text-neutral-300 mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-emerald-400">4</div>
                  <div className="text-[9px] text-neutral-500">This week</div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-blue-400">12</div>
                  <div className="text-[9px] text-neutral-500">This month</div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-amber-400">2</div>
                  <div className="text-[9px] text-neutral-500">Pending</div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-purple-400">8.5h</div>
                  <div className="text-[9px] text-neutral-500">Time saved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

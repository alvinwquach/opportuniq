"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as d3 from "d3";
import { IoTrendingUp, IoCalendar, IoCash, IoLocate } from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Savings Timeline
 *
 * Animated area chart showing cumulative savings over time
 * with milestone markers and interactive tooltips.
 */

interface SavingsDataPoint {
  month: number;
  monthLabel: string;
  savings: number;
  cumulativeSavings: number;
  decisions: number;
  milestone?: string;
}

// Generate sample savings data over 12 months
const generateSavingsData = (): SavingsDataPoint[] => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const monthlyDecisions = [3, 4, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8];
  const avgSavingsPerDecision = 85;

  let cumulative = 0;
  return months.map((label, i) => {
    const decisions = monthlyDecisions[i];
    const savings = decisions * avgSavingsPerDecision + Math.floor(Math.random() * 100);
    cumulative += savings;

    let milestone: string | undefined;
    if (cumulative >= 500 && cumulative - savings < 500) milestone = "$500 Saved!";
    else if (cumulative >= 1500 && cumulative - savings < 1500) milestone = "$1,500 Saved!";
    else if (cumulative >= 3000 && cumulative - savings < 3000) milestone = "$3,000 Saved!";
    else if (cumulative >= 5000 && cumulative - savings < 5000) milestone = "$5,000 Milestone!";

    return {
      month: i,
      monthLabel: label,
      savings,
      cumulativeSavings: cumulative,
      decisions,
      milestone,
    };
  });
};

export function SavingsTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const [data] = useState<SavingsDataPoint[]>(() => generateSavingsData());
  const [hoveredPoint, setHoveredPoint] = useState<SavingsDataPoint | null>(null);
  const [animated, setAnimated] = useState(false);

  const totalSavings = data[data.length - 1].cumulativeSavings;
  const totalDecisions = data.reduce((acc, d) => acc + d.decisions, 0);


  const drawChart = useCallback(() => {
    if (!chartRef.current) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();

    const width = 500;
    const height = 280;
    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, totalSavings * 1.1])
      .range([innerHeight, 0]);

    // Grid lines
    const yTicks = yScale.ticks(5);
    g.selectAll(".grid-line")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#1f2937")
      .attr("stroke-dasharray", "4,4");

    // Area generator
    const area = d3.area<SavingsDataPoint>()
      .x(d => xScale(d.month))
      .y0(innerHeight)
      .y1(d => yScale(d.cumulativeSavings))
      .curve(d3.curveMonotoneX);

    // Line generator
    const line = d3.line<SavingsDataPoint>()
      .x(d => xScale(d.month))
      .y(d => yScale(d.cumulativeSavings))
      .curve(d3.curveMonotoneX);

    // Gradient definition
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "savings-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#22c55e")
      .attr("stop-opacity", 0.4);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#22c55e")
      .attr("stop-opacity", 0.05);

    // Clip path for animation
    const clipPath = svg.append("defs")
      .append("clipPath")
      .attr("id", "chart-clip");

    clipPath.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 0)
      .attr("height", height);

    // Area path
    g.append("path")
      .datum(data)
      .attr("fill", "url(#savings-gradient)")
      .attr("d", area)
      .attr("clip-path", "url(#chart-clip)");

    // Line path
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 3)
      .attr("d", line)
      .attr("clip-path", "url(#chart-clip)");

    // Data points
    const points = g.selectAll(".data-point")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "data-point")
      .attr("transform", d => `translate(${xScale(d.month)}, ${yScale(d.cumulativeSavings)})`)
      .style("cursor", "pointer")
      .attr("clip-path", "url(#chart-clip)");

    points.append("circle")
      .attr("r", d => d.milestone ? 8 : 5)
      .attr("fill", d => d.milestone ? "#fbbf24" : "#22c55e")
      .attr("stroke", "#000")
      .attr("stroke-width", 2);

    // Milestone labels
    points.filter(d => !!d.milestone)
      .append("text")
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("fill", "#fbbf24")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(d => d.milestone || "");

    // X-axis labels
    g.selectAll(".x-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "x-label")
      .attr("x", d => xScale(d.month))
      .attr("y", innerHeight + 25)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .attr("font-size", "11px")
      .text(d => d.monthLabel);

    // Y-axis labels
    g.selectAll(".y-label")
      .data(yTicks)
      .enter()
      .append("text")
      .attr("class", "y-label")
      .attr("x", -10)
      .attr("y", d => yScale(d))
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#6b7280")
      .attr("font-size", "11px")
      .text(d => `$${d.toLocaleString()}`);

    // Hover interaction
    points
      .on("mouseenter", (event, d) => {
        setHoveredPoint(d);
        d3.select(event.currentTarget).select("circle")
          .transition()
          .duration(150)
          .attr("r", d.milestone ? 12 : 8);
      })
      .on("mouseleave", (event, d) => {
        setHoveredPoint(null);
        d3.select(event.currentTarget).select("circle")
          .transition()
          .duration(150)
          .attr("r", d.milestone ? 8 : 5);
      });

    // Animation
    if (sectionRef.current && !animated) {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        onEnter: () => {
          setAnimated(true);
          clipPath.select("rect")
            .transition()
            .duration(1500)
            .ease(d3.easeQuadOut)
            .attr("width", width);
        },
      });
    } else if (animated) {
      clipPath.select("rect").attr("width", width);
    }
  }, [data, totalSavings, animated]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);


  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-black overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #22c55e 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-6">
            <IoTrendingUp className="w-4 h-4" />
            Cumulative Savings
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
            Watch Your Savings{" "}
            <span className="text-emerald-400">Compound</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-400">
            Every smart decision adds up. See how small wins create big results over time.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-xl mx-auto">
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 text-center">
            <IoCash className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">${totalSavings.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total Saved</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 text-center">
            <IoLocate className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalDecisions}</div>
            <div className="text-xs text-gray-500">Decisions Made</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 text-center">
            <IoCalendar className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">12</div>
            <div className="text-xs text-gray-500">Months Tracked</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 lg:p-8 relative">
          <svg ref={chartRef} className="w-full" />

          {/* Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-4 right-4 bg-gray-800 border border-gray-700 rounded-xl p-4 min-w-[180px] shadow-xl">
              <div className="text-sm font-semibold text-white mb-2">{hoveredPoint.monthLabel}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly Savings</span>
                  <span className="text-emerald-400 font-medium">${hoveredPoint.savings}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Cumulative</span>
                  <span className="text-white font-medium">${hoveredPoint.cumulativeSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Decisions</span>
                  <span className="text-blue-400 font-medium">{hoveredPoint.decisions}</span>
                </div>
              </div>
              {hoveredPoint.milestone && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <span className="text-amber-400 text-xs font-semibold">{hoveredPoint.milestone}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom insight */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Average savings: <span className="text-white font-medium">${Math.round(totalSavings / 12)}/month</span>
            {" "}across <span className="text-white font-medium">{Math.round(totalDecisions / 12)} decisions/month</span>
          </p>
        </div>
      </div>
    </section>
  );
}

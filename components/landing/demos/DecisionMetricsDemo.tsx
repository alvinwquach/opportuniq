"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

/**
 * Decision Metrics Demo
 *
 * Static charts (no animation) showing:
 * - DIY Success Rate by Category
 * - Issue Types Distribution
 * - Savings Distribution
 * - Time Saved Analysis
 * - Risk Assessment Breakdown
 * - Monthly Trends
 */

const SUCCESS_BY_CATEGORY = [
  { category: "Minor Repairs", successRate: 94 },
  { category: "Maintenance", successRate: 91 },
  { category: "Build Projects", successRate: 85 },
  { category: "Installations", successRate: 78 },
  { category: "Cosmetic", successRate: 96 },
];

const ISSUE_TYPES = [
  { type: "Plumbing", count: 89 },
  { type: "Electrical", count: 45 },
  { type: "HVAC", count: 34 },
  { type: "Structural", count: 28 },
  { type: "Auto", count: 67 },
  { type: "Outdoor", count: 52 },
];

const SAVINGS_DISTRIBUTION = [
  { range: "$0-50", count: 45 },
  { range: "$51-150", count: 78 },
  { range: "$151-300", count: 56 },
  { range: "$301-500", count: 34 },
  { range: "$500+", count: 23 },
];

const TIME_SAVED = [
  { task: "Research", hours: 4.2 },
  { task: "Quotes", hours: 3.8 },
  { task: "Decisions", hours: 2.1 },
  { task: "Mistakes", hours: 5.5 },
];

const RISK_BREAKDOWN = [
  { level: "Low Risk", count: 156, color: "#22c55e" },
  { level: "Medium", count: 67, color: "#f59e0b" },
  { level: "High Risk", count: 23, color: "#ef4444" },
];

const MONTHLY_TRENDS = [
  { month: "Jul", decisions: 12, savings: 340 },
  { month: "Aug", decisions: 18, savings: 520 },
  { month: "Sep", decisions: 15, savings: 410 },
  { month: "Oct", decisions: 22, savings: 680 },
  { month: "Nov", decisions: 19, savings: 540 },
  { month: "Dec", decisions: 25, savings: 820 },
];

export function DecisionMetricsDemo() {
  const successChartRef = useRef<SVGSVGElement>(null);
  const issueChartRef = useRef<SVGSVGElement>(null);
  const savingsChartRef = useRef<SVGSVGElement>(null);
  const timeChartRef = useRef<SVGSVGElement>(null);
  const riskChartRef = useRef<SVGSVGElement>(null);
  const trendsChartRef = useRef<SVGSVGElement>(null);


  // Success Rate - Horizontal bars (static)
  useEffect(() => {
    if (!successChartRef.current) return;

    const svg = d3.select(successChartRef.current);
    svg.selectAll("*").remove();

    const width = 260;
    const height = 140;
    const margin = { top: 5, right: 35, bottom: 5, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yScale = d3.scaleBand()
      .domain(SUCCESS_BY_CATEGORY.map(d => d.category))
      .range([0, innerHeight])
      .padding(0.3);

    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

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
      .attr("x", -6)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#a3a3a3")
      .attr("font-size", 9)
      .text(d => d.category);

    // Success bars
    g.selectAll(".bar")
      .data(SUCCESS_BY_CATEGORY)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.category) || 0)
      .attr("width", d => xScale(d.successRate))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => d.successRate >= 90 ? "#22c55e" : d.successRate >= 80 ? "#f59e0b" : "#ef4444")
      .attr("rx", 2);

    // Percentage labels
    g.selectAll(".pct")
      .data(SUCCESS_BY_CATEGORY)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.successRate) + 4)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#e5e5e5")
      .attr("font-size", 9)
      .attr("font-weight", 500)
      .text(d => `${d.successRate}%`);

  }, []);

  // Issue Types - Simple bar chart
  useEffect(() => {
    if (!issueChartRef.current) return;

    const svg = d3.select(issueChartRef.current);
    svg.selectAll("*").remove();

    const width = 260;
    const height = 140;
    const margin = { top: 10, right: 10, bottom: 25, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(ISSUE_TYPES.map(d => d.type))
      .range([0, innerWidth])
      .padding(0.25);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(ISSUE_TYPES, d => d.count) || 100])
      .range([innerHeight, 0]);

    // Bars
    g.selectAll(".bar")
      .data(ISSUE_TYPES)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.type) || 0)
      .attr("y", d => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.count))
      .attr("fill", "#3b82f6")
      .attr("rx", 2);

    // Value labels on top
    g.selectAll(".value")
      .data(ISSUE_TYPES)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d.type) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.count) - 4)
      .attr("text-anchor", "middle")
      .attr("fill", "#a3a3a3")
      .attr("font-size", 8)
      .text(d => d.count);

    // X axis labels
    g.selectAll(".x-label")
      .data(ISSUE_TYPES)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d.type) || 0) + xScale.bandwidth() / 2)
      .attr("y", innerHeight + 14)
      .attr("text-anchor", "middle")
      .attr("fill", "#737373")
      .attr("font-size", 8)
      .text(d => d.type);

  }, []);

  // Savings Distribution - Bar chart
  useEffect(() => {
    if (!savingsChartRef.current) return;

    const svg = d3.select(savingsChartRef.current);
    svg.selectAll("*").remove();

    const width = 260;
    const height = 140;
    const margin = { top: 10, right: 10, bottom: 25, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(SAVINGS_DISTRIBUTION.map(d => d.range))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(SAVINGS_DISTRIBUTION, d => d.count) || 100])
      .range([innerHeight, 0]);

    // Bars
    g.selectAll(".bar")
      .data(SAVINGS_DISTRIBUTION)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.range) || 0)
      .attr("y", d => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.count))
      .attr("fill", "#22c55e")
      .attr("rx", 2);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(4).tickSize(-innerWidth))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#262626"))
      .call(g => g.selectAll(".tick text").attr("fill", "#737373").attr("font-size", 8));

    // X axis labels
    g.selectAll(".x-label")
      .data(SAVINGS_DISTRIBUTION)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d.range) || 0) + xScale.bandwidth() / 2)
      .attr("y", innerHeight + 14)
      .attr("text-anchor", "middle")
      .attr("fill", "#737373")
      .attr("font-size", 7)
      .text(d => d.range);

  }, []);

  // Time Saved - Horizontal bars
  useEffect(() => {
    if (!timeChartRef.current) return;

    const svg = d3.select(timeChartRef.current);
    svg.selectAll("*").remove();

    const width = 260;
    const height = 120;
    const margin = { top: 5, right: 40, bottom: 5, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yScale = d3.scaleBand()
      .domain(TIME_SAVED.map(d => d.task))
      .range([0, innerHeight])
      .padding(0.35);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(TIME_SAVED, d => d.hours) || 10])
      .range([0, innerWidth]);

    // Labels
    g.selectAll(".label")
      .data(TIME_SAVED)
      .enter()
      .append("text")
      .attr("x", -6)
      .attr("y", d => (yScale(d.task) || 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#a3a3a3")
      .attr("font-size", 9)
      .text(d => d.task);

    // Bars
    g.selectAll(".bar")
      .data(TIME_SAVED)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.task) || 0)
      .attr("width", d => xScale(d.hours))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#8b5cf6")
      .attr("rx", 2);

    // Hour labels
    g.selectAll(".hours")
      .data(TIME_SAVED)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.hours) + 4)
      .attr("y", d => (yScale(d.task) || 0) + yScale.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#e5e5e5")
      .attr("font-size", 9)
      .text(d => `${d.hours}h`);

  }, []);

  // Risk Breakdown - Donut chart
  useEffect(() => {
    if (!riskChartRef.current) return;

    const svg = d3.select(riskChartRef.current);
    svg.selectAll("*").remove();

    const width = 140;
    const height = 140;
    const radius = 55;

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<typeof RISK_BREAKDOWN[0]>()
      .value(d => d.count)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<typeof RISK_BREAKDOWN[0]>>()
      .innerRadius(radius - 18)
      .outerRadius(radius);

    g.selectAll(".arc")
      .data(pie(RISK_BREAKDOWN))
      .enter()
      .append("path")
      .attr("d", arc as string)
      .attr("fill", d => d.data.color);

    // Center text
    const total = RISK_BREAKDOWN.reduce((sum, d) => sum + d.count, 0);
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff")
      .attr("font-size", 18)
      .attr("font-weight", 600)
      .text(total);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 14)
      .attr("fill", "#737373")
      .attr("font-size", 8)
      .text("assessments");

  }, []);

  // Monthly Trends - Line + Bar combo
  useEffect(() => {
    if (!trendsChartRef.current) return;

    const svg = d3.select(trendsChartRef.current);
    svg.selectAll("*").remove();

    const width = 280;
    const height = 140;
    const margin = { top: 15, right: 35, bottom: 25, left: 35 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(MONTHLY_TRENDS.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.3);

    const yScaleDecisions = d3.scaleLinear()
      .domain([0, d3.max(MONTHLY_TRENDS, d => d.decisions) || 30])
      .range([innerHeight, 0]);

    const yScaleSavings = d3.scaleLinear()
      .domain([0, d3.max(MONTHLY_TRENDS, d => d.savings) || 1000])
      .range([innerHeight, 0]);

    // Decision bars
    g.selectAll(".bar")
      .data(MONTHLY_TRENDS)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.month) || 0)
      .attr("y", d => yScaleDecisions(d.decisions))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScaleDecisions(d.decisions))
      .attr("fill", "#3b82f6")
      .attr("opacity", 0.6)
      .attr("rx", 2);

    // Savings line
    const line = d3.line<typeof MONTHLY_TRENDS[0]>()
      .x(d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .y(d => yScaleSavings(d.savings))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(MONTHLY_TRENDS)
      .attr("fill", "none")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Savings points
    g.selectAll(".point")
      .data(MONTHLY_TRENDS)
      .enter()
      .append("circle")
      .attr("cx", d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr("cy", d => yScaleSavings(d.savings))
      .attr("r", 3)
      .attr("fill", "#22c55e");

    // X axis
    g.selectAll(".x-label")
      .data(MONTHLY_TRENDS)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr("y", innerHeight + 14)
      .attr("text-anchor", "middle")
      .attr("fill", "#737373")
      .attr("font-size", 8)
      .text(d => d.month);

    // Left Y axis (decisions)
    g.append("g")
      .call(d3.axisLeft(yScaleDecisions).ticks(4))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#262626"))
      .call(g => g.selectAll(".tick text").attr("fill", "#3b82f6").attr("font-size", 8));

    // Right Y axis (savings)
    g.append("g")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(yScaleSavings).ticks(4).tickFormat(d => `$${d}`))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").remove())
      .call(g => g.selectAll(".tick text").attr("fill", "#22c55e").attr("font-size", 8));

  }, []);


  return (
    <section className="relative py-16 lg:py-20 bg-gradient-to-b from-black via-blue-950/10 to-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
            The Numbers Don&apos;t Lie
          </h2>
          <p className="text-sm text-neutral-400 max-w-lg mx-auto">
            Real insights from real decisions. See what works.
          </p>
        </div>

        {/* Charts Grid - 3 columns */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* DIY Success Rate */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <h3 className="text-xs font-medium text-neutral-300 mb-1">DIY Success Rate</h3>
            <p className="text-[10px] text-neutral-500 mb-3">by category</p>
            <svg ref={successChartRef} viewBox="0 0 260 140" className="w-full" />
          </div>

          {/* Issue Types */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <h3 className="text-xs font-medium text-neutral-300 mb-1">Issues Analyzed</h3>
            <p className="text-[10px] text-neutral-500 mb-3">by type</p>
            <svg ref={issueChartRef} viewBox="0 0 260 140" className="w-full" />
          </div>

          {/* Savings Distribution */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <h3 className="text-xs font-medium text-neutral-300 mb-1">Savings Per Decision</h3>
            <p className="text-[10px] text-neutral-500 mb-3">distribution</p>
            <svg ref={savingsChartRef} viewBox="0 0 260 140" className="w-full" />
          </div>

          {/* Time Saved */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <h3 className="text-xs font-medium text-neutral-300 mb-1">Time Saved</h3>
            <p className="text-[10px] text-neutral-500 mb-3">hours per decision</p>
            <svg ref={timeChartRef} viewBox="0 0 260 120" className="w-full" />
            <div className="text-center mt-2">
              <span className="text-lg font-semibold text-purple-400">15.6h</span>
              <span className="text-[10px] text-neutral-500 ml-1">avg. saved</span>
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <h3 className="text-xs font-medium text-neutral-300 mb-1">Risk Assessment</h3>
            <p className="text-[10px] text-neutral-500 mb-3">breakdown</p>
            <div className="flex items-center justify-center gap-4">
              <svg ref={riskChartRef} viewBox="0 0 140 140" className="w-28 h-28" />
              <div className="space-y-2">
                {RISK_BREAKDOWN.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] text-neutral-400">{item.level}</span>
                    <span className="text-[10px] font-medium text-neutral-300">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <h3 className="text-xs font-medium text-neutral-300 mb-1">Monthly Trends</h3>
            <p className="text-[10px] text-neutral-500 mb-3">decisions & savings</p>
            <svg ref={trendsChartRef} viewBox="0 0 280 140" className="w-full" />
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-blue-500 opacity-60" />
                <span className="text-[10px] text-neutral-500">Decisions</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] text-neutral-500">Savings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

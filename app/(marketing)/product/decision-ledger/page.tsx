"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { IoBook } from "react-icons/io5";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import {
  LightSection,
  ChartContainer,
  ContentCard,
  SectionHeader,
  ThemeToggle,
  DARK_CHART_COLORS,
} from "@/components/ui/hybrid-layout";

/**
 * Decision Ledger Feature Page
 *
 * Permanent history of all decisions with outcome tracking
 * Hybrid layout: light mode for text, dark containers for charts
 */

// Decision history data
const DECISION_HISTORY = [
  { date: "2024-06-15", category: "Plumbing", decision: "DIY", outcome: "Success", saved: 220, time: 2.5 },
  { date: "2024-06-08", category: "Electrical", decision: "Pro", outcome: "Success", saved: 0, time: 0 },
  { date: "2024-05-28", category: "HVAC", decision: "DIY", outcome: "Success", saved: 380, time: 4 },
  { date: "2024-05-15", category: "Appliance", decision: "DIY", outcome: "Partial", saved: 120, time: 3 },
  { date: "2024-05-01", category: "Outdoor", decision: "DIY", outcome: "Success", saved: 180, time: 2 },
  { date: "2024-04-20", category: "Plumbing", decision: "Defer", outcome: "Pending", saved: 0, time: 0 },
];

// Monthly decisions trend
const DECISIONS_TREND = [
  { month: "Jan", total: 5, successful: 4 },
  { month: "Feb", total: 7, successful: 6 },
  { month: "Mar", total: 4, successful: 4 },
  { month: "Apr", total: 8, successful: 7 },
  { month: "May", total: 6, successful: 5 },
  { month: "Jun", total: 9, successful: 8 },
];

// Outcome distribution
const OUTCOME_DISTRIBUTION = [
  { outcome: "Success", count: 28, percentage: 72 },
  { outcome: "Partial", count: 7, percentage: 18 },
  { outcome: "Failed", count: 2, percentage: 5 },
  { outcome: "Pending", count: 2, percentage: 5 },
];

// Category performance
const CATEGORY_PERFORMANCE = [
  { category: "Plumbing", success: 85, attempts: 12 },
  { category: "Electrical", success: 70, attempts: 8 },
  { category: "HVAC", success: 90, attempts: 5 },
  { category: "Appliance", success: 95, attempts: 10 },
  { category: "Outdoor", success: 88, attempts: 9 },
];

// Decision timeline data
const DECISION_TIMELINE = [
  { week: 1, diy: 3, pro: 1, defer: 1 },
  { week: 2, diy: 4, pro: 2, defer: 0 },
  { week: 3, diy: 2, pro: 1, defer: 2 },
  { week: 4, diy: 5, pro: 0, defer: 1 },
  { week: 5, diy: 3, pro: 2, defer: 0 },
  { week: 6, diy: 4, pro: 1, defer: 1 },
  { week: 7, diy: 2, pro: 3, defer: 0 },
  { week: 8, diy: 5, pro: 1, defer: 1 },
];

// Monthly activity calendar
const MONTHLY_ACTIVITY = [
  { day: 1, count: 2 }, { day: 2, count: 0 }, { day: 3, count: 1 },
  { day: 4, count: 0 }, { day: 5, count: 3 }, { day: 6, count: 1 },
  { day: 7, count: 0 }, { day: 8, count: 2 }, { day: 9, count: 1 },
  { day: 10, count: 0 }, { day: 11, count: 4 }, { day: 12, count: 2 },
  { day: 13, count: 0 }, { day: 14, count: 1 }, { day: 15, count: 3 },
  { day: 16, count: 0 }, { day: 17, count: 2 }, { day: 18, count: 1 },
  { day: 19, count: 0 }, { day: 20, count: 0 }, { day: 21, count: 5 },
  { day: 22, count: 1 }, { day: 23, count: 0 }, { day: 24, count: 2 },
  { day: 25, count: 0 }, { day: 26, count: 3 }, { day: 27, count: 1 },
  { day: 28, count: 0 }, { day: 29, count: 2 }, { day: 30, count: 4 },
];

// Cost vs outcome scatter data
const COST_OUTCOME = [
  { cost: 50, success: true, category: "Plumbing" },
  { cost: 120, success: true, category: "Electrical" },
  { cost: 200, success: false, category: "HVAC" },
  { cost: 80, success: true, category: "Appliance" },
  { cost: 150, success: true, category: "Outdoor" },
  { cost: 300, success: true, category: "Plumbing" },
  { cost: 180, success: false, category: "Electrical" },
  { cost: 90, success: true, category: "HVAC" },
  { cost: 220, success: true, category: "Appliance" },
  { cost: 60, success: true, category: "Outdoor" },
];

// Weekly streak data
const STREAK_DATA = [
  { week: "W1", streak: 3 },
  { week: "W2", streak: 5 },
  { week: "W3", streak: 4 },
  { week: "W4", streak: 7 },
  { week: "W5", streak: 6 },
  { week: "W6", streak: 8 },
];

const FEATURES = [
  {
    title: "Automatic Logging",
    description: "Every decision is automatically recorded with context, reasoning, and expected outcomes.",
  },
  {
    title: "Outcome Tracking",
    description: "Follow up on decisions to record actual outcomes. Learn what worked and what didn't.",
  },
  {
    title: "Searchable History",
    description: "Find any past decision instantly. Filter by category, outcome, date, or cost.",
  },
  {
    title: "Pattern Recognition",
    description: "Smart analysis identifies patterns in your decisions to help improve future choices.",
  },
];

const RECENT_INSIGHTS = [
  { insight: "Your plumbing DIY success rate has improved 15% since January", type: "positive" },
  { insight: "Electrical tasks show higher success when done on weekends", type: "neutral" },
  { insight: "Consider hiring for HVAC - complexity often exceeds time estimates", type: "warning" },
];

export default function DecisionLedgerPage() {
  const { mode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const trendChartRef = useRef<SVGSVGElement>(null);
  const outcomeChartRef = useRef<SVGSVGElement>(null);
  const performanceChartRef = useRef<SVGSVGElement>(null);
  const timelineChartRef = useRef<SVGSVGElement>(null);
  const calendarRef = useRef<SVGSVGElement>(null);
  const scatterChartRef = useRef<SVGSVGElement>(null);
  const streakChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Decisions Trend Chart
  useEffect(() => {
    if (!trendChartRef.current || !mounted) return;

    const svg = d3.select(trendChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(DECISIONS_TREND.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.3);

    const yMax = d3.max(DECISIONS_TREND, d => d.total) as number;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    // Total bars (background)
    g.selectAll(".total-bar")
      .data(DECISIONS_TREND)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.month) || 0)
      .attr("y", d => yScale(d.total))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.total))
      .attr("fill", DARK_CHART_COLORS.grid)
      .attr("rx", 4);

    // Successful bars
    g.selectAll(".success-bar")
      .data(DECISIONS_TREND)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.month) || 0)
      .attr("y", d => yScale(d.successful))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.successful))
      .attr("fill", DARK_CHART_COLORS.green)
      .attr("rx", 4);

    // Success rate labels
    g.selectAll(".rate-label")
      .data(DECISIONS_TREND)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.total) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", DARK_CHART_COLORS.green)
      .attr("font-size", 10)
      .attr("font-weight", 600)
      .text(d => `${Math.round((d.successful / d.total) * 100)}%`);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Outcome Distribution Donut
  useEffect(() => {
    if (!outcomeChartRef.current || !mounted) return;

    const svg = d3.select(outcomeChartRef.current);
    svg.selectAll("*").remove();

    const width = 180;
    const height = 180;
    const radius = 70;

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const colors = [DARK_CHART_COLORS.green, DARK_CHART_COLORS.amber, DARK_CHART_COLORS.red, DARK_CHART_COLORS.textMuted];

    const pie = d3.pie<typeof OUTCOME_DISTRIBUTION[0]>()
      .value(d => d.count)
      .sort(null)
      .padAngle(0.03);

    const arc = d3.arc<d3.PieArcDatum<typeof OUTCOME_DISTRIBUTION[0]>>()
      .innerRadius(radius - 20)
      .outerRadius(radius);

    g.selectAll(".arc")
      .data(pie(OUTCOME_DISTRIBUTION))
      .enter()
      .append("path")
      .attr("d", arc as never)
      .attr("fill", (_, i) => colors[i]);

    // Center text
    const total = OUTCOME_DISTRIBUTION.reduce((sum, d) => sum + d.count, 0);
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 24)
      .attr("font-weight", 700)
      .attr("y", -6)
      .text(total);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 14)
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11)
      .text("Decisions");

  }, [mounted]);

  // Category Performance Chart
  useEffect(() => {
    if (!performanceChartRef.current || !mounted) return;

    const svg = d3.select(performanceChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 60, bottom: 20, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(CATEGORY_PERFORMANCE.map(d => d.category))
      .range([0, innerHeight])
      .padding(0.3);

    // Background bars
    g.selectAll(".bg-bar")
      .data(CATEGORY_PERFORMANCE)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.category) || 0)
      .attr("width", innerWidth)
      .attr("height", yScale.bandwidth())
      .attr("fill", DARK_CHART_COLORS.grid)
      .attr("rx", 4);

    // Success bars
    g.selectAll(".success-bar")
      .data(CATEGORY_PERFORMANCE)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.category) || 0)
      .attr("width", d => xScale(d.success))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => d.success >= 90 ? DARK_CHART_COLORS.green : d.success >= 80 ? DARK_CHART_COLORS.blue : DARK_CHART_COLORS.amber)
      .attr("rx", 4);

    // Percentage labels
    g.selectAll(".percent-label")
      .data(CATEGORY_PERFORMANCE)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.success) + 8)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 11)
      .attr("font-weight", 600)
      .text(d => `${d.success}%`);

    // Attempt count
    g.selectAll(".attempt-label")
      .data(CATEGORY_PERFORMANCE)
      .enter()
      .append("text")
      .attr("x", innerWidth + 10)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10)
      .text(d => `(${d.attempts})`);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", "transparent");

  }, [mounted]);

  // Decision Timeline Stacked Area
  useEffect(() => {
    if (!timelineChartRef.current || !mounted) return;

    const svg = d3.select(timelineChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 180;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const keys = ["diy", "pro", "defer"] as const;
    const colors = [DARK_CHART_COLORS.green, DARK_CHART_COLORS.blue, DARK_CHART_COLORS.amber];

    const xScale = d3.scaleLinear()
      .domain([1, 8])
      .range([0, innerWidth]);

    const stack = d3.stack<typeof DECISION_TIMELINE[0]>()
      .keys(keys);

    const series = stack(DECISION_TIMELINE);

    const yMax = d3.max(series[series.length - 1], d => d[1]) || 10;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    const area = d3.area<d3.SeriesPoint<typeof DECISION_TIMELINE[0]>>()
      .x(d => xScale(d.data.week))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    series.forEach((s, i) => {
      g.append("path")
        .datum(s)
        .attr("d", area)
        .attr("fill", colors[i])
        .attr("fill-opacity", 0.85);
    });

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(d => `W${d}`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Activity Calendar
  useEffect(() => {
    if (!calendarRef.current || !mounted) return;

    const svg = d3.select(calendarRef.current);
    svg.selectAll("*").remove();

    const width = 350;
    const height = 120;
    const cellSize = 18;
    const cellPadding = 2;

    const g = svg.append("g").attr("transform", "translate(20, 25)");

    const colorScale = d3.scaleLinear<string>()
      .domain([0, 2, 5])
      .range([DARK_CHART_COLORS.grid, DARK_CHART_COLORS.blue, DARK_CHART_COLORS.green]);

    // Grid of days (5 rows x 6 cols = 30 days)
    MONTHLY_ACTIVITY.forEach((day, i) => {
      const row = Math.floor(i / 7);
      const col = i % 7;

      g.append("rect")
        .attr("x", col * (cellSize + cellPadding))
        .attr("y", row * (cellSize + cellPadding))
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("fill", colorScale(day.count))
        .attr("rx", 3);

      if (day.count > 0) {
        g.append("text")
          .attr("x", col * (cellSize + cellPadding) + cellSize / 2)
          .attr("y", row * (cellSize + cellPadding) + cellSize / 2 + 4)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .attr("font-size", 9)
          .attr("font-weight", 600)
          .text(day.count);
      }
    });

    // Day labels
    ["S", "M", "T", "W", "T", "F", "S"].forEach((d, i) => {
      g.append("text")
        .attr("x", i * (cellSize + cellPadding) + cellSize / 2)
        .attr("y", -8)
        .attr("text-anchor", "middle")
        .attr("fill", DARK_CHART_COLORS.textMuted)
        .attr("font-size", 9)
        .text(d);
    });

  }, [mounted]);

  // Cost vs Outcome Scatter
  useEffect(() => {
    if (!scatterChartRef.current || !mounted) return;

    const svg = d3.select(scatterChartRef.current);
    svg.selectAll("*").remove();

    const width = 350;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, 350])
      .range([0, innerWidth]);

    const categories = [...new Set(COST_OUTCOME.map(d => d.category))];
    const yScale = d3.scaleBand()
      .domain(categories)
      .range([0, innerHeight])
      .padding(0.3);

    // Grid lines
    g.selectAll(".grid")
      .data([100, 200, 300])
      .enter()
      .append("line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", DARK_CHART_COLORS.grid)
      .attr("stroke-dasharray", "2,2");

    // Points
    g.selectAll(".point")
      .data(COST_OUTCOME)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.cost))
      .attr("cy", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr("r", 8)
      .attr("fill", d => d.success ? DARK_CHART_COLORS.green : DARK_CHART_COLORS.red)
      .attr("fill-opacity", 0.85)
      .attr("stroke", d => d.success ? DARK_CHART_COLORS.green : DARK_CHART_COLORS.red)
      .attr("stroke-width", 2);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(4).tickFormat(d => `$${d}`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

    // X label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 35)
      .attr("text-anchor", "middle")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10)
      .text("Cost Invested");

  }, [mounted]);

  // Success Streak Chart
  useEffect(() => {
    if (!streakChartRef.current || !mounted) return;

    const svg = d3.select(streakChartRef.current);
    svg.selectAll("*").remove();

    const width = 350;
    const height = 120;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scalePoint()
      .domain(STREAK_DATA.map(d => d.week))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 10])
      .range([innerHeight, 0]);

    // Area
    const area = d3.area<typeof STREAK_DATA[0]>()
      .x(d => xScale(d.week) || 0)
      .y0(innerHeight)
      .y1(d => yScale(d.streak))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(STREAK_DATA)
      .attr("d", area)
      .attr("fill", DARK_CHART_COLORS.purple)
      .attr("fill-opacity", 0.25);

    // Line
    const line = d3.line<typeof STREAK_DATA[0]>()
      .x(d => xScale(d.week) || 0)
      .y(d => yScale(d.streak))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(STREAK_DATA)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", DARK_CHART_COLORS.purple)
      .attr("stroke-width", 3);

    // Points
    g.selectAll(".point")
      .data(STREAK_DATA)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.week) || 0)
      .attr("cy", d => yScale(d.streak))
      .attr("r", 5)
      .attr("fill", DARK_CHART_COLORS.purple)
      .attr("stroke", DARK_CHART_COLORS.background)
      .attr("stroke-width", 2);

    // Value labels
    g.selectAll(".value")
      .data(STREAK_DATA)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.week) || 0)
      .attr("y", d => yScale(d.streak) - 12)
      .attr("text-anchor", "middle")
      .attr("fill", DARK_CHART_COLORS.purple)
      .attr("font-size", 10)
      .attr("font-weight", 600)
      .text(d => d.streak);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  if (!mounted) return null;

  const totalDecisions = OUTCOME_DISTRIBUTION.reduce((sum, d) => sum + d.count, 0);
  const successRate = Math.round((OUTCOME_DISTRIBUTION[0].count / totalDecisions) * 100);
  const totalSaved = DECISION_HISTORY.reduce((sum, d) => sum + d.saved, 0);

  return (
    <>
      {/* Hero */}
      <LightSection className="pt-28 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/product"
              className={cn(
                "inline-flex items-center gap-2 text-sm transition-colors",
                mode === "dark"
                  ? "text-neutral-400 hover:text-blue-400"
                  : "text-neutral-500 hover:text-blue-600"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Product
            </Link>
            <ThemeToggle />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-6",
                  mode === "dark"
                    ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                    : "bg-blue-50 border border-blue-200 text-blue-600"
                )}
              >
                <IoBook className="w-3.5 h-3.5" />
                Decision History
              </div>

              <h1
                className={cn(
                  "text-4xl sm:text-5xl font-bold mb-6 leading-tight",
                  mode === "dark" ? "text-white" : "text-neutral-900"
                )}
              >
                Permanent{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
                  Decision Ledger
                </span>
              </h1>

              <p
                className={cn(
                  "text-lg mb-8 leading-relaxed",
                  mode === "dark" ? "text-neutral-300" : "text-neutral-600"
                )}
              >
                Every decision is logged: what you chose, why, and what happened.
                Revisit past choices. Learn from outcomes. Build judgment.
              </p>

              <div className="flex flex-wrap gap-4">
                <WaitlistModal>
                  <Button className="h-12 px-6 font-mono font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300 shadow-lg shadow-teal-600/20">
                    Join the Waitlist
                  </Button>
                </WaitlistModal>
              </div>
            </div>

            {/* Stats Summary */}
            <ContentCard>
              <h3 className={cn(
                "text-lg font-semibold mb-6",
                mode === "dark" ? "text-white" : "text-neutral-900"
              )}>
                Your Decision Record
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={cn(
                  "text-center p-4 rounded-lg border",
                  mode === "dark"
                    ? "bg-neutral-800 border-neutral-700"
                    : "bg-neutral-50 border-neutral-100"
                )}>
                  <div className={cn(
                    "text-2xl font-bold",
                    mode === "dark" ? "text-white" : "text-neutral-900"
                  )}>
                    {totalDecisions}
                  </div>
                  <div className={cn(
                    "text-xs mt-1",
                    mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                  )}>
                    Decisions
                  </div>
                </div>
                <div className={cn(
                  "text-center p-4 rounded-lg border",
                  mode === "dark"
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-green-50 border-green-200"
                )}>
                  <div className={cn(
                    "text-2xl font-bold",
                    mode === "dark" ? "text-green-400" : "text-green-600"
                  )}>
                    {successRate}%
                  </div>
                  <div className={cn(
                    "text-xs mt-1",
                    mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                  )}>
                    Success Rate
                  </div>
                </div>
                <div className={cn(
                  "text-center p-4 rounded-lg border",
                  mode === "dark"
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-blue-50 border-blue-200"
                )}>
                  <div className={cn(
                    "text-2xl font-bold",
                    mode === "dark" ? "text-blue-400" : "text-blue-600"
                  )}>
                    ${totalSaved}
                  </div>
                  <div className={cn(
                    "text-xs mt-1",
                    mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                  )}>
                    Saved
                  </div>
                </div>
              </div>

              {/* Recent Insights */}
              <div className="space-y-2">
                <div className={cn(
                  "text-xs uppercase tracking-wider mb-2",
                  mode === "dark" ? "text-neutral-500" : "text-neutral-500"
                )}>
                  Recent Insights
                </div>
                {RECENT_INSIGHTS.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-lg text-sm border",
                      item.type === "positive"
                        ? mode === "dark"
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : "bg-green-50 border-green-200 text-green-700"
                        : item.type === "warning"
                        ? mode === "dark"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                        : mode === "dark"
                          ? "bg-neutral-800 border-neutral-700 text-neutral-300"
                          : "bg-neutral-50 border-neutral-200 text-neutral-600"
                    )}
                  >
                    {item.insight}
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        </div>
      </LightSection>

      {/* Recent Decisions */}
      <LightSection variant="muted" className="py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className={cn(
              "text-2xl font-bold",
              mode === "dark" ? "text-white" : "text-neutral-900"
            )}>
              Recent Decisions
            </h2>
            <div className={cn(
              "text-sm",
              mode === "dark" ? "text-neutral-400" : "text-neutral-500"
            )}>
              Last 30 days
            </div>
          </div>

          <div className={cn(
            "rounded-xl border shadow-sm overflow-hidden",
            mode === "dark"
              ? "bg-neutral-900 border-neutral-800"
              : "bg-white border-neutral-200"
          )}>
            <div className={cn(
              "grid grid-cols-6 gap-4 p-4 border-b text-xs uppercase tracking-wider",
              mode === "dark"
                ? "bg-neutral-800 border-neutral-700 text-neutral-400"
                : "bg-neutral-50 border-neutral-200 text-neutral-500"
            )}>
              <div>Date</div>
              <div>Category</div>
              <div>Decision</div>
              <div>Outcome</div>
              <div>Saved</div>
              <div>Time</div>
            </div>
            {DECISION_HISTORY.map((decision, i) => (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-6 gap-4 p-4 border-b transition-colors",
                  mode === "dark"
                    ? "border-neutral-800 hover:bg-neutral-800/50"
                    : "border-neutral-100 hover:bg-neutral-50"
                )}
              >
                <div className={cn(
                  "text-sm",
                  mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                )}>
                  {decision.date}
                </div>
                <div className={cn(
                  "text-sm font-medium",
                  mode === "dark" ? "text-white" : "text-neutral-900"
                )}>
                  {decision.category}
                </div>
                <div className={cn(
                  "text-sm font-medium",
                  decision.decision === "DIY"
                    ? mode === "dark" ? "text-green-400" : "text-green-600"
                    : decision.decision === "Pro"
                    ? mode === "dark" ? "text-blue-400" : "text-blue-600"
                    : mode === "dark" ? "text-amber-400" : "text-amber-600"
                )}>
                  {decision.decision}
                </div>
                <div className={cn(
                  "text-sm",
                  decision.outcome === "Success"
                    ? mode === "dark" ? "text-green-400" : "text-green-600"
                    : decision.outcome === "Partial"
                    ? mode === "dark" ? "text-amber-400" : "text-amber-600"
                    : decision.outcome === "Pending"
                    ? mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                    : mode === "dark" ? "text-red-400" : "text-red-600"
                )}>
                  {decision.outcome}
                </div>
                <div className={cn(
                  "text-sm font-medium",
                  mode === "dark" ? "text-green-400" : "text-green-600"
                )}>
                  {decision.saved > 0 ? `+$${decision.saved}` : "-"}
                </div>
                <div className={cn(
                  "text-sm",
                  mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                )}>
                  {decision.time > 0 ? `${decision.time}h` : "-"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </LightSection>

      {/* Charts Section */}
      <LightSection className="py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Learn from your history"
            description="Visualize patterns in your decisions to make better choices going forward."
            centered
            className="mb-16"
          />

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Decision Trend */}
            <ChartContainer
              title="Decision Trend"
              subtitle="Monthly decisions and success rate."
              className="lg:col-span-2"
            >
              <svg ref={trendChartRef} viewBox="0 0 400 200" className="w-full" />
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.grid }} />
                  <span className="text-xs text-neutral-400">Total</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.green }} />
                  <span className="text-xs text-neutral-400">Successful</span>
                </div>
              </div>
            </ChartContainer>

            {/* Outcome Distribution */}
            <ChartContainer
              title="Outcomes"
              subtitle="Distribution of decision outcomes."
            >
              <div className="flex justify-center">
                <svg ref={outcomeChartRef} viewBox="0 0 180 180" className="w-44 h-44" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {OUTCOME_DISTRIBUTION.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{
                      backgroundColor: [DARK_CHART_COLORS.green, DARK_CHART_COLORS.amber, DARK_CHART_COLORS.red, DARK_CHART_COLORS.textMuted][i]
                    }} />
                    <span className="text-xs text-neutral-400">{item.outcome}</span>
                    <span className="text-xs font-semibold ml-auto text-white">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>

          {/* Category Performance */}
          <ChartContainer
            title="Success Rate by Category"
            subtitle="Your performance across different repair types."
            className="mt-8"
          >
            <svg ref={performanceChartRef} viewBox="0 0 400 200" className="w-full max-w-lg mx-auto" />
          </ChartContainer>
        </div>
      </LightSection>

      {/* Advanced Ledger Analytics */}
      <LightSection variant="muted" className="py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Deep Ledger Analytics"
            description="Comprehensive analysis of your decision history with activity tracking and pattern recognition."
            centered
            className="mb-16"
          />

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Decision Timeline */}
            <ChartContainer
              title="Decision Volume Over Time"
              subtitle="Weekly breakdown by decision type."
            >
              <svg ref={timelineChartRef} viewBox="0 0 400 180" className="w-full" />
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.green }} />
                  <span className="text-xs text-neutral-400">DIY</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.blue }} />
                  <span className="text-xs text-neutral-400">Pro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.amber }} />
                  <span className="text-xs text-neutral-400">Defer</span>
                </div>
              </div>
            </ChartContainer>

            {/* Activity Calendar */}
            <ChartContainer
              title="Monthly Activity"
              subtitle="Decision activity calendar for the current month."
            >
              <div className="flex justify-center">
                <svg ref={calendarRef} viewBox="0 0 350 120" className="w-full max-w-[350px]" />
              </div>
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.grid }} />
                  <span className="text-xs text-neutral-400">No activity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.blue }} />
                  <span className="text-xs text-neutral-400">Low</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.green }} />
                  <span className="text-xs text-neutral-400">High</span>
                </div>
              </div>
            </ChartContainer>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Cost vs Outcome */}
            <ChartContainer
              title="Cost vs Outcome"
              subtitle="See how cost investment correlates with success by category."
            >
              <svg ref={scatterChartRef} viewBox="0 0 350 200" className="w-full" />
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DARK_CHART_COLORS.green }} />
                  <span className="text-xs text-neutral-400">Success</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DARK_CHART_COLORS.red }} />
                  <span className="text-xs text-neutral-400">Failed</span>
                </div>
              </div>
            </ChartContainer>

            {/* Success Streak */}
            <ChartContainer
              title="Success Streak"
              subtitle="Your consecutive successful decisions over time."
            >
              <svg ref={streakChartRef} viewBox="0 0 350 120" className="w-full" />
              <div className="text-center mt-4">
                <span className="text-xs text-neutral-400">Current Streak: </span>
                <span className="text-sm font-bold text-purple-400">8 decisions</span>
              </div>
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Features Grid */}
      <LightSection className="py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <ContentCard
                key={i}
                className={cn(
                  "transition-all",
                  mode === "dark"
                    ? "hover:border-blue-500/50"
                    : "hover:border-blue-300 hover:shadow-md"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                  mode === "dark"
                    ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                    : "bg-blue-50 border border-blue-200 text-blue-600"
                )}>
                  <IoBook className="w-6 h-6" />
                </div>
                <h3 className={cn(
                  "text-lg font-semibold mb-2",
                  mode === "dark" ? "text-white" : "text-neutral-900"
                )}>
                  {feature.title}
                </h3>
                <p className={cn(
                  "text-sm leading-relaxed",
                  mode === "dark" ? "text-neutral-400" : "text-neutral-600"
                )}>
                  {feature.description}
                </p>
              </ContentCard>
            ))}
          </div>
        </div>
      </LightSection>

      {/* CTA */}
      <LightSection variant="muted" className="py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={cn(
            "text-3xl sm:text-4xl font-bold mb-6",
            mode === "dark" ? "text-white" : "text-neutral-900"
          )}>
            Start building your decision history
          </h2>
          <p className={cn(
            "mb-8",
            mode === "dark" ? "text-neutral-400" : "text-neutral-600"
          )}>
            Every decision you make today becomes wisdom for tomorrow.
          </p>
          <WaitlistModal>
            <Button className="h-14 px-8 font-mono font-bold text-lg bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300 shadow-lg shadow-teal-600/20">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </LightSection>
    </>
  );
}

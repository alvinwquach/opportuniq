"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { IoPeople } from "react-icons/io5";
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
 * Solo or Shared Feature Page
 *
 * Collaboration features for households, roommates, and families
 * Hybrid layout: light mode for text, dark containers for charts
 */

// Member colors for charts (high contrast for dark backgrounds)
const MEMBER_COLORS = [DARK_CHART_COLORS.green, DARK_CHART_COLORS.blue, DARK_CHART_COLORS.amber, DARK_CHART_COLORS.purple];

// Household activity data
const HOUSEHOLD_ACTIVITY = [
  { member: "Alex", decisions: 12, completed: 8, savings: 420 },
  { member: "Sam", decisions: 8, completed: 6, savings: 280 },
  { member: "Jordan", decisions: 5, completed: 4, savings: 180 },
  { member: "Taylor", decisions: 3, completed: 2, savings: 120 },
];

// Shared vs Solo usage
const USAGE_COMPARISON = [
  { month: "Jan", solo: 35, shared: 65 },
  { month: "Feb", solo: 40, shared: 60 },
  { month: "Mar", solo: 30, shared: 70 },
  { month: "Apr", solo: 25, shared: 75 },
  { month: "May", solo: 28, shared: 72 },
  { month: "Jun", solo: 22, shared: 78 },
];

// Task distribution
const TASK_DISTRIBUTION = [
  { category: "Plumbing", alex: 4, sam: 2, jordan: 1, taylor: 0 },
  { category: "Electrical", alex: 2, sam: 3, jordan: 0, taylor: 1 },
  { category: "HVAC", alex: 1, sam: 1, jordan: 2, taylor: 0 },
  { category: "Outdoor", alex: 3, sam: 2, jordan: 2, taylor: 2 },
  { category: "Appliance", alex: 2, sam: 0, jordan: 0, taylor: 0 },
];

// Collaboration matrix for member interactions
const COLLABORATION_MATRIX = [
  { from: "Alex", to: "Sam", value: 8 },
  { from: "Alex", to: "Jordan", value: 5 },
  { from: "Alex", to: "Taylor", value: 3 },
  { from: "Sam", to: "Jordan", value: 6 },
  { from: "Sam", to: "Taylor", value: 4 },
  { from: "Jordan", to: "Taylor", value: 2 },
];

// Member expertise radar data
const MEMBER_EXPERTISE = [
  { member: "Alex", plumbing: 90, electrical: 60, hvac: 40, outdoor: 85, appliance: 70 },
  { member: "Sam", plumbing: 50, electrical: 85, hvac: 55, outdoor: 60, appliance: 40 },
  { member: "Jordan", plumbing: 30, electrical: 20, hvac: 80, outdoor: 65, appliance: 25 },
  { member: "Taylor", plumbing: 20, electrical: 45, hvac: 15, outdoor: 75, appliance: 30 },
];

// Response time by member
const RESPONSE_TIME = [
  { member: "Alex", avgHours: 2.5 },
  { member: "Sam", avgHours: 4.2 },
  { member: "Jordan", avgHours: 6.8 },
  { member: "Taylor", avgHours: 8.5 },
];

// Workload distribution over time
const WORKLOAD_TREND = [
  { week: "W1", alex: 5, sam: 3, jordan: 2, taylor: 1 },
  { week: "W2", alex: 4, sam: 4, jordan: 3, taylor: 2 },
  { week: "W3", alex: 6, sam: 2, jordan: 4, taylor: 1 },
  { week: "W4", alex: 3, sam: 5, jordan: 2, taylor: 3 },
  { week: "W5", alex: 4, sam: 4, jordan: 3, taylor: 2 },
  { week: "W6", alex: 5, sam: 3, jordan: 4, taylor: 2 },
];

const FEATURES = [
  {
    title: "Shared Budgets",
    description: "Pool resources and track spending together. Everyone sees the same financial picture.",
  },
  {
    title: "Task Assignment",
    description: "Assign repairs to household members based on skills, availability, and preferences.",
  },
  {
    title: "Shared Decision History",
    description: "Everyone learns from past decisions. Build collective knowledge about your home.",
  },
  {
    title: "Permission Levels",
    description: "Control who can make decisions, who can view, and who can approve spending.",
  },
];

const COLLABORATION_SCENARIOS = [
  {
    title: "Couples & Families",
    description: "Share home maintenance responsibilities and make decisions together.",
    icon: "heart",
  },
  {
    title: "Roommates",
    description: "Split costs fairly and coordinate repairs without awkward conversations.",
    icon: "home",
  },
  {
    title: "Property Managers",
    description: "Manage multiple properties with team access and tenant visibility.",
    icon: "building",
  },
];

export default function CollaborationPage() {
  const { mode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const activityChartRef = useRef<SVGSVGElement>(null);
  const usageChartRef = useRef<SVGSVGElement>(null);
  const distributionChartRef = useRef<SVGSVGElement>(null);
  const networkChartRef = useRef<SVGSVGElement>(null);
  const expertiseChartRef = useRef<SVGSVGElement>(null);
  const responseChartRef = useRef<SVGSVGElement>(null);
  const workloadChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Household Activity Chart
  useEffect(() => {
    if (!activityChartRef.current || !mounted) return;

    const svg = d3.select(activityChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 80, bottom: 30, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(HOUSEHOLD_ACTIVITY, d => d.decisions) as number])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleBand()
      .domain(HOUSEHOLD_ACTIVITY.map(d => d.member))
      .range([0, innerHeight])
      .padding(0.3);

    const barHeight = yScale.bandwidth() / 2 - 2;
    const colors = MEMBER_COLORS;

    // Decisions bars (background)
    g.selectAll(".decisions-bar")
      .data(HOUSEHOLD_ACTIVITY)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.member) || 0)
      .attr("width", d => xScale(d.decisions))
      .attr("height", barHeight)
      .attr("fill", (_, i) => colors[i])
      .attr("fill-opacity", 0.3)
      .attr("rx", 3);

    // Completed bars
    g.selectAll(".completed-bar")
      .data(HOUSEHOLD_ACTIVITY)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.member) || 0)
      .attr("width", d => xScale(d.completed))
      .attr("height", barHeight)
      .attr("fill", (_, i) => colors[i])
      .attr("rx", 3);

    // Savings labels
    g.selectAll(".savings-label")
      .data(HOUSEHOLD_ACTIVITY)
      .enter()
      .append("text")
      .attr("x", innerWidth + 10)
      .attr("y", d => (yScale(d.member) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("fill", DARK_CHART_COLORS.green)
      .attr("font-size", 11)
      .attr("font-weight", 600)
      .text(d => `+$${d.savings}`);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 11);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Usage Comparison Chart
  useEffect(() => {
    if (!usageChartRef.current || !mounted) return;

    const svg = d3.select(usageChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 180;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scalePoint()
      .domain(USAGE_COMPARISON.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.5);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Shared area
    const sharedArea = d3.area<typeof USAGE_COMPARISON[0]>()
      .x(d => xScale(d.month) || 0)
      .y0(innerHeight)
      .y1(d => yScale(d.shared))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(USAGE_COMPARISON)
      .attr("d", sharedArea)
      .attr("fill", DARK_CHART_COLORS.purple)
      .attr("fill-opacity", 0.25);

    // Solo area
    const soloArea = d3.area<typeof USAGE_COMPARISON[0]>()
      .x(d => xScale(d.month) || 0)
      .y0(innerHeight)
      .y1(d => yScale(d.solo))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(USAGE_COMPARISON)
      .attr("d", soloArea)
      .attr("fill", DARK_CHART_COLORS.blue)
      .attr("fill-opacity", 0.35);

    // Lines
    const sharedLine = d3.line<typeof USAGE_COMPARISON[0]>()
      .x(d => xScale(d.month) || 0)
      .y(d => yScale(d.shared))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(USAGE_COMPARISON)
      .attr("d", sharedLine)
      .attr("fill", "none")
      .attr("stroke", DARK_CHART_COLORS.purple)
      .attr("stroke-width", 2);

    const soloLine = d3.line<typeof USAGE_COMPARISON[0]>()
      .x(d => xScale(d.month) || 0)
      .y(d => yScale(d.solo))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(USAGE_COMPARISON)
      .attr("d", soloLine)
      .attr("fill", "none")
      .attr("stroke", DARK_CHART_COLORS.blue)
      .attr("stroke-width", 2);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Task Distribution Heatmap
  useEffect(() => {
    if (!distributionChartRef.current || !mounted) return;

    const svg = d3.select(distributionChartRef.current);
    svg.selectAll("*").remove();

    const width = 450;
    const height = 200;
    const margin = { top: 30, right: 20, bottom: 20, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const members = ["Alex", "Sam", "Jordan", "Taylor"];
    const categories = TASK_DISTRIBUTION.map(d => d.category);

    const xScale = d3.scaleBand()
      .domain(members)
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(categories)
      .range([0, innerHeight])
      .padding(0.1);

    const colorScale = d3.scaleLinear<string>()
      .domain([0, 2, 4])
      .range([DARK_CHART_COLORS.grid, DARK_CHART_COLORS.blue, DARK_CHART_COLORS.green]);

    // Cells
    TASK_DISTRIBUTION.forEach(row => {
      members.forEach(member => {
        const value = row[member.toLowerCase() as keyof typeof row] as number;
        g.append("rect")
          .attr("x", xScale(member) || 0)
          .attr("y", yScale(row.category) || 0)
          .attr("width", xScale.bandwidth())
          .attr("height", yScale.bandwidth())
          .attr("fill", colorScale(value))
          .attr("rx", 4);

        if (value > 0) {
          g.append("text")
            .attr("x", (xScale(member) || 0) + xScale.bandwidth() / 2)
            .attr("y", (yScale(row.category) || 0) + yScale.bandwidth() / 2 + 4)
            .attr("text-anchor", "middle")
            .attr("fill", "#fff")
            .attr("font-size", 12)
            .attr("font-weight", 600)
            .text(value);
        }
      });
    });

    // X axis (top)
    members.forEach(member => {
      g.append("text")
        .attr("x", (xScale(member) || 0) + xScale.bandwidth() / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", DARK_CHART_COLORS.textMuted)
        .attr("font-size", 11)
        .text(member);
    });

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", "transparent");

  }, [mounted]);

  // Network Graph - Collaboration Connections
  useEffect(() => {
    if (!networkChartRef.current || !mounted) return;

    const svg = d3.select(networkChartRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 280;
    const radius = 90;

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const members = ["Alex", "Sam", "Jordan", "Taylor"];
    const memberColors = MEMBER_COLORS;
    const angleStep = (2 * Math.PI) / members.length;

    // Member positions in a circle
    const positions = members.map((_, i) => ({
      x: radius * Math.cos(angleStep * i - Math.PI / 2),
      y: radius * Math.sin(angleStep * i - Math.PI / 2),
    }));

    // Draw connections
    COLLABORATION_MATRIX.forEach(conn => {
      const fromIdx = members.indexOf(conn.from);
      const toIdx = members.indexOf(conn.to);
      if (fromIdx === -1 || toIdx === -1) return;

      g.append("line")
        .attr("x1", positions[fromIdx].x)
        .attr("y1", positions[fromIdx].y)
        .attr("x2", positions[toIdx].x)
        .attr("y2", positions[toIdx].y)
        .attr("stroke", DARK_CHART_COLORS.textMuted)
        .attr("stroke-width", conn.value / 2)
        .attr("stroke-opacity", 0.7);
    });

    // Draw member nodes
    members.forEach((member, i) => {
      g.append("circle")
        .attr("cx", positions[i].x)
        .attr("cy", positions[i].y)
        .attr("r", 25)
        .attr("fill", memberColors[i])
        .attr("stroke", DARK_CHART_COLORS.background)
        .attr("stroke-width", 3);

      g.append("text")
        .attr("x", positions[i].x)
        .attr("y", positions[i].y + 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", 11)
        .attr("font-weight", 600)
        .text(member[0]);

      g.append("text")
        .attr("x", positions[i].x)
        .attr("y", positions[i].y + (positions[i].y > 0 ? 45 : -35))
        .attr("text-anchor", "middle")
        .attr("fill", DARK_CHART_COLORS.textMuted)
        .attr("font-size", 10)
        .text(member);
    });

  }, [mounted]);

  // Member Expertise Radar Chart
  useEffect(() => {
    if (!expertiseChartRef.current || !mounted) return;

    const svg = d3.select(expertiseChartRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 50;
    const levels = 5;
    const factors = ["Plumbing", "Electrical", "HVAC", "Outdoor", "Appliance"];
    const angleSlice = (Math.PI * 2) / factors.length;

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const rScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, radius]);

    // Background circles
    for (let level = 1; level <= levels; level++) {
      g.append("circle")
        .attr("r", (radius / levels) * level)
        .attr("fill", "none")
        .attr("stroke", DARK_CHART_COLORS.grid)
        .attr("stroke-dasharray", "2,2");
    }

    // Axis lines and labels
    factors.forEach((factor, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", radius * Math.cos(angle))
        .attr("y2", radius * Math.sin(angle))
        .attr("stroke", DARK_CHART_COLORS.grid);

      g.append("text")
        .attr("x", (radius + 15) * Math.cos(angle))
        .attr("y", (radius + 15) * Math.sin(angle))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", DARK_CHART_COLORS.textMuted)
        .attr("font-size", 8)
        .text(factor);
    });

    // Draw member expertise polygons
    const memberColors = MEMBER_COLORS;
    const factorKeys = ["plumbing", "electrical", "hvac", "outdoor", "appliance"] as const;

    MEMBER_EXPERTISE.forEach((member, memberIdx) => {
      const points = factorKeys.map((factor, i) => {
        const value = member[factor];
        const angle = angleSlice * i - Math.PI / 2;
        return [rScale(value) * Math.cos(angle), rScale(value) * Math.sin(angle)];
      });

      const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z";

      g.append("path")
        .attr("d", pathData)
        .attr("fill", memberColors[memberIdx])
        .attr("fill-opacity", 0.15)
        .attr("stroke", memberColors[memberIdx])
        .attr("stroke-width", 2);
    });

  }, [mounted]);

  // Response Time Chart (Horizontal Bar)
  useEffect(() => {
    if (!responseChartRef.current || !mounted) return;

    const svg = d3.select(responseChartRef.current);
    svg.selectAll("*").remove();

    const width = 350;
    const height = 160;
    const margin = { top: 20, right: 40, bottom: 30, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(RESPONSE_TIME.map(d => d.member))
      .range([0, innerHeight])
      .padding(0.3);

    const memberColors = MEMBER_COLORS;

    // Bars
    g.selectAll(".bar")
      .data(RESPONSE_TIME)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.member) || 0)
      .attr("width", d => xScale(d.avgHours))
      .attr("height", yScale.bandwidth())
      .attr("fill", (_, i) => memberColors[i])
      .attr("rx", 4);

    // Value labels
    g.selectAll(".value")
      .data(RESPONSE_TIME)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.avgHours) + 8)
      .attr("y", d => (yScale(d.member) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 11)
      .attr("font-weight", 600)
      .text(d => `${d.avgHours}h`);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 11);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}h`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Workload Stream Graph
  useEffect(() => {
    if (!workloadChartRef.current || !mounted) return;

    const svg = d3.select(workloadChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const members = ["alex", "sam", "jordan", "taylor"] as const;
    const memberColors = MEMBER_COLORS;

    const xScale = d3.scalePoint()
      .domain(WORKLOAD_TREND.map(d => d.week))
      .range([0, innerWidth]);

    const stack = d3.stack<typeof WORKLOAD_TREND[0]>()
      .keys(members)
      .offset(d3.stackOffsetWiggle);

    const series = stack(WORKLOAD_TREND);

    const yMax = d3.max(series, s => d3.max(s, d => d[1])) || 10;
    const yMin = d3.min(series, s => d3.min(s, d => d[0])) || -10;

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0]);

    const area = d3.area<d3.SeriesPoint<typeof WORKLOAD_TREND[0]>>()
      .x(d => xScale(d.data.week) || 0)
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveCardinal);

    series.forEach((s, i) => {
      g.append("path")
        .datum(s)
        .attr("d", area)
        .attr("fill", memberColors[i])
        .attr("fill-opacity", 0.85);
    });

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

  const totalMembers = HOUSEHOLD_ACTIVITY.length;
  const totalSavings = HOUSEHOLD_ACTIVITY.reduce((sum, d) => sum + d.savings, 0);

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
                  ? "text-neutral-400 hover:text-purple-400"
                  : "text-neutral-500 hover:text-purple-600"
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
                    ? "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                    : "bg-purple-50 border border-purple-200 text-purple-700"
                )}
              >
                <IoPeople className="w-3.5 h-3.5" />
                Collaboration
              </div>

              <h1
                className={cn(
                  "text-4xl sm:text-5xl font-bold mb-6 leading-tight",
                  mode === "dark" ? "text-white" : "text-neutral-900"
                )}
              >
                Solo or{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  Shared
                </span>
              </h1>

              <p
                className={cn(
                  "text-lg mb-8 leading-relaxed",
                  mode === "dark" ? "text-neutral-300" : "text-neutral-600"
                )}
              >
                Use it alone or collaborate with family, roommates, or partners. Shared
                budgets, shared decisions, shared accountability.
              </p>

              <div className="flex flex-wrap gap-4">
                <WaitlistModal>
                  <Button className="h-12 px-6 font-mono font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300 shadow-lg shadow-teal-600/20">
                    Join the Waitlist
                  </Button>
                </WaitlistModal>
              </div>
            </div>

            {/* Household Summary */}
            <ContentCard>
              <h3 className={cn(
                "text-lg font-semibold mb-6",
                mode === "dark" ? "text-white" : "text-neutral-900"
              )}>
                Your Household
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={cn(
                  "text-center p-4 rounded-lg border",
                  mode === "dark"
                    ? "bg-purple-500/10 border-purple-500/30"
                    : "bg-purple-50 border-purple-200"
                )}>
                  <div className={cn(
                    "text-3xl font-bold",
                    mode === "dark" ? "text-purple-400" : "text-purple-600"
                  )}>
                    {totalMembers}
                  </div>
                  <div className={cn(
                    "text-sm mt-1",
                    mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                  )}>
                    Members
                  </div>
                </div>
                <div className={cn(
                  "text-center p-4 rounded-lg border",
                  mode === "dark"
                    ? "bg-teal-500/10 border-teal-500/30"
                    : "bg-teal-50 border-teal-200"
                )}>
                  <div className="text-3xl font-bold text-teal-500">${totalSavings}</div>
                  <div className={cn(
                    "text-sm mt-1",
                    mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                  )}>
                    Total Saved
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {HOUSEHOLD_ACTIVITY.map((member, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      mode === "dark"
                        ? "bg-neutral-800 border-neutral-700"
                        : "bg-neutral-50 border-neutral-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: `${MEMBER_COLORS[i]}20`,
                          color: MEMBER_COLORS[i],
                        }}
                      >
                        {member.member[0]}
                      </div>
                      <span className={cn(
                        "text-sm",
                        mode === "dark" ? "text-white" : "text-neutral-900"
                      )}>
                        {member.member}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-sm font-semibold",
                        mode === "dark" ? "text-white" : "text-neutral-900"
                      )}>
                        {member.completed}/{member.decisions}
                      </div>
                      <div className={cn(
                        "text-xs",
                        mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                      )}>
                        completed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        </div>
      </LightSection>

      {/* Activity Section */}
      <LightSection variant="muted" className="py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ChartContainer title="Household Activity">
              <svg ref={activityChartRef} viewBox="0 0 400 200" className="w-full" />
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded opacity-30" style={{ backgroundColor: DARK_CHART_COLORS.green }} />
                  <span className="text-xs text-neutral-400">Total Decisions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.green }} />
                  <span className="text-xs text-neutral-400">Completed</span>
                </div>
              </div>
            </ChartContainer>

            <div>
              <SectionHeader
                title="Everyone contributes"
                description="Track who's handling what, and see individual contributions to the household's home maintenance. Build a team approach to taking care of your space."
              />

              <div className="space-y-4 mt-8">
                {COLLABORATION_SCENARIOS.map((scenario, i) => (
                  <ContentCard key={i} className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      mode === "dark"
                        ? "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                        : "bg-purple-50 border border-purple-200 text-purple-600"
                    )}>
                      <IoPeople className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={cn(
                        "font-semibold",
                        mode === "dark" ? "text-white" : "text-neutral-900"
                      )}>
                        {scenario.title}
                      </h4>
                      <p className={cn(
                        "text-sm",
                        mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                      )}>
                        {scenario.description}
                      </p>
                    </div>
                  </ContentCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LightSection>

      {/* Charts Section */}
      <LightSection className="py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Shared insights"
            description="See how your household collaborates and where expertise lies."
            centered
            className="mb-16"
          />

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Usage Comparison */}
            <ChartContainer
              title="Solo vs Shared Decisions"
              subtitle="Percentage of decisions made collaboratively."
            >
              <svg ref={usageChartRef} viewBox="0 0 400 180" className="w-full" />
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.blue }} />
                  <span className="text-xs text-neutral-400">Solo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.purple }} />
                  <span className="text-xs text-neutral-400">Shared</span>
                </div>
              </div>
            </ChartContainer>

            {/* Task Distribution */}
            <ChartContainer
              title="Task Distribution"
              subtitle="Who handles what category."
            >
              <svg ref={distributionChartRef} viewBox="0 0 450 200" className="w-full" />
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Advanced Collaboration Analytics */}
      <LightSection variant="muted" className="py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Team Analytics"
            description="Deep insights into collaboration patterns, expertise mapping, and workload distribution."
            centered
            className="mb-16"
          />

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Network Graph */}
            <ChartContainer
              title="Collaboration Network"
              subtitle="Who works together most often. Line thickness = collaboration frequency."
            >
              <div className="flex justify-center">
                <svg ref={networkChartRef} viewBox="0 0 300 280" className="w-full max-w-[300px]" />
              </div>
            </ChartContainer>

            {/* Expertise Radar */}
            <ChartContainer
              title="Expertise Mapping"
              subtitle="Each member's skill levels across different categories."
            >
              <div className="flex justify-center">
                <svg ref={expertiseChartRef} viewBox="0 0 300 300" className="w-full max-w-[300px]" />
              </div>
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {["Alex", "Sam", "Jordan", "Taylor"].map((member, i) => (
                  <div key={member} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: MEMBER_COLORS[i] }} />
                    <span className="text-xs text-neutral-400">{member}</span>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Response Time */}
            <ChartContainer
              title="Response Time"
              subtitle="Average time to respond to new decisions by member."
            >
              <svg ref={responseChartRef} viewBox="0 0 350 160" className="w-full" />
            </ChartContainer>

            {/* Workload Stream */}
            <ChartContainer
              title="Workload Distribution"
              subtitle="Task volume by member over the past 6 weeks."
            >
              <svg ref={workloadChartRef} viewBox="0 0 400 200" className="w-full" />
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {["Alex", "Sam", "Jordan", "Taylor"].map((member, i) => (
                  <div key={member} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: MEMBER_COLORS[i] }} />
                    <span className="text-xs text-neutral-400">{member}</span>
                  </div>
                ))}
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
                    ? "hover:border-purple-500/50"
                    : "hover:border-purple-300 hover:shadow-md"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                  mode === "dark"
                    ? "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                    : "bg-purple-50 border border-purple-200 text-purple-600"
                )}>
                  <IoPeople className="w-6 h-6" />
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

      {/* Permission Levels */}
      <LightSection variant="muted" className="py-20">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Flexible permissions"
            description="Control access at every level."
            centered
            className="mb-12"
          />

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { role: "Owner", permissions: ["Full access", "Invite members", "Manage billing", "Delete account"], color: "purple" },
              { role: "Admin", permissions: ["View & edit", "Approve spending", "Assign tasks", "View reports"], color: "blue" },
              { role: "Member", permissions: ["View access", "Log decisions", "Track personal", "Request approvals"], color: "green" },
            ].map((level, i) => (
              <ContentCard
                key={i}
                className={cn(
                  mode === "dark"
                    ? level.color === "purple" ? "border-purple-500/30" :
                      level.color === "blue" ? "border-blue-500/30" : "border-green-500/30"
                    : level.color === "purple" ? "border-purple-200" :
                      level.color === "blue" ? "border-blue-200" : "border-green-200"
                )}
              >
                <div className={cn(
                  "text-lg font-bold mb-4",
                  level.color === "purple"
                    ? mode === "dark" ? "text-purple-400" : "text-purple-600"
                    : level.color === "blue"
                    ? mode === "dark" ? "text-blue-400" : "text-blue-600"
                    : mode === "dark" ? "text-green-400" : "text-green-600"
                )}>
                  {level.role}
                </div>
                <ul className="space-y-2">
                  {level.permissions.map((perm, j) => (
                    <li key={j} className={cn(
                      "flex items-center gap-2 text-sm",
                      mode === "dark" ? "text-neutral-300" : "text-neutral-700"
                    )}>
                      <svg
                        className={cn(
                          "w-4 h-4 flex-shrink-0",
                          level.color === "purple"
                            ? mode === "dark" ? "text-purple-400" : "text-purple-600"
                            : level.color === "blue"
                            ? mode === "dark" ? "text-blue-400" : "text-blue-600"
                            : mode === "dark" ? "text-green-400" : "text-green-600"
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {perm}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            ))}
          </div>
        </div>
      </LightSection>

      {/* CTA */}
      <LightSection className="py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={cn(
            "text-3xl sm:text-4xl font-bold mb-6",
            mode === "dark" ? "text-white" : "text-neutral-900"
          )}>
            Better together
          </h2>
          <p className={cn(
            "mb-8",
            mode === "dark" ? "text-neutral-400" : "text-neutral-600"
          )}>
            Collaborate on home maintenance decisions with the people who matter.
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

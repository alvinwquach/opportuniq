"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { IoShield } from "react-icons/io5";
import {
  HybridPageWrapper,
  LightSection,
  ChartContainer,
  ContentCard,
  SectionHeader,
  ThemeToggle,
  DARK_CHART_COLORS,
} from "@/components/ui/hybrid-layout";
import { useTheme } from "@/lib/theme-context";

/**
 * Safety & Risk Analysis Feature Page
 *
 * PPE requirements, risk assessment, and safety guidance
 *
 * Theme: Hybrid layout - light text sections, dark chart containers
 */

// Risk levels by category
const RISK_BY_CATEGORY = [
  { category: "Electrical", low: 15, medium: 35, high: 50 },
  { category: "Gas/HVAC", low: 10, medium: 30, high: 60 },
  { category: "Roofing", low: 20, medium: 40, high: 40 },
  { category: "Plumbing", low: 45, medium: 40, high: 15 },
  { category: "Appliance", low: 60, medium: 30, high: 10 },
  { category: "Outdoor", low: 55, medium: 35, high: 10 },
];

// Incident type distribution for donut chart
const INCIDENT_TYPES = [
  { type: "Minor Injuries", value: 35, color: DARK_CHART_COLORS.amber },
  { type: "Property Damage", value: 25, color: DARK_CHART_COLORS.red },
  { type: "Near Misses", value: 20, color: DARK_CHART_COLORS.blue },
  { type: "Equipment Failure", value: 12, color: DARK_CHART_COLORS.purple },
  { type: "Other", value: 8, color: "#6b7280" },
];

// Safety compliance data
const SAFETY_COMPLIANCE = [
  { category: "PPE Usage", compliance: 92 },
  { category: "Pre-work Check", compliance: 87 },
  { category: "Tool Inspection", compliance: 78 },
  { category: "Area Prep", compliance: 85 },
  { category: "Post-work Clean", compliance: 90 },
];

// Safety score trend over time
const SAFETY_TREND = [
  { week: "W1", score: 72, incidents: 3 },
  { week: "W2", score: 78, incidents: 2 },
  { week: "W3", score: 75, incidents: 2 },
  { week: "W4", score: 82, incidents: 1 },
  { week: "W5", score: 88, incidents: 1 },
  { week: "W6", score: 85, incidents: 1 },
  { week: "W7", score: 91, incidents: 0 },
  { week: "W8", score: 94, incidents: 0 },
];

// Incident prevention data
const INCIDENT_PREVENTION = [
  { month: "Jan", prevented: 12, occurred: 2 },
  { month: "Feb", prevented: 15, occurred: 1 },
  { month: "Mar", prevented: 18, occurred: 3 },
  { month: "Apr", prevented: 22, occurred: 2 },
  { month: "May", prevented: 25, occurred: 1 },
  { month: "Jun", prevented: 28, occurred: 2 },
];

// PPE requirements
const PPE_REQUIREMENTS = [
  { task: "Electrical work", items: ["Insulated gloves", "Safety glasses", "Non-conductive footwear"] },
  { task: "Plumbing", items: ["Rubber gloves", "Safety glasses", "Knee pads"] },
  { task: "HVAC/Gas", items: ["Respirator", "Safety glasses", "Work gloves"] },
  { task: "Roofing", items: ["Hard hat", "Safety harness", "Non-slip boots"] },
  { task: "Outdoor", items: ["Work gloves", "Safety glasses", "Hearing protection"] },
];

const FEATURES = [
  {
    title: "PPE Recommendations",
    description: "Get specific personal protective equipment recommendations for every type of repair task.",
  },
  {
    title: "Risk Level Assessment",
    description: "Understand the inherent risks of each task based on historical data and expert analysis.",
  },
  {
    title: "Stop Points",
    description: "Clear indicators of when a DIY attempt should stop and professional help is needed.",
  },
  {
    title: "Safety Checklists",
    description: "Task-specific safety checklists to complete before starting any repair work.",
  },
];

const SAFETY_QUESTIONS = [
  { question: "Is there a gas smell?", severity: "critical", action: "Evacuate and call gas company" },
  { question: "Exposed wires visible?", severity: "high", action: "Kill breaker before proceeding" },
  { question: "Water actively flowing?", severity: "high", action: "Shut off main valve" },
  { question: "Working at height?", severity: "medium", action: "Use proper fall protection" },
  { question: "Confined space?", severity: "medium", action: "Ensure proper ventilation" },
];

export default function SafetyRiskPage() {
  const [mounted, setMounted] = useState(false);
  const { mode } = useTheme();
  const riskChartRef = useRef<SVGSVGElement>(null);
  const preventionChartRef = useRef<SVGSVGElement>(null);
  const heatmapRef = useRef<SVGSVGElement>(null);
  const incidentDonutRef = useRef<SVGSVGElement>(null);
  const complianceChartRef = useRef<SVGSVGElement>(null);
  const trendChartRef = useRef<SVGSVGElement>(null);
  const gaugeChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stacked Risk Chart (Dark mode styling)
  useEffect(() => {
    if (!riskChartRef.current || !mounted) return;

    const svg = d3.select(riskChartRef.current);
    svg.selectAll("*").remove();

    const width = 450;
    const height = 220;
    const margin = { top: 20, right: 20, bottom: 40, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(RISK_BY_CATEGORY.map(d => d.category))
      .range([0, innerHeight])
      .padding(0.3);

    const colors = {
      low: DARK_CHART_COLORS.low,
      medium: DARK_CHART_COLORS.medium,
      high: DARK_CHART_COLORS.high
    };

    // Stacked bars
    RISK_BY_CATEGORY.forEach(d => {
      const y = yScale(d.category) || 0;
      let x = 0;

      // Low risk
      g.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", xScale(d.low))
        .attr("height", yScale.bandwidth())
        .attr("fill", colors.low)
        .attr("rx", 2);
      x += xScale(d.low);

      // Medium risk
      g.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", xScale(d.medium))
        .attr("height", yScale.bandwidth())
        .attr("fill", colors.medium)
        .attr("rx", 2);
      x += xScale(d.medium);

      // High risk
      g.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", xScale(d.high))
        .attr("height", yScale.bandwidth())
        .attr("fill", colors.high)
        .attr("rx", 2);
    });

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 11);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}%`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Incident Prevention Chart (Dark mode styling)
  useEffect(() => {
    if (!preventionChartRef.current || !mounted) return;

    const svg = d3.select(preventionChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(INCIDENT_PREVENTION.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.3);

    const yMax = d3.max(INCIDENT_PREVENTION, d => d.prevented + d.occurred) || 30;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    // Prevented bars
    g.selectAll(".prevented-bar")
      .data(INCIDENT_PREVENTION)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.month) || 0)
      .attr("y", d => yScale(d.prevented))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.prevented))
      .attr("fill", DARK_CHART_COLORS.green)
      .attr("rx", 3);

    // Occurred dots
    g.selectAll(".occurred-dot")
      .data(INCIDENT_PREVENTION)
      .enter()
      .append("circle")
      .attr("cx", d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr("cy", d => yScale(d.occurred))
      .attr("r", 6)
      .attr("fill", DARK_CHART_COLORS.red);

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

  // Risk Heatmap (Dark mode styling)
  useEffect(() => {
    if (!heatmapRef.current || !mounted) return;

    const svg = d3.select(heatmapRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 180;
    const margin = { top: 30, right: 20, bottom: 20, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const categories = ["Plumbing", "Electrical", "HVAC", "Appliance"];
    const severities = ["Minor", "Moderate", "Severe", "Critical"];

    const riskValues = [
      [2, 4, 6, 8],    // Plumbing
      [4, 6, 8, 10],   // Electrical
      [5, 7, 9, 10],   // HVAC
      [1, 3, 5, 7],    // Appliance
    ];

    const xScale = d3.scaleBand()
      .domain(severities)
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(categories)
      .range([0, innerHeight])
      .padding(0.1);

    const colorScale = d3.scaleLinear<string>()
      .domain([1, 5, 10])
      .range([DARK_CHART_COLORS.green, DARK_CHART_COLORS.amber, DARK_CHART_COLORS.red]);

    // Cells
    categories.forEach((cat, i) => {
      severities.forEach((sev, j) => {
        const value = riskValues[i][j];
        g.append("rect")
          .attr("x", xScale(sev) || 0)
          .attr("y", yScale(cat) || 0)
          .attr("width", xScale.bandwidth())
          .attr("height", yScale.bandwidth())
          .attr("fill", colorScale(value))
          .attr("rx", 4);

        g.append("text")
          .attr("x", (xScale(sev) || 0) + xScale.bandwidth() / 2)
          .attr("y", (yScale(cat) || 0) + yScale.bandwidth() / 2 + 4)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .attr("font-size", 12)
          .attr("font-weight", 600)
          .text(value);
      });
    });

    // X axis (top)
    g.append("g")
      .attr("transform", `translate(0, -5)`)
      .selectAll("text")
      .data(severities)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d) || 0) + xScale.bandwidth() / 2)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10)
      .text(d => d);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", "transparent");

  }, [mounted]);

  // Incident Types Donut Chart (Dark mode styling)
  useEffect(() => {
    if (!incidentDonutRef.current || !mounted) return;

    const svg = d3.select(incidentDonutRef.current);
    svg.selectAll("*").remove();

    const width = 280;
    const height = 280;
    const radius = Math.min(width, height) / 2 - 20;

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<typeof INCIDENT_TYPES[0]>()
      .value(d => d.value)
      .sort(null)
      .padAngle(0.03);

    const arc = d3.arc<d3.PieArcDatum<typeof INCIDENT_TYPES[0]>>()
      .innerRadius(radius * 0.55)
      .outerRadius(radius);

    // Slices
    g.selectAll(".slice")
      .data(pie(INCIDENT_TYPES))
      .enter()
      .append("path")
      .attr("d", arc as never)
      .attr("fill", d => d.data.color)
      .attr("stroke", DARK_CHART_COLORS.background)
      .attr("stroke-width", 2);

    // Center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 24)
      .attr("font-weight", 700)
      .text("100");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 25)
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11)
      .text("Incidents");

  }, [mounted]);

  // Safety Compliance Bar Chart (Dark mode styling)
  useEffect(() => {
    if (!complianceChartRef.current || !mounted) return;

    const svg = d3.select(complianceChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 40, bottom: 30, left: 110 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(SAFETY_COMPLIANCE.map(d => d.category))
      .range([0, innerHeight])
      .padding(0.3);

    // Background bars
    g.selectAll(".bg-bar")
      .data(SAFETY_COMPLIANCE)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.category) || 0)
      .attr("width", innerWidth)
      .attr("height", yScale.bandwidth())
      .attr("fill", DARK_CHART_COLORS.background)
      .attr("rx", 4);

    // Progress bars with gradient colors
    g.selectAll(".progress-bar")
      .data(SAFETY_COMPLIANCE)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.category) || 0)
      .attr("width", d => xScale(d.compliance))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => d.compliance >= 90 ? DARK_CHART_COLORS.green : d.compliance >= 80 ? DARK_CHART_COLORS.amber : DARK_CHART_COLORS.red)
      .attr("rx", 4);

    // Percentage labels
    g.selectAll(".percent-label")
      .data(SAFETY_COMPLIANCE)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.compliance) + 8)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 11)
      .attr("font-weight", 600)
      .text(d => `${d.compliance}%`);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", "transparent");

  }, [mounted]);

  // Safety Score Trend Line Chart (Dark mode styling)
  useEffect(() => {
    if (!trendChartRef.current || !mounted) return;

    const svg = d3.select(trendChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 220;
    const margin = { top: 30, right: 40, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scalePoint()
      .domain(SAFETY_TREND.map(d => d.week))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([60, 100])
      .range([innerHeight, 0]);

    const incidentScale = d3.scaleLinear()
      .domain([0, 4])
      .range([innerHeight, 0]);

    // Grid lines
    g.selectAll(".grid")
      .data([70, 80, 90, 100])
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", DARK_CHART_COLORS.grid)
      .attr("stroke-dasharray", "2,2");

    // Area under line
    const area = d3.area<typeof SAFETY_TREND[0]>()
      .x(d => xScale(d.week) || 0)
      .y0(innerHeight)
      .y1(d => yScale(d.score))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(SAFETY_TREND)
      .attr("d", area)
      .attr("fill", "url(#safetyGradientDark)");

    // Gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "safetyGradientDark")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", DARK_CHART_COLORS.green)
      .attr("stop-opacity", 0.4);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", DARK_CHART_COLORS.green)
      .attr("stop-opacity", 0);

    // Line
    const line = d3.line<typeof SAFETY_TREND[0]>()
      .x(d => xScale(d.week) || 0)
      .y(d => yScale(d.score))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(SAFETY_TREND)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", DARK_CHART_COLORS.green)
      .attr("stroke-width", 3);

    // Score points
    g.selectAll(".score-point")
      .data(SAFETY_TREND)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.week) || 0)
      .attr("cy", d => yScale(d.score))
      .attr("r", 5)
      .attr("fill", DARK_CHART_COLORS.green)
      .attr("stroke", DARK_CHART_COLORS.background)
      .attr("stroke-width", 2);

    // Incident bars
    g.selectAll(".incident-bar")
      .data(SAFETY_TREND)
      .enter()
      .append("rect")
      .attr("x", d => (xScale(d.week) || 0) - 6)
      .attr("y", d => incidentScale(d.incidents))
      .attr("width", 12)
      .attr("height", d => innerHeight - incidentScale(d.incidents))
      .attr("fill", DARK_CHART_COLORS.red)
      .attr("fill-opacity", 0.5)
      .attr("rx", 2);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(4))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Safety Score Gauge Chart (Dark mode styling)
  useEffect(() => {
    if (!gaugeChartRef.current || !mounted) return;

    const svg = d3.select(gaugeChartRef.current);
    svg.selectAll("*").remove();

    const width = 280;
    const height = 180;
    const radius = 100;
    const safetyScore = 87;

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height - 20})`);

    // Background arc
    const bgArc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append("path")
      .attr("d", bgArc as never)
      .attr("fill", DARK_CHART_COLORS.background);

    // Score arc with gradient sections
    const scoreAngle = -Math.PI / 2 + (Math.PI * safetyScore / 100);

    // Create colored sections
    const sections = [
      { start: -Math.PI / 2, end: -Math.PI / 6, color: DARK_CHART_COLORS.red },
      { start: -Math.PI / 6, end: Math.PI / 6, color: DARK_CHART_COLORS.amber },
      { start: Math.PI / 6, end: Math.PI / 2, color: DARK_CHART_COLORS.green },
    ];

    sections.forEach(section => {
      const sectionArc = d3.arc()
        .innerRadius(radius - 18)
        .outerRadius(radius - 2)
        .startAngle(section.start)
        .endAngle(Math.min(section.end, scoreAngle));

      if (scoreAngle > section.start) {
        g.append("path")
          .attr("d", sectionArc as never)
          .attr("fill", section.color);
      }
    });

    // Needle
    const needleAngle = scoreAngle;
    g.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (radius - 30) * Math.cos(needleAngle))
      .attr("y2", (radius - 30) * Math.sin(needleAngle))
      .attr("stroke", DARK_CHART_COLORS.text)
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round");

    // Center circle
    g.append("circle")
      .attr("r", 8)
      .attr("fill", DARK_CHART_COLORS.text);

    // Score text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -40)
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 36)
      .attr("font-weight", 700)
      .text(safetyScore);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -15)
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 12)
      .text("Safety Score");

    // Labels
    g.append("text")
      .attr("x", -radius + 10)
      .attr("y", 15)
      .attr("fill", DARK_CHART_COLORS.red)
      .attr("font-size", 10)
      .text("0");

    g.append("text")
      .attr("x", radius - 25)
      .attr("y", 15)
      .attr("fill", DARK_CHART_COLORS.green)
      .attr("font-size", 10)
      .text("100");

  }, [mounted]);

  if (!mounted) return null;

  return (
    <HybridPageWrapper>
      {/* Hero Section */}
      <LightSection variant="gradient" className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with nav and theme toggle */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/product"
              className={`inline-flex items-center gap-2 text-sm transition-colors ${
                mode === "dark"
                  ? "text-neutral-400 hover:text-teal-400"
                  : "text-neutral-500 hover:text-teal-600"
              }`}
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
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono mb-6 ${
                mode === "dark"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                <IoShield className="w-3.5 h-3.5" />
                Safety First
              </div>

              <h1 className={`text-4xl sm:text-5xl font-bold mb-6 leading-tight ${
                mode === "dark" ? "text-white" : "text-neutral-900"
              }`}>
                Safety &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                  Risk Analysis
                </span>
              </h1>

              <p className={`text-lg mb-8 leading-relaxed ${
                mode === "dark" ? "text-neutral-400" : "text-neutral-600"
              }`}>
                What PPE do you need? Can you make this worse? When should you stop
                and call a pro? We surface what you might overlook.
              </p>

              <div className="flex flex-wrap gap-4">
                <WaitlistModal>
                  <Button className="h-12 px-6 font-mono font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                    Join the Waitlist
                  </Button>
                </WaitlistModal>
              </div>
            </div>

            {/* Safety Questions Preview - Dark Panel */}
            <ChartContainer
              title="Safety Assessment"
              subtitle="Pre-task risk evaluation"
            >
              <div className="space-y-3">
                {SAFETY_QUESTIONS.map((q, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      q.severity === "critical"
                        ? "border-red-500/30 bg-red-500/10"
                        : q.severity === "high"
                        ? "border-orange-500/30 bg-orange-500/10"
                        : "border-amber-500/30 bg-amber-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        q.severity === "critical" ? "bg-red-500" :
                        q.severity === "high" ? "bg-orange-500" : "bg-amber-500"
                      }`} />
                      <span className="text-sm text-neutral-200">{q.question}</span>
                    </div>
                    <span className={`text-xs font-mono uppercase ${
                      q.severity === "critical" ? "text-red-400" :
                      q.severity === "high" ? "text-orange-400" : "text-amber-400"
                    }`}>
                      {q.severity}
                    </span>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Risk Distribution Section */}
      <LightSection className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${
                mode === "dark" ? "text-white" : "text-neutral-900"
              }`}>
                Know the risks before you start
              </h2>
              <p className={`mb-6 leading-relaxed ${
                mode === "dark" ? "text-neutral-400" : "text-neutral-600"
              }`}>
                Different repair categories carry different risk levels. Electrical and
                gas work consistently rank highest, while appliance repairs are often
                safer for DIY attempts.
              </p>

              <div className="space-y-4">
                {[
                  { level: "Low Risk", color: "bg-emerald-500", desc: "Safe for most DIY skill levels" },
                  { level: "Medium Risk", color: "bg-amber-500", desc: "Requires experience and caution" },
                  { level: "High Risk", color: "bg-red-500", desc: "Consider professional help" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${item.color}`} />
                    <div>
                      <span className={`font-medium ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>
                        {item.level}
                      </span>
                      <span className={`text-sm ml-2 ${mode === "dark" ? "text-neutral-500" : "text-neutral-500"}`}>
                        - {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ChartContainer
              title="Risk Distribution by Category"
              subtitle="Percentage breakdown of risk levels"
              legend={[
                { label: "Low", color: DARK_CHART_COLORS.green },
                { label: "Medium", color: DARK_CHART_COLORS.amber },
                { label: "High", color: DARK_CHART_COLORS.red },
              ]}
            >
              <svg ref={riskChartRef} viewBox="0 0 450 220" className="w-full" />
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Prevention Charts Section */}
      <LightSection variant="subtle" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Prevention in action"
            subtitle="Our safety checks have prevented thousands of potential incidents."
            badge="Analytics"
            badgeColor="teal"
          />

          <div className="grid lg:grid-cols-2 gap-8">
            <ChartContainer
              title="Incidents Prevented"
              subtitle="Safety warnings that helped users avoid problems"
              legend={[
                { label: "Prevented", color: DARK_CHART_COLORS.green },
                { label: "Occurred", color: DARK_CHART_COLORS.red, type: "circle" },
              ]}
            >
              <svg ref={preventionChartRef} viewBox="0 0 400 200" className="w-full" />
            </ChartContainer>

            <ChartContainer
              title="Risk Heatmap"
              subtitle="Risk levels by category and severity (1-10 scale)"
            >
              <svg ref={heatmapRef} viewBox="0 0 400 180" className="w-full" />
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Advanced Analytics Section */}
      <LightSection className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Comprehensive Safety Analytics"
            subtitle="Deep dive into safety metrics, compliance rates, and trend analysis."
            badge="Insights"
            badgeColor="red"
          />

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <ChartContainer
              title="Overall Safety Score"
              subtitle="Your current safety rating based on compliance and incident history"
            >
              <div className="flex justify-center">
                <svg ref={gaugeChartRef} viewBox="0 0 280 180" className="w-full max-w-[280px]" />
              </div>
            </ChartContainer>

            <ChartContainer
              title="Incident Types"
              subtitle="Breakdown of incident categories across all projects"
            >
              <div className="flex justify-center">
                <svg ref={incidentDonutRef} viewBox="0 0 280 280" className="w-full max-w-[280px]" />
              </div>
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {INCIDENT_TYPES.map((item) => (
                  <div key={item.type} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-neutral-400">{item.type}</span>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <ChartContainer
              title="Safety Score Trend"
              subtitle="Weekly safety score with incident overlay"
              legend={[
                { label: "Safety Score", color: DARK_CHART_COLORS.green },
                { label: "Incidents", color: DARK_CHART_COLORS.red },
              ]}
            >
              <svg ref={trendChartRef} viewBox="0 0 400 220" className="w-full" />
            </ChartContainer>

            <ChartContainer
              title="Safety Compliance"
              subtitle="Compliance rates across different safety procedures"
            >
              <svg ref={complianceChartRef} viewBox="0 0 400 200" className="w-full" />
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* PPE Section */}
      <LightSection variant="subtle" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="PPE recommendations"
            subtitle="Task-specific protective equipment recommendations based on the work you're doing."
            badge="Safety Gear"
            badgeColor="red"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PPE_REQUIREMENTS.map((req, i) => (
              <ContentCard key={i} hoverable>
                <h3 className={`text-lg font-semibold mb-4 ${
                  mode === "dark" ? "text-red-400" : "text-red-600"
                }`}>
                  {req.task}
                </h3>
                <ul className="space-y-2">
                  {req.items.map((item, j) => (
                    <li key={j} className={`flex items-center gap-2 text-sm ${
                      mode === "dark" ? "text-neutral-300" : "text-neutral-700"
                    }`}>
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            ))}
          </div>
        </div>
      </LightSection>

      {/* Features Grid */}
      <LightSection className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <ContentCard key={i} hoverable>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  mode === "dark"
                    ? "bg-red-500/10 border border-red-500/30 text-red-400"
                    : "bg-red-50 border border-red-200 text-red-600"
                }`}>
                  <IoShield className="w-6 h-6" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  mode === "dark" ? "text-white" : "text-neutral-900"
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  mode === "dark" ? "text-neutral-400" : "text-neutral-600"
                }`}>
                  {feature.description}
                </p>
              </ContentCard>
            ))}
          </div>
        </div>
      </LightSection>

      {/* CTA */}
      <LightSection variant="gradient" className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${
            mode === "dark" ? "text-white" : "text-neutral-900"
          }`}>
            Stay safe with every repair
          </h2>
          <p className={`mb-8 ${
            mode === "dark" ? "text-neutral-400" : "text-neutral-600"
          }`}>
            Get personalized safety guidance and risk assessments for all your
            home maintenance projects.
          </p>
          <WaitlistModal>
            <Button className="h-14 px-8 font-mono font-bold text-lg bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </LightSection>
    </HybridPageWrapper>
  );
}

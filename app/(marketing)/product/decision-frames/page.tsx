"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { IoGitBranch, IoArrowBack } from "react-icons/io5";
import { useTheme } from "@/lib/theme-context";
import {
  HybridPageWrapper,
  LightSection,
  DarkPanel,
  ChartContainer,
  SectionHeader,
  ContentCard,
  ThemeToggle,
  DARK_CHART_COLORS,
} from "@/components/ui/hybrid-layout";
import { cn } from "@/lib/utils";

/**
 * Decision Frames Feature Page
 *
 * HYBRID LAYOUT:
 * - Light sections for text content (readable, clean)
 * - Dark panels for charts and visualizations (high contrast, engaging)
 * - Theme toggle for user preference
 *
 * Page Structure:
 * 1. Hero - Light bg with dark chart panel
 * 2. Features Grid - Light bg
 * 3. Decision Flow - Dark panel in light section
 * 4. Charts Section - Dark panels for all visualizations
 * 5. Decision Example - Light cards
 * 6. CTA - Light with gradient
 */

// Decision outcome data by path
const DECISION_PATHS = [
  { path: "DIY", success: 78, avgSavings: 420, avgTime: 4.5, risk: 25 },
  { path: "Hire Pro", success: 95, avgSavings: 0, avgTime: 0.5, risk: 5 },
  { path: "Defer", success: 60, avgSavings: 180, avgTime: 0, risk: 35 },
];

// Historical decisions comparison
const DECISION_OUTCOMES = [
  { month: "Jan", diy: 5, hire: 2, defer: 1 },
  { month: "Feb", diy: 7, hire: 3, defer: 2 },
  { month: "Mar", diy: 4, hire: 4, defer: 1 },
  { month: "Apr", diy: 8, hire: 2, defer: 3 },
  { month: "May", diy: 6, hire: 3, defer: 2 },
  { month: "Jun", diy: 9, hire: 2, defer: 1 },
];

// Cost comparison data
const COST_COMPARISON = [
  { category: "Plumbing", diy: 85, pro: 280, savings: 195 },
  { category: "Electrical", diy: 120, pro: 350, savings: 230 },
  { category: "HVAC", diy: 180, pro: 450, savings: 270 },
  { category: "Appliance", diy: 45, pro: 180, savings: 135 },
  { category: "Outdoor", diy: 65, pro: 220, savings: 155 },
];

// Decision distribution pie chart data
const DECISION_DISTRIBUTION = [
  { type: "DIY Success", value: 45, color: DARK_CHART_COLORS.green },
  { type: "Pro Hired", value: 25, color: DARK_CHART_COLORS.blue },
  { type: "Deferred", value: 15, color: DARK_CHART_COLORS.amber },
  { type: "DIY Failed", value: 10, color: DARK_CHART_COLORS.red },
  { type: "In Progress", value: 5, color: DARK_CHART_COLORS.purple },
];

// Scatter plot data - Complexity vs Success
const COMPLEXITY_SUCCESS = [
  { complexity: 2, success: 95, type: "DIY", size: 12 },
  { complexity: 3, success: 88, type: "DIY", size: 18 },
  { complexity: 4, success: 75, type: "DIY", size: 15 },
  { complexity: 5, success: 65, type: "DIY", size: 22 },
  { complexity: 6, success: 55, type: "DIY", size: 10 },
  { complexity: 7, success: 40, type: "DIY", size: 8 },
  { complexity: 3, success: 98, type: "Pro", size: 14 },
  { complexity: 5, success: 96, type: "Pro", size: 20 },
  { complexity: 7, success: 94, type: "Pro", size: 16 },
  { complexity: 8, success: 92, type: "Pro", size: 12 },
  { complexity: 9, success: 90, type: "Pro", size: 18 },
];

// Radar chart data for decision factors
const RADAR_DATA = {
  diy: { cost: 85, time: 40, skill: 60, risk: 35, satisfaction: 90 },
  pro: { cost: 25, time: 95, skill: 10, risk: 90, satisfaction: 75 },
  defer: { cost: 100, time: 100, skill: 0, risk: 50, satisfaction: 30 },
};

const FEATURES = [
  {
    title: "Three Clear Paths",
    description: "Every decision is framed as DIY, hire a professional, or defer. No ambiguity, just clear options with tradeoffs.",
  },
  {
    title: "Context-Aware Recommendations",
    description: "Based on your skill level, available time, and the specific issue, we highlight which path makes the most sense.",
  },
  {
    title: "Tradeoff Visualization",
    description: "See the cost, time, risk, and success probability for each option side by side before you decide.",
  },
  {
    title: "Historical Success Rates",
    description: "Learn from thousands of similar decisions made by other users to understand real-world outcomes.",
  },
];

export default function DecisionFramesPage() {
  const { mode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathsChartRef = useRef<SVGSVGElement>(null);
  const outcomesChartRef = useRef<SVGSVGElement>(null);
  const comparisonChartRef = useRef<SVGSVGElement>(null);
  const pieChartRef = useRef<SVGSVGElement>(null);
  const scatterChartRef = useRef<SVGSVGElement>(null);
  const radarChartRef = useRef<SVGSVGElement>(null);
  const funnelChartRef = useRef<SVGSVGElement>(null);
  const flowChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // All charts use DARK theme colors for high contrast
  const C = DARK_CHART_COLORS;

  // Decision Paths Radar-style Chart
  useEffect(() => {
    if (!pathsChartRef.current || !mounted) return;

    const svg = d3.select(pathsChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 250;
    const margin = { top: 30, right: 120, bottom: 40, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const metrics = ["Success %", "Savings", "Time (h)", "Risk %"];
    const colors = [C.green, C.blue, C.amber];

    const xScale = d3.scaleBand()
      .domain(metrics)
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Background bars
    metrics.forEach(metric => {
      g.append("rect")
        .attr("x", xScale(metric) || 0)
        .attr("y", 0)
        .attr("width", xScale.bandwidth())
        .attr("height", innerHeight)
        .attr("fill", C.background)
        .attr("rx", 4);
    });

    // Data bars for each path
    const barWidth = xScale.bandwidth() / 3 - 2;

    DECISION_PATHS.forEach((path, pathIndex) => {
      const values = [
        path.success,
        Math.min((path.avgSavings / 500) * 100, 100),
        Math.min((path.avgTime / 5) * 100, 100),
        path.risk,
      ];

      values.forEach((value, metricIndex) => {
        const metric = metrics[metricIndex];
        g.append("rect")
          .attr("x", (xScale(metric) || 0) + pathIndex * (barWidth + 2))
          .attr("y", yScale(value))
          .attr("width", barWidth)
          .attr("height", innerHeight - yScale(value))
          .attr("fill", colors[pathIndex])
          .attr("fill-opacity", 0.9)
          .attr("rx", 2);
      });
    });

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", C.textMuted)
      .attr("font-size", 10);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text")
      .attr("fill", C.textMuted)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", C.grid);
    g.selectAll(".tick line").attr("stroke", C.grid);

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 100}, ${margin.top})`);

    DECISION_PATHS.forEach((path, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 22})`);

      legendItem.append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", colors[i])
        .attr("rx", 3);

      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 11)
        .attr("fill", C.text)
        .attr("font-size", 11)
        .text(path.path);
    });

  }, [mounted, C]);

  // Decision Outcomes Stacked Bar Chart
  useEffect(() => {
    if (!outcomesChartRef.current || !mounted) return;

    const svg = d3.select(outcomesChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(DECISION_OUTCOMES.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.3);

    const yMax = d3.max(DECISION_OUTCOMES, d => d.diy + d.hire + d.defer) || 15;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    const colors = { diy: C.green, hire: C.blue, defer: C.amber };

    // Stacked bars
    DECISION_OUTCOMES.forEach(d => {
      const x = xScale(d.month) || 0;
      let y0 = innerHeight;

      // DIY
      const diyHeight = innerHeight - yScale(d.diy);
      g.append("rect")
        .attr("x", x)
        .attr("y", y0 - diyHeight)
        .attr("width", xScale.bandwidth())
        .attr("height", diyHeight)
        .attr("fill", colors.diy)
        .attr("rx", 2);
      y0 -= diyHeight;

      // Hire
      const hireHeight = innerHeight - yScale(d.hire);
      g.append("rect")
        .attr("x", x)
        .attr("y", y0 - hireHeight)
        .attr("width", xScale.bandwidth())
        .attr("height", hireHeight)
        .attr("fill", colors.hire)
        .attr("rx", 2);
      y0 -= hireHeight;

      // Defer
      const deferHeight = innerHeight - yScale(d.defer);
      g.append("rect")
        .attr("x", x)
        .attr("y", y0 - deferHeight)
        .attr("width", xScale.bandwidth())
        .attr("height", deferHeight)
        .attr("fill", colors.defer)
        .attr("rx", 2);
    });

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", C.textMuted)
      .attr("font-size", 11);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text")
      .attr("fill", C.textMuted)
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", C.grid);
    g.selectAll(".tick line").attr("stroke", C.grid);

  }, [mounted, C]);

  // Cost Comparison Chart
  useEffect(() => {
    if (!comparisonChartRef.current || !mounted) return;

    const svg = d3.select(comparisonChartRef.current);
    svg.selectAll("*").remove();

    const width = 450;
    const height = 220;
    const margin = { top: 20, right: 50, bottom: 40, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(COST_COMPARISON, d => d.pro) as number])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleBand()
      .domain(COST_COMPARISON.map(d => d.category))
      .range([0, innerHeight])
      .padding(0.3);

    const barHeight = yScale.bandwidth() / 2 - 2;

    // DIY bars
    g.selectAll(".diy-bar")
      .data(COST_COMPARISON)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.category) || 0)
      .attr("width", d => xScale(d.diy))
      .attr("height", barHeight)
      .attr("fill", C.green)
      .attr("rx", 3);

    // Pro bars
    g.selectAll(".pro-bar")
      .data(COST_COMPARISON)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => (yScale(d.category) || 0) + barHeight + 4)
      .attr("width", d => xScale(d.pro))
      .attr("height", barHeight)
      .attr("fill", C.blue)
      .attr("rx", 3);

    // Savings labels
    g.selectAll(".savings-label")
      .data(COST_COMPARISON)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.pro) + 8)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("fill", C.green)
      .attr("font-size", 11)
      .attr("font-weight", 600)
      .text(d => `+$${d.savings}`);

    // Y axis (categories)
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("fill", C.text)
      .attr("font-size", 11);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `$${d}`))
      .selectAll("text")
      .attr("fill", C.textMuted)
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", C.grid);
    g.selectAll(".tick line").attr("stroke", C.grid);

  }, [mounted, C]);

  // Pie Chart - Decision Distribution
  useEffect(() => {
    if (!pieChartRef.current || !mounted) return;

    const svg = d3.select(pieChartRef.current);
    svg.selectAll("*").remove();

    const width = 280;
    const height = 280;
    const radius = Math.min(width, height) / 2 - 20;

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<typeof DECISION_DISTRIBUTION[0]>()
      .value(d => d.value)
      .sort(null)
      .padAngle(0.02);

    const arc = d3.arc<d3.PieArcDatum<typeof DECISION_DISTRIBUTION[0]>>()
      .innerRadius(0)
      .outerRadius(radius);

    const outerArc = d3.arc<d3.PieArcDatum<typeof DECISION_DISTRIBUTION[0]>>()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    // Slices
    g.selectAll(".slice")
      .data(pie(DECISION_DISTRIBUTION))
      .enter()
      .append("path")
      .attr("d", arc as never)
      .attr("fill", d => d.data.color)
      .attr("stroke", "#111111")
      .attr("stroke-width", 2);

    // Labels
    g.selectAll(".label")
      .data(pie(DECISION_DISTRIBUTION))
      .enter()
      .append("text")
      .attr("transform", d => {
        const pos = outerArc.centroid(d);
        return `translate(${pos[0] * 1.4}, ${pos[1] * 1.4})`;
      })
      .attr("text-anchor", "middle")
      .attr("fill", C.text)
      .attr("font-size", 10)
      .text(d => `${d.data.value}%`);

  }, [mounted, C]);

  // Scatter Plot - Complexity vs Success
  useEffect(() => {
    if (!scatterChartRef.current || !mounted) return;

    const svg = d3.select(scatterChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 280;
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Grid lines
    g.selectAll(".grid-x")
      .data(d3.range(0, 11, 2))
      .enter()
      .append("line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", C.grid)
      .attr("stroke-dasharray", "2,2");

    g.selectAll(".grid-y")
      .data(d3.range(0, 101, 20))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", C.grid)
      .attr("stroke-dasharray", "2,2");

    // Scatter points
    g.selectAll(".point")
      .data(COMPLEXITY_SUCCESS)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.complexity))
      .attr("cy", d => yScale(d.success))
      .attr("r", d => d.size / 2)
      .attr("fill", d => d.type === "DIY" ? C.green : C.blue)
      .attr("fill-opacity", 0.7)
      .attr("stroke", d => d.type === "DIY" ? C.green : C.blue)
      .attr("stroke-width", 2);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll("text")
      .attr("fill", C.textMuted)
      .attr("font-size", 11);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`))
      .selectAll("text")
      .attr("fill", C.textMuted)
      .attr("font-size", 11);

    // Axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("fill", C.textMuted)
      .attr("font-size", 11)
      .text("Task Complexity");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -35)
      .attr("text-anchor", "middle")
      .attr("fill", C.textMuted)
      .attr("font-size", 11)
      .text("Success Rate");

    g.selectAll(".domain").attr("stroke", C.grid);
    g.selectAll(".tick line").attr("stroke", C.grid);

  }, [mounted, C]);

  // Radar Chart - Decision Factors
  useEffect(() => {
    if (!radarChartRef.current || !mounted) return;

    const svg = d3.select(radarChartRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;
    const levels = 5;
    const factors = ["Cost Savings", "Time Saved", "Skill Required", "Safety", "Satisfaction"];
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
        .attr("stroke", C.grid)
        .attr("stroke-dasharray", "2,2");
    }

    // Axis lines
    factors.forEach((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", radius * Math.cos(angle))
        .attr("y2", radius * Math.sin(angle))
        .attr("stroke", C.grid);

      g.append("text")
        .attr("x", (radius + 20) * Math.cos(angle))
        .attr("y", (radius + 20) * Math.sin(angle))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", C.textMuted)
        .attr("font-size", 9)
        .text(factors[i]);
    });

    // Data paths
    const radarLine = d3.lineRadial<number>()
      .radius(d => rScale(d))
      .angle((_, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    const datasets = [
      { data: Object.values(RADAR_DATA.diy), color: C.green, label: "DIY" },
      { data: Object.values(RADAR_DATA.pro), color: C.blue, label: "Pro" },
      { data: Object.values(RADAR_DATA.defer), color: C.amber, label: "Defer" },
    ];

    datasets.forEach(dataset => {
      g.append("path")
        .datum(dataset.data)
        .attr("d", radarLine as never)
        .attr("fill", dataset.color)
        .attr("fill-opacity", 0.15)
        .attr("stroke", dataset.color)
        .attr("stroke-width", 2);

      dataset.data.forEach((value, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        g.append("circle")
          .attr("cx", rScale(value) * Math.cos(angle))
          .attr("cy", rScale(value) * Math.sin(angle))
          .attr("r", 4)
          .attr("fill", dataset.color);
      });
    });

  }, [mounted, C]);

  // Decision Flow Diagram
  useEffect(() => {
    if (!flowChartRef.current || !mounted) return;

    const svg = d3.select(flowChartRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 280;

    const g = svg.append("g");

    // Node definitions
    const nodes = [
      { id: "issue", label: "Issue\nIdentified", x: 60, y: 140, color: C.purple },
      { id: "assess", label: "Assess", x: 180, y: 140, color: C.blue },
      { id: "diy", label: "DIY", x: 320, y: 60, color: C.green },
      { id: "hire", label: "Hire Pro", x: 320, y: 140, color: C.blue },
      { id: "defer", label: "Defer", x: 320, y: 220, color: C.amber },
      { id: "success", label: "Resolved", x: 460, y: 100, color: C.green },
      { id: "track", label: "Track &\nLearn", x: 540, y: 180, color: C.teal },
    ];

    // Connection definitions
    const connections = [
      { from: "issue", to: "assess" },
      { from: "assess", to: "diy" },
      { from: "assess", to: "hire" },
      { from: "assess", to: "defer" },
      { from: "diy", to: "success" },
      { from: "hire", to: "success" },
      { from: "defer", to: "track" },
      { from: "success", to: "track" },
    ];

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Draw curved connections
    connections.forEach(conn => {
      const from = nodeMap.get(conn.from)!;
      const to = nodeMap.get(conn.to)!;

      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;

      const path = `M ${from.x + 35} ${from.y} Q ${midX} ${midY} ${to.x - 35} ${to.y}`;

      g.append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", C.grid)
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead-dark)");
    });

    // Define arrowhead marker
    svg.append("defs").append("marker")
      .attr("id", "arrowhead-dark")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", C.axis);

    // Draw nodes
    nodes.forEach(node => {
      // Node circle
      g.append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", 32)
        .attr("fill", node.color)
        .attr("fill-opacity", 0.2)
        .attr("stroke", node.color)
        .attr("stroke-width", 2);

      // Node label
      const lines = node.label.split("\n");
      lines.forEach((line, i) => {
        g.append("text")
          .attr("x", node.x)
          .attr("y", node.y + (i - (lines.length - 1) / 2) * 12)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", C.text)
          .attr("font-size", 10)
          .attr("font-weight", 500)
          .text(line);
      });
    });

    // Decision labels
    g.append("text")
      .attr("x", 250)
      .attr("y", 45)
      .attr("fill", C.green)
      .attr("font-size", 9)
      .attr("font-weight", 500)
      .text("Skills + Time OK");

    g.append("text")
      .attr("x", 250)
      .attr("y", 135)
      .attr("fill", C.blue)
      .attr("font-size", 9)
      .attr("font-weight", 500)
      .text("Complex / Urgent");

    g.append("text")
      .attr("x", 250)
      .attr("y", 235)
      .attr("fill", C.amber)
      .attr("font-size", 9)
      .attr("font-weight", 500)
      .text("Not Urgent");

  }, [mounted, C]);

  // Funnel Chart - Decision Funnel
  useEffect(() => {
    if (!funnelChartRef.current || !mounted) return;

    const svg = d3.select(funnelChartRef.current);
    svg.selectAll("*").remove();

    const width = 350;
    const height = 250;
    const margin = { top: 20, right: 80, bottom: 20, left: 20 };

    const funnelData = [
      { stage: "Issues Identified", value: 100, color: C.purple },
      { stage: "Assessed", value: 85, color: C.blue },
      { stage: "Decision Made", value: 72, color: C.green },
      { stage: "Action Taken", value: 65, color: C.amber },
      { stage: "Resolved", value: 58, color: C.red },
    ];

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    const innerHeight = height - margin.top - margin.bottom;
    const stepHeight = innerHeight / funnelData.length;
    const maxWidth = width - margin.left - margin.right - 80;

    funnelData.forEach((d, i) => {
      const barWidth = (d.value / 100) * maxWidth;
      const x = (maxWidth - barWidth) / 2;
      const y = i * stepHeight;

      // Trapezoid shape
      const nextWidth = i < funnelData.length - 1
        ? (funnelData[i + 1].value / 100) * maxWidth
        : barWidth * 0.8;

      const path = `
        M ${x} ${y}
        L ${x + barWidth} ${y}
        L ${(maxWidth - nextWidth) / 2 + nextWidth} ${y + stepHeight}
        L ${(maxWidth - nextWidth) / 2} ${y + stepHeight}
        Z
      `;

      g.append("path")
        .attr("d", path)
        .attr("fill", d.color)
        .attr("fill-opacity", 0.85);

      // Labels
      g.append("text")
        .attr("x", maxWidth + 10)
        .attr("y", y + stepHeight / 2)
        .attr("dominant-baseline", "middle")
        .attr("fill", C.text)
        .attr("font-size", 10)
        .text(d.stage);

      g.append("text")
        .attr("x", maxWidth / 2)
        .attr("y", y + stepHeight / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#fff")
        .attr("font-size", 12)
        .attr("font-weight", 600)
        .text(`${d.value}%`);
    });

  }, [mounted, C]);

  if (!mounted) return null;

  return (
    <HybridPageWrapper>
      {/* Hero - Light section with dark chart panel */}
      <LightSection variant="gradient" className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/product"
              className={cn(
                "inline-flex items-center gap-2 text-sm transition-colors",
                mode === "dark"
                  ? "text-neutral-400 hover:text-teal-400"
                  : "text-neutral-500 hover:text-teal-600"
              )}
            >
              <IoArrowBack className="w-4 h-4" />
              Back to Product
            </Link>
            <ThemeToggle />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <div>
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono mb-6",
                mode === "dark"
                  ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                  : "bg-teal-50 border-teal-200 text-teal-700"
              )}>
                <IoGitBranch className="w-3.5 h-3.5" />
                Decision Framework
              </div>

              <h1 className={cn(
                "text-4xl sm:text-5xl font-bold mb-6 leading-tight",
                mode === "dark" ? "text-white" : "text-neutral-900"
              )}>
                Decision Frames,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
                  Not Recommendations
                </span>
              </h1>

              <p className={cn(
                "text-lg mb-8 leading-relaxed",
                mode === "dark" ? "text-neutral-300" : "text-neutral-600"
              )}>
                We don&apos;t tell you what to do. We show you DIY vs. hire vs. defer,
                with clear tradeoffs for each path. You make the call.
              </p>

              <div className="flex flex-wrap gap-4">
                <WaitlistModal>
                  <Button className="h-12 px-6 font-mono font-bold bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                    Join the Waitlist
                  </Button>
                </WaitlistModal>
              </div>
            </div>

            {/* Dark panel for chart */}
            <ChartContainer
              title="Decision Path Comparison"
              subtitle="Success rates, savings, and risk by decision type"
              legend={[
                { label: "DIY", color: C.green },
                { label: "Hire Pro", color: C.blue },
                { label: "Defer", color: C.amber },
              ]}
            >
              <svg ref={pathsChartRef} viewBox="0 0 400 250" className="w-full" />
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Features Grid - Light section */}
      <LightSection className="py-20 px-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="How decision frames work"
            subtitle="Every repair or maintenance issue is presented with three clear options, each with transparent tradeoffs."
          />

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <ContentCard key={i} hoverable>
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                  mode === "dark"
                    ? "bg-teal-500/20 border border-teal-500/30 text-teal-400"
                    : "bg-teal-50 border border-teal-200 text-teal-600"
                )}>
                  <IoGitBranch className="w-6 h-6" />
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

      {/* Decision Flow - Dark panel in light section */}
      <LightSection variant="subtle" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="The Decision Flow"
            subtitle="Every issue flows through our simple framework to help you make the right choice."
          />

          <ChartContainer
            title="Decision Flow Diagram"
            legend={[
              { label: "DIY Path", color: C.green, type: "circle" },
              { label: "Professional", color: C.blue, type: "circle" },
              { label: "Defer", color: C.amber, type: "circle" },
              { label: "Track & Learn", color: C.teal, type: "circle" },
            ]}
          >
            <svg ref={flowChartRef} viewBox="0 0 600 280" className="w-full" />
          </ChartContainer>
        </div>
      </LightSection>

      {/* Charts Section - All dark panels */}
      <LightSection className="py-20 px-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Data-driven decisions"
            subtitle="See real patterns from thousands of similar decisions to inform your choice."
          />

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Decision Outcomes Chart */}
            <ChartContainer
              title="Your Decision History"
              subtitle="Track how you've been making decisions over time."
              legend={[
                { label: "DIY", color: C.green },
                { label: "Hire Pro", color: C.blue },
                { label: "Defer", color: C.amber },
              ]}
            >
              <svg ref={outcomesChartRef} viewBox="0 0 400 200" className="w-full" />
            </ChartContainer>

            {/* Cost Comparison Chart */}
            <ChartContainer
              title="DIY vs Pro Cost Comparison"
              subtitle="Average costs by category. Green shows potential savings."
              legend={[
                { label: "DIY Cost", color: C.green },
                { label: "Pro Cost", color: C.blue },
              ]}
            >
              <svg ref={comparisonChartRef} viewBox="0 0 450 220" className="w-full" />
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Advanced Analytics Section */}
      <LightSection variant="subtle" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Advanced Decision Analytics"
            subtitle="Deep insights into decision patterns, complexity analysis, and outcome tracking."
          />

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Pie Chart - Decision Distribution */}
            <ChartContainer
              title="Decision Outcomes Distribution"
              subtitle="Breakdown of all decision outcomes across your projects."
              legend={DECISION_DISTRIBUTION.map(d => ({ label: d.type, color: d.color }))}
            >
              <div className="flex justify-center">
                <svg ref={pieChartRef} viewBox="0 0 280 280" className="w-full max-w-[280px]" />
              </div>
            </ChartContainer>

            {/* Scatter Plot - Complexity vs Success */}
            <ChartContainer
              title="Complexity vs Success Rate"
              subtitle="How task complexity impacts success rates for DIY vs Pro decisions."
              legend={[
                { label: "DIY Projects", color: C.green, type: "circle" },
                { label: "Pro Hired", color: C.blue, type: "circle" },
              ]}
            >
              <svg ref={scatterChartRef} viewBox="0 0 400 280" className="w-full" />
            </ChartContainer>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Radar Chart - Decision Factors */}
            <ChartContainer
              title="Decision Factor Analysis"
              subtitle="Compare key factors across all three decision paths."
              legend={[
                { label: "DIY", color: C.green },
                { label: "Pro", color: C.blue },
                { label: "Defer", color: C.amber },
              ]}
            >
              <div className="flex justify-center">
                <svg ref={radarChartRef} viewBox="0 0 300 300" className="w-full max-w-[300px]" />
              </div>
            </ChartContainer>

            {/* Funnel Chart - Decision Pipeline */}
            <ChartContainer
              title="Decision Pipeline"
              subtitle="From issue identification to resolution - see your conversion rates."
            >
              <svg ref={funnelChartRef} viewBox="0 0 350 250" className="w-full" />
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Decision Example - Light cards */}
      <LightSection className="py-20 px-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="See it in action"
            subtitle="Here's how a typical decision frame looks for a leaky faucet."
          />

          <div className="grid md:grid-cols-3 gap-6">
            {DECISION_PATHS.map((path, i) => (
              <div
                key={i}
                className={cn(
                  "p-6 rounded-xl border",
                  i === 0
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : i === 1
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-amber-500/10 border-amber-500/30"
                )}
              >
                <div className={cn(
                  "text-lg font-bold mb-4",
                  i === 0 ? "text-emerald-400" : i === 1 ? "text-blue-400" : "text-amber-400"
                )}>
                  {path.path}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className={mode === "dark" ? "text-neutral-400" : "text-neutral-600"}>Success Rate</span>
                    <span className={cn("font-semibold", mode === "dark" ? "text-white" : "text-neutral-900")}>{path.success}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={mode === "dark" ? "text-neutral-400" : "text-neutral-600"}>Avg. Savings</span>
                    <span className={cn("font-semibold", mode === "dark" ? "text-white" : "text-neutral-900")}>${path.avgSavings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={mode === "dark" ? "text-neutral-400" : "text-neutral-600"}>Time Required</span>
                    <span className={cn("font-semibold", mode === "dark" ? "text-white" : "text-neutral-900")}>{path.avgTime}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={mode === "dark" ? "text-neutral-400" : "text-neutral-600"}>Risk Level</span>
                    <span className={cn("font-semibold", mode === "dark" ? "text-white" : "text-neutral-900")}>{path.risk}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LightSection>

      {/* CTA - Light with gradient */}
      <LightSection variant="gradient" className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={cn(
            "text-3xl sm:text-4xl font-bold mb-6",
            mode === "dark" ? "text-white" : "text-neutral-900"
          )}>
            Make decisions with confidence
          </h2>
          <p className={cn(
            "mb-8",
            mode === "dark" ? "text-neutral-400" : "text-neutral-600"
          )}>
            Join the waitlist to get early access to decision frames that help you
            choose the right path for every repair.
          </p>
          <WaitlistModal>
            <Button className="h-14 px-8 font-mono font-bold text-lg bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </LightSection>
    </HybridPageWrapper>
  );
}

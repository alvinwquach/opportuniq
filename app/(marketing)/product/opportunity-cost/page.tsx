"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { IoTime } from "react-icons/io5";
import { useTheme } from "@/lib/theme-context";
import {
  LightSection,
  ChartContainer,
  ContentCard,
  SectionHeader,
  ThemeToggle,
  DARK_CHART_COLORS,
} from "@/components/ui/hybrid-layout";

/**
 * Opportunity Cost Awareness Feature Page
 *
 * Time vs. money tradeoff analysis
 * Hybrid layout: Light text sections, dark chart containers
 */

// Time value comparison
const TIME_VALUE_DATA = [
  { hourlyRate: 25, taskHours: 4, diyCost: 50, proCost: 200, netSavings: 50 },
  { hourlyRate: 50, taskHours: 4, diyCost: 50, proCost: 200, netSavings: -50 },
  { hourlyRate: 75, taskHours: 4, diyCost: 50, proCost: 200, netSavings: -150 },
  { hourlyRate: 100, taskHours: 4, diyCost: 50, proCost: 200, netSavings: -250 },
];

// Break-even analysis
const BREAKEVEN_DATA = [
  { hours: 1, diy: 50, pro: 180 },
  { hours: 2, diy: 100, pro: 180 },
  { hours: 3, diy: 150, pro: 180 },
  { hours: 4, diy: 200, pro: 180 },
  { hours: 5, diy: 250, pro: 180 },
  { hours: 6, diy: 300, pro: 180 },
];

// Task time estimates
const TASK_TIME_ESTIMATES = [
  { task: "Leaky faucet", beginner: 3, experienced: 0.5, pro: 0.25 },
  { task: "Toilet repair", beginner: 2, experienced: 0.5, pro: 0.25 },
  { task: "Light fixture", beginner: 2.5, experienced: 0.75, pro: 0.5 },
  { task: "Garbage disposal", beginner: 3, experienced: 1, pro: 0.5 },
  { task: "Water heater", beginner: 6, experienced: 2, pro: 1 },
];

// Monthly time investment
const TIME_INVESTMENT = [
  { month: "Jan", diyHours: 8, savedHours: 12 },
  { month: "Feb", diyHours: 6, savedHours: 10 },
  { month: "Mar", diyHours: 10, savedHours: 15 },
  { month: "Apr", diyHours: 4, savedHours: 8 },
  { month: "May", diyHours: 7, savedHours: 14 },
  { month: "Jun", diyHours: 5, savedHours: 11 },
];

// Cumulative savings data for area chart
const CUMULATIVE_SAVINGS = [
  { month: "Jan", savings: 150, running: 150 },
  { month: "Feb", savings: 200, running: 350 },
  { month: "Mar", savings: -100, running: 250 },
  { month: "Apr", savings: 180, running: 430 },
  { month: "May", savings: 220, running: 650 },
  { month: "Jun", savings: 280, running: 930 },
  { month: "Jul", savings: 150, running: 1080 },
  { month: "Aug", savings: 300, running: 1380 },
];

// Cost breakdown for waterfall chart
const COST_BREAKDOWN = [
  { label: "Pro Quote", value: 450, type: "start" },
  { label: "Materials", value: -85, type: "negative" },
  { label: "Tools (Owned)", value: 0, type: "neutral" },
  { label: "Time Cost", value: -200, type: "negative" },
  { label: "Risk Premium", value: -50, type: "negative" },
  { label: "DIY Total", value: 115, type: "end" },
];

// Project comparison bubble chart data
const PROJECT_COMPARISON = [
  { name: "Faucet", hours: 2, savings: 120, difficulty: 2 },
  { name: "Toilet", hours: 1.5, savings: 100, difficulty: 1 },
  { name: "Light Fix", hours: 1, savings: 80, difficulty: 2 },
  { name: "Disposal", hours: 3, savings: 180, difficulty: 3 },
  { name: "Water Heater", hours: 6, savings: -150, difficulty: 5 },
  { name: "Drywall", hours: 4, savings: 220, difficulty: 3 },
  { name: "Paint Room", hours: 8, savings: 400, difficulty: 2 },
];

// ROI by category for radial chart
const ROI_BY_CATEGORY = [
  { category: "Plumbing", roi: 85 },
  { category: "Electrical", roi: 45 },
  { category: "HVAC", roi: 30 },
  { category: "Appliance", roi: 92 },
  { category: "Outdoor", roi: 78 },
  { category: "Painting", roi: 95 },
];

const FEATURES = [
  {
    title: "Hourly Rate Calculator",
    description: "Input your effective hourly rate and see the true cost of DIY time investment.",
  },
  {
    title: "Break-Even Analysis",
    description: "Know exactly when DIY stops making financial sense based on your time value.",
  },
  {
    title: "Learning Curve Factor",
    description: "First-time tasks take longer. We factor in the learning curve for accurate estimates.",
  },
  {
    title: "Time Tracking",
    description: "Log actual time spent to improve future estimates and build your efficiency profile.",
  },
];

export default function OpportunityCostPage() {
  const { mode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(50);
  const breakevenChartRef = useRef<SVGSVGElement>(null);
  const timeComparisonRef = useRef<SVGSVGElement>(null);
  const investmentChartRef = useRef<SVGSVGElement>(null);
  const cumulativeChartRef = useRef<SVGSVGElement>(null);
  const waterfallChartRef = useRef<SVGSVGElement>(null);
  const bubbleChartRef = useRef<SVGSVGElement>(null);
  const radialChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Break-even Chart (Dark mode)
  useEffect(() => {
    if (!breakevenChartRef.current || !mounted) return;

    const svg = d3.select(breakevenChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 220;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Calculate DIY cost with time value
    const diyWithTime = BREAKEVEN_DATA.map(d => ({
      ...d,
      diyTotal: d.diy + (d.hours * hourlyRate),
    }));

    const xScale = d3.scaleLinear()
      .domain([1, 6])
      .range([0, innerWidth]);

    const yMax = Math.max(
      d3.max(diyWithTime, d => d.diyTotal) as number,
      d3.max(BREAKEVEN_DATA, d => d.pro) as number
    );
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    // Pro cost line (flat)
    const proLine = d3.line<typeof BREAKEVEN_DATA[0]>()
      .x(d => xScale(d.hours))
      .y(d => yScale(d.pro))
      .curve(d3.curveLinear);

    g.append("path")
      .datum(BREAKEVEN_DATA)
      .attr("d", proLine)
      .attr("fill", "none")
      .attr("stroke", DARK_CHART_COLORS.blue)
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "8,4");

    // DIY total cost line
    const diyLine = d3.line<typeof diyWithTime[0]>()
      .x(d => xScale(d.hours))
      .y(d => yScale(d.diyTotal))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(diyWithTime)
      .attr("d", diyLine)
      .attr("fill", "none")
      .attr("stroke", DARK_CHART_COLORS.green)
      .attr("stroke-width", 3);

    // Find intersection
    const breakeven = diyWithTime.find(d => d.diyTotal >= d.pro);
    if (breakeven) {
      g.append("circle")
        .attr("cx", xScale(breakeven.hours))
        .attr("cy", yScale(breakeven.diyTotal))
        .attr("r", 8)
        .attr("fill", DARK_CHART_COLORS.amber)
        .attr("stroke", DARK_CHART_COLORS.background)
        .attr("stroke-width", 2);

      g.append("text")
        .attr("x", xScale(breakeven.hours))
        .attr("y", yScale(breakeven.diyTotal) - 15)
        .attr("text-anchor", "middle")
        .attr("fill", DARK_CHART_COLORS.amber)
        .attr("font-size", 11)
        .attr("font-weight", 600)
        .text(`Break-even: ${breakeven.hours}h`);
    }

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => `${d}h`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d}`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

    // X axis label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 35)
      .attr("text-anchor", "middle")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11)
      .text("Time Spent (hours)");

  }, [mounted, hourlyRate]);

  // Time Comparison Chart (Dark mode)
  useEffect(() => {
    if (!timeComparisonRef.current || !mounted) return;

    const svg = d3.select(timeComparisonRef.current);
    svg.selectAll("*").remove();

    const width = 450;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(TASK_TIME_ESTIMATES, d => d.beginner) as number])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(TASK_TIME_ESTIMATES.map(d => d.task))
      .range([0, innerHeight])
      .padding(0.3);

    const barHeight = yScale.bandwidth() / 3 - 1;
    const colors = [DARK_CHART_COLORS.red, DARK_CHART_COLORS.amber, DARK_CHART_COLORS.green];

    TASK_TIME_ESTIMATES.forEach(d => {
      const values = [d.beginner, d.experienced, d.pro];
      const y = yScale(d.task) || 0;

      values.forEach((value, i) => {
        g.append("rect")
          .attr("x", 0)
          .attr("y", y + i * (barHeight + 1))
          .attr("width", xScale(value))
          .attr("height", barHeight)
          .attr("fill", colors[i])
          .attr("rx", 2);

        g.append("text")
          .attr("x", xScale(value) + 5)
          .attr("y", y + i * (barHeight + 1) + barHeight / 2 + 3)
          .attr("fill", colors[i])
          .attr("font-size", 10)
          .attr("font-weight", 600)
          .text(`${value}h`);
      });
    });

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Time Investment Chart (Dark mode)
  useEffect(() => {
    if (!investmentChartRef.current || !mounted) return;

    const svg = d3.select(investmentChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 180;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(TIME_INVESTMENT.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.3);

    const yMax = d3.max(TIME_INVESTMENT, d => Math.max(d.diyHours, d.savedHours)) as number;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    const barWidth = xScale.bandwidth() / 2 - 2;

    // DIY hours bars
    g.selectAll(".diy-bar")
      .data(TIME_INVESTMENT)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.month) || 0)
      .attr("y", d => yScale(d.diyHours))
      .attr("width", barWidth)
      .attr("height", d => innerHeight - yScale(d.diyHours))
      .attr("fill", DARK_CHART_COLORS.blue)
      .attr("rx", 3);

    // Saved hours bars
    g.selectAll(".saved-bar")
      .data(TIME_INVESTMENT)
      .enter()
      .append("rect")
      .attr("x", d => (xScale(d.month) || 0) + barWidth + 4)
      .attr("y", d => yScale(d.savedHours))
      .attr("width", barWidth)
      .attr("height", d => innerHeight - yScale(d.savedHours))
      .attr("fill", DARK_CHART_COLORS.green)
      .attr("rx", 3);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}h`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Cumulative Savings Area Chart (Dark mode)
  useEffect(() => {
    if (!cumulativeChartRef.current || !mounted) return;

    const svg = d3.select(cumulativeChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 220;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scalePoint()
      .domain(CUMULATIVE_SAVINGS.map(d => d.month))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(CUMULATIVE_SAVINGS, d => d.running) as number])
      .range([innerHeight, 0])
      .nice();

    // Gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "savingsGradientDark")
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

    // Area
    const area = d3.area<typeof CUMULATIVE_SAVINGS[0]>()
      .x(d => xScale(d.month) || 0)
      .y0(innerHeight)
      .y1(d => yScale(d.running))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(CUMULATIVE_SAVINGS)
      .attr("d", area)
      .attr("fill", "url(#savingsGradientDark)");

    // Line
    const line = d3.line<typeof CUMULATIVE_SAVINGS[0]>()
      .x(d => xScale(d.month) || 0)
      .y(d => yScale(d.running))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(CUMULATIVE_SAVINGS)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", DARK_CHART_COLORS.green)
      .attr("stroke-width", 3);

    // Points with values
    g.selectAll(".point")
      .data(CUMULATIVE_SAVINGS)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.month) || 0)
      .attr("cy", d => yScale(d.running))
      .attr("r", 5)
      .attr("fill", DARK_CHART_COLORS.green)
      .attr("stroke", DARK_CHART_COLORS.background)
      .attr("stroke-width", 2);

    // Value labels
    g.selectAll(".value-label")
      .data(CUMULATIVE_SAVINGS)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.month) || 0)
      .attr("y", d => yScale(d.running) - 12)
      .attr("text-anchor", "middle")
      .attr("fill", DARK_CHART_COLORS.green)
      .attr("font-size", 9)
      .attr("font-weight", 600)
      .text(d => `$${d.running}`);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d}`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Waterfall Chart - Cost Breakdown (Dark mode)
  useEffect(() => {
    if (!waterfallChartRef.current || !mounted) return;

    const svg = d3.select(waterfallChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 250;
    const margin = { top: 30, right: 20, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(COST_BREAKDOWN.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, 500])
      .range([innerHeight, 0]);

    let runningTotal = 0;

    COST_BREAKDOWN.forEach((d) => {
      const x = xScale(d.label) || 0;
      let y0: number, height: number;

      if (d.type === "start") {
        y0 = yScale(d.value);
        height = innerHeight - yScale(d.value);
        runningTotal = d.value;
      } else if (d.type === "end") {
        y0 = yScale(d.value);
        height = innerHeight - yScale(d.value);
      } else {
        const prevTotal = runningTotal;
        runningTotal += d.value;
        if (d.value < 0) {
          y0 = yScale(prevTotal);
          height = yScale(runningTotal) - yScale(prevTotal);
        } else {
          y0 = yScale(runningTotal);
          height = yScale(prevTotal) - yScale(runningTotal);
        }
      }

      // Bar
      g.append("rect")
        .attr("x", x)
        .attr("y", y0!)
        .attr("width", xScale.bandwidth())
        .attr("height", Math.abs(height!))
        .attr("fill", d.type === "start" ? DARK_CHART_COLORS.blue : d.type === "end" ? DARK_CHART_COLORS.green : d.value < 0 ? DARK_CHART_COLORS.red : DARK_CHART_COLORS.amber)
        .attr("rx", 3);

      // Value label
      g.append("text")
        .attr("x", x + xScale.bandwidth() / 2)
        .attr("y", y0! - 5)
        .attr("text-anchor", "middle")
        .attr("fill", d.type === "start" ? DARK_CHART_COLORS.blue : d.type === "end" ? DARK_CHART_COLORS.green : d.value < 0 ? DARK_CHART_COLORS.red : DARK_CHART_COLORS.amber)
        .attr("font-size", 10)
        .attr("font-weight", 600)
        .text(d.type === "start" || d.type === "end" ? `$${d.value}` : `${d.value >= 0 ? "+" : ""}$${d.value}`);
    });

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 9)
      .attr("transform", "rotate(-25)")
      .attr("text-anchor", "end");

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Bubble Chart - Project Comparison (Dark mode)
  useEffect(() => {
    if (!bubbleChartRef.current || !mounted) return;

    const svg = d3.select(bubbleChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 280;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([-200, 500])
      .range([innerHeight, 0]);

    const sizeScale = d3.scaleLinear()
      .domain([1, 5])
      .range([8, 25]);

    // Grid
    g.selectAll(".grid-x")
      .data([2, 4, 6, 8])
      .enter()
      .append("line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", DARK_CHART_COLORS.grid)
      .attr("stroke-dasharray", "2,2");

    // Zero line
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", DARK_CHART_COLORS.textMuted)
      .attr("stroke-width", 1);

    // Bubbles
    g.selectAll(".bubble")
      .data(PROJECT_COMPARISON)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.hours))
      .attr("cy", d => yScale(d.savings))
      .attr("r", d => sizeScale(d.difficulty))
      .attr("fill", d => d.savings >= 0 ? DARK_CHART_COLORS.green : DARK_CHART_COLORS.red)
      .attr("fill-opacity", 0.6)
      .attr("stroke", d => d.savings >= 0 ? DARK_CHART_COLORS.green : DARK_CHART_COLORS.red)
      .attr("stroke-width", 2);

    // Labels
    g.selectAll(".bubble-label")
      .data(PROJECT_COMPARISON)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.hours))
      .attr("y", d => yScale(d.savings) - sizeScale(d.difficulty) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 9)
      .text(d => d.name);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}h`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d}`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    // Axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11)
      .text("Time Investment (hours)");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11)
      .text("Net Savings");

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Radial Bar Chart - ROI by Category (Dark mode)
  useEffect(() => {
    if (!radialChartRef.current || !mounted) return;

    const svg = d3.select(radialChartRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const angleScale = d3.scaleBand()
      .domain(ROI_BY_CATEGORY.map(d => d.category))
      .range([0, 2 * Math.PI])
      .padding(0.1);

    const radiusScale = d3.scaleLinear()
      .domain([0, 100])
      .range([30, radius]);

    // Background arcs
    g.selectAll(".bg-arc")
      .data(ROI_BY_CATEGORY)
      .enter()
      .append("path")
      .attr("d", d3.arc<typeof ROI_BY_CATEGORY[0]>()
        .innerRadius(30)
        .outerRadius(radius)
        .startAngle(d => angleScale(d.category) || 0)
        .endAngle(d => (angleScale(d.category) || 0) + angleScale.bandwidth()) as never
      )
      .attr("fill", DARK_CHART_COLORS.grid);

    // Value arcs
    g.selectAll(".value-arc")
      .data(ROI_BY_CATEGORY)
      .enter()
      .append("path")
      .attr("d", d3.arc<typeof ROI_BY_CATEGORY[0]>()
        .innerRadius(30)
        .outerRadius(d => radiusScale(d.roi))
        .startAngle(d => angleScale(d.category) || 0)
        .endAngle(d => (angleScale(d.category) || 0) + angleScale.bandwidth())
        .padAngle(0.02)
        .cornerRadius(3) as never
      )
      .attr("fill", d => d.roi >= 80 ? DARK_CHART_COLORS.green : d.roi >= 50 ? DARK_CHART_COLORS.amber : DARK_CHART_COLORS.red);

    // Labels
    g.selectAll(".label")
      .data(ROI_BY_CATEGORY)
      .enter()
      .append("text")
      .attr("transform", d => {
        const angle = (angleScale(d.category) || 0) + angleScale.bandwidth() / 2 - Math.PI / 2;
        const r = radius + 20;
        return `translate(${r * Math.cos(angle)}, ${r * Math.sin(angle)})`;
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 9)
      .text(d => d.category);

    // Center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 20)
      .attr("font-weight", 700)
      .text("ROI");

  }, [mounted]);

  if (!mounted) return null;

  // Calculate current savings/loss
  const taskHours = 4;
  const diyCost = 50;
  const proCost = 200;
  const timeCost = taskHours * hourlyRate;
  const totalDiyCost = diyCost + timeCost;
  const netSavings = proCost - totalDiyCost;

  return (
    <>
      {/* Hero */}
      <LightSection variant="gradient" className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/product"
              className={`inline-flex items-center gap-2 text-sm transition-colors ${
                mode === "dark" ? "text-neutral-400 hover:text-teal-400" : "text-neutral-500 hover:text-teal-600"
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
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}>
                <IoTime className="w-3.5 h-3.5" />
                Time Value
              </div>

              <h1 className={`text-4xl sm:text-5xl font-bold mb-6 leading-tight ${
                mode === "dark" ? "text-white" : "text-neutral-900"
              }`}>
                Opportunity Cost{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                  Awareness
                </span>
              </h1>

              <p className={`text-lg mb-8 leading-relaxed ${
                mode === "dark" ? "text-neutral-400" : "text-neutral-600"
              }`}>
                If your time is worth $50/hour and a repair takes 4 hours, the
                &ldquo;savings&rdquo; might not be savings. We help you see the real math.
              </p>

              <div className="flex flex-wrap gap-4">
                <WaitlistModal>
                  <Button className="h-12 px-6 font-mono font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300">
                    Join the Waitlist
                  </Button>
                </WaitlistModal>
              </div>
            </div>

            {/* Interactive Calculator */}
            <ContentCard className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>
                Quick Calculator
              </h3>

              <div className="mb-6">
                <label className={`block text-sm mb-2 ${mode === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
                  Your hourly rate: <span className="text-amber-500 font-bold">${hourlyRate}</span>
                </label>
                <input
                  type="range"
                  min="15"
                  max="150"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className={`flex justify-between text-xs mt-1 ${mode === "dark" ? "text-neutral-500" : "text-neutral-400"}`}>
                  <span>$15</span>
                  <span>$150</span>
                </div>
              </div>

              <div className={`space-y-3 p-4 rounded-lg ${mode === "dark" ? "bg-neutral-900" : "bg-neutral-50"}`}>
                <div className="flex justify-between text-sm">
                  <span className={mode === "dark" ? "text-neutral-400" : "text-neutral-600"}>Material cost:</span>
                  <span className={`font-mono ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>${diyCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={mode === "dark" ? "text-neutral-400" : "text-neutral-600"}>Time cost ({taskHours}h x ${hourlyRate}):</span>
                  <span className={`font-mono ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>${timeCost}</span>
                </div>
                <div className={`flex justify-between text-sm border-t pt-3 ${mode === "dark" ? "border-neutral-800" : "border-neutral-200"}`}>
                  <span className={mode === "dark" ? "text-neutral-400" : "text-neutral-600"}>Total DIY cost:</span>
                  <span className={`font-mono font-bold ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>${totalDiyCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={mode === "dark" ? "text-neutral-400" : "text-neutral-600"}>Pro cost:</span>
                  <span className={`font-mono ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>${proCost}</span>
                </div>
                <div className={`flex justify-between text-sm border-t pt-3 font-bold ${
                  mode === "dark" ? "border-neutral-800" : "border-neutral-200"
                } ${netSavings >= 0 ? "text-green-500" : "text-red-500"}`}>
                  <span>Net {netSavings >= 0 ? "savings" : "loss"}:</span>
                  <span className="font-mono">${Math.abs(netSavings)}</span>
                </div>
              </div>

              <div className={`mt-4 p-3 rounded-lg text-sm ${
                netSavings >= 0
                  ? "bg-green-500/10 border border-green-500/30 text-green-500"
                  : "bg-red-500/10 border border-red-500/30 text-red-500"
              }`}>
                {netSavings >= 0
                  ? "DIY makes sense at your hourly rate!"
                  : "Consider hiring a pro - DIY costs more than your time is worth."}
              </div>
            </ContentCard>
          </div>
        </div>
      </LightSection>

      {/* Break-even Section */}
      <LightSection className="py-20 px-6 border-t border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ChartContainer
              title="Break-Even Analysis"
              subtitle={`@$${hourlyRate}/hr`}
              legend={[
                { label: "DIY Total Cost", color: DARK_CHART_COLORS.green },
                { label: "Pro Cost", color: DARK_CHART_COLORS.blue },
              ]}
            >
              <svg ref={breakevenChartRef} viewBox="0 0 400 220" className="w-full" />
            </ChartContainer>

            <div>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>
                Find your break-even point
              </h2>
              <p className={`mb-6 leading-relaxed ${mode === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
                The break-even point shows exactly when DIY stops making financial sense.
                For quick repairs, DIY often wins. For complex, time-consuming tasks,
                hiring out may actually save you money.
              </p>

              <div className="space-y-4">
                {TIME_VALUE_DATA.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.netSavings >= 0
                        ? "border-green-500/30 bg-green-500/10"
                        : "border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    <span className={`text-sm ${mode === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
                      @${item.hourlyRate}/hr
                    </span>
                    <span className={`text-sm font-mono font-bold ${
                      item.netSavings >= 0 ? "text-green-500" : "text-red-500"
                    }`}>
                      {item.netSavings >= 0 ? "+" : ""}{item.netSavings}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LightSection>

      {/* Time Comparison Section */}
      <LightSection variant="subtle" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Experience matters"
            subtitle="First-time DIYers take 3-6x longer than pros. We factor this into your cost calculations."
          />

          <div className="grid lg:grid-cols-2 gap-8">
            <ChartContainer
              title="Time by Experience Level"
              subtitle="Estimated hours for common repairs."
              legend={[
                { label: "Beginner", color: DARK_CHART_COLORS.red },
                { label: "Experienced", color: DARK_CHART_COLORS.amber },
                { label: "Pro", color: DARK_CHART_COLORS.green },
              ]}
            >
              <svg ref={timeComparisonRef} viewBox="0 0 450 200" className="w-full" />
            </ChartContainer>

            <ChartContainer
              title="Your Time Investment"
              subtitle="Hours spent on DIY vs. hours saved by hiring pros."
              legend={[
                { label: "DIY Hours", color: DARK_CHART_COLORS.blue },
                { label: "Hours Saved (Pro)", color: DARK_CHART_COLORS.green },
              ]}
            >
              <svg ref={investmentChartRef} viewBox="0 0 400 180" className="w-full" />
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Advanced Analytics Section */}
      <LightSection className="py-20 px-6 border-t border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Deep Cost Analytics"
            subtitle="Comprehensive analysis of your DIY decisions with advanced visualizations."
          />

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <ChartContainer
              title="Cumulative Savings"
              subtitle="Running total of your DIY savings over time."
            >
              <svg ref={cumulativeChartRef} viewBox="0 0 400 220" className="w-full" />
            </ChartContainer>

            <ChartContainer
              title="Cost Breakdown"
              subtitle="Waterfall analysis: from pro quote to your actual savings."
            >
              <svg ref={waterfallChartRef} viewBox="0 0 400 250" className="w-full" />
            </ChartContainer>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <ChartContainer
              title="Project Comparison"
              subtitle="Time vs savings by project. Bubble size = difficulty."
              legend={[
                { label: "Profitable", color: DARK_CHART_COLORS.green },
                { label: "Not Profitable", color: DARK_CHART_COLORS.red },
              ]}
            >
              <svg ref={bubbleChartRef} viewBox="0 0 400 280" className="w-full" />
            </ChartContainer>

            <ChartContainer
              title="DIY ROI by Category"
              subtitle="Return on investment for DIY efforts by repair type."
              legend={[
                { label: "High ROI (80%+)", color: DARK_CHART_COLORS.green },
                { label: "Medium", color: DARK_CHART_COLORS.amber },
                { label: "Low ROI", color: DARK_CHART_COLORS.red },
              ]}
            >
              <div className="flex justify-center">
                <svg ref={radialChartRef} viewBox="0 0 300 300" className="w-full max-w-[300px]" />
              </div>
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Features Grid */}
      <LightSection variant="subtle" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <ContentCard key={i} hoverable>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  mode === "dark"
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                    : "bg-amber-50 border border-amber-200 text-amber-600"
                }`}>
                  <IoTime className="w-6 h-6" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed ${mode === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
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
          <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>
            Know the true cost of your time
          </h2>
          <p className={`mb-8 ${mode === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
            Get personalized opportunity cost analysis for every repair decision.
          </p>
          <WaitlistModal>
            <Button className="h-14 px-8 font-mono font-bold text-lg bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </LightSection>
    </>
  );
}

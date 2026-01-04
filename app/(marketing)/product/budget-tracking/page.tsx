"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { IoWallet } from "react-icons/io5";
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
 * Budget & Expense Tracking Feature Page
 *
 * Personal and shared budget and expense tracking with spending insights
 * Hybrid layout: light mode for text, dark containers for charts
 */

// Monthly spending data
const MONTHLY_SPENDING = [
  { month: "Jan", repairs: 320, contractors: 450, projects: 180 },
  { month: "Feb", repairs: 180, contractors: 280, projects: 120 },
  { month: "Mar", repairs: 420, contractors: 350, projects: 250 },
  { month: "Apr", repairs: 280, contractors: 180, projects: 90 },
  { month: "May", repairs: 350, contractors: 420, projects: 310 },
  { month: "Jun", repairs: 190, contractors: 520, projects: 180 },
];

// Category breakdown
const CATEGORY_BREAKDOWN = [
  { category: "Plumbing", amount: 1240, percentage: 28 },
  { category: "Electrical", amount: 890, percentage: 20 },
  { category: "HVAC", amount: 780, percentage: 18 },
  { category: "Appliance", amount: 650, percentage: 15 },
  { category: "Outdoor", amount: 520, percentage: 12 },
  { category: "Other", amount: 320, percentage: 7 },
];

// Budget vs Actual
const BUDGET_VS_ACTUAL = [
  { category: "Repairs", budget: 500, actual: 420, variance: -80 },
  { category: "Contractors", budget: 800, actual: 650, variance: -150 },
  { category: "Materials", budget: 300, actual: 380, variance: 80 },
  { category: "Tools", budget: 200, actual: 180, variance: -20 },
  { category: "Emergency", budget: 400, actual: 520, variance: 120 },
];

// Savings over time
const SAVINGS_TREND = [
  { month: "Jan", savings: 180 },
  { month: "Feb", savings: 340 },
  { month: "Mar", savings: 520 },
  { month: "Apr", savings: 680 },
  { month: "May", savings: 920 },
  { month: "Jun", savings: 1180 },
];

// Expense treemap data
const EXPENSE_TREEMAP = [
  { name: "Plumber", value: 450, category: "Labor" },
  { name: "Electrician", value: 320, category: "Labor" },
  { name: "HVAC Tech", value: 280, category: "Labor" },
  { name: "Pipes", value: 180, category: "Materials" },
  { name: "Fixtures", value: 220, category: "Materials" },
  { name: "Tools", value: 150, category: "Equipment" },
  { name: "Supplies", value: 120, category: "Materials" },
  { name: "Rentals", value: 90, category: "Equipment" },
];

// Monthly comparison data
const MONTHLY_COMPARISON = [
  { month: "Jan", thisYear: 750, lastYear: 620 },
  { month: "Feb", thisYear: 580, lastYear: 710 },
  { month: "Mar", thisYear: 1020, lastYear: 890 },
  { month: "Apr", thisYear: 550, lastYear: 680 },
  { month: "May", thisYear: 1080, lastYear: 820 },
  { month: "Jun", thisYear: 890, lastYear: 950 },
];

// Spending velocity data
const SPENDING_VELOCITY = [
  { day: 1, amount: 0 },
  { day: 5, amount: 120 },
  { day: 8, amount: 280 },
  { day: 12, amount: 380 },
  { day: 15, amount: 520 },
  { day: 18, amount: 650 },
  { day: 22, amount: 780 },
  { day: 25, amount: 920 },
  { day: 28, amount: 1050 },
  { day: 30, amount: 1180 },
];

const FEATURES = [
  {
    title: "Category Tracking",
    description: "Track spending across plumbing, electrical, HVAC, appliances, and more with automatic categorization.",
  },
  {
    title: "Budget Alerts",
    description: "Set monthly budgets and get notified when you're approaching or exceeding limits.",
  },
  {
    title: "Trend Analysis",
    description: "See spending patterns over time. Identify seasonal spikes and plan ahead.",
  },
  {
    title: "Savings Calculator",
    description: "Track cumulative savings from DIY decisions vs. what you would have paid pros.",
  },
];

export default function BudgetTrackingPage() {
  const { mode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const spendingChartRef = useRef<SVGSVGElement>(null);
  const categoryChartRef = useRef<SVGSVGElement>(null);
  const budgetChartRef = useRef<SVGSVGElement>(null);
  const savingsChartRef = useRef<SVGSVGElement>(null);
  const treemapRef = useRef<SVGSVGElement>(null);
  const gaugeRef = useRef<SVGSVGElement>(null);
  const lollipopRef = useRef<SVGSVGElement>(null);
  const velocityRef = useRef<SVGSVGElement>(null);
  const breakdownChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stacked Spending Chart
  useEffect(() => {
    if (!spendingChartRef.current || !mounted) return;

    const svg = d3.select(spendingChartRef.current);
    svg.selectAll("*").remove();

    const width = 450;
    const height = 220;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(MONTHLY_SPENDING.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.3);

    const yMax = d3.max(MONTHLY_SPENDING, d => d.repairs + d.contractors + d.projects) || 1000;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    const colors = { repairs: DARK_CHART_COLORS.green, contractors: DARK_CHART_COLORS.blue, projects: DARK_CHART_COLORS.amber };

    // Stacked bars
    MONTHLY_SPENDING.forEach(d => {
      const x = xScale(d.month) || 0;
      let y0 = innerHeight;

      // Repairs
      const repairsHeight = innerHeight - yScale(d.repairs);
      g.append("rect")
        .attr("x", x)
        .attr("y", y0 - repairsHeight)
        .attr("width", xScale.bandwidth())
        .attr("height", repairsHeight)
        .attr("fill", colors.repairs)
        .attr("rx", 2);
      y0 -= repairsHeight;

      // Contractors
      const contractorsHeight = innerHeight - yScale(d.contractors);
      g.append("rect")
        .attr("x", x)
        .attr("y", y0 - contractorsHeight)
        .attr("width", xScale.bandwidth())
        .attr("height", contractorsHeight)
        .attr("fill", colors.contractors)
        .attr("rx", 2);
      y0 -= contractorsHeight;

      // Projects
      const projectsHeight = innerHeight - yScale(d.projects);
      g.append("rect")
        .attr("x", x)
        .attr("y", y0 - projectsHeight)
        .attr("width", xScale.bandwidth())
        .attr("height", projectsHeight)
        .attr("fill", colors.projects)
        .attr("rx", 2);
    });

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
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

  }, [mounted]);

  // Category Donut Chart
  useEffect(() => {
    if (!categoryChartRef.current || !mounted) return;

    const svg = d3.select(categoryChartRef.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 200;
    const radius = 80;

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const colors = [DARK_CHART_COLORS.green, DARK_CHART_COLORS.blue, DARK_CHART_COLORS.amber, DARK_CHART_COLORS.red, DARK_CHART_COLORS.purple, DARK_CHART_COLORS.textMuted];

    const pie = d3.pie<typeof CATEGORY_BREAKDOWN[0]>()
      .value(d => d.amount)
      .sort(null)
      .padAngle(0.02);

    const arc = d3.arc<d3.PieArcDatum<typeof CATEGORY_BREAKDOWN[0]>>()
      .innerRadius(radius - 25)
      .outerRadius(radius);

    g.selectAll(".arc")
      .data(pie(CATEGORY_BREAKDOWN))
      .enter()
      .append("path")
      .attr("d", arc as never)
      .attr("fill", (_, i) => colors[i]);

    // Center text
    const total = CATEGORY_BREAKDOWN.reduce((sum, d) => sum + d.amount, 0);
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 18)
      .attr("font-weight", 700)
      .attr("y", -8)
      .text(`$${(total / 1000).toFixed(1)}k`);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 12)
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11)
      .text("Total Spent");

  }, [mounted]);

  // Budget vs Actual Chart
  useEffect(() => {
    if (!budgetChartRef.current || !mounted) return;

    const svg = d3.select(budgetChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 80, bottom: 20, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xMax = d3.max(BUDGET_VS_ACTUAL, d => Math.max(d.budget, d.actual)) as number;
    const xScale = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(BUDGET_VS_ACTUAL.map(d => d.category))
      .range([0, innerHeight])
      .padding(0.4);

    const barHeight = yScale.bandwidth() / 2 - 1;

    // Budget bars (background)
    g.selectAll(".budget-bar")
      .data(BUDGET_VS_ACTUAL)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.category) || 0)
      .attr("width", d => xScale(d.budget))
      .attr("height", barHeight)
      .attr("fill", DARK_CHART_COLORS.grid)
      .attr("rx", 3);

    // Actual bars
    g.selectAll(".actual-bar")
      .data(BUDGET_VS_ACTUAL)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => (yScale(d.category) || 0) + barHeight + 2)
      .attr("width", d => xScale(d.actual))
      .attr("height", barHeight)
      .attr("fill", d => d.variance <= 0 ? DARK_CHART_COLORS.green : DARK_CHART_COLORS.red)
      .attr("rx", 3);

    // Variance labels
    g.selectAll(".variance")
      .data(BUDGET_VS_ACTUAL)
      .enter()
      .append("text")
      .attr("x", innerWidth + 10)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("fill", d => d.variance <= 0 ? DARK_CHART_COLORS.green : DARK_CHART_COLORS.red)
      .attr("font-size", 11)
      .attr("font-weight", 600)
      .text(d => `${d.variance >= 0 ? "+" : ""}$${d.variance}`);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Cumulative Savings Chart
  useEffect(() => {
    if (!savingsChartRef.current || !mounted) return;

    const svg = d3.select(savingsChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 180;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scalePoint()
      .domain(SAVINGS_TREND.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.5);

    const yMax = d3.max(SAVINGS_TREND, d => d.savings) as number;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    // Area
    const area = d3.area<typeof SAVINGS_TREND[0]>()
      .x(d => xScale(d.month) || 0)
      .y0(innerHeight)
      .y1(d => yScale(d.savings))
      .curve(d3.curveMonotoneX);

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
      .attr("stop-opacity", 0.05);

    g.append("path")
      .datum(SAVINGS_TREND)
      .attr("d", area)
      .attr("fill", "url(#savingsGradientDark)");

    // Line
    const line = d3.line<typeof SAVINGS_TREND[0]>()
      .x(d => xScale(d.month) || 0)
      .y(d => yScale(d.savings))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(SAVINGS_TREND)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", DARK_CHART_COLORS.green)
      .attr("stroke-width", 3);

    // Dots
    g.selectAll(".dot")
      .data(SAVINGS_TREND)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.month) || 0)
      .attr("cy", d => yScale(d.savings))
      .attr("r", 5)
      .attr("fill", DARK_CHART_COLORS.green)
      .attr("stroke", DARK_CHART_COLORS.background)
      .attr("stroke-width", 2);

    // Value labels
    g.selectAll(".value-label")
      .data(SAVINGS_TREND)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.month) || 0)
      .attr("y", d => yScale(d.savings) - 12)
      .attr("text-anchor", "middle")
      .attr("fill", DARK_CHART_COLORS.green)
      .attr("font-size", 10)
      .attr("font-weight", 600)
      .text(d => `$${d.savings}`);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Treemap Chart
  useEffect(() => {
    if (!treemapRef.current || !mounted) return;

    const svg = d3.select(treemapRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 250;

    const categoryColors: Record<string, string> = {
      Labor: DARK_CHART_COLORS.blue,
      Materials: DARK_CHART_COLORS.green,
      Equipment: DARK_CHART_COLORS.amber,
    };

    type TreemapNode = { name?: string; value?: number; category?: string; children?: TreemapNode[] };
    const root = d3.hierarchy<TreemapNode>({ children: EXPENSE_TREEMAP })
      .sum(d => d.value || 0);

    d3.treemap<TreemapNode>()
      .size([width, height])
      .padding(2)(root as d3.HierarchyRectangularNode<TreemapNode>);

    const g = svg.append("g");
    const leaves = root.leaves() as d3.HierarchyRectangularNode<TreemapNode>[];

    g.selectAll(".cell")
      .data(leaves)
      .enter()
      .append("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => categoryColors[d.data.category || ""] || "#666")
      .attr("fill-opacity", 0.9)
      .attr("rx", 4);

    g.selectAll(".label")
      .data(leaves)
      .enter()
      .append("text")
      .attr("x", d => (d.x0 + d.x1) / 2)
      .attr("y", d => (d.y0 + d.y1) / 2 - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", 10)
      .attr("font-weight", 600)
      .text(d => d.data.name || "");

    g.selectAll(".value")
      .data(leaves)
      .enter()
      .append("text")
      .attr("x", d => (d.x0 + d.x1) / 2)
      .attr("y", d => (d.y0 + d.y1) / 2 + 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("fill-opacity", 0.8)
      .attr("font-size", 9)
      .text(d => `$${d.data.value || 0}`);

  }, [mounted]);

  // Budget Health Gauge
  useEffect(() => {
    if (!gaugeRef.current || !mounted) return;

    const svg = d3.select(gaugeRef.current);
    svg.selectAll("*").remove();

    const width = 280;
    const height = 160;
    const radius = 100;
    const budgetHealth = 72; // percentage

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height - 15})`);

    // Background arc
    const bgArc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append("path")
      .attr("d", bgArc as never)
      .attr("fill", DARK_CHART_COLORS.grid);

    // Health arc
    const healthAngle = -Math.PI / 2 + (Math.PI * budgetHealth / 100);

    const healthArc = d3.arc()
      .innerRadius(radius - 18)
      .outerRadius(radius - 2)
      .startAngle(-Math.PI / 2)
      .endAngle(healthAngle);

    g.append("path")
      .attr("d", healthArc as never)
      .attr("fill", budgetHealth >= 70 ? DARK_CHART_COLORS.green : budgetHealth >= 40 ? DARK_CHART_COLORS.amber : DARK_CHART_COLORS.red);

    // Tick marks
    [-Math.PI / 2, -Math.PI / 4, 0, Math.PI / 4, Math.PI / 2].forEach((angle, i) => {
      g.append("line")
        .attr("x1", (radius - 25) * Math.cos(angle))
        .attr("y1", (radius - 25) * Math.sin(angle))
        .attr("x2", (radius + 5) * Math.cos(angle))
        .attr("y2", (radius + 5) * Math.sin(angle))
        .attr("stroke", DARK_CHART_COLORS.textMuted)
        .attr("stroke-width", 2);

      g.append("text")
        .attr("x", (radius + 15) * Math.cos(angle))
        .attr("y", (radius + 15) * Math.sin(angle) + 4)
        .attr("text-anchor", "middle")
        .attr("fill", DARK_CHART_COLORS.textMuted)
        .attr("font-size", 9)
        .text([0, 25, 50, 75, 100][i]);
    });

    // Center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -35)
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 32)
      .attr("font-weight", 700)
      .text(`${budgetHealth}%`);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -10)
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11)
      .text("Budget Health");

  }, [mounted]);

  // Lollipop Chart - Year over Year Comparison
  useEffect(() => {
    if (!lollipopRef.current || !mounted) return;

    const svg = d3.select(lollipopRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 220;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(MONTHLY_COMPARISON.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.5);

    const yMax = d3.max(MONTHLY_COMPARISON, d => Math.max(d.thisYear, d.lastYear)) as number;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    // Connecting lines
    MONTHLY_COMPARISON.forEach(d => {
      const x = (xScale(d.month) || 0) + xScale.bandwidth() / 2;
      g.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", yScale(d.lastYear))
        .attr("y2", yScale(d.thisYear))
        .attr("stroke", d.thisYear > d.lastYear ? DARK_CHART_COLORS.red : DARK_CHART_COLORS.green)
        .attr("stroke-width", 2);
    });

    // Last year dots
    g.selectAll(".dot-last")
      .data(MONTHLY_COMPARISON)
      .enter()
      .append("circle")
      .attr("cx", d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr("cy", d => yScale(d.lastYear))
      .attr("r", 6)
      .attr("fill", DARK_CHART_COLORS.textMuted);

    // This year dots
    g.selectAll(".dot-this")
      .data(MONTHLY_COMPARISON)
      .enter()
      .append("circle")
      .attr("cx", d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr("cy", d => yScale(d.thisYear))
      .attr("r", 6)
      .attr("fill", d => d.thisYear > d.lastYear ? DARK_CHART_COLORS.red : DARK_CHART_COLORS.green);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d}`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Spending Velocity Chart
  useEffect(() => {
    if (!velocityRef.current || !mounted) return;

    const svg = d3.select(velocityRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 180;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([1, 30])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 1500])
      .range([innerHeight, 0]);

    // Budget line (projected)
    g.append("line")
      .attr("x1", xScale(1))
      .attr("y1", yScale(0))
      .attr("x2", xScale(30))
      .attr("y2", yScale(1200))
      .attr("stroke", DARK_CHART_COLORS.textMuted)
      .attr("stroke-dasharray", "4,4")
      .attr("stroke-width", 2);

    // Actual spending area
    const area = d3.area<typeof SPENDING_VELOCITY[0]>()
      .x(d => xScale(d.day))
      .y0(innerHeight)
      .y1(d => yScale(d.amount))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(SPENDING_VELOCITY)
      .attr("d", area)
      .attr("fill", DARK_CHART_COLORS.blue)
      .attr("fill-opacity", 0.2);

    // Actual spending line
    const line = d3.line<typeof SPENDING_VELOCITY[0]>()
      .x(d => xScale(d.day))
      .y(d => yScale(d.amount))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(SPENDING_VELOCITY)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", DARK_CHART_COLORS.blue)
      .attr("stroke-width", 3);

    // Current position marker
    const currentDay = SPENDING_VELOCITY[SPENDING_VELOCITY.length - 1];
    g.append("circle")
      .attr("cx", xScale(currentDay.day))
      .attr("cy", yScale(currentDay.amount))
      .attr("r", 6)
      .attr("fill", DARK_CHART_COLORS.blue)
      .attr("stroke", DARK_CHART_COLORS.background)
      .attr("stroke-width", 2);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => `Day ${d}`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(4).tickFormat(d => `$${d}`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Budget Breakdown Sunburst Chart
  useEffect(() => {
    if (!breakdownChartRef.current || !mounted) return;

    const svg = d3.select(breakdownChartRef.current);
    svg.selectAll("*").remove();

    const width = 320;
    const height = 320;
    const radius = Math.min(width, height) / 2 - 20;

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Budget allocation data (hierarchical)
    const budgetData = {
      name: "Total Budget",
      value: 2200,
      children: [
        {
          name: "Repairs",
          value: 800,
          color: DARK_CHART_COLORS.green,
          children: [
            { name: "Plumbing", value: 350, color: "#10b981" },
            { name: "Electrical", value: 250, color: "#059669" },
            { name: "Other", value: 200, color: "#047857" },
          ],
        },
        {
          name: "Contractors",
          value: 600,
          color: DARK_CHART_COLORS.blue,
          children: [
            { name: "HVAC", value: 300, color: "#3b82f6" },
            { name: "Roofing", value: 200, color: "#2563eb" },
            { name: "Painting", value: 100, color: "#1d4ed8" },
          ],
        },
        {
          name: "Projects",
          value: 500,
          color: DARK_CHART_COLORS.amber,
          children: [
            { name: "Kitchen", value: 250, color: "#f59e0b" },
            { name: "Bathroom", value: 150, color: "#d97706" },
            { name: "Outdoor", value: 100, color: "#b45309" },
          ],
        },
        {
          name: "Emergency",
          value: 300,
          color: DARK_CHART_COLORS.red,
          children: [
            { name: "Reserve", value: 300, color: "#ef4444" },
          ],
        },
      ],
    };

    type BudgetNode = {
      name: string;
      value: number;
      color?: string;
      children?: BudgetNode[];
    };

    const root = d3.hierarchy<BudgetNode>(budgetData)
      .sum(d => d.children ? 0 : d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const partition = d3.partition<BudgetNode>()
      .size([2 * Math.PI, radius]);

    partition(root);

    const arc = d3.arc<d3.HierarchyRectangularNode<BudgetNode>>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1 - 1);

    // Draw arcs
    const nodes = root.descendants().filter(d => d.depth > 0) as d3.HierarchyRectangularNode<BudgetNode>[];

    g.selectAll("path")
      .data(nodes)
      .enter()
      .append("path")
      .attr("d", arc as never)
      .attr("fill", d => {
        // Get color from data or parent
        if (d.data.color) return d.data.color;
        let node = d;
        while (node.parent && !node.data.color) {
          node = node.parent as d3.HierarchyRectangularNode<BudgetNode>;
        }
        return node.data.color || "#666";
      })
      .attr("fill-opacity", d => d.depth === 1 ? 0.9 : 0.75)
      .attr("stroke", DARK_CHART_COLORS.background)
      .attr("stroke-width", 1);

    // Labels for outer ring
    nodes
      .filter(d => d.depth === 2 && (d.x1 - d.x0) > 0.15)
      .forEach(d => {
        const angle = (d.x0 + d.x1) / 2;
        const r = (d.y0 + d.y1) / 2;
        const x = r * Math.sin(angle);
        const y = -r * Math.cos(angle);

        g.append("text")
          .attr("x", x)
          .attr("y", y)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#fff")
          .attr("font-size", 8)
          .attr("font-weight", 500)
          .attr("transform", `rotate(${(angle * 180) / Math.PI - 90}, ${x}, ${y})`)
          .text(d.data.name);
      });

    // Center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -8)
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 20)
      .attr("font-weight", 700)
      .text("$2,200");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 12)
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10)
      .text("Total Budget");

  }, [mounted]);

  if (!mounted) return null;

  const totalSpent = CATEGORY_BREAKDOWN.reduce((sum, d) => sum + d.amount, 0);
  const totalSavings = SAVINGS_TREND[SAVINGS_TREND.length - 1].savings;

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
                  ? "text-neutral-400 hover:text-teal-400"
                  : "text-neutral-500 hover:text-teal-600"
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
                    ? "bg-teal-500/10 border border-teal-500/30 text-teal-400"
                    : "bg-teal-50 border border-teal-200 text-teal-700"
                )}
              >
                <IoWallet className="w-3.5 h-3.5" />
                Financial Tracking
              </div>

              <h1
                className={cn(
                  "text-4xl sm:text-5xl font-bold mb-6 leading-tight",
                  mode === "dark" ? "text-white" : "text-neutral-900"
                )}
              >
                Budget &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
                  Expense Tracking
                </span>
              </h1>

              <p
                className={cn(
                  "text-lg mb-8 leading-relaxed",
                  mode === "dark" ? "text-neutral-300" : "text-neutral-600"
                )}
              >
                Personal or shared. Track every expense on repairs, contractors, and
                projects. See patterns. Set budgets. Make better future decisions.
              </p>

              <div className="flex flex-wrap gap-4">
                <WaitlistModal>
                  <Button className="h-12 px-6 font-mono font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300 shadow-lg shadow-teal-600/20">
                    Join the Waitlist
                  </Button>
                </WaitlistModal>
              </div>
            </div>

            {/* Summary Stats */}
            <ContentCard>
              <h3 className={cn(
                "text-lg font-semibold mb-6",
                mode === "dark" ? "text-white" : "text-neutral-900"
              )}>
                Your Financial Summary
              </h3>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className={cn(
                  "text-center p-4 rounded-lg",
                  mode === "dark" ? "bg-neutral-800" : "bg-neutral-50"
                )}>
                  <div className={cn(
                    "text-3xl font-bold",
                    mode === "dark" ? "text-white" : "text-neutral-900"
                  )}>
                    ${(totalSpent / 1000).toFixed(1)}k
                  </div>
                  <div className={cn(
                    "text-sm mt-1",
                    mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                  )}>
                    Total Spent
                  </div>
                </div>
                <div className={cn(
                  "text-center p-4 rounded-lg border",
                  mode === "dark"
                    ? "bg-teal-500/10 border-teal-500/30"
                    : "bg-teal-50 border-teal-200"
                )}>
                  <div className="text-3xl font-bold text-teal-500">${(totalSavings / 1000).toFixed(1)}k</div>
                  <div className={cn(
                    "text-sm mt-1",
                    mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                  )}>
                    Total Saved
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {CATEGORY_BREAKDOWN.slice(0, 4).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{
                        backgroundColor: [DARK_CHART_COLORS.green, DARK_CHART_COLORS.blue, DARK_CHART_COLORS.amber, DARK_CHART_COLORS.red][i]
                      }} />
                      <span className={cn(
                        "text-sm",
                        mode === "dark" ? "text-neutral-300" : "text-neutral-600"
                      )}>
                        {cat.category}
                      </span>
                    </div>
                    <span className={cn(
                      "text-sm font-mono",
                      mode === "dark" ? "text-white" : "text-neutral-900"
                    )}>
                      ${cat.amount}
                    </span>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        </div>
      </LightSection>

      {/* Spending Section */}
      <LightSection variant="muted" className="py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ChartContainer title="Monthly Spending Breakdown">
              <svg ref={spendingChartRef} viewBox="0 0 450 220" className="w-full" />
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.green }} />
                  <span className="text-xs text-neutral-400">DIY Repairs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.blue }} />
                  <span className="text-xs text-neutral-400">Contractors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.amber }} />
                  <span className="text-xs text-neutral-400">Projects</span>
                </div>
              </div>
            </ChartContainer>

            <div>
              <SectionHeader
                title="See where your money goes"
                description="Track every dollar spent on home maintenance. Visualize spending by category, month, and type to identify opportunities for savings."
              />

              <div className="space-y-4 mt-8">
                <ContentCard className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    mode === "dark"
                      ? "bg-teal-500/10 border border-teal-500/30"
                      : "bg-teal-50 border border-teal-200"
                  )}>
                    <span className="text-teal-500 font-bold">32%</span>
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-semibold",
                      mode === "dark" ? "text-white" : "text-neutral-900"
                    )}>
                      DIY Savings Rate
                    </h4>
                    <p className={cn(
                      "text-sm",
                      mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                    )}>
                      Average savings vs. hiring professionals
                    </p>
                  </div>
                </ContentCard>

                <ContentCard className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    mode === "dark"
                      ? "bg-blue-500/10 border border-blue-500/30"
                      : "bg-blue-50 border border-blue-200"
                  )}>
                    <span className="text-blue-500 font-bold">$847</span>
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-semibold",
                      mode === "dark" ? "text-white" : "text-neutral-900"
                    )}>
                      Monthly Average
                    </h4>
                    <p className={cn(
                      "text-sm",
                      mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                    )}>
                      Total home maintenance spending
                    </p>
                  </div>
                </ContentCard>
              </div>
            </div>
          </div>
        </div>
      </LightSection>

      {/* Charts Grid */}
      <LightSection className="py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Budget insights"
            description="Set budgets, track actuals, and watch your savings grow over time."
            centered
            className="mb-16"
          />

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Category Breakdown */}
            <ChartContainer
              title="Spending by Category"
              subtitle="Year-to-date breakdown."
            >
              <div className="flex items-center gap-8">
                <svg ref={categoryChartRef} viewBox="0 0 200 200" className="w-48 h-48" />
                <div className="space-y-2">
                  {CATEGORY_BREAKDOWN.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{
                        backgroundColor: [DARK_CHART_COLORS.green, DARK_CHART_COLORS.blue, DARK_CHART_COLORS.amber, DARK_CHART_COLORS.red, DARK_CHART_COLORS.purple, DARK_CHART_COLORS.textMuted][i]
                      }} />
                      <span className="text-xs text-neutral-300">{item.category}</span>
                      <span className="text-xs font-semibold ml-auto text-white">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartContainer>

            {/* Budget vs Actual */}
            <ChartContainer
              title="Budget vs Actual"
              subtitle="How you're tracking against your monthly budgets."
            >
              <svg ref={budgetChartRef} viewBox="0 0 400 200" className="w-full" />
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.grid }} />
                  <span className="text-xs text-neutral-400">Budget</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.green }} />
                  <span className="text-xs text-neutral-400">Under Budget</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.red }} />
                  <span className="text-xs text-neutral-400">Over Budget</span>
                </div>
              </div>
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Savings Trend */}
      <LightSection variant="muted" className="py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader
                title="Watch your savings grow"
                description="Every DIY decision that saves money is tracked. See your cumulative savings build up over time compared to what you would have spent on professionals."
              />

              <div className={cn(
                "p-6 rounded-xl border mt-8",
                mode === "dark"
                  ? "bg-teal-500/10 border-teal-500/30"
                  : "bg-teal-50 border-teal-200"
              )}>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-teal-500">${totalSavings}</div>
                  <div>
                    <div className={cn(
                      "text-sm font-semibold",
                      mode === "dark" ? "text-teal-400" : "text-teal-700"
                    )}>
                      Total Saved
                    </div>
                    <div className={cn(
                      "text-xs",
                      mode === "dark" ? "text-neutral-400" : "text-neutral-500"
                    )}>
                      Year-to-date
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ChartContainer title="Cumulative Savings">
              <svg ref={savingsChartRef} viewBox="0 0 400 180" className="w-full" />
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Advanced Budget Analytics */}
      <LightSection className="py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Advanced Budget Analytics"
            description="Deep insights into your spending patterns with advanced visualization tools."
            centered
            className="mb-16"
          />

          {/* Budget Allocation Sunburst - Full Width */}
          <ChartContainer
            title="Budget Allocation Breakdown"
            subtitle="Hierarchical view of how your budget is allocated across categories and subcategories."
            className="mb-8"
          >
            <div className="flex justify-center">
              <svg ref={breakdownChartRef} viewBox="0 0 320 320" className="w-full max-w-[320px]" />
            </div>
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.green }} />
                <span className="text-xs text-neutral-400">Repairs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.blue }} />
                <span className="text-xs text-neutral-400">Contractors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.amber }} />
                <span className="text-xs text-neutral-400">Projects</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.red }} />
                <span className="text-xs text-neutral-400">Emergency</span>
              </div>
            </div>
          </ChartContainer>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Budget Health Gauge */}
            <ChartContainer
              title="Budget Health Score"
              subtitle="Overall financial health based on budget adherence."
            >
              <div className="flex justify-center">
                <svg ref={gaugeRef} viewBox="0 0 280 160" className="w-full max-w-[280px]" />
              </div>
            </ChartContainer>

            {/* Treemap */}
            <ChartContainer
              title="Expense Breakdown"
              subtitle="Visual breakdown of all expense categories."
            >
              <svg ref={treemapRef} viewBox="0 0 400 250" className="w-full" />
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.blue }} />
                  <span className="text-xs text-neutral-400">Labor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.green }} />
                  <span className="text-xs text-neutral-400">Materials</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.amber }} />
                  <span className="text-xs text-neutral-400">Equipment</span>
                </div>
              </div>
            </ChartContainer>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Lollipop Chart */}
            <ChartContainer
              title="Year-over-Year Comparison"
              subtitle="Compare this year's spending vs last year by month."
            >
              <svg ref={lollipopRef} viewBox="0 0 400 220" className="w-full" />
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DARK_CHART_COLORS.textMuted }} />
                  <span className="text-xs text-neutral-400">Last Year</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DARK_CHART_COLORS.green }} />
                  <span className="text-xs text-neutral-400">This Year (Lower)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DARK_CHART_COLORS.red }} />
                  <span className="text-xs text-neutral-400">This Year (Higher)</span>
                </div>
              </div>
            </ChartContainer>

            {/* Spending Velocity */}
            <ChartContainer
              title="Spending Velocity"
              subtitle="Track your spending pace throughout the month."
            >
              <svg ref={velocityRef} viewBox="0 0 400 180" className="w-full" />
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: DARK_CHART_COLORS.blue }} />
                  <span className="text-xs text-neutral-400">Actual Spending</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-0.5 border-t-2 border-dashed" style={{ borderColor: DARK_CHART_COLORS.textMuted }} />
                  <span className="text-xs text-neutral-400">Budget Pace</span>
                </div>
              </div>
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Features Grid */}
      <LightSection variant="muted" className="py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <ContentCard
                key={i}
                className={cn(
                  "transition-all",
                  mode === "dark"
                    ? "hover:border-teal-500/50"
                    : "hover:border-teal-300 hover:shadow-md"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                  mode === "dark"
                    ? "bg-teal-500/10 border border-teal-500/30 text-teal-400"
                    : "bg-teal-50 border border-teal-200 text-teal-600"
                )}>
                  <IoWallet className="w-6 h-6" />
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
      <LightSection className="py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={cn(
            "text-3xl sm:text-4xl font-bold mb-6",
            mode === "dark" ? "text-white" : "text-neutral-900"
          )}>
            Take control of your home budget and expenses
          </h2>
          <p className={cn(
            "mb-8",
            mode === "dark" ? "text-neutral-400" : "text-neutral-600"
          )}>
            Track every expense, set budgets, and maximize savings on home maintenance.
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

"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
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
 * Analytics Product Page
 *
 * Professional SaaS page showcasing analytics capabilities
 * for individual users and enterprise customers
 * Hybrid layout: Light text sections, dark chart containers
 */

// Chart data
const SAVINGS_DATA = [
  { month: "Jul", diy: 180, avoided: 120 },
  { month: "Aug", diy: 245, avoided: 200 },
  { month: "Sep", diy: 320, avoided: 150 },
  { month: "Oct", diy: 410, avoided: 280 },
  { month: "Nov", diy: 285, avoided: 190 },
  { month: "Dec", diy: 520, avoided: 340 },
];

const CATEGORY_PERFORMANCE = [
  { category: "Plumbing", success: 92 },
  { category: "Electrical", success: 78 },
  { category: "HVAC", success: 85 },
  { category: "Appliances", success: 95 },
  { category: "Outdoor", success: 88 },
];

const MONTHLY_TRENDS = [
  { month: "Jan", decisions: 5, savings: 280 },
  { month: "Feb", decisions: 7, savings: 420 },
  { month: "Mar", decisions: 6, savings: 350 },
  { month: "Apr", decisions: 9, savings: 580 },
  { month: "May", decisions: 8, savings: 510 },
  { month: "Jun", decisions: 11, savings: 680 },
];

const FEATURES = [
  {
    title: "Real-Time Cost Tracking",
    description: "Monitor DIY savings, avoided contractor fees, and total cost of ownership across all your projects.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Skill Progression Insights",
    description: "Track your growing expertise across categories. See which skills are improving and where to focus next.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: "Decision History & Patterns",
    description: "Complete audit trail of every decision. Identify patterns, learn from past choices, and improve outcomes.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: "ROI Calculations",
    description: "Automatic return-on-investment analysis for tools, materials, and time invested in DIY projects.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Exportable Reports",
    description: "Generate PDF reports for insurance claims, property management, or personal records.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "Team & Property Dashboards",
    description: "Enterprise features for property managers and maintenance teams to track across multiple units.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const ENTERPRISE_BENEFITS = [
  "Unlimited team members and properties",
  "Custom reporting and API access",
  "SSO and enterprise security",
  "Dedicated account manager",
  "Custom integrations",
  "SLA guarantees",
];

export default function AnalyticsPage() {
  const { mode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const savingsChartRef = useRef<SVGSVGElement>(null);
  const categoryChartRef = useRef<SVGSVGElement>(null);
  const trendsChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stacked Area Chart
  useEffect(() => {
    if (!savingsChartRef.current || !mounted) return;

    const svg = d3.select(savingsChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scalePoint()
      .domain(SAVINGS_DATA.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.5);

    const yMax = d3.max(SAVINGS_DATA, d => d.diy + d.avoided) || 1000;
    const yScale = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]).nice();

    const stackedData = SAVINGS_DATA.map(d => ({
      month: d.month,
      diy: d.diy,
      avoided: d.diy + d.avoided,
    }));

    // Avoided area
    const avoidedArea = d3.area<typeof stackedData[0]>()
      .x(d => xScale(d.month) || 0)
      .y0(d => yScale(d.diy))
      .y1(d => yScale(d.avoided))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(stackedData)
      .attr("d", avoidedArea)
      .attr("fill", DARK_CHART_COLORS.blue)
      .attr("fill-opacity", 0.5);

    // DIY area
    const diyArea = d3.area<typeof stackedData[0]>()
      .x(d => xScale(d.month) || 0)
      .y0(innerHeight)
      .y1(d => yScale(d.diy))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(stackedData)
      .attr("d", diyArea)
      .attr("fill", DARK_CHART_COLORS.green)
      .attr("fill-opacity", 0.6);

    // Axes
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d}`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Category Performance Chart
  useEffect(() => {
    if (!categoryChartRef.current || !mounted) return;

    const svg = d3.select(categoryChartRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 180;
    const margin = { top: 10, right: 50, bottom: 10, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);
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

    // Labels
    g.selectAll(".label")
      .data(CATEGORY_PERFORMANCE)
      .enter()
      .append("text")
      .attr("x", -8)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 12)
      .text(d => d.category);

    // Percentages
    g.selectAll(".percent")
      .data(CATEGORY_PERFORMANCE)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.success) + 8)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .text(d => `${d.success}%`);

  }, [mounted]);

  // Monthly Trends Chart
  useEffect(() => {
    if (!trendsChartRef.current || !mounted) return;

    const svg = d3.select(trendsChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 160;
    const margin = { top: 20, right: 50, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(MONTHLY_TRENDS.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.3);

    const yScaleLeft = d3.scaleLinear()
      .domain([0, d3.max(MONTHLY_TRENDS, d => d.decisions) as number])
      .range([innerHeight, 0])
      .nice();

    const yScaleRight = d3.scaleLinear()
      .domain([0, d3.max(MONTHLY_TRENDS, d => d.savings) as number])
      .range([innerHeight, 0])
      .nice();

    // Bars
    g.selectAll(".bar")
      .data(MONTHLY_TRENDS)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.month) || 0)
      .attr("y", d => yScaleLeft(d.decisions))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScaleLeft(d.decisions))
      .attr("fill", DARK_CHART_COLORS.blue)
      .attr("fill-opacity", 0.7)
      .attr("rx", 3);

    // Line
    const savingsLine = d3.line<typeof MONTHLY_TRENDS[0]>()
      .x(d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .y(d => yScaleRight(d.savings))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(MONTHLY_TRENDS)
      .attr("d", savingsLine)
      .attr("fill", "none")
      .attr("stroke", DARK_CHART_COLORS.green)
      .attr("stroke-width", 3);

    // Dots
    g.selectAll(".dot")
      .data(MONTHLY_TRENDS)
      .enter()
      .append("circle")
      .attr("cx", d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr("cy", d => yScaleRight(d.savings))
      .attr("r", 5)
      .attr("fill", DARK_CHART_COLORS.green);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      {/* Hero Section */}
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
                  ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                  : "bg-teal-50 border-teal-200 text-teal-600"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Analytics Dashboard
              </div>

              <h1 className={`text-4xl sm:text-5xl font-bold mb-6 leading-tight ${
                mode === "dark" ? "text-white" : "text-neutral-900"
              }`}>
                Every decision.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
                  Measured.
                </span>
              </h1>

              <p className={`text-lg mb-8 leading-relaxed ${
                mode === "dark" ? "text-neutral-400" : "text-neutral-600"
              }`}>
                Transform your repair and maintenance decisions into actionable data.
                Track savings, measure ROI, and build a complete history of every choice you make.
              </p>

              <div className="flex flex-wrap gap-4">
                <WaitlistModal>
                  <Button className="h-12 px-6 font-mono font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300">
                    Get Early Access
                  </Button>
                </WaitlistModal>
                <Link href="/product">
                  <Button variant="outline" className={`h-12 px-6 font-mono transition-colors ${
                    mode === "dark"
                      ? "border-neutral-700 hover:border-teal-500 hover:text-teal-400"
                      : "border-neutral-300 hover:border-teal-600 hover:text-teal-600"
                  }`}>
                    View All Features
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Chart Preview */}
            <ChartContainer
              title="Cumulative Savings"
              legend={[
                { label: "DIY Savings", color: DARK_CHART_COLORS.green },
                { label: "Avoided Costs", color: DARK_CHART_COLORS.blue },
              ]}
            >
              <svg ref={savingsChartRef} viewBox="0 0 400 200" className="w-full" />
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Stats Bar */}
      <LightSection variant="subtle" className="py-8 px-6 border-y border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "$847", label: "Avg. monthly savings" },
            { value: "89%", label: "DIY success rate" },
            { value: "23.5h", label: "Hours saved/month" },
            { value: "4.2x", label: "Average ROI" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-teal-500">{stat.value}</div>
              <div className={`text-xs sm:text-sm mt-1 ${mode === "dark" ? "text-neutral-400" : "text-neutral-500"}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </LightSection>

      {/* Features Grid */}
      <LightSection className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Analytics that drive better decisions"
            subtitle="Go beyond basic tracking. Understand the true cost of every decision, measure your progress, and make smarter choices over time."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <ContentCard key={i} hoverable>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  mode === "dark"
                    ? "bg-teal-500/10 border border-teal-500/30 text-teal-400"
                    : "bg-teal-50 border border-teal-200 text-teal-600"
                }`}>
                  {feature.icon}
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

      {/* Charts Section */}
      <LightSection variant="subtle" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Visualize your progress"
            subtitle="Beautiful, intuitive charts that make complex data easy to understand."
          />

          <div className="grid md:grid-cols-2 gap-8">
            {/* Category Success */}
            <ChartContainer
              title="Success Rate by Category"
              subtitle="Track which areas you excel in and where you need more experience."
            >
              <svg ref={categoryChartRef} viewBox="0 0 300 180" className="w-full" />
            </ChartContainer>

            {/* Monthly Trends */}
            <ChartContainer
              title="Monthly Trends"
              subtitle="Decisions made vs. total savings over time."
              legend={[
                { label: "Decisions", color: DARK_CHART_COLORS.blue },
                { label: "Savings", color: DARK_CHART_COLORS.green },
              ]}
            >
              <svg ref={trendsChartRef} viewBox="0 0 400 160" className="w-full" />
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Enterprise Section */}
      <LightSection className="py-20 px-6 border-t border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono mb-6 ${
                mode === "dark"
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                  : "bg-purple-50 border-purple-200 text-purple-600"
              }`}>
                Enterprise
              </div>

              <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>
                Built for teams and property managers
              </h2>

              <p className={`mb-8 leading-relaxed ${mode === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
                Whether you manage a single property or a portfolio of hundreds,
                OpportunIQ scales with your needs. Track maintenance across units,
                analyze contractor performance, and reduce operational costs.
              </p>

              <ul className="space-y-3 mb-8">
                {ENTERPRISE_BENEFITS.map((benefit, i) => (
                  <li key={i} className={`flex items-center gap-3 ${mode === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
                    <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>

              <a
                href="mailto:enterprise@opportuniq.com"
                className="inline-flex items-center gap-2 text-teal-500 hover:underline"
              >
                Contact sales for enterprise pricing
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            <ContentCard>
              <div className="text-center mb-6">
                <div className={`text-5xl font-bold mb-2 ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>
                  Custom
                </div>
                <div className={mode === "dark" ? "text-neutral-400" : "text-neutral-500"}>
                  Tailored to your organization
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className={`flex items-center justify-between py-3 border-b ${
                  mode === "dark" ? "border-neutral-800" : "border-neutral-100"
                }`}>
                  <span className={mode === "dark" ? "text-neutral-400" : "text-neutral-600"}>Team members</span>
                  <span className={`font-semibold ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>Unlimited</span>
                </div>
                <div className={`flex items-center justify-between py-3 border-b ${
                  mode === "dark" ? "border-neutral-800" : "border-neutral-100"
                }`}>
                  <span className={mode === "dark" ? "text-neutral-400" : "text-neutral-600"}>Properties</span>
                  <span className={`font-semibold ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>Unlimited</span>
                </div>
                <div className={`flex items-center justify-between py-3 border-b ${
                  mode === "dark" ? "border-neutral-800" : "border-neutral-100"
                }`}>
                  <span className={mode === "dark" ? "text-neutral-400" : "text-neutral-600"}>API access</span>
                  <span className="font-semibold text-green-500">Included</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className={mode === "dark" ? "text-neutral-400" : "text-neutral-600"}>Support</span>
                  <span className={`font-semibold ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>Dedicated</span>
                </div>
              </div>

              <Button className="w-full h-12 font-mono font-bold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
                Schedule a Demo
              </Button>
            </ContentCard>
          </div>
        </div>
      </LightSection>

      {/* CTA Section */}
      <LightSection variant="gradient" className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>
            Start tracking smarter decisions today
          </h2>
          <p className={`mb-8 ${mode === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
            Join thousands of homeowners and property managers who use OpportunIQ
            to make data-driven repair and maintenance decisions.
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

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
 * Insights Product Page
 *
 * Showcases the decision intelligence features:
 * - Contractor availability & pricing
 * - Risk assessment
 * - Cost comparisons
 * - Smart recommendations
 *
 * Hybrid layout: Light text sections, dark chart containers
 */

// Contractor availability data
const CONTRACTOR_AVAILABILITY = [
  { month: "Jan", available: 85, avgWait: 2 },
  { month: "Feb", available: 78, avgWait: 3 },
  { month: "Mar", available: 45, avgWait: 7 },
  { month: "Apr", available: 35, avgWait: 10 },
  { month: "May", available: 28, avgWait: 14 },
  { month: "Jun", available: 32, avgWait: 12 },
  { month: "Jul", available: 38, avgWait: 9 },
  { month: "Aug", available: 42, avgWait: 8 },
  { month: "Sep", available: 55, avgWait: 5 },
  { month: "Oct", available: 62, avgWait: 4 },
  { month: "Nov", available: 75, avgWait: 3 },
  { month: "Dec", available: 82, avgWait: 2 },
];

const PRICING_BY_SEASON = [
  { season: "Winter", plumbing: 150, electrical: 180, hvac: 200, appliance: 120 },
  { season: "Spring", plumbing: 185, electrical: 210, hvac: 280, appliance: 145 },
  { season: "Summer", plumbing: 175, electrical: 195, hvac: 350, appliance: 155 },
  { season: "Fall", plumbing: 160, electrical: 185, hvac: 220, appliance: 130 },
];

const COST_BREAKDOWN = [
  { category: "Labor", value: 45, color: DARK_CHART_COLORS.blue },
  { category: "Parts", value: 25, color: DARK_CHART_COLORS.green },
  { category: "Markup", value: 15, color: DARK_CHART_COLORS.amber },
  { category: "Travel", value: 10, color: DARK_CHART_COLORS.purple },
  { category: "Overhead", value: 5, color: DARK_CHART_COLORS.red },
];

const SMART_QUESTIONS = [
  { question: "Is there a gas smell?", impact: "Critical", action: "Call professional immediately" },
  { question: "Water actively leaking?", impact: "High", action: "Shut off valve, then assess" },
  { question: "Electrical sparking?", impact: "Critical", action: "Kill breaker, call electrician" },
  { question: "Appliance under warranty?", impact: "Medium", action: "Check warranty first" },
  { question: "Done this repair before?", impact: "Low", action: "Consider DIY" },
];

const INSIGHT_FEATURES = [
  {
    title: "Real-Time Contractor Pricing",
    description: "Know what contractors are charging in your area before you call. Compare quotes against market rates.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Seasonal Availability Tracking",
    description: "See when contractors are busiest. Plan non-urgent repairs for off-peak times and save 20-40%.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Smart Safety Questions",
    description: "Smart diagnostic questions that identify safety risks before you start any repair.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Hidden Cost Calculator",
    description: "Factor in tools, time, materials, and potential mistakes. Know the true cost before you commit.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Risk Assessment Engine",
    description: "Evaluate complexity, safety risks, and your skill level to get personalized recommendations.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    title: "Learning Curve Analysis",
    description: "See how costs decrease with experience. Know when DIY becomes more economical than hiring out.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

export default function InsightsPage() {
  const { mode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const availabilityChartRef = useRef<SVGSVGElement>(null);
  const pricingChartRef = useRef<SVGSVGElement>(null);
  const breakdownChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Contractor Availability Chart
  useEffect(() => {
    if (!availabilityChartRef.current || !mounted) return;

    const svg = d3.select(availabilityChartRef.current);
    svg.selectAll("*").remove();

    const width = 500;
    const height = 200;
    const margin = { top: 20, right: 60, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(CONTRACTOR_AVAILABILITY.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.3);

    const yScaleLeft = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    const yScaleRight = d3.scaleLinear()
      .domain([0, 16])
      .range([innerHeight, 0]);

    // Bars for availability
    g.selectAll(".bar")
      .data(CONTRACTOR_AVAILABILITY)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.month) || 0)
      .attr("y", d => yScaleLeft(d.available))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScaleLeft(d.available))
      .attr("fill", d => d.available > 60 ? DARK_CHART_COLORS.green : d.available > 40 ? DARK_CHART_COLORS.amber : DARK_CHART_COLORS.red)
      .attr("rx", 3);

    // Line for wait time
    const waitLine = d3.line<typeof CONTRACTOR_AVAILABILITY[0]>()
      .x(d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .y(d => yScaleRight(d.avgWait))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(CONTRACTOR_AVAILABILITY)
      .attr("d", waitLine)
      .attr("fill", "none")
      .attr("stroke", DARK_CHART_COLORS.purple)
      .attr("stroke-width", 3);

    // Dots
    g.selectAll(".dot")
      .data(CONTRACTOR_AVAILABILITY)
      .enter()
      .append("circle")
      .attr("cx", d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr("cy", d => yScaleRight(d.avgWait))
      .attr("r", 4)
      .attr("fill", DARK_CHART_COLORS.purple);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 10);

    // Left Y axis
    g.append("g")
      .call(d3.axisLeft(yScaleLeft).ticks(5).tickFormat(d => `${d}%`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.green)
      .attr("font-size", 10);

    // Right Y axis
    g.append("g")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(yScaleRight).ticks(4).tickFormat(d => `${d}d`))
      .selectAll("text")
      .attr("fill", DARK_CHART_COLORS.purple)
      .attr("font-size", 10);

    g.selectAll(".domain").attr("stroke", DARK_CHART_COLORS.grid);
    g.selectAll(".tick line").attr("stroke", DARK_CHART_COLORS.grid);

  }, [mounted]);

  // Seasonal Pricing Chart
  useEffect(() => {
    if (!pricingChartRef.current || !mounted) return;

    const svg = d3.select(pricingChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const categories = ["plumbing", "electrical", "hvac", "appliance"];
    const colors = [DARK_CHART_COLORS.blue, DARK_CHART_COLORS.amber, DARK_CHART_COLORS.red, DARK_CHART_COLORS.green];

    const xScale = d3.scaleBand()
      .domain(PRICING_BY_SEASON.map(d => d.season))
      .range([0, innerWidth])
      .padding(0.2);

    const xSubScale = d3.scaleBand()
      .domain(categories)
      .range([0, xScale.bandwidth()])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, 400])
      .range([innerHeight, 0]);

    // Bars
    PRICING_BY_SEASON.forEach(seasonData => {
      categories.forEach((cat, i) => {
        g.append("rect")
          .attr("x", (xScale(seasonData.season) || 0) + (xSubScale(cat) || 0))
          .attr("y", yScale(seasonData[cat as keyof typeof seasonData] as number))
          .attr("width", xSubScale.bandwidth())
          .attr("height", innerHeight - yScale(seasonData[cat as keyof typeof seasonData] as number))
          .attr("fill", colors[i])
          .attr("rx", 2);
      });
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

  // Cost Breakdown Donut
  useEffect(() => {
    if (!breakdownChartRef.current || !mounted) return;

    const svg = d3.select(breakdownChartRef.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 200;
    const radius = 80;

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<typeof COST_BREAKDOWN[0]>()
      .value(d => d.value)
      .sort(null)
      .padAngle(0.02);

    const arc = d3.arc<d3.PieArcDatum<typeof COST_BREAKDOWN[0]>>()
      .innerRadius(radius - 30)
      .outerRadius(radius);

    g.selectAll(".arc")
      .data(pie(COST_BREAKDOWN))
      .enter()
      .append("path")
      .attr("d", arc as never)
      .attr("fill", d => d.data.color);

    // Center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", DARK_CHART_COLORS.text)
      .attr("font-size", 14)
      .attr("font-weight", 600)
      .attr("y", -8)
      .text("Typical");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 10)
      .attr("fill", DARK_CHART_COLORS.textMuted)
      .attr("font-size", 12)
      .text("Cost Split");

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
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-green-50 border-green-200 text-green-600"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Decision Intelligence
              </div>

              <h1 className={`text-4xl sm:text-5xl font-bold mb-6 leading-tight ${
                mode === "dark" ? "text-white" : "text-neutral-900"
              }`}>
                Know before you{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
                  decide.
                </span>
              </h1>

              <p className={`text-lg mb-8 leading-relaxed ${
                mode === "dark" ? "text-neutral-400" : "text-neutral-600"
              }`}>
                Real-time contractor pricing, seasonal availability patterns, and smart risk assessment.
                Make informed decisions with data that was previously impossible to access.
              </p>

              <div className="flex flex-wrap gap-4">
                <WaitlistModal>
                  <Button className="h-12 px-6 font-mono font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300">
                    Get Early Access
                  </Button>
                </WaitlistModal>
                <Link href="/product/analytics">
                  <Button variant="outline" className={`h-12 px-6 font-mono transition-colors ${
                    mode === "dark"
                      ? "border-neutral-700 hover:border-green-500 hover:text-green-400"
                      : "border-neutral-300 hover:border-green-600 hover:text-green-600"
                  }`}>
                    View Analytics
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Visual - Smart Questions */}
            <div className="bg-[#111111] rounded-xl border border-neutral-800 overflow-hidden">
              <div className="p-4 border-b border-neutral-800">
                <span className="text-sm font-medium text-neutral-400">Smart Safety Check</span>
              </div>
              <div className="p-4 space-y-3">
                {SMART_QUESTIONS.map((q, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      q.impact === "Critical"
                        ? "border-red-500/30 bg-red-500/5"
                        : q.impact === "High"
                        ? "border-orange-500/30 bg-orange-500/5"
                        : q.impact === "Medium"
                        ? "border-yellow-500/30 bg-yellow-500/5"
                        : "border-green-500/30 bg-green-500/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        q.impact === "Critical" ? "bg-red-500" :
                        q.impact === "High" ? "bg-orange-500" :
                        q.impact === "Medium" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                      <span className="text-sm text-white">{q.question}</span>
                    </div>
                    <span className={`text-xs font-mono ${
                      q.impact === "Critical" ? "text-red-400" :
                      q.impact === "High" ? "text-orange-400" :
                      q.impact === "Medium" ? "text-yellow-400" : "text-green-400"
                    }`}>
                      {q.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LightSection>

      {/* Contractor Availability Section */}
      <LightSection className="py-20 px-6 border-t border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${
                mode === "dark" ? "text-white" : "text-neutral-900"
              }`}>
                Contractor availability changes everything
              </h2>
              <p className={`mb-6 leading-relaxed ${
                mode === "dark" ? "text-neutral-400" : "text-neutral-600"
              }`}>
                Did you know HVAC contractors book out 2+ weeks in summer?
                Or that plumbers are 40% cheaper in January? OpportunIQ tracks
                real-time availability and pricing so you can plan smarter.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    mode === "dark"
                      ? "bg-green-500/10 border border-green-500/30"
                      : "bg-green-50 border border-green-200"
                  }`}>
                    <span className="text-green-500 font-bold text-sm">20%</span>
                  </div>
                  <div>
                    <h4 className={`font-semibold mb-1 ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>
                      Off-season savings
                    </h4>
                    <p className={`text-sm ${mode === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
                      Schedule non-urgent repairs in winter for significant discounts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    mode === "dark"
                      ? "bg-red-500/10 border border-red-500/30"
                      : "bg-red-50 border border-red-200"
                  }`}>
                    <span className="text-red-500 font-bold text-sm">14d</span>
                  </div>
                  <div>
                    <h4 className={`font-semibold mb-1 ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>
                      Peak wait times
                    </h4>
                    <p className={`text-sm ${mode === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
                      Know when to expect delays and plan accordingly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    mode === "dark"
                      ? "bg-purple-500/10 border border-purple-500/30"
                      : "bg-purple-50 border border-purple-200"
                  }`}>
                    <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={`font-semibold mb-1 ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>
                      Smart recommendations
                    </h4>
                    <p className={`text-sm ${mode === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
                      Get personalized timing advice based on urgency and budget.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ChartContainer
              title="Contractor Availability (2024)"
              legend={[
                { label: "Availability %", color: DARK_CHART_COLORS.green },
                { label: "Wait Time (days)", color: DARK_CHART_COLORS.purple },
              ]}
            >
              <svg ref={availabilityChartRef} viewBox="0 0 500 200" className="w-full" />
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Pricing Section */}
      <LightSection variant="subtle" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Seasonal pricing intelligence"
            subtitle="Contractor rates fluctuate dramatically by season. Know the best time to schedule each type of repair."
          />

          <div className="grid lg:grid-cols-2 gap-8">
            <ChartContainer
              title="Average Service Call by Season"
              subtitle="HVAC peaks in summer, everything else drops in winter."
              legend={[
                { label: "Plumbing", color: DARK_CHART_COLORS.blue },
                { label: "Electrical", color: DARK_CHART_COLORS.amber },
                { label: "HVAC", color: DARK_CHART_COLORS.red },
                { label: "Appliance", color: DARK_CHART_COLORS.green },
              ]}
            >
              <svg ref={pricingChartRef} viewBox="0 0 400 200" className="w-full" />
            </ChartContainer>

            <ChartContainer
              title="Where Your Money Goes"
              subtitle="Understanding contractor pricing helps you negotiate better."
            >
              <div className="flex items-center justify-center gap-8">
                <svg ref={breakdownChartRef} viewBox="0 0 200 200" className="w-48 h-48" />
                <div className="space-y-2">
                  {COST_BREAKDOWN.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-neutral-400">{item.category}</span>
                      <span className="text-sm font-semibold ml-auto text-white">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartContainer>
          </div>
        </div>
      </LightSection>

      {/* Features Grid */}
      <LightSection className="py-20 px-6 border-t border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Intelligence that pays for itself"
            subtitle="One good decision can save you hundreds. OpportunIQ gives you the data to make that decision every time."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INSIGHT_FEATURES.map((feature, i) => (
              <ContentCard key={i} hoverable>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  mode === "dark"
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : "bg-green-50 border border-green-200 text-green-600"
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

      {/* CTA Section */}
      <LightSection variant="gradient" className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${mode === "dark" ? "text-white" : "text-neutral-900"}`}>
            Stop guessing. Start knowing.
          </h2>
          <p className={`mb-8 ${mode === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
            Join the waitlist and be first to access decision intelligence
            that transforms how you approach home maintenance.
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

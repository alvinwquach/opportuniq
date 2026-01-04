"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";

/**
 * Features Page
 *
 * Deep dive into all OpportunIQ features with interactive demos
 */

// Risk escalation data
const RISK_DATA = [
  { step: 0, cost: 150, label: "Initial estimate" },
  { step: 1, cost: 220, label: "Wrong part ordered" },
  { step: 2, cost: 350, label: "Water damage" },
  { step: 3, cost: 520, label: "Mold remediation" },
  { step: 4, cost: 890, label: "Professional repair" },
];

// Decision ledger data
const LEDGER_DATA = [
  { date: "Jan 15", category: "Plumbing", decision: "DIY", cost: 45, saved: 180 },
  { date: "Feb 3", category: "Electrical", decision: "Pro", cost: 350, saved: 0 },
  { date: "Feb 28", category: "HVAC", decision: "DIY", cost: 120, saved: 400 },
  { date: "Mar 12", category: "Appliance", decision: "DIY", cost: 35, saved: 150 },
  { date: "Apr 5", category: "Plumbing", decision: "Pro", cost: 280, saved: 0 },
  { date: "Apr 22", category: "Outdoor", decision: "DIY", cost: 85, saved: 320 },
];

// Learning curve data
const LEARNING_CURVE = [
  { attempt: 1, time: 180, cost: 450 },
  { attempt: 2, time: 120, cost: 280 },
  { attempt: 3, time: 75, cost: 180 },
  { attempt: 4, time: 50, cost: 120 },
  { attempt: 5, time: 40, cost: 95 },
];

const FEATURE_SECTIONS = [
  {
    id: "risk-assessment",
    title: "Risk Assessment Engine",
    subtitle: "See how mistakes compound",
    description: "Every DIY project carries risk. Our engine calculates the potential cost of mistakes before they happen, so you can make informed decisions.",
    features: [
      "Real-time cost escalation modeling",
      "Safety hazard identification",
      "Skill gap analysis",
      "Worst-case scenario planning",
    ],
  },
  {
    id: "decision-ledger",
    title: "Decision Ledger",
    subtitle: "Every decision. Logged forever.",
    description: "Build a complete history of your home maintenance decisions. Track what worked, what didn't, and learn from every experience.",
    features: [
      "Automatic decision logging",
      "Outcome tracking",
      "Cost vs. savings analysis",
      "Searchable history",
    ],
  },
  {
    id: "learning-curve",
    title: "Learning Curve Analysis",
    subtitle: "Watch your skills grow",
    description: "See exactly how your DIY skills improve over time. Know when you've crossed the threshold from 'should hire' to 'can handle it'.",
    features: [
      "Time-per-task tracking",
      "Cost efficiency improvements",
      "Skill progression graphs",
      "Confidence scoring",
    ],
  },
];

export default function FeaturesPage() {
  const [mounted, setMounted] = useState(false);
  const riskChartRef = useRef<SVGSVGElement>(null);
  const ledgerChartRef = useRef<SVGSVGElement>(null);
  const learningChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Risk Escalation Chart
  useEffect(() => {
    if (!riskChartRef.current || !mounted) return;

    const svg = d3.select(riskChartRef.current);
    svg.selectAll("*").remove();

    const width = 450;
    const height = 220;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, RISK_DATA.length - 1])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(RISK_DATA, d => d.cost) as number])
      .range([innerHeight, 0])
      .nice();

    // Area
    const area = d3.area<typeof RISK_DATA[0]>()
      .x((_, i) => xScale(i))
      .y0(innerHeight)
      .y1(d => yScale(d.cost))
      .curve(d3.curveMonotoneX);

    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "riskGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.6);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.1);

    g.append("path")
      .datum(RISK_DATA)
      .attr("d", area)
      .attr("fill", "url(#riskGradient)");

    // Line
    const line = d3.line<typeof RISK_DATA[0]>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d.cost))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(RISK_DATA)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 3);

    // Dots with labels
    g.selectAll(".dot")
      .data(RISK_DATA)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => xScale(i))
      .attr("cy", d => yScale(d.cost))
      .attr("r", 6)
      .attr("fill", "#ef4444")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Cost labels
    g.selectAll(".cost-label")
      .data(RISK_DATA)
      .enter()
      .append("text")
      .attr("x", (_, i) => xScale(i))
      .attr("y", d => yScale(d.cost) - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .text(d => `$${d.cost}`);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat((_, i) => RISK_DATA[i]?.label.split(" ")[0] || ""))
      .selectAll("text")
      .attr("fill", "#888")
      .attr("font-size", 10);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d}`))
      .selectAll("text")
      .attr("fill", "#888")
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", "#333");
    g.selectAll(".tick line").attr("stroke", "#333");

  }, [mounted]);

  // Decision Ledger Chart
  useEffect(() => {
    if (!ledgerChartRef.current || !mounted) return;

    const svg = d3.select(ledgerChartRef.current);
    svg.selectAll("*").remove();

    const width = 450;
    const height = 200;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(LEDGER_DATA.map(d => d.date))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(LEDGER_DATA, d => Math.max(d.cost, d.saved)) as number])
      .range([innerHeight, 0])
      .nice();

    // Saved bars
    g.selectAll(".saved-bar")
      .data(LEDGER_DATA)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.date) || 0)
      .attr("y", d => yScale(d.saved))
      .attr("width", xScale.bandwidth() / 2 - 2)
      .attr("height", d => innerHeight - yScale(d.saved))
      .attr("fill", "#22c55e")
      .attr("rx", 3);

    // Cost bars
    g.selectAll(".cost-bar")
      .data(LEDGER_DATA)
      .enter()
      .append("rect")
      .attr("x", d => (xScale(d.date) || 0) + xScale.bandwidth() / 2 + 2)
      .attr("y", d => yScale(d.cost))
      .attr("width", xScale.bandwidth() / 2 - 2)
      .attr("height", d => innerHeight - yScale(d.cost))
      .attr("fill", d => d.decision === "DIY" ? "#3b82f6" : "#f59e0b")
      .attr("rx", 3);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", "#888")
      .attr("font-size", 10)
      .attr("transform", "rotate(-30)")
      .attr("text-anchor", "end");

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d}`))
      .selectAll("text")
      .attr("fill", "#888")
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", "#333");
    g.selectAll(".tick line").attr("stroke", "#333");

  }, [mounted]);

  // Learning Curve Chart
  useEffect(() => {
    if (!learningChartRef.current || !mounted) return;

    const svg = d3.select(learningChartRef.current);
    svg.selectAll("*").remove();

    const width = 450;
    const height = 200;
    const margin = { top: 20, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([1, LEARNING_CURVE.length])
      .range([0, innerWidth]);

    const yScaleTime = d3.scaleLinear()
      .domain([0, d3.max(LEARNING_CURVE, d => d.time) as number])
      .range([innerHeight, 0])
      .nice();

    const yScaleCost = d3.scaleLinear()
      .domain([0, d3.max(LEARNING_CURVE, d => d.cost) as number])
      .range([innerHeight, 0])
      .nice();

    // Time line
    const timeLine = d3.line<typeof LEARNING_CURVE[0]>()
      .x(d => xScale(d.attempt))
      .y(d => yScaleTime(d.time))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(LEARNING_CURVE)
      .attr("d", timeLine)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 3);

    // Cost line
    const costLine = d3.line<typeof LEARNING_CURVE[0]>()
      .x(d => xScale(d.attempt))
      .y(d => yScaleCost(d.cost))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(LEARNING_CURVE)
      .attr("d", costLine)
      .attr("fill", "none")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 3);

    // Time dots
    g.selectAll(".time-dot")
      .data(LEARNING_CURVE)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.attempt))
      .attr("cy", d => yScaleTime(d.time))
      .attr("r", 5)
      .attr("fill", "#f59e0b");

    // Cost dots
    g.selectAll(".cost-dot")
      .data(LEARNING_CURVE)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.attempt))
      .attr("cy", d => yScaleCost(d.cost))
      .attr("r", 5)
      .attr("fill", "#22c55e");

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `#${d}`))
      .selectAll("text")
      .attr("fill", "#888")
      .attr("font-size", 11);

    // Left Y axis (time)
    g.append("g")
      .call(d3.axisLeft(yScaleTime).ticks(5).tickFormat(d => `${d}min`))
      .selectAll("text")
      .attr("fill", "#f59e0b")
      .attr("font-size", 11);

    // Right Y axis (cost)
    g.append("g")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(yScaleCost).ticks(5).tickFormat(d => `$${d}`))
      .selectAll("text")
      .attr("fill", "#22c55e")
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", "#333");
    g.selectAll(".tick line").attr("stroke", "#333");

  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-gradient-to-b from-black via-neutral-950 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/product"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#00F0FF] mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Product
          </Link>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Features that{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-purple-500">
              make the difference
            </span>
          </h1>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Dive deep into the tools that help you make smarter decisions about repairs and maintenance.
          </p>
        </div>
      </section>

      {/* Risk Assessment */}
      <section id="risk-assessment" className="py-20 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono mb-6">
                Risk Assessment
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {FEATURE_SECTIONS[0].title}
              </h2>
              <p className="text-sm text-neutral-500 mb-4">{FEATURE_SECTIONS[0].subtitle}</p>
              <p className="text-neutral-400 mb-8 leading-relaxed">
                {FEATURE_SECTIONS[0].description}
              </p>

              <ul className="space-y-3">
                {FEATURE_SECTIONS[0].features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-neutral-400">Cost Escalation Risk</span>
                <span className="text-xs text-red-400 font-mono">5.9x potential increase</span>
              </div>
              <svg ref={riskChartRef} viewBox="0 0 450 220" className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Decision Ledger */}
      <section id="decision-ledger" className="py-20 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-neutral-950/80 rounded-xl border border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-neutral-400">Decision History</span>
                <div className="flex gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-neutral-500">Saved</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span className="text-neutral-500">DIY Cost</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-amber-500" />
                    <span className="text-neutral-500">Pro Cost</span>
                  </div>
                </div>
              </div>
              <svg ref={ledgerChartRef} viewBox="0 0 450 200" className="w-full" />
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-6">
                Decision Ledger
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {FEATURE_SECTIONS[1].title}
              </h2>
              <p className="text-sm text-neutral-500 mb-4">{FEATURE_SECTIONS[1].subtitle}</p>
              <p className="text-neutral-400 mb-8 leading-relaxed">
                {FEATURE_SECTIONS[1].description}
              </p>

              <ul className="space-y-3">
                {FEATURE_SECTIONS[1].features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Curve */}
      <section id="learning-curve" className="py-20 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono mb-6">
                Learning Curve
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {FEATURE_SECTIONS[2].title}
              </h2>
              <p className="text-sm text-neutral-500 mb-4">{FEATURE_SECTIONS[2].subtitle}</p>
              <p className="text-neutral-400 mb-8 leading-relaxed">
                {FEATURE_SECTIONS[2].description}
              </p>

              <ul className="space-y-3">
                {FEATURE_SECTIONS[2].features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-neutral-400">Skill Improvement Over Time</span>
                <div className="flex gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-amber-500" />
                    <span className="text-neutral-500">Time</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-neutral-500">Cost</span>
                  </div>
                </div>
              </div>
              <svg ref={learningChartRef} viewBox="0 0 450 200" className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to make smarter decisions?
          </h2>
          <p className="text-neutral-400 mb-8">
            Join the waitlist to be first in line when we launch.
          </p>
          <WaitlistModal>
            <Button className="h-14 px-8 font-mono font-bold text-lg bg-[#00F0FF] hover:bg-[#00D4E5] text-black rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(0,240,255,0.4)]">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";

/**
 * Smart Diagnostics Feature Page
 *
 * Intelligent question flow that learns from thousands of cases
 */

// Diagnostic accuracy by question count
const ACCURACY_PROGRESSION = [
  { questions: 1, accuracy: 45, certainty: 20 },
  { questions: 2, accuracy: 62, certainty: 40 },
  { questions: 3, accuracy: 78, certainty: 65 },
  { questions: 4, accuracy: 89, certainty: 82 },
  { questions: 5, accuracy: 95, certainty: 92 },
];

// Common diagnoses by category
const DIAGNOSIS_DATA = [
  { diagnosis: "Clogged drain", frequency: 324, avgQuestions: 2.3 },
  { diagnosis: "Faulty thermostat", frequency: 287, avgQuestions: 3.1 },
  { diagnosis: "Loose connection", frequency: 256, avgQuestions: 2.8 },
  { diagnosis: "Worn gasket", frequency: 198, avgQuestions: 2.5 },
  { diagnosis: "Filter replacement", frequency: 312, avgQuestions: 1.8 },
  { diagnosis: "Low refrigerant", frequency: 167, avgQuestions: 3.4 },
];

const FEATURES = [
  "Adaptive questioning based on responses",
  "Learn from 50,000+ similar cases",
  "Probability scoring for multiple causes",
  "Context-aware follow-ups",
  "Expert-level diagnostic accuracy",
  "Works offline after initial load",
];

const SMART_FEATURES = [
  {
    title: "Adaptive Flow",
    description: "Questions change based on your answers, narrowing down the issue faster.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Multi-Cause Detection",
    description: "Sometimes problems have multiple causes. We identify all likely culprits.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    title: "Confidence Scoring",
    description: "Know exactly how confident we are in each diagnosis with probability scores.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function SmartDiagnosticsPage() {
  const [mounted, setMounted] = useState(false);
  const progressionChartRef = useRef<SVGSVGElement>(null);
  const diagnosisChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Accuracy Progression Chart
  useEffect(() => {
    if (!progressionChartRef.current || !mounted) return;

    const svg = d3.select(progressionChartRef.current);
    svg.selectAll("*").remove();

    const width = 450;
    const height = 220;
    const margin = { top: 20, right: 40, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([1, 5])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Area for accuracy
    const areaAcc = d3.area<typeof ACCURACY_PROGRESSION[0]>()
      .x(d => xScale(d.questions))
      .y0(innerHeight)
      .y1(d => yScale(d.accuracy))
      .curve(d3.curveMonotoneX);

    const gradientAcc = svg.append("defs")
      .append("linearGradient")
      .attr("id", "accGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");

    gradientAcc.append("stop").attr("offset", "0%").attr("stop-color", "#00F0FF").attr("stop-opacity", 0.4);
    gradientAcc.append("stop").attr("offset", "100%").attr("stop-color", "#00F0FF").attr("stop-opacity", 0.05);

    g.append("path")
      .datum(ACCURACY_PROGRESSION)
      .attr("d", areaAcc)
      .attr("fill", "url(#accGradient)");

    // Line for accuracy
    const lineAcc = d3.line<typeof ACCURACY_PROGRESSION[0]>()
      .x(d => xScale(d.questions))
      .y(d => yScale(d.accuracy))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(ACCURACY_PROGRESSION)
      .attr("d", lineAcc)
      .attr("fill", "none")
      .attr("stroke", "#00F0FF")
      .attr("stroke-width", 3);

    // Line for certainty
    const lineCert = d3.line<typeof ACCURACY_PROGRESSION[0]>()
      .x(d => xScale(d.questions))
      .y(d => yScale(d.certainty))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(ACCURACY_PROGRESSION)
      .attr("d", lineCert)
      .attr("fill", "none")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6,4");

    // Dots
    g.selectAll(".acc-dot")
      .data(ACCURACY_PROGRESSION)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.questions))
      .attr("cy", d => yScale(d.accuracy))
      .attr("r", 5)
      .attr("fill", "#00F0FF");

    g.selectAll(".cert-dot")
      .data(ACCURACY_PROGRESSION)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.questions))
      .attr("cy", d => yScale(d.certainty))
      .attr("r", 4)
      .attr("fill", "#22c55e");

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `Q${d}`))
      .selectAll("text")
      .attr("fill", "#888")
      .attr("font-size", 11);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`))
      .selectAll("text")
      .attr("fill", "#888")
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", "#333");
    g.selectAll(".tick line").attr("stroke", "#333");

    // X axis label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#666")
      .attr("font-size", 11)
      .text("Questions Asked");

  }, [mounted]);

  // Diagnosis Frequency Chart (Horizontal Bars)
  useEffect(() => {
    if (!diagnosisChartRef.current || !mounted) return;

    const svg = d3.select(diagnosisChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 250;
    const margin = { top: 10, right: 50, bottom: 20, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yScale = d3.scaleBand()
      .domain(DIAGNOSIS_DATA.map(d => d.diagnosis))
      .range([0, innerHeight])
      .padding(0.3);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(DIAGNOSIS_DATA, d => d.frequency) as number])
      .range([0, innerWidth]);

    // Bars
    g.selectAll(".bar")
      .data(DIAGNOSIS_DATA)
      .enter()
      .append("rect")
      .attr("y", d => yScale(d.diagnosis) || 0)
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .attr("width", d => xScale(d.frequency))
      .attr("fill", "#00F0FF")
      .attr("opacity", 0.7)
      .attr("rx", 4);

    // Labels
    g.selectAll(".label")
      .data(DIAGNOSIS_DATA)
      .enter()
      .append("text")
      .attr("y", d => (yScale(d.diagnosis) || 0) + yScale.bandwidth() / 2)
      .attr("x", -8)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", "#ccc")
      .attr("font-size", 11)
      .text(d => d.diagnosis);

    // Count labels
    g.selectAll(".count")
      .data(DIAGNOSIS_DATA)
      .enter()
      .append("text")
      .attr("y", d => (yScale(d.diagnosis) || 0) + yScale.bandwidth() / 2)
      .attr("x", d => xScale(d.frequency) + 8)
      .attr("dy", "0.35em")
      .attr("fill", "#888")
      .attr("font-size", 11)
      .text(d => d.frequency);

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

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Smart Diagnostics
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Answer questions.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Get answers.
            </span>
          </h1>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10">
            Smart diagnostics asks the right questions in the right order, learning from thousands of
            similar cases to diagnose your issue with expert-level accuracy.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 font-mono font-bold bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              Start Diagnosis
            </Button>
          </WaitlistModal>
        </div>
      </section>

      {/* Smart Features */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {SMART_FEATURES.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accuracy Progression */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                95% accuracy in just 5 questions
              </h2>
              <p className="text-neutral-400 mb-8">
                Our diagnostic engine narrows down issues fast. With each question,
                accuracy and confidence increase exponentially.
              </p>

              <ul className="space-y-3">
                {FEATURES.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-neutral-400">Diagnostic Accuracy</span>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#00F0FF]" />
                    <span className="text-neutral-500">Accuracy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-neutral-500">Certainty</span>
                  </div>
                </div>
              </div>
              <svg ref={progressionChartRef} viewBox="0 0 450 220" className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Common Diagnoses */}
      <section className="py-20 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-neutral-950/80 rounded-xl border border-neutral-800 p-6">
              <div className="mb-4">
                <span className="text-sm font-medium text-neutral-400">Most Common Diagnoses</span>
              </div>
              <svg ref={diagnosisChartRef} viewBox="0 0 400 250" className="w-full" />
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold mb-4">
                Learning from 50,000+ cases
              </h2>
              <p className="text-neutral-400 mb-8">
                Our system has been trained on tens of thousands of real diagnostic sessions.
                It knows the patterns, the edge cases, and the quick wins.
              </p>

              <ul className="space-y-3">
                {FEATURES.slice(3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to diagnose smarter?
          </h2>
          <p className="text-neutral-400 mb-8">
            Join the waitlist to be first in line when we launch.
          </p>
          <WaitlistModal>
            <Button className="h-14 px-8 font-mono font-bold text-lg bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";

const ACCURACY_DATA = [
  { quality: "Low", accuracy: 72, time: 1.2 },
  { quality: "Medium", accuracy: 88, time: 0.9 },
  { quality: "High", accuracy: 95, time: 0.6 },
  { quality: "HD", accuracy: 98, time: 0.4 },
];

const DETECTION_CATEGORIES = [
  { category: "Plumbing", count: 1847, color: "#3b82f6" },
  { category: "Electrical", count: 1234, color: "#f59e0b" },
  { category: "HVAC", count: 956, color: "#22c55e" },
  { category: "Structural", count: 723, color: "#ef4444" },
  { category: "Appliances", count: 1456, color: "#8b5cf6" },
  { category: "Exterior", count: 892, color: "#06b6d4" },
];

const FEATURES = [
  "Instant issue identification from any angle",
  "Multi-issue detection in single photos",
  "Severity assessment (minor, moderate, urgent)",
  "Part and component recognition",
  "Brand and model identification",
  "Damage extent estimation",
];

const HOW_IT_WORKS = [
  { step: 1, title: "Upload", description: "Take or upload a photo of the issue" },
  { step: 2, title: "Analyze", description: "Image is processed in under 2 seconds" },
  { step: 3, title: "Results", description: "Get detailed diagnosis and recommendations" },
];

export default function PhotoAnalysisPage() {
  const [mounted, setMounted] = useState(false);
  const accuracyChartRef = useRef<SVGSVGElement>(null);
  const categoryChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!accuracyChartRef.current || !mounted) return;

    const svg = d3.select(accuracyChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 220;
    const margin = { top: 20, right: 50, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(ACCURACY_DATA.map(d => d.quality))
      .range([0, innerWidth])
      .padding(0.4);

    const yScaleAcc = d3.scaleLinear()
      .domain([60, 100])
      .range([innerHeight, 0]);

    const yScaleTime = d3.scaleLinear()
      .domain([0, 1.5])
      .range([innerHeight, 0]);

    //  bars
    g.selectAll(".acc-bar")
      .data(ACCURACY_DATA)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.quality) || 0)
      .attr("y", d => yScaleAcc(d.accuracy))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScaleAcc(d.accuracy))
      .attr("fill", "#00F0FF")
      .attr("rx", 4)
      .attr("opacity", 0.8);

    // Accuracy labels
    g.selectAll(".acc-label")
      .data(ACCURACY_DATA)
      .enter()
      .append("text")
      .attr("x", d => (xScale(d.quality) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => yScaleAcc(d.accuracy) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#00F0FF")
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .text(d => `${d.accuracy}%`);

    // Time line
    const timeLine = d3.line<typeof ACCURACY_DATA[0]>()
      .x(d => (xScale(d.quality) || 0) + xScale.bandwidth() / 2)
      .y(d => yScaleTime(d.time))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(ACCURACY_DATA)
      .attr("d", timeLine)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6,4");

    // Time dots
    g.selectAll(".time-dot")
      .data(ACCURACY_DATA)
      .enter()
      .append("circle")
      .attr("cx", d => (xScale(d.quality) || 0) + xScale.bandwidth() / 2)
      .attr("cy", d => yScaleTime(d.time))
      .attr("r", 4)
      .attr("fill", "#f59e0b");

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", "#888")
      .attr("font-size", 11);

    // Left Y axis
    g.append("g")
      .call(d3.axisLeft(yScaleAcc).ticks(5).tickFormat(d => `${d}%`))
      .selectAll("text")
      .attr("fill", "#00F0FF")
      .attr("font-size", 11);

    // Right Y axis
    g.append("g")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(yScaleTime).ticks(4).tickFormat(d => `${d}s`))
      .selectAll("text")
      .attr("fill", "#f59e0b")
      .attr("font-size", 11);

    g.selectAll(".domain").attr("stroke", "#333");
    g.selectAll(".tick line").attr("stroke", "#333");

  }, [mounted]);

  // Category Distribution Chart (Donut)
  useEffect(() => {
    if (!categoryChartRef.current || !mounted) return;

    const svg = d3.select(categoryChartRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 20;

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<typeof DETECTION_CATEGORIES[0]>()
      .value(d => d.count)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<typeof DETECTION_CATEGORIES[0]>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);

    const arcs = g.selectAll(".arc")
      .data(pie(DETECTION_CATEGORIES))
      .enter()
      .append("g");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => d.data.color)
      .attr("stroke", "#000")
      .attr("stroke-width", 2)
      .attr("opacity", 0.85);

    // Center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .attr("fill", "#fff")
      .attr("font-size", 24)
      .attr("font-weight", "bold")
      .text("7,108");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("fill", "#888")
      .attr("font-size", 12)
      .text("Issues Detected");

  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      <section className="pt-28 pb-16 px-6 bg-linear-to-b from-black via-neutral-950 to-black">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-mono mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            Photo Analysis
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            See the problem.{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00F0FF] to-blue-500">
              Know the solution.
            </span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10">
            Upload a photo of any issue and get instant analysis.
            Identify problems, estimate severity, and get actionable recommendations in seconds.
          </p>
          <WaitlistModal>
            <Button className="h-12 px-8 font-mono font-bold bg-[#00F0FF] hover:bg-[#00D4E5] text-black rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              Try Photo Analysis
            </Button>
          </WaitlistModal>
        </div>
      </section>
      
      <section className="py-20 px-6 bg-linear-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Higher quality = Better results
              </h2>
              <p className="text-neutral-400 mb-8">
                The system adapts to image quality, but clearer photos mean faster analysis and higher accuracy.
                Even low-quality images achieve 72% accuracy for common issues.
              </p>

              <ul className="space-y-3">
                {FEATURES.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-[#00F0FF] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-neutral-400">Accuracy vs. Image Quality</span>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#00F0FF]" />
                    <span className="text-neutral-500">Accuracy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-amber-500" />
                    <span className="text-neutral-500">Time</span>
                  </div>
                </div>
              </div>
              <svg ref={accuracyChartRef} viewBox="0 0 400 220" className="w-full" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-neutral-950/80 rounded-xl border border-neutral-800 p-6">
              <div className="flex justify-center">
                <svg ref={categoryChartRef} viewBox="0 0 300 300" className="w-full max-w-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {DETECTION_CATEGORIES.map((cat) => (
                  <div key={cat.category} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: cat.color }} />
                    <span className="text-neutral-400">{cat.category}</span>
                    <span className="text-neutral-600 ml-auto">{cat.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold mb-4">
                Trained on 7,000+ real issues
              </h2>
              <p className="text-neutral-400 mb-8">
                Our system has analyzed thousands of real-world problems across every category.
                From leaky pipes to faulty wiring, we've seen it all.
              </p>

              <ul className="space-y-3">
                {FEATURES.slice(3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-[#00F0FF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <section className="py-20 px-6 bg-linear-to-b from-black to-neutral-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to diagnose any problem?
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

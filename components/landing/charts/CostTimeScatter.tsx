"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import * as d3 from "d3";

/**
 * Cost vs Time Scatterplot
 *
 * D3.js visualization showing decision outcomes across cost and time axes
 * Points are colored by decision type (DIY, outsource, defer)
 * Hover for details, GSAP animations on load
 */

interface DataPoint {
  id: string;
  label: string;
  cost: number;
  time: number;
  decision: "diy" | "outsource" | "defer";
  outcome: "success" | "partial" | "issue";
}

const SAMPLE_DATA: DataPoint[] = [
  { id: "1", label: "Kitchen Faucet", cost: 25, time: 0.5, decision: "diy", outcome: "success" },
  { id: "2", label: "Garage Door", cost: 15, time: 0.5, decision: "diy", outcome: "success" },
  { id: "3", label: "Furnace Repair", cost: 280, time: 2, decision: "outsource", outcome: "success" },
  { id: "4", label: "AC Filter", cost: 15, time: 0.1, decision: "diy", outcome: "success" },
  { id: "5", label: "Ceiling Crack", cost: 35, time: 1.5, decision: "diy", outcome: "success" },
  { id: "6", label: "Car Shudder", cost: 150, time: 2, decision: "outsource", outcome: "success" },
  { id: "7", label: "Bathroom Clog", cost: 20, time: 0.5, decision: "diy", outcome: "success" },
  { id: "8", label: "Pond Algae", cost: 45, time: 2, decision: "diy", outcome: "partial" },
  { id: "9", label: "Drywall Hole", cost: 30, time: 3, decision: "diy", outcome: "success" },
  { id: "10", label: "Roof Leak", cost: 500, time: 4, decision: "outsource", outcome: "success" },
  { id: "11", label: "Window Seal", cost: 0, time: 0, decision: "defer", outcome: "partial" },
  { id: "12", label: "Sole Swap", cost: 85, time: 1, decision: "outsource", outcome: "success" },
];

const DECISION_COLORS = {
  diy: "#00FF88",
  outsource: "#00F0FF",
  defer: "#FF8800",
};

export function CostTimeScatter() {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !mounted) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 420;
    const height = 280;
    const margin = { top: 24, right: 24, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(SAMPLE_DATA, d => d.time) || 5])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(SAMPLE_DATA, d => d.cost) || 600])
      .range([innerHeight, 0])
      .nice();

    // Grid
    g.append("g")
      .selectAll("line")
      .data(xScale.ticks(5))
      .enter()
      .append("line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#1a1a1a")
      .attr("stroke-dasharray", "2,2");

    g.append("g")
      .selectAll("line")
      .data(yScale.ticks(5))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#1a1a1a")
      .attr("stroke-dasharray", "2,2");

    // Quadrant labels
    g.append("text")
      .attr("x", innerWidth * 0.25)
      .attr("y", innerHeight * 0.25)
      .attr("fill", "#333")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .text("Quick & Cheap");

    g.append("text")
      .attr("x", innerWidth * 0.75)
      .attr("y", innerHeight * 0.75)
      .attr("fill", "#333")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .text("Slow & Expensive");

    // Points
    const points = g.selectAll(".point")
      .data(SAMPLE_DATA)
      .enter()
      .append("g")
      .attr("class", "point")
      .attr("transform", d => `translate(${xScale(d.time)}, ${yScale(d.cost)})`);

    points.append("circle")
      .attr("r", 0)
      .attr("fill", d => DECISION_COLORS[d.decision])
      .attr("fill-opacity", 0.7)
      .attr("stroke", d => DECISION_COLORS[d.decision])
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function(event, d) {
        gsap.to(this, { scale: 1.5, duration: 0.2 });
        if (tooltipRef.current) {
          tooltipRef.current.style.display = "block";
          tooltipRef.current.innerHTML = `
            <div class="font-semibold text-white">${d.label}</div>
            <div class="text-xs text-neutral-400">$${d.cost} · ${d.time}h</div>
            <div class="text-xs mt-1" style="color: ${DECISION_COLORS[d.decision]}">${d.decision.toUpperCase()}</div>
          `;
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            tooltipRef.current.style.left = `${event.clientX - rect.left + 10}px`;
            tooltipRef.current.style.top = `${event.clientY - rect.top - 40}px`;
          }
        }
      })
      .on("mouseleave", function() {
        gsap.to(this, { scale: 1, duration: 0.2 });
        if (tooltipRef.current) {
          tooltipRef.current.style.display = "none";
        }
      });

    // Animate points appearing
    points.selectAll("circle").each(function(d: unknown, i: number) {
      const dataPoint = d as DataPoint;
      gsap.to(this, {
        attr: { r: dataPoint.outcome === "success" ? 8 : 6 },
        duration: 0.5,
        delay: i * 0.05,
        ease: "back.out(1.7)",
      });
    });

    // X Axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}h`));

    xAxis.selectAll("text").attr("fill", "#666").attr("font-size", 10);
    xAxis.selectAll("line").attr("stroke", "#333");
    xAxis.select(".domain").attr("stroke", "#333");

    // X Label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("fill", "#666")
      .attr("font-size", 11)
      .attr("text-anchor", "middle")
      .text("Time Investment →");

    // Y Axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d}`));

    yAxis.selectAll("text").attr("fill", "#666").attr("font-size", 10);
    yAxis.selectAll("line").attr("stroke", "#333");
    yAxis.select(".domain").attr("stroke", "#333");

    // Y Label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -45)
      .attr("fill", "#666")
      .attr("font-size", 11)
      .attr("text-anchor", "middle")
      .text("Cost ($)");

  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Cost vs Time Analysis</h3>
        <div className="flex items-center gap-4">
          {Object.entries(DECISION_COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-neutral-400 capitalize">{key}</span>
            </div>
          ))}
        </div>
      </div>
      <svg ref={svgRef} viewBox="0 0 420 280" className="w-full" />
      <div
        ref={tooltipRef}
        className="absolute hidden pointer-events-none z-10 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl"
        style={{ display: "none" }}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as d3 from "d3";
import { IoTrendingUp, IoCalendar, IoCash, IoTime, IoConstruct, IoPeople } from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Decision Timeline Visualization
 *
 * Interactive horizontal timeline showing decisions over time
 * Cumulative savings line overlay
 * Scroll-driven reveal animation
 */

interface Decision {
  id: number;
  date: Date;
  title: string;
  type: "diy" | "pro" | "defer";
  savedAmount: number;
  cumulativeSaved: number;
  timeSpent: number;
  category: string;
}

// Generate mock decision history
const generateDecisions = (): Decision[] => {
  const decisions: Decision[] = [];
  const categories = ["Plumbing", "Electrical", "HVAC", "Appliance", "Exterior", "Interior"];
  const titles = [
    "Faucet repair", "Light fixture", "AC filter", "Dishwasher drain",
    "Gutter cleaning", "Ceiling crack", "Thermostat", "Door hinge",
    "Window seal", "Garage door", "Water heater", "Outlet replacement"
  ];

  let cumulative = 0;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  for (let i = 0; i < 12; i++) {
    const type = Math.random() > 0.7 ? "pro" : Math.random() > 0.9 ? "defer" : "diy";
    const saved = type === "diy" ? Math.floor(Math.random() * 300) + 50 :
                  type === "pro" ? 0 : Math.floor(Math.random() * 100);
    cumulative += saved;

    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 15 + Math.floor(Math.random() * 10));

    decisions.push({
      id: i + 1,
      date,
      title: titles[i % titles.length],
      type,
      savedAmount: saved,
      cumulativeSaved: cumulative,
      timeSpent: type === "diy" ? Math.random() * 3 + 0.5 : 0,
      category: categories[Math.floor(Math.random() * categories.length)],
    });
  }

  return decisions;
};

const DECISIONS = generateDecisions();

const TYPE_COLORS = {
  diy: "#22c55e",
  pro: "#3b82f6",
  defer: "#f59e0b",
};

const TYPE_LABELS = {
  diy: "DIY",
  pro: "Hired Pro",
  defer: "Deferred",
};

export function DecisionTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 260 });

  useEffect(() => {
    setMounted(true);

    const updateDimensions = () => {
      const width = Math.min(window.innerWidth - 48, 700);
      setDimensions({ width, height: 260 });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // D3 Timeline Chart
  useEffect(() => {
    if (!svgRef.current || !mounted) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 40, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(DECISIONS, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(DECISIONS, d => d.cumulativeSaved) || 1000])
      .range([innerHeight, 0]);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(yScale.ticks(5))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#374151")
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.5);

    // Area under line
    const area = d3.area<Decision>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(d.cumulativeSaved))
      .curve(d3.curveMonotoneX);

    const areaPath = g.append("path")
      .datum(DECISIONS)
      .attr("fill", "url(#areaGradient)")
      .attr("d", area)
      .attr("opacity", 0);

    // Gradient for area
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "areaGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#22c55e")
      .attr("stop-opacity", 0.3);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#22c55e")
      .attr("stop-opacity", 0.05);

    // Line
    const line = d3.line<Decision>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.cumulativeSaved))
      .curve(d3.curveMonotoneX);

    const linePath = g.append("path")
      .datum(DECISIONS)
      .attr("fill", "none")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Animate line drawing
    const totalLength = linePath.node()?.getTotalLength() || 0;
    linePath
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength);

    // Decision dots
    const dots = g.selectAll(".decision-dot")
      .data(DECISIONS)
      .enter()
      .append("g")
      .attr("class", "decision-dot")
      .attr("transform", d => `translate(${xScale(d.date)}, ${yScale(d.cumulativeSaved)})`)
      .style("cursor", "pointer")
      .on("mouseenter", function(event, d) {
        setSelectedDecision(d);
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", 10);
      })
      .on("mouseleave", function() {
        setSelectedDecision(null);
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", 7);
      });

    dots.append("circle")
      .attr("r", 7)
      .attr("fill", d => TYPE_COLORS[d.type])
      .attr("stroke", "#1f2937")
      .attr("stroke-width", 2)
      .attr("opacity", 0);

    // X Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d3.timeFormat("%b %d") as any);

    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "#9ca3af")
      .attr("font-size", "11px");

    g.selectAll(".domain, .tick line").attr("stroke", "#4b5563");

    // Y Axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("fill", "#9ca3af")
      .attr("font-size", "11px")
      .text("Cumulative Savings ($)");

    // Scroll-triggered animation
    if (sectionRef.current) {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        onEnter: () => {
          // Animate line
          linePath.transition()
            .duration(2000)
            .ease(d3.easeCubicOut)
            .attr("stroke-dashoffset", 0);

          // Animate area
          areaPath.transition()
            .duration(2000)
            .delay(500)
            .attr("opacity", 1);

          // Animate dots
          dots.selectAll("circle")
            .transition()
            .duration(400)
            .delay((_, i) => i * 100 + 500)
            .attr("opacity", 1);
        },
      });
    }

  }, [mounted, dimensions]);

  // Section animations
  useEffect(() => {
    if (!sectionRef.current || !mounted) return;

    const ctx = gsap.context(() => {
      gsap.from(".timeline-header", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) return null;

  const totalSaved = DECISIONS[DECISIONS.length - 1].cumulativeSaved;
  const diyCount = DECISIONS.filter(d => d.type === "diy").length;
  const totalTime = DECISIONS.reduce((sum, d) => sum + d.timeSpent, 0);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-gray-900 overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
        {/* Header */}
        <div className="timeline-header text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-4">
            <IoTrendingUp className="w-3.5 h-3.5" />
            Decision Ledger
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
            Watch Your Savings{" "}
            <span className="text-emerald-400">Compound</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-400">
            Every decision is logged. Every dollar tracked. Over time, smart choices add up to real savings.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-center">
            <IoCash className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">${totalSaved}</div>
            <div className="text-xs text-gray-400">Total Saved</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-center">
            <IoConstruct className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{diyCount}/{DECISIONS.length}</div>
            <div className="text-xs text-gray-400">DIY Decisions</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-center">
            <IoTime className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalTime.toFixed(1)}h</div>
            <div className="text-xs text-gray-400">Time Invested</div>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="bg-gray-800/30 rounded-2xl border border-gray-700 p-4 lg:p-6 overflow-x-auto">
          <div className="flex justify-center">
            <svg ref={svgRef} />
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            {(Object.keys(TYPE_COLORS) as Array<keyof typeof TYPE_COLORS>).map(type => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: TYPE_COLORS[type] }}
                />
                <span className="text-xs text-gray-400">{TYPE_LABELS[type]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Decision Tooltip */}
        {selectedDecision && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-xl z-50 min-w-[280px]">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-medium text-white">{selectedDecision.title}</div>
                <div className="text-xs text-gray-400">{selectedDecision.category}</div>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${TYPE_COLORS[selectedDecision.type]}20`,
                  color: TYPE_COLORS[selectedDecision.type],
                }}
              >
                {TYPE_LABELS[selectedDecision.type]}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <IoCalendar className="w-3 h-3" />
                {selectedDecision.date.toLocaleDateString()}
              </span>
              {selectedDecision.savedAmount > 0 && (
                <span className="text-emerald-400 font-medium">
                  Saved ${selectedDecision.savedAmount}
                </span>
              )}
              {selectedDecision.timeSpent > 0 && (
                <span className="flex items-center gap-1">
                  <IoTime className="w-3 h-3" />
                  {selectedDecision.timeSpent.toFixed(1)}h
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import * as d3 from "d3";

/**
 * Decision Flow Demo
 *
 * Interactive D3.js decision tree + GSAP animations
 * User selects an issue → tree branches animate → hover for cost/time details
 *
 * 5-second insight: "This shows me my options instantly. No searching, no guessing."
 */

interface FlowNode {
  id: string;
  label: string;
  type: "issue" | "path" | "action";
  cost?: string;
  time?: string;
  risk?: "low" | "medium" | "high";
  children?: FlowNode[];
}

const SCENARIOS: Record<string, FlowNode> = {
  ceiling: {
    id: "root",
    label: "Ceiling Crack",
    type: "issue",
    children: [
      {
        id: "diy",
        label: "DIY",
        type: "path",
        children: [
          { id: "diy-cosmetic", label: "Patch & Paint", type: "action", cost: "$25", time: "2 hrs", risk: "low" },
          { id: "diy-tape", label: "Drywall Tape", type: "action", cost: "$40", time: "4 hrs", risk: "medium" },
        ],
      },
      {
        id: "outsource",
        label: "Hire Pro",
        type: "path",
        children: [
          { id: "pro-drywall", label: "Drywall Contractor", type: "action", cost: "$200", time: "1 day", risk: "low" },
          { id: "pro-structural", label: "Structural Engineer", type: "action", cost: "$500", time: "3 days", risk: "low" },
        ],
      },
      {
        id: "defer",
        label: "Monitor",
        type: "path",
        children: [
          { id: "defer-photo", label: "Photo & Wait", type: "action", cost: "$0", time: "30 days", risk: "medium" },
        ],
      },
    ],
  },
  garage: {
    id: "root",
    label: "Garage Door Noise",
    type: "issue",
    children: [
      {
        id: "diy",
        label: "DIY",
        type: "path",
        children: [
          { id: "diy-lube", label: "Lubricate Tracks", type: "action", cost: "$12", time: "20 min", risk: "low" },
          { id: "diy-tighten", label: "Tighten Hardware", type: "action", cost: "$0", time: "30 min", risk: "low" },
        ],
      },
      {
        id: "outsource",
        label: "Hire Pro",
        type: "path",
        children: [
          { id: "pro-tune", label: "Door Tune-Up", type: "action", cost: "$150", time: "Same day", risk: "low" },
          { id: "pro-spring", label: "Spring Replace", type: "action", cost: "$350", time: "1 day", risk: "low" },
        ],
      },
      {
        id: "defer",
        label: "Wait",
        type: "path",
        children: [
          { id: "defer-risk", label: "Risk: Spring Failure", type: "action", cost: "$0", time: "?", risk: "high" },
        ],
      },
    ],
  },
  transmission: {
    id: "root",
    label: "Car Shudders",
    type: "issue",
    children: [
      {
        id: "diy",
        label: "DIY Check",
        type: "path",
        children: [
          { id: "diy-fluid", label: "Check Fluid", type: "action", cost: "$0", time: "10 min", risk: "low" },
          { id: "diy-scan", label: "OBD Scanner", type: "action", cost: "$30", time: "15 min", risk: "low" },
        ],
      },
      {
        id: "outsource",
        label: "Mechanic",
        type: "path",
        children: [
          { id: "pro-diag", label: "Diagnostic", type: "action", cost: "$100", time: "1 hr", risk: "low" },
          { id: "pro-service", label: "Trans Service", type: "action", cost: "$250", time: "3 hrs", risk: "low" },
        ],
      },
      {
        id: "defer",
        label: "Ignore",
        type: "path",
        children: [
          { id: "defer-risk", label: "Risk: Trans Failure", type: "action", cost: "$0→$4K", time: "?", risk: "high" },
        ],
      },
    ],
  },
};

const PATH_COLORS = {
  diy: "#00FF88",
  outsource: "#00F0FF",
  defer: "#FF8800",
};

const RISK_COLORS = {
  low: "#00FF88",
  medium: "#FF8800",
  high: "#FF4444",
};

export function DecisionFlowDemo() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>("ceiling");
  const [hoveredNode, setHoveredNode] = useState<FlowNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // D3 tree rendering
  useEffect(() => {
    if (!svgRef.current || !mounted) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 380;
    const height = 280;
    const scenario = SCENARIOS[selectedScenario];

    // Create hierarchy
    const root = d3.hierarchy(scenario);
    const treeLayout = d3.tree<FlowNode>().size([width - 60, height - 80]);
    const treeData = treeLayout(root);

    const g = svg.append("g").attr("transform", "translate(30, 40)");

    // Draw links with GSAP animation
    const links = g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", d => {
        const pathType = d.source.data.id === "root" ? d.target.data.id : d.source.data.id;
        return PATH_COLORS[pathType as keyof typeof PATH_COLORS] || "#444";
      })
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.4)
      .attr("d", d3.linkVertical<d3.HierarchyPointLink<FlowNode>, d3.HierarchyPointNode<FlowNode>>()
        .x(d => d.x)
        .y(d => d.y)
      );

    // Animate links
    links.each(function(d, i) {
      const path = this as SVGPathElement;
      const length = path.getTotalLength();
      gsap.fromTo(path,
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 0.5, delay: i * 0.1, ease: "power2.out" }
      );
    });

    // Draw nodes
    const nodes = g.selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer")
      .on("mouseenter", function(event, d) {
        if (d.data.type === "action") {
          setHoveredNode(d.data);
          const rect = (event.target as Element).getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (containerRect) {
            setTooltipPos({
              x: rect.left - containerRect.left + rect.width / 2,
              y: rect.top - containerRect.top - 10,
            });
          }
        }
      })
      .on("mouseleave", () => setHoveredNode(null));

    // Node circles
    nodes.append("circle")
      .attr("r", d => d.data.type === "issue" ? 20 : d.data.type === "path" ? 16 : 12)
      .attr("fill", "#0a0a0a")
      .attr("stroke", d => {
        if (d.data.type === "issue") return "#00F0FF";
        if (d.data.type === "path") return PATH_COLORS[d.data.id as keyof typeof PATH_COLORS] || "#666";
        return d.data.risk ? RISK_COLORS[d.data.risk] : "#666";
      })
      .attr("stroke-width", 2)
      .attr("opacity", 0);

    // Animate nodes appearing
    nodes.selectAll("circle").each(function(d, i) {
      gsap.to(this, {
        opacity: 1,
        duration: 0.3,
        delay: 0.3 + i * 0.08,
        ease: "back.out(1.7)",
      });
    });

    // Node labels
    nodes.append("text")
      .attr("dy", d => d.data.type === "issue" ? 35 : d.data.type === "path" ? 28 : 24)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", d => d.data.type === "issue" ? 11 : d.data.type === "path" ? 10 : 9)
      .attr("font-weight", d => d.data.type === "issue" ? 600 : 500)
      .text(d => d.data.label)
      .attr("opacity", 0);

    nodes.selectAll("text").each(function(d, i) {
      gsap.to(this, {
        opacity: 1,
        duration: 0.3,
        delay: 0.4 + i * 0.08,
      });
    });

  }, [selectedScenario, mounted]);

  if (!mounted) return null;

  return (
    <section className="relative py-20 lg:py-28 bg-black overflow-hidden">
      {/* Subtle background grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
              <span className="text-xs font-medium text-[#00F0FF]">Interactive Demo</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              See Every Path.<br />
              <span className="text-[#00F0FF]">Before You Start.</span>
            </h2>

            <p className="text-lg text-neutral-400 mb-6 leading-relaxed">
              Pick an issue. Watch the decision tree unfold.
              Hover any endpoint to see cost, time, and risk.
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#00FF88]" />
                <span className="text-neutral-300">Green = DIY options</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#00F0FF]" />
                <span className="text-neutral-300">Cyan = Professional help</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#FF8800]" />
                <span className="text-neutral-300">Orange = Wait and monitor</span>
              </div>
            </div>
          </div>

          {/* Interactive Demo */}
          <div ref={containerRef} className="relative">
            {/* Scenario Selector */}
            <div className="flex gap-2 mb-4">
              {[
                { id: "ceiling", label: "Ceiling Crack", icon: "🏠" },
                { id: "garage", label: "Garage Door", icon: "🚗" },
                { id: "transmission", label: "Car Issue", icon: "🔧" },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenario(s.id)}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedScenario === s.id
                      ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40"
                      : "bg-neutral-900/80 text-neutral-400 border border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <span className="mr-1.5">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>

            {/* D3 Visualization */}
            <div className="relative bg-neutral-950/80 rounded-xl border border-neutral-800 p-2 backdrop-blur-sm">
              <svg
                ref={svgRef}
                viewBox="0 0 380 280"
                className="w-full h-auto"
                style={{ minHeight: 280 }}
              />

              {/* Tooltip */}
              {hoveredNode && hoveredNode.cost && (
                <div
                  className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl"
                  style={{
                    left: tooltipPos.x,
                    top: tooltipPos.y,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div className="text-xs font-semibold text-white mb-1">{hoveredNode.label}</div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#00FF88] font-mono">{hoveredNode.cost}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-400">{hoveredNode.time}</span>
                    {hoveredNode.risk && (
                      <>
                        <span className="text-neutral-500">•</span>
                        <span style={{ color: RISK_COLORS[hoveredNode.risk] }}>
                          {hoveredNode.risk} risk
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-neutral-600 mt-3">
              Hover endpoints to see details
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

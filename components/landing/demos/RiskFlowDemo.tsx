"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import * as d3 from "d3";

/**
 * Risk Flow Demo - Expanded with many charts
 *
 * Shows how mistakes compound with multiple D3 visualizations:
 * - Line chart (cost escalation)
 * - Treemap (cost breakdown)
 * - Radial chart (risk factors)
 * - Sankey-style flow
 * - Gauge (current risk level)
 */

interface RiskStep {
  id: number;
  action: string;
  consequence: string;
  costDelta: number;
  risk: "safe" | "warning" | "danger" | "critical";
}

const SCENARIO = {
  title: "Water Heater Service",
  subtitle: "Attempting DIY sediment flush",
  startCost: 150,
  maxCost: 2500,
  steps: [
    { id: 1, action: "Skip pressure valve check", consequence: "Pressure builds silently", costDelta: 0, risk: "warning" as const },
    { id: 2, action: "Open drain valve too fast", consequence: "Sediment clogs valve", costDelta: 120, risk: "warning" as const },
    { id: 3, action: "Force the stuck valve", consequence: "Valve cracks, water leaks", costDelta: 350, risk: "danger" as const },
    { id: 4, action: "Slow to find shutoff", consequence: "Floor water damage", costDelta: 800, risk: "critical" as const },
    { id: 5, action: "No wet-vac ready", consequence: "Subfloor damage begins", costDelta: 1100, risk: "critical" as const },
  ],
};

const RISK_COLORS = {
  safe: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  critical: "#dc2626",
};

// Cost breakdown for treemap
const COST_BREAKDOWN = [
  { name: "Labor", value: 180, category: "direct" },
  { name: "Parts", value: 95, category: "direct" },
  { name: "Water Damage", value: 450, category: "damage" },
  { name: "Flooring", value: 320, category: "damage" },
  { name: "Mold Prevention", value: 150, category: "secondary" },
  { name: "Tools Ruined", value: 85, category: "secondary" },
  { name: "Time Lost", value: 200, category: "opportunity" },
];

// Risk factors for radial
const RISK_FACTORS = [
  { factor: "Skill Gap", score: 75 },
  { factor: "Tool Access", score: 45 },
  { factor: "Time Pressure", score: 60 },
  { factor: "Safety Risk", score: 85 },
  { factor: "Cost if Wrong", score: 90 },
  { factor: "Complexity", score: 70 },
];

// Questions that prevent disasters
const SMART_QUESTIONS = [
  { question: "Gas smell present?", impact: "critical", action: "Call pro immediately" },
  { question: "Pressure valve dripping?", impact: "high", action: "Check before proceeding" },
  { question: "Tank age > 10 years?", impact: "medium", action: "Consider replacement" },
  { question: "Access to shutoff?", impact: "high", action: "Locate first" },
  { question: "Wet-vac available?", impact: "medium", action: "Have ready" },
];

export function RiskFlowDemo() {
  const lineChartRef = useRef<SVGSVGElement>(null);
  const treemapRef = useRef<SVGSVGElement>(null);
  const radialRef = useRef<SVGSVGElement>(null);
  const gaugeRef = useRef<SVGSVGElement>(null);
  const heatmapRef = useRef<SVGSVGElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalCost, setTotalCost] = useState(SCENARIO.startCost);
  const [isPaused, setIsPaused] = useState(false);


  // Slow auto-play through steps
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= SCENARIO.steps.length) {
          setTimeout(() => {
            setCurrentStep(0);
            setTotalCost(SCENARIO.startCost);
          }, 3000);
          return prev;
        }
        const step = SCENARIO.steps[prev];
        if (step) {
          setTotalCost(current => current + step.costDelta);
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Line Chart - Cost Escalation
  useEffect(() => {
    if (!lineChartRef.current) return;

    const svg = d3.select(lineChartRef.current);
    svg.selectAll("*").remove();

    const width = 280;
    const height = 140;
    const margin = { top: 15, right: 15, bottom: 25, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Build data points
    const dataPoints = [{ step: 0, cost: SCENARIO.startCost }];
    let runningCost = SCENARIO.startCost;
    for (let i = 0; i < currentStep; i++) {
      runningCost += SCENARIO.steps[i].costDelta;
      dataPoints.push({ step: i + 1, cost: runningCost });
    }

    const xScale = d3.scaleLinear().domain([0, SCENARIO.steps.length]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, SCENARIO.maxCost]).range([innerHeight, 0]);

    // Danger zone
    g.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", innerWidth)
      .attr("height", yScale(1000))
      .attr("fill", "#ef4444")
      .attr("opacity", 0.1);

    // Area under line
    const area = d3.area<{ step: number; cost: number }>()
      .x(d => xScale(d.step))
      .y0(innerHeight)
      .y1(d => yScale(d.cost))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(dataPoints)
      .attr("fill", currentStep >= 3 ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)")
      .attr("d", area);

    // Line
    const line = d3.line<{ step: number; cost: number }>()
      .x(d => xScale(d.step))
      .y(d => yScale(d.cost))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(dataPoints)
      .attr("fill", "none")
      .attr("stroke", currentStep >= 3 ? "#ef4444" : currentStep >= 1 ? "#f59e0b" : "#22c55e")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Points
    g.selectAll(".point")
      .data(dataPoints)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.step))
      .attr("cy", d => yScale(d.cost))
      .attr("r", 4)
      .attr("fill", (d, i) => {
        if (i === 0) return "#22c55e";
        return RISK_COLORS[SCENARIO.steps[i - 1]?.risk || "safe"];
      });

    // Axes
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickSize(0))
      .call(g => g.select(".domain").attr("stroke", "#404040"))
      .call(g => g.selectAll(".tick text").attr("fill", "#737373").attr("font-size", 8));

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(4).tickFormat(d => `$${d}`))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#262626").attr("x2", innerWidth))
      .call(g => g.selectAll(".tick text").attr("fill", "#737373").attr("font-size", 8));

  }, [currentStep]);

  // Treemap - Cost Breakdown
  useEffect(() => {
    if (!treemapRef.current) return;

    const svg = d3.select(treemapRef.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 140;

    const colorScale: Record<string, string> = {
      direct: "#3b82f6",
      damage: "#ef4444",
      secondary: "#f59e0b",
      opportunity: "#8b5cf6",
    };

    type TreemapNode = { name?: string; value?: number; category?: string; children?: TreemapNode[] };
    const root = d3.hierarchy<TreemapNode>({ children: COST_BREAKDOWN })
      .sum(d => d.value || 0);

    d3.treemap<TreemapNode>()
      .size([width, height])
      .padding(2)(root as d3.HierarchyRectangularNode<TreemapNode>);

    const leaves = root.leaves() as d3.HierarchyRectangularNode<TreemapNode>[];
    const nodes = svg.selectAll(".node")
      .data(leaves)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    nodes.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => colorScale[d.data.category || ""] || "#666")
      .attr("opacity", 0.8)
      .attr("rx", 2);

    nodes.filter(d => (d.x1 - d.x0) > 40 && (d.y1 - d.y0) > 25)
      .append("text")
      .attr("x", 4)
      .attr("y", 12)
      .attr("fill", "#fff")
      .attr("font-size", 8)
      .text(d => d.data.name || "");

    nodes.filter(d => (d.x1 - d.x0) > 40 && (d.y1 - d.y0) > 35)
      .append("text")
      .attr("x", 4)
      .attr("y", 24)
      .attr("fill", "rgba(255,255,255,0.7)")
      .attr("font-size", 9)
      .attr("font-weight", 600)
      .text(d => `$${d.data.value || 0}`);

  }, []);

  // Radial Chart - Risk Factors
  useEffect(() => {
    if (!radialRef.current) return;

    const svg = d3.select(radialRef.current);
    svg.selectAll("*").remove();

    const width = 180;
    const height = 180;
    const radius = 70;
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);

    const angleScale = d3.scaleBand()
      .domain(RISK_FACTORS.map(d => d.factor))
      .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
      .domain([0, 100])
      .range([20, radius]);

    // Background circles
    [25, 50, 75, 100].forEach(level => {
      g.append("circle")
        .attr("r", radiusScale(level))
        .attr("fill", "none")
        .attr("stroke", "#262626")
        .attr("stroke-dasharray", level === 50 ? "none" : "2,2");
    });

    // Spokes
    RISK_FACTORS.forEach(d => {
      const angle = (angleScale(d.factor) || 0) + (angleScale.bandwidth() || 0) / 2;
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", Math.sin(angle) * radius)
        .attr("y2", -Math.cos(angle) * radius)
        .attr("stroke", "#262626");
    });

    // Area
    const areaGenerator = d3.areaRadial<typeof RISK_FACTORS[0]>()
      .angle(d => (angleScale(d.factor) || 0) + (angleScale.bandwidth() || 0) / 2)
      .innerRadius(20)
      .outerRadius(d => radiusScale(d.score))
      .curve(d3.curveLinearClosed);

    g.append("path")
      .datum(RISK_FACTORS)
      .attr("fill", "rgba(239,68,68,0.3)")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("d", areaGenerator as string);

    // Labels
    RISK_FACTORS.forEach(d => {
      const angle = (angleScale(d.factor) || 0) + (angleScale.bandwidth() || 0) / 2;
      const labelRadius = radius + 12;
      g.append("text")
        .attr("x", Math.sin(angle) * labelRadius)
        .attr("y", -Math.cos(angle) * labelRadius)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#a3a3a3")
        .attr("font-size", 7)
        .text(d.factor);
    });

  }, []);

  // Gauge - Current Risk Level
  useEffect(() => {
    if (!gaugeRef.current) return;

    const svg = d3.select(gaugeRef.current);
    svg.selectAll("*").remove();

    const width = 160;
    const height = 100;
    const radius = 70;
    const cx = width / 2;
    const cy = height - 10;

    const g = svg.append("g").attr("transform", `translate(${cx}, ${cy})`);

    // Background arc
    const bgArc = d3.arc()
      .innerRadius(radius - 15)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append("path").attr("d", bgArc as string).attr("fill", "#262626");

    // Colored segments
    const segments = [
      { start: -90, end: -36, color: "#22c55e" },
      { start: -36, end: 18, color: "#f59e0b" },
      { start: 18, end: 90, color: "#ef4444" },
    ];

    segments.forEach(seg => {
      const arc = d3.arc()
        .innerRadius(radius - 14)
        .outerRadius(radius - 1)
        .startAngle((seg.start * Math.PI) / 180)
        .endAngle((seg.end * Math.PI) / 180);

      g.append("path").attr("d", arc as string).attr("fill", seg.color).attr("opacity", 0.6);
    });

    // Needle
    const riskLevel = currentStep / SCENARIO.steps.length;
    const needleAngle = -90 + riskLevel * 180;

    const needle = g.append("g").attr("class", "needle");
    needle.append("path")
      .attr("d", "M -3 0 L 0 -50 L 3 0 Z")
      .attr("fill", riskLevel > 0.6 ? "#ef4444" : riskLevel > 0.3 ? "#f59e0b" : "#22c55e")
      .attr("transform", `rotate(${needleAngle})`);

    needle.append("circle").attr("r", 6).attr("fill", "#fff");
    needle.append("circle").attr("r", 3).attr("fill", "#0a0a0a");

  }, [currentStep]);

  // Heatmap - Question Impact
  useEffect(() => {
    if (!heatmapRef.current) return;

    const svg = d3.select(heatmapRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 120;
    const margin = { top: 5, right: 80, bottom: 5, left: 5 };

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yScale = d3.scaleBand()
      .domain(SMART_QUESTIONS.map(d => d.question))
      .range([0, height - margin.top - margin.bottom])
      .padding(0.15);

    const impactColor: Record<string, string> = {
      critical: "#dc2626",
      high: "#f59e0b",
      medium: "#3b82f6",
    };

    // Bars
    g.selectAll(".bar")
      .data(SMART_QUESTIONS)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.question) || 0)
      .attr("width", d => d.impact === "critical" ? 180 : d.impact === "high" ? 140 : 100)
      .attr("height", yScale.bandwidth())
      .attr("fill", d => impactColor[d.impact])
      .attr("opacity", 0.8)
      .attr("rx", 2);

    // Question text
    g.selectAll(".question")
      .data(SMART_QUESTIONS)
      .enter()
      .append("text")
      .attr("x", 6)
      .attr("y", d => (yScale(d.question) || 0) + yScale.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff")
      .attr("font-size", 8)
      .text(d => d.question);

    // Action text
    g.selectAll(".action")
      .data(SMART_QUESTIONS)
      .enter()
      .append("text")
      .attr("x", d => (d.impact === "critical" ? 180 : d.impact === "high" ? 140 : 100) + 8)
      .attr("y", d => (yScale(d.question) || 0) + yScale.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#737373")
      .attr("font-size", 7)
      .text(d => d.action);

  }, []);

  // Animate cost bar
  useEffect(() => {
    if (!barRef.current) return;
    const percentage = (totalCost / SCENARIO.maxCost) * 100;
    gsap.to(barRef.current, {
      width: `${percentage}%`,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [totalCost]);

  const getCurrentRisk = () => {
    if (currentStep === 0) return "safe";
    return SCENARIO.steps[currentStep - 1]?.risk || "safe";
  };

  const handleReset = () => {
    setCurrentStep(0);
    setTotalCost(SCENARIO.startCost);
  };


  const riskColor = RISK_COLORS[getCurrentRisk()];
  const isComplete = currentStep >= SCENARIO.steps.length;

  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-neutral-950 via-red-950/20 to-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            One Wrong Step. <span className="text-red-500">Ten Times the Cost.</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Watch a $150 repair become a $2,500 disaster. Each mistake compounds into the next.
            Opportuniq asks the right questions first.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Step Progress */}
          <div className="bg-neutral-900/80 rounded-xl border border-neutral-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: riskColor }} />
                  <span className="text-sm font-medium text-white">{SCENARIO.title}</span>
                </div>
                <p className="text-xs text-neutral-500">{SCENARIO.subtitle}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold" style={{ color: riskColor }}>
                  ${totalCost.toLocaleString()}
                </div>
                <div className="text-[10px] text-neutral-500">total cost</div>
              </div>
            </div>

            {/* Cost Bar */}
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden mb-4">
              <div
                ref={barRef}
                className="h-full rounded-full"
                style={{ backgroundColor: riskColor, width: `${(SCENARIO.startCost / SCENARIO.maxCost) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {SCENARIO.steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div
                    key={step.id}
                    className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
                      isCompleted
                        ? "bg-neutral-800/60 border-neutral-700"
                        : isCurrent
                        ? "bg-neutral-800 border-neutral-600"
                        : "bg-neutral-900/30 border-neutral-800/40 opacity-40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCompleted ? "text-red-400" : "bg-neutral-800 text-neutral-500"
                        }`}
                        style={isCompleted ? { backgroundColor: `${RISK_COLORS[step.risk]}20` } : {}}
                      >
                        {isCompleted ? "✕" : step.id}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <span className="text-xs text-white truncate">{step.action}</span>
                        {isCompleted && step.costDelta > 0 && (
                          <span className="text-[10px] font-mono font-semibold" style={{ color: RISK_COLORS[step.risk] }}>
                            +${step.costDelta}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-4 text-xs text-neutral-500">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="hover:text-white transition-colors"
              >
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>
              {isComplete && (
                <button onClick={handleReset} className="hover:text-white transition-colors">
                  ↻ Replay
                </button>
              )}
              <span>{currentStep}/{SCENARIO.steps.length} mistakes</span>
            </div>
          </div>

          {/* Middle Column - Charts */}
          <div className="space-y-4">
            {/* Cost Escalation Line Chart */}
            <div className="bg-neutral-900/80 rounded-xl border border-neutral-800 p-4">
              <h4 className="text-xs font-medium text-neutral-300 mb-2">Cost Escalation</h4>
              <svg ref={lineChartRef} viewBox="0 0 280 140" className="w-full" />
            </div>

            {/* Risk Gauge */}
            <div className="bg-neutral-900/80 rounded-xl border border-neutral-800 p-4">
              <h4 className="text-xs font-medium text-neutral-300 mb-2">Current Risk Level</h4>
              <svg ref={gaugeRef} viewBox="0 0 160 100" className="w-full max-w-[160px] mx-auto" />
            </div>

            {/* Cost Breakdown Treemap */}
            <div className="bg-neutral-900/80 rounded-xl border border-neutral-800 p-4">
              <h4 className="text-xs font-medium text-neutral-300 mb-2">Where the Money Goes</h4>
              <svg ref={treemapRef} viewBox="0 0 200 140" className="w-full" />
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue-500" /><span className="text-[9px] text-neutral-500">Direct</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red-500" /><span className="text-[9px] text-neutral-500">Damage</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-amber-500" /><span className="text-[9px] text-neutral-500">Secondary</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-purple-500" /><span className="text-[9px] text-neutral-500">Time</span></div>
              </div>
            </div>
          </div>

          {/* Right Column - More Charts */}
          <div className="space-y-4">
            {/* Risk Factors Radial */}
            <div className="bg-neutral-900/80 rounded-xl border border-neutral-800 p-4">
              <h4 className="text-xs font-medium text-neutral-300 mb-2">Risk Factor Analysis</h4>
              <svg ref={radialRef} viewBox="0 0 180 180" className="w-full max-w-[180px] mx-auto" />
            </div>

            {/* Smart Questions Heatmap */}
            <div className="bg-neutral-900/80 rounded-xl border border-neutral-800 p-4">
              <h4 className="text-xs font-medium text-neutral-300 mb-1">Questions That Prevent Disasters</h4>
              <p className="text-[10px] text-neutral-500 mb-3">Opportuniq asks these first</p>
              <svg ref={heatmapRef} viewBox="0 0 300 120" className="w-full" />
              <div className="flex gap-3 mt-2">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red-600" /><span className="text-[9px] text-neutral-500">Critical</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-amber-500" /><span className="text-[9px] text-neutral-500">High</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue-500" /><span className="text-[9px] text-neutral-500">Medium</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

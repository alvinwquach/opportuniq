"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as d3 from "d3";
import {
  IoWarning,
  IoShield,
  IoTime,
  IoLocation,
  IoThermometer,
  IoWater,
  IoLeaf,
  IoHardwareChip,
  IoEye,
  IoHandLeft,
  IoFootsteps,
  IoChevronForward,
  IoCheckmarkCircle,
  IoCloseCircle,
} from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Demo scenarios for the streaming demo
const DEMO_SCENARIOS = [
  {
    id: "pond-algae",
    title: "Clean pond algae",
    location: { lat: 33.749, lng: -84.388, name: "Atlanta, GA" },
    weather: { temp: 78, humidity: 65, wind: 8, condition: "Partly Cloudy" },
  },
  {
    id: "car-diagnosis",
    title: "Diagnose car issue",
    location: { lat: 34.052, lng: -118.243, name: "Los Angeles, CA" },
    weather: { temp: 72, humidity: 45, wind: 5, condition: "Sunny" },
  },
  {
    id: "roof-inspection",
    title: "Inspect roof damage",
    location: { lat: 41.878, lng: -87.629, name: "Chicago, IL" },
    weather: { temp: 55, humidity: 70, wind: 15, condition: "Overcast" },
  },
];

// Risk data for each scenario
const RISK_DATA: Record<string, {
  risks: { category: string; severity: number; likelihood: number; color: string }[];
  safetyEquipment: { name: string; icon: IconType; required: boolean }[];
  complications: { issue: string; impact: "high" | "medium" | "low" }[];
  timeEstimate: string;
  confidenceScore: number;
}> = {
  "pond-algae": {
    risks: [
      { category: "Chemical Exposure", severity: 75, likelihood: 60, color: "#f59e0b" },
      { category: "Slipping/Falling", severity: 65, likelihood: 45, color: "#f59e0b" },
      { category: "Skin Irritation", severity: 40, likelihood: 70, color: "#22c55e" },
      { category: "Water Contamination", severity: 85, likelihood: 30, color: "#ef4444" },
      { category: "Equipment Damage", severity: 35, likelihood: 25, color: "#22c55e" },
    ],
    safetyEquipment: [
      { name: "Chemical-resistant gloves", icon: IoHandLeft, required: true },
      { name: "Safety goggles", icon: IoEye, required: true },
      { name: "Waterproof boots", icon: IoFootsteps, required: true },
      { name: "Protective clothing", icon: IoHardwareChip, required: false },
    ],
    complications: [
      { issue: "Algae may indicate underlying water quality issues", impact: "high" },
      { issue: "Treatment may temporarily affect fish/wildlife", impact: "medium" },
      { issue: "Weather conditions affect chemical effectiveness", impact: "medium" },
      { issue: "Multiple treatments may be necessary", impact: "low" },
    ],
    timeEstimate: "2-4 hours",
    confidenceScore: 82,
  },
  "car-diagnosis": {
    risks: [
      { category: "Electrical Hazard", severity: 70, likelihood: 35, color: "#f59e0b" },
      { category: "Burns (Engine)", severity: 80, likelihood: 50, color: "#ef4444" },
      { category: "Pinch Points", severity: 55, likelihood: 40, color: "#f59e0b" },
      { category: "Chemical Exposure", severity: 45, likelihood: 30, color: "#22c55e" },
      { category: "Misdiagnosis", severity: 60, likelihood: 55, color: "#f59e0b" },
    ],
    safetyEquipment: [
      { name: "Mechanic gloves", icon: IoHandLeft, required: true },
      { name: "Safety glasses", icon: IoEye, required: true },
      { name: "Closed-toe shoes", icon: IoFootsteps, required: true },
      { name: "Work light", icon: IoHardwareChip, required: false },
    ],
    complications: [
      { issue: "Issue may be symptom of larger problem", impact: "high" },
      { issue: "Diagnostic tools may be required", impact: "medium" },
      { issue: "Vehicle-specific knowledge needed", impact: "medium" },
      { issue: "Parts availability varies", impact: "low" },
    ],
    timeEstimate: "1-3 hours",
    confidenceScore: 76,
  },
  "roof-inspection": {
    risks: [
      { category: "Fall Risk", severity: 95, likelihood: 40, color: "#ef4444" },
      { category: "Weather Exposure", severity: 50, likelihood: 65, color: "#f59e0b" },
      { category: "Structural Weakness", severity: 85, likelihood: 25, color: "#ef4444" },
      { category: "Ladder Safety", severity: 70, likelihood: 50, color: "#f59e0b" },
      { category: "Tool Handling", severity: 40, likelihood: 30, color: "#22c55e" },
    ],
    safetyEquipment: [
      { name: "Fall harness", icon: IoHardwareChip, required: true },
      { name: "Non-slip footwear", icon: IoFootsteps, required: true },
      { name: "Work gloves", icon: IoHandLeft, required: true },
      { name: "Safety helmet", icon: IoHardwareChip, required: true },
    ],
    complications: [
      { issue: "Hidden damage may not be visible", impact: "high" },
      { issue: "Weather window required for safety", impact: "high" },
      { issue: "May require professional equipment", impact: "medium" },
      { issue: "Insurance considerations apply", impact: "medium" },
    ],
    timeEstimate: "1-2 hours",
    confidenceScore: 68,
  },
};

// Streaming text simulation
const STREAMING_INSIGHTS = {
  "pond-algae": [
    "Analyzing environmental conditions...",
    "Identifying algae type based on description...",
    "Calculating chemical exposure risks...",
    "Evaluating water safety parameters...",
    "Assessing required safety equipment...",
    "Generating risk severity matrix...",
    "Compiling potential complications...",
    "Analysis complete. Review risk assessment below.",
  ],
  "car-diagnosis": [
    "Processing vehicle diagnostic parameters...",
    "Identifying potential failure points...",
    "Calculating electrical system risks...",
    "Evaluating thermal hazard zones...",
    "Assessing tool and equipment needs...",
    "Generating diagnostic risk matrix...",
    "Compiling potential complications...",
    "Analysis complete. Review risk assessment below.",
  ],
  "roof-inspection": [
    "Analyzing structural safety factors...",
    "Calculating fall risk parameters...",
    "Evaluating weather impact on safety...",
    "Processing accessibility requirements...",
    "Assessing required safety equipment...",
    "Generating risk severity matrix...",
    "Compiling potential complications...",
    "Analysis complete. Review risk assessment below.",
  ],
};

export function DecisionFrameDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const riskChartRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(DEMO_SCENARIOS[0]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState<string[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Mapbox
  useEffect(() => {
    if (!mapContainerRef.current || !mounted) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn("Mapbox token not configured");
      return;
    }

    mapboxgl.accessToken = token;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [selectedScenario.location.lng, selectedScenario.location.lat],
      zoom: 10,
      interactive: false,
      attributionControl: false,
    });

    mapRef.current.on("load", () => {
      setMapLoaded(true);

      // Add marker
      new mapboxgl.Marker({ color: "#14b8a6" })
        .setLngLat([selectedScenario.location.lng, selectedScenario.location.lat])
        .addTo(mapRef.current!);
    });

    return () => {
      mapRef.current?.remove();
    };
  }, [mounted]);

  // Update map when scenario changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    mapRef.current.flyTo({
      center: [selectedScenario.location.lng, selectedScenario.location.lat],
      zoom: 10,
      duration: 1500,
    });

    // Remove existing markers and add new one
    const markers = document.querySelectorAll(".mapboxgl-marker");
    markers.forEach((m) => m.remove());

    new mapboxgl.Marker({ color: "#14b8a6" })
      .setLngLat([selectedScenario.location.lng, selectedScenario.location.lat])
      .addTo(mapRef.current);
  }, [selectedScenario, mapLoaded]);

  // Draw risk chart with D3
  const drawRiskChart = useCallback(() => {
    if (!riskChartRef.current || !analysisComplete) return;

    const riskData = RISK_DATA[selectedScenario.id].risks;
    const svg = d3.select(riskChartRef.current);
    svg.selectAll("*").remove();

    const width = riskChartRef.current.clientWidth;
    const height = riskChartRef.current.clientHeight;
    const margin = { top: 20, right: 20, bottom: 40, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);
    const yScale = d3
      .scaleBand()
      .domain(riskData.map((d) => d.category))
      .range([0, innerHeight])
      .padding(0.3);

    // Gridlines
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(innerHeight)
          .tickFormat(() => "")
          .ticks(5)
      )
      .attr("stroke-opacity", 0.1)
      .attr("stroke", "#666");

    // Bars with animation
    g.selectAll(".bar")
      .data(riskData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => yScale(d.category)!)
      .attr("height", yScale.bandwidth())
      .attr("x", 0)
      .attr("width", 0)
      .attr("fill", (d) => d.color)
      .attr("rx", 4)
      .transition()
      .duration(800)
      .delay((_, i) => i * 100)
      .attr("width", (d) => xScale(d.severity));

    // Likelihood markers
    g.selectAll(".likelihood")
      .data(riskData)
      .enter()
      .append("circle")
      .attr("class", "likelihood")
      .attr("cy", (d) => yScale(d.category)! + yScale.bandwidth() / 2)
      .attr("cx", 0)
      .attr("r", 6)
      .attr("fill", "#fff")
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", 2)
      .transition()
      .duration(800)
      .delay((_, i) => i * 100 + 400)
      .attr("cx", (d) => xScale(d.likelihood));

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .attr("font-size", "11px")
      .attr("color", "#888")
      .selectAll("path, line")
      .attr("stroke", "#333");

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat((d) => `${d}%`))
      .attr("font-size", "10px")
      .attr("color", "#666")
      .selectAll("path, line")
      .attr("stroke", "#333");

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width - 150}, 10)`);

    legend
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", "#666")
      .attr("rx", 2);
    legend.append("text").attr("x", 18).attr("y", 10).attr("fill", "#888").attr("font-size", "10px").text("Severity");

    legend
      .append("circle")
      .attr("cx", 6)
      .attr("cy", 26)
      .attr("r", 5)
      .attr("fill", "#fff")
      .attr("stroke", "#666")
      .attr("stroke-width", 2);
    legend.append("text").attr("x", 18).attr("y", 30).attr("fill", "#888").attr("font-size", "10px").text("Likelihood");
  }, [selectedScenario, analysisComplete]);

  useEffect(() => {
    drawRiskChart();
  }, [drawRiskChart]);

  // Streaming simulation
  const startStreaming = useCallback(async () => {
    setIsStreaming(true);
    setStreamedText([]);
    setAnalysisComplete(false);

    const insights = STREAMING_INSIGHTS[selectedScenario.id as keyof typeof STREAMING_INSIGHTS];

    for (let i = 0; i < insights.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
      setStreamedText((prev) => [...prev, insights[i]]);
    }

    setIsStreaming(false);
    setAnalysisComplete(true);
  }, [selectedScenario]);

  // GSAP animations
  useEffect(() => {
    if (!sectionRef.current || !mounted) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(".demo-header > *", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) return null;

  const currentRiskData = RISK_DATA[selectedScenario.id];

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="relative py-24 overflow-hidden"
      style={{ backgroundColor: "#111111" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="demo-header text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 mb-6">
            <IoShield className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-medium text-teal-400">Live Risk Analysis Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            See Decision Frames in Action
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Watch as AI analyzes risk factors, safety considerations, and potential complications in real-time.
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {DEMO_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => {
                setSelectedScenario(scenario);
                setStreamedText([]);
                setAnalysisComplete(false);
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                selectedScenario.id === scenario.id
                  ? "bg-teal-500 text-black"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              )}
            >
              {scenario.title}
            </button>
          ))}
        </div>

        {/* Main Demo Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Map & Weather */}
          <div className="space-y-6">
            {/* Mapbox Map */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IoLocation className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium text-white">Location Context</span>
                </div>
                <span className="text-xs text-neutral-500">{selectedScenario.location.name}</span>
              </div>
              <div ref={mapContainerRef} className="h-48 w-full" />
            </div>

            {/* Weather Card */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
              <div className="flex items-center gap-2 mb-4">
                <IoThermometer className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-medium text-white">Weather Conditions</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <IoThermometer className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-white">{selectedScenario.weather.temp}°F</p>
                  <p className="text-xs text-neutral-500">Temperature</p>
                </div>
                <div className="text-center">
                  <IoWater className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-white">{selectedScenario.weather.humidity}%</p>
                  <p className="text-xs text-neutral-500">Humidity</p>
                </div>
                <div className="text-center">
                  <IoLeaf className="w-5 h-5 text-neutral-400 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-white">{selectedScenario.weather.wind} mph</p>
                  <p className="text-xs text-neutral-500">Wind</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-800 text-center">
                <p className="text-sm text-neutral-400">{selectedScenario.weather.condition}</p>
              </div>
            </div>

            {/* Safety Equipment */}
            {analysisComplete && (
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <IoHardwareChip className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium text-white">Safety Equipment</span>
                </div>
                <div className="space-y-2">
                  {currentRiskData.safetyEquipment.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg",
                          item.required ? "bg-red-500/10 border border-red-500/20" : "bg-neutral-800"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", item.required ? "text-red-400" : "text-neutral-400")} />
                        <span className="text-sm text-neutral-200 flex-1">{item.name}</span>
                        {item.required ? (
                          <span className="text-xs text-red-400 font-medium">Required</span>
                        ) : (
                          <span className="text-xs text-neutral-500">Recommended</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Center Column - Streaming & Risk Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Streaming Analysis */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IoWarning className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium text-white">Risk Analysis Stream</span>
                </div>
                {!isStreaming && !analysisComplete && (
                  <button
                    onClick={startStreaming}
                    className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-black text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    Start Analysis
                    <IoChevronForward className="w-4 h-4" />
                  </button>
                )}
                {isStreaming && (
                  <div className="flex items-center gap-2 text-teal-400">
                    <ImSpinner8 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                )}
                {analysisComplete && (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <IoCheckmarkCircle className="w-4 h-4" />
                    <span className="text-sm">Complete</span>
                  </div>
                )}
              </div>
              <div className="p-4 h-48 overflow-y-auto font-mono text-sm">
                {streamedText.length === 0 && !isStreaming && (
                  <p className="text-neutral-500">Click &quot;Start Analysis&quot; to begin risk assessment...</p>
                )}
                {streamedText.map((text, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <IoChevronForward className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                    <span className="text-neutral-300">{text}</span>
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-4 bg-teal-400 animate-pulse" />
                  </div>
                )}
              </div>
            </div>

            {/* Risk Severity Chart */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IoShield className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium text-white">Risk Severity Matrix</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500" />
                    Low
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-500" />
                    Medium
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-red-500" />
                    High
                  </span>
                </div>
              </div>
              <div className="p-4">
                {analysisComplete ? (
                  <svg ref={riskChartRef} className="w-full h-64" />
                ) : (
                  <div className="h-64 flex items-center justify-center text-neutral-500">
                    <p>Run analysis to view risk matrix</p>
                  </div>
                )}
              </div>
            </div>

            {/* Complications & Summary */}
            {analysisComplete && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Potential Complications */}
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <IoWarning className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-white">Potential Complications</span>
                  </div>
                  <div className="space-y-2">
                    {currentRiskData.complications.map((comp, i) => (
                      <div key={i} className="flex items-start gap-2">
                        {comp.impact === "high" ? (
                          <IoCloseCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        ) : comp.impact === "medium" ? (
                          <IoWarning className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        ) : (
                          <IoCheckmarkCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        )}
                        <span className="text-sm text-neutral-300">{comp.issue}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <IoTime className="w-4 h-4 text-teal-400" />
                    <span className="text-sm font-medium text-white">Analysis Summary</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-neutral-800">
                      <p className="text-xs text-neutral-500 mb-1">Time Estimate</p>
                      <p className="text-lg font-semibold text-teal-400">{currentRiskData.timeEstimate}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-neutral-800">
                      <p className="text-xs text-neutral-500 mb-1">Confidence</p>
                      <p className="text-lg font-semibold text-emerald-400">{currentRiskData.confidenceScore}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-4 text-center">
                    This analysis is for informational purposes only. Always consult professionals for critical decisions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

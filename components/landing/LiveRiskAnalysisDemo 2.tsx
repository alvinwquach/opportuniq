"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  IoCash,
  IoTimer,
  IoTrendingUp,
  IoStorefront,
  IoConstruct,
  IoAlertCircle,
  IoTriangle,
  IoHome,
  IoWaterOutline,
  IoLeafOutline,
  IoSearch,
  IoPlay,
  IoPlayForward,
} from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================================================
// TYPES
// ============================================================================

interface GeoLocation {
  lat: number;
  lng: number;
  name: string;
  zipCode: string;
}

interface WeatherConditions {
  temp: number;
  humidity: number;
  wind: number;
  condition: string;
}

interface Risk {
  category: string;
  severity: "low" | "medium" | "high";
  likelihood: number;
  color: string;
}

interface SafetyEquipment {
  name: string;
  icon: IconType;
  required: boolean;
}

interface Complication {
  issue: string;
  impact: "high" | "medium" | "low";
}

interface ToolAvailability {
  storeName: string;
  distance: number;
  tools: string[];
  lat: number;
  lng: number;
}

interface EnvironmentalOverlay {
  type: "flood" | "slope" | "hoa" | "wetland" | "utility";
  severity: "low" | "medium" | "high";
  label: string;
  coordinates: [number, number][];
}

interface OpportunityCost {
  timeValue: number; // $/hour user value
  estimatedHours: number;
  materialCost: number;
  riskCost: number; // potential cost if things go wrong
  totalCost: number;
}

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  location: GeoLocation;
  weather: WeatherConditions;
  risks: Risk[];
  safetyEquipment: SafetyEquipment[];
  complications: Complication[];
  toolsNearby: ToolAvailability[];
  environmentalOverlays: EnvironmentalOverlay[];
  opportunityCost: OpportunityCost;
  timeEstimate: string;
  confidenceScore: number;
}

// ============================================================================
// DEMO DATA
// ============================================================================

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "pond-algae",
    title: "Clean pond algae",
    description: "Evaluate algae removal from residential pond",
    location: { lat: 33.749, lng: -84.388, name: "Atlanta, GA", zipCode: "30301" },
    weather: { temp: 78, humidity: 65, wind: 8, condition: "Partly Cloudy" },
    risks: [
      { category: "Chemical Exposure", severity: "medium", likelihood: 60, color: "#f59e0b" },
      { category: "Slipping/Falling", severity: "medium", likelihood: 45, color: "#f59e0b" },
      { category: "Skin Irritation", severity: "low", likelihood: 70, color: "#22c55e" },
      { category: "Water Contamination", severity: "high", likelihood: 30, color: "#ef4444" },
      { category: "Equipment Damage", severity: "low", likelihood: 25, color: "#22c55e" },
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
    toolsNearby: [
      { storeName: "Hardware Supply Co", distance: 2.3, tools: ["Pond rake", "Pump", "Chemical applicator"], lat: 33.752, lng: -84.391 },
      { storeName: "Garden Center Plus", distance: 3.8, tools: ["Algaecide", "Test kits", "Nets"], lat: 33.745, lng: -84.380 },
    ],
    environmentalOverlays: [
      { type: "wetland", severity: "medium", label: "Protected Wetland Buffer (50ft)", coordinates: [[33.748, -84.390], [33.750, -84.390], [33.750, -84.386], [33.748, -84.386]] },
      { type: "flood", severity: "low", label: "100-Year Flood Zone", coordinates: [[33.746, -84.392], [33.752, -84.392], [33.752, -84.384], [33.746, -84.384]] },
    ],
    opportunityCost: {
      timeValue: 50,
      estimatedHours: 4,
      materialCost: 150,
      riskCost: 300,
      totalCost: 650,
    },
    timeEstimate: "2-4 hours",
    confidenceScore: 82,
  },
  {
    id: "car-diagnosis",
    title: "Diagnose car issue",
    description: "Investigate check engine light and unusual sounds",
    location: { lat: 34.052, lng: -118.243, name: "Los Angeles, CA", zipCode: "90012" },
    weather: { temp: 72, humidity: 45, wind: 5, condition: "Sunny" },
    risks: [
      { category: "Electrical Hazard", severity: "medium", likelihood: 35, color: "#f59e0b" },
      { category: "Burns (Engine)", severity: "high", likelihood: 50, color: "#ef4444" },
      { category: "Pinch Points", severity: "medium", likelihood: 40, color: "#f59e0b" },
      { category: "Chemical Exposure", severity: "low", likelihood: 30, color: "#22c55e" },
      { category: "Misdiagnosis", severity: "medium", likelihood: 55, color: "#f59e0b" },
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
    toolsNearby: [
      { storeName: "AutoZone", distance: 1.2, tools: ["OBD2 Scanner", "Multimeter", "Socket set"], lat: 34.055, lng: -118.240 },
      { storeName: "O'Reilly Auto", distance: 1.8, tools: ["Code reader", "Battery tester", "Diagnostic tools"], lat: 34.048, lng: -118.248 },
    ],
    environmentalOverlays: [
      { type: "hoa", severity: "low", label: "Street Parking Restrictions", coordinates: [[34.050, -118.245], [34.054, -118.245], [34.054, -118.241], [34.050, -118.241]] },
    ],
    opportunityCost: {
      timeValue: 50,
      estimatedHours: 3,
      materialCost: 0,
      riskCost: 500,
      totalCost: 650,
    },
    timeEstimate: "1-3 hours",
    confidenceScore: 76,
  },
  {
    id: "roof-inspection",
    title: "Inspect roof damage",
    description: "Assess storm damage and potential leaks",
    location: { lat: 41.878, lng: -87.629, name: "Chicago, IL", zipCode: "60601" },
    weather: { temp: 55, humidity: 70, wind: 15, condition: "Overcast" },
    risks: [
      { category: "Fall Risk", severity: "high", likelihood: 40, color: "#ef4444" },
      { category: "Weather Exposure", severity: "medium", likelihood: 65, color: "#f59e0b" },
      { category: "Structural Weakness", severity: "high", likelihood: 25, color: "#ef4444" },
      { category: "Ladder Safety", severity: "medium", likelihood: 50, color: "#f59e0b" },
      { category: "Tool Handling", severity: "low", likelihood: 30, color: "#22c55e" },
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
    toolsNearby: [
      { storeName: "Home Depot", distance: 2.5, tools: ["Extension ladder", "Roof rake", "Flashlight"], lat: 41.880, lng: -87.625 },
      { storeName: "Menards", distance: 4.2, tools: ["Safety harness", "Tarps", "Caulk gun"], lat: 41.875, lng: -87.635 },
    ],
    environmentalOverlays: [
      { type: "slope", severity: "high", label: "Steep Roof Pitch (8/12+)", coordinates: [[41.877, -87.630], [41.879, -87.630], [41.879, -87.628], [41.877, -87.628]] },
      { type: "utility", severity: "medium", label: "Overhead Power Lines", coordinates: [[41.876, -87.631], [41.880, -87.631], [41.880, -87.627], [41.876, -87.627]] },
    ],
    opportunityCost: {
      timeValue: 50,
      estimatedHours: 2,
      materialCost: 50,
      riskCost: 1000,
      totalCost: 1150,
    },
    timeEstimate: "1-2 hours",
    confidenceScore: 68,
  },
];

// Streaming text for each scenario
const STREAMING_INSIGHTS: Record<string, string[]> = {
  "pond-algae": [
    "Analyzing environmental conditions for ZIP 30301...",
    "Identifying algae type based on description...",
    "Scanning nearby store inventory for tools...",
    "Calculating chemical exposure risks...",
    "Mapping protected wetland zones...",
    "Evaluating flood zone impact...",
    "Assessing required safety equipment...",
    "Computing opportunity cost factors...",
    "Generating risk severity matrix...",
    "Analysis complete. Review findings below.",
  ],
  "car-diagnosis": [
    "Processing vehicle diagnostic parameters...",
    "Scanning area auto parts stores...",
    "Identifying potential failure points...",
    "Calculating electrical system risks...",
    "Checking local parking restrictions...",
    "Evaluating thermal hazard zones...",
    "Assessing tool requirements...",
    "Computing opportunity cost factors...",
    "Generating diagnostic risk matrix...",
    "Analysis complete. Review findings below.",
  ],
  "roof-inspection": [
    "Analyzing structural safety factors...",
    "Mapping overhead utility locations...",
    "Calculating fall risk parameters...",
    "Assessing roof pitch severity...",
    "Scanning nearby hardware stores...",
    "Evaluating weather impact on safety...",
    "Processing accessibility requirements...",
    "Computing opportunity cost factors...",
    "Generating risk severity matrix...",
    "Analysis complete. Review findings below.",
  ],
};

// Overlay colors and icons
const OVERLAY_CONFIG: Record<EnvironmentalOverlay["type"], { color: string; icon: IconType; label: string }> = {
  flood: { color: "#3b82f6", icon: IoWaterOutline, label: "Flood Zone" },
  slope: { color: "#a855f7", icon: IoTriangle, label: "Steep Slope" },
  hoa: { color: "#f97316", icon: IoHome, label: "HOA Restriction" },
  wetland: { color: "#22c55e", icon: IoLeafOutline, label: "Protected Wetland" },
  utility: { color: "#eab308", icon: IoAlertCircle, label: "Utility Hazard" },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function LiveRiskAnalysisDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const riskChartRef = useRef<SVGSVGElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [mounted, setMounted] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState<string[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [demoQueueIndex, setDemoQueueIndex] = useState(0);
  const [userTimeValue, setUserTimeValue] = useState(50);
  const [showOverlays, setShowOverlays] = useState(true);

  // Get next tasks in queue
  const nextTasks = useMemo(() => {
    const currentIndex = DEMO_SCENARIOS.findIndex((s) => s.id === selectedScenario.id);
    return DEMO_SCENARIOS.filter((_, i) => i !== currentIndex).slice(0, 2);
  }, [selectedScenario]);

  // Calculate dynamic opportunity cost
  const dynamicOpportunityCost = useMemo(() => {
    const base = selectedScenario.opportunityCost;
    const timeValue = userTimeValue * base.estimatedHours;
    return {
      ...base,
      timeValue: userTimeValue,
      totalCost: timeValue + base.materialCost + base.riskCost,
    };
  }, [selectedScenario, userTimeValue]);

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
      zoom: 13,
      interactive: true,
      attributionControl: false,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapRef.current.on("load", () => {
      setMapLoaded(true);
      updateMapOverlays();
      updateMapMarkers();
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
      zoom: 13,
      duration: 1500,
    });

    updateMapMarkers();
    updateMapOverlays();
  }, [selectedScenario, mapLoaded, showOverlays]);

  // Update markers for stores and main location
  const updateMapMarkers = useCallback(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add main location marker
    const mainMarker = new mapboxgl.Marker({ color: "#14b8a6" })
      .setLngLat([selectedScenario.location.lng, selectedScenario.location.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${selectedScenario.title}</strong><br/>${selectedScenario.location.name}`))
      .addTo(mapRef.current);
    markersRef.current.push(mainMarker);

    // Add store markers
    selectedScenario.toolsNearby.forEach((store) => {
      const el = document.createElement("div");
      el.className = "store-marker";
      el.innerHTML = `<div style="background: #3b82f6; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M3 9l2.45-4.9A2 2 0 017.24 3h9.52a2 2 0 011.8 1.1L21 9"/></svg></div>`;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([store.lng, store.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<strong>${store.storeName}</strong><br/>${store.distance} mi away<br/><em>${store.tools.slice(0, 3).join(", ")}</em>`
          )
        )
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [selectedScenario]);

  // Update environmental overlays
  const updateMapOverlays = useCallback(() => {
    if (!mapRef.current) return;

    // Remove existing overlay layers
    const layerIds = ["flood-zone", "slope-zone", "hoa-zone", "wetland-zone", "utility-zone"];
    layerIds.forEach((id) => {
      if (mapRef.current?.getLayer(id)) {
        mapRef.current.removeLayer(id);
      }
      if (mapRef.current?.getSource(id)) {
        mapRef.current.removeSource(id);
      }
    });

    if (!showOverlays) return;

    // Add overlays for current scenario
    selectedScenario.environmentalOverlays.forEach((overlay, index) => {
      const sourceId = `${overlay.type}-zone`;
      const config = OVERLAY_CONFIG[overlay.type];

      // Create polygon from coordinates
      const coordinates = overlay.coordinates.map((c) => [c[1], c[0]]);
      coordinates.push(coordinates[0]); // Close the polygon

      mapRef.current?.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: { label: overlay.label },
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
        },
      });

      mapRef.current?.addLayer({
        id: sourceId,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": config.color,
          "fill-opacity": overlay.severity === "high" ? 0.4 : overlay.severity === "medium" ? 0.25 : 0.15,
        },
      });
    });
  }, [selectedScenario, showOverlays]);

  // Draw risk chart with D3
  const drawRiskChart = useCallback(() => {
    if (!riskChartRef.current || !analysisComplete) return;

    const riskData = selectedScenario.risks;
    const svg = d3.select(riskChartRef.current);
    svg.selectAll("*").remove();

    const width = riskChartRef.current.clientWidth;
    const height = riskChartRef.current.clientHeight;
    const margin = { top: 20, right: 30, bottom: 40, left: 120 };
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

    // Background gridlines
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
      .attr("stroke", "#666")
      .selectAll("line")
      .attr("stroke-dasharray", "3,3");

    // Severity background zones
    const zones = [
      { start: 0, end: 33, color: "#22c55e", label: "Low" },
      { start: 33, end: 66, color: "#f59e0b", label: "Medium" },
      { start: 66, end: 100, color: "#ef4444", label: "High" },
    ];

    zones.forEach((zone) => {
      g.append("rect")
        .attr("x", xScale(zone.start))
        .attr("y", 0)
        .attr("width", xScale(zone.end) - xScale(zone.start))
        .attr("height", innerHeight)
        .attr("fill", zone.color)
        .attr("opacity", 0.05);
    });

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
      .attr("width", (d) => xScale(d.likelihood));

    // Severity indicators
    g.selectAll(".severity-badge")
      .data(riskData)
      .enter()
      .append("text")
      .attr("class", "severity-badge")
      .attr("x", innerWidth + 5)
      .attr("y", (d) => yScale(d.category)! + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("fill", (d) => d.color)
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .text((d) => d.severity.toUpperCase())
      .attr("opacity", 0)
      .transition()
      .duration(400)
      .delay((_, i) => i * 100 + 800)
      .attr("opacity", 1);

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

    // X axis label
    svg
      .append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#666")
      .attr("font-size", "10px")
      .text("Likelihood (%)");
  }, [selectedScenario, analysisComplete]);

  useEffect(() => {
    drawRiskChart();
  }, [drawRiskChart]);

  // Streaming simulation
  const startStreaming = useCallback(async () => {
    setIsStreaming(true);
    setStreamedText([]);
    setAnalysisComplete(false);

    const insights = STREAMING_INSIGHTS[selectedScenario.id];

    for (let i = 0; i < insights.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300));
      setStreamedText((prev) => [...prev, insights[i]]);
    }

    setIsStreaming(false);
    setAnalysisComplete(true);
  }, [selectedScenario]);

  // Handle scenario change
  const handleScenarioChange = useCallback((scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setStreamedText([]);
    setAnalysisComplete(false);
    setZipCode(scenario.location.zipCode);
  }, []);

  // Handle next task in queue
  const handleNextTask = useCallback(() => {
    const currentIndex = DEMO_SCENARIOS.findIndex((s) => s.id === selectedScenario.id);
    const nextIndex = (currentIndex + 1) % DEMO_SCENARIOS.length;
    handleScenarioChange(DEMO_SCENARIOS[nextIndex]);
    setDemoQueueIndex((prev) => prev + 1);
  }, [selectedScenario, handleScenarioChange]);

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

  return (
    <section
      ref={sectionRef}
      id="live-demo"
      className="relative py-24 overflow-hidden"
      style={{ backgroundColor: "#111111" }}
    >
      {/* Background Grid */}
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
        <div className="demo-header text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 mb-6">
            <IoShield className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-medium text-teal-400">Live Risk Analysis Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            See Decision Frames in Action
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Enter your ZIP code to see location-specific risk analysis with hazard zones, tool availability, and opportunity cost calculations.
          </p>
        </div>

        {/* ZIP Code Input */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-700 rounded-xl p-2">
            <div className="flex items-center gap-2 px-3">
              <IoLocation className="w-4 h-4 text-teal-400" />
              <input
                type="text"
                placeholder="Enter ZIP code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                className="bg-transparent text-white placeholder-neutral-500 text-sm w-28 focus:outline-none"
                maxLength={5}
              />
            </div>
            <button
              onClick={startStreaming}
              disabled={isStreaming}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/50 text-black text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <IoSearch className="w-4 h-4" />
              Analyze
            </button>
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {DEMO_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleScenarioChange(scenario)}
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

        {/* Main Demo Layout - 3 Column */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column - Map & Environmental Data */}
          <div className="lg:col-span-5 space-y-4">
            {/* Mapbox Map */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
              <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IoLocation className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium text-white">Risk Map</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowOverlays(!showOverlays)}
                    className={cn(
                      "px-2 py-1 rounded text-xs transition-colors",
                      showOverlays ? "bg-teal-500/20 text-teal-400" : "bg-neutral-800 text-neutral-500"
                    )}
                  >
                    Overlays
                  </button>
                  <span className="text-xs text-neutral-500">{selectedScenario.location.name}</span>
                </div>
              </div>
              <div ref={mapContainerRef} className="h-72 w-full" />

              {/* Map Legend */}
              <div className="p-3 border-t border-neutral-800 bg-neutral-900/80">
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-teal-500" />
                    <span className="text-neutral-400">Task Location</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-neutral-400">Tool Store</span>
                  </div>
                  {selectedScenario.environmentalOverlays.map((overlay) => (
                    <div key={overlay.type} className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: OVERLAY_CONFIG[overlay.type].color, opacity: 0.6 }}
                      />
                      <span className="text-neutral-400">{OVERLAY_CONFIG[overlay.type].label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Environmental Overlays Details */}
            {selectedScenario.environmentalOverlays.length > 0 && (
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IoAlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-white">Environmental Factors</span>
                </div>
                <div className="space-y-2">
                  {selectedScenario.environmentalOverlays.map((overlay, i) => {
                    const config = OVERLAY_CONFIG[overlay.type];
                    const Icon = config.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800"
                      >
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                        <div className="flex-1">
                          <p className="text-sm text-white">{overlay.label}</p>
                          <p className="text-xs text-neutral-500">Severity: {overlay.severity}</p>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            overlay.severity === "high"
                              ? "bg-red-500/20 text-red-400"
                              : overlay.severity === "medium"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-green-500/20 text-green-400"
                          )}
                        >
                          {overlay.severity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tool Availability */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <IoStorefront className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Tools Available Nearby</span>
              </div>
              <div className="space-y-3">
                {selectedScenario.toolsNearby.map((store, i) => (
                  <div key={i} className="p-3 rounded-lg bg-neutral-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{store.storeName}</span>
                      <span className="text-xs text-teal-400">{store.distance} mi</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {store.tools.map((tool, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-700 text-xs text-neutral-300"
                        >
                          <IoConstruct className="w-3 h-3" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Conditions */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <IoThermometer className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-medium text-white">Weather Conditions</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 rounded-lg bg-neutral-800">
                  <IoThermometer className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <p className="text-base font-semibold text-white">{selectedScenario.weather.temp}°F</p>
                  <p className="text-xs text-neutral-500">Temp</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-neutral-800">
                  <IoWater className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-base font-semibold text-white">{selectedScenario.weather.humidity}%</p>
                  <p className="text-xs text-neutral-500">Humidity</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-neutral-800">
                  <IoLeaf className="w-4 h-4 text-neutral-400 mx-auto mb-1" />
                  <p className="text-base font-semibold text-white">{selectedScenario.weather.wind} mph</p>
                  <p className="text-xs text-neutral-500">Wind</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Streaming Panel & Analysis */}
          <div className="lg:col-span-7 space-y-4">
            {/* Streaming Analysis Panel */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
              <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IoWarning className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium text-white">Risk Analysis Stream</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-xs text-neutral-400">
                    {selectedScenario.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!isStreaming && !analysisComplete && (
                    <button
                      onClick={startStreaming}
                      className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-black text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <IoPlay className="w-3 h-3" />
                      Start Analysis
                    </button>
                  )}
                  {isStreaming && (
                    <div className="flex items-center gap-2 text-teal-400">
                      <ImSpinner8 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Analyzing...</span>
                    </div>
                  )}
                  {analysisComplete && (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <IoCheckmarkCircle className="w-4 h-4" />
                      <span className="text-xs">Complete</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 h-40 overflow-y-auto font-mono text-xs">
                {streamedText.length === 0 && !isStreaming && (
                  <p className="text-neutral-500">Click &quot;Start Analysis&quot; to begin risk assessment...</p>
                )}
                {streamedText.map((text, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <IoChevronForward className="w-3 h-3 text-teal-400 mt-0.5 shrink-0" />
                    <span className="text-neutral-300">{text}</span>
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-3 bg-teal-400 animate-pulse" />
                  </div>
                )}
              </div>
            </div>

            {/* Risk Severity Matrix */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
              <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IoShield className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium text-white">Risk Severity Matrix</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                    Low
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                    Medium
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-red-500" />
                    High
                  </span>
                </div>
              </div>
              <div className="p-4">
                {analysisComplete ? (
                  <svg ref={riskChartRef} className="w-full h-52" />
                ) : (
                  <div className="h-52 flex items-center justify-center text-neutral-500 text-sm">
                    <p>Run analysis to view risk matrix</p>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Results Grid */}
            {analysisComplete && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Safety Equipment */}
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IoHardwareChip className="w-4 h-4 text-teal-400" />
                    <span className="text-sm font-medium text-white">Safety Equipment</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedScenario.safetyEquipment.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg text-xs",
                            item.required ? "bg-red-500/10 border border-red-500/20" : "bg-neutral-800"
                          )}
                        >
                          <Icon className={cn("w-3.5 h-3.5", item.required ? "text-red-400" : "text-neutral-400")} />
                          <span className="text-neutral-200 flex-1">{item.name}</span>
                          {item.required ? (
                            <span className="text-red-400 font-medium">Required</span>
                          ) : (
                            <span className="text-neutral-500">Optional</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Potential Complications */}
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IoWarning className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-white">Potential Complications</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedScenario.complications.map((comp, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        {comp.impact === "high" ? (
                          <IoCloseCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                        ) : comp.impact === "medium" ? (
                          <IoWarning className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                        ) : (
                          <IoCheckmarkCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        )}
                        <span className="text-neutral-300">{comp.issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Opportunity Cost Calculator */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IoCash className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-white">Opportunity Cost Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-400">Your hourly value:</span>
                  <input
                    type="number"
                    value={userTimeValue}
                    onChange={(e) => setUserTimeValue(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-white text-center"
                    min={0}
                  />
                  <span className="text-neutral-500">/hr</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="text-center p-3 rounded-lg bg-neutral-800">
                  <IoTimer className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-neutral-500 mb-0.5">Time Cost</p>
                  <p className="text-sm font-semibold text-white">
                    ${(dynamicOpportunityCost.timeValue * dynamicOpportunityCost.estimatedHours).toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-500">{dynamicOpportunityCost.estimatedHours}h × ${userTimeValue}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-800">
                  <IoConstruct className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <p className="text-xs text-neutral-500 mb-0.5">Materials</p>
                  <p className="text-sm font-semibold text-white">
                    ${dynamicOpportunityCost.materialCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-500">Estimated</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-800">
                  <IoWarning className="w-4 h-4 text-red-400 mx-auto mb-1" />
                  <p className="text-xs text-neutral-500 mb-0.5">Risk Cost</p>
                  <p className="text-sm font-semibold text-white">
                    ${dynamicOpportunityCost.riskCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-500">If issues arise</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-teal-500/10 border border-teal-500/30">
                  <IoTrendingUp className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                  <p className="text-xs text-teal-400 mb-0.5">Total Impact</p>
                  <p className="text-lg font-bold text-teal-400">
                    ${dynamicOpportunityCost.totalCost.toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-xs text-neutral-500 text-center">
                Opportunity cost factors in your time value, material costs, and potential risk exposure.
              </p>
            </div>

            {/* Demo Queue - Next Tasks */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <IoTime className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium text-white">Demo Queue</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-xs text-neutral-400">
                    {demoQueueIndex + 1} / {DEMO_SCENARIOS.length}
                  </span>
                </div>
                <button
                  onClick={handleNextTask}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <IoPlayForward className="w-3 h-3" />
                  Next Task
                </button>
              </div>
              <div className="flex gap-3">
                {nextTasks.map((task, i) => (
                  <button
                    key={task.id}
                    onClick={() => handleScenarioChange(task)}
                    className="flex-1 p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-neutral-400 group-hover:bg-teal-500/20 group-hover:text-teal-400">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-white">{task.title}</span>
                    </div>
                    <p className="text-xs text-neutral-500 pl-7">{task.location.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            {analysisComplete && (
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <IoTime className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-300">
                        Est. Time: <span className="text-white font-medium">{selectedScenario.timeEstimate}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IoShield className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-300">
                        Confidence: <span className="text-emerald-400 font-medium">{selectedScenario.confidenceScore}%</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500">
                    For informational purposes only
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

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import * as d3 from "d3";
import {
  IoHome,
  IoCar,
  IoConstruct,
  IoFish,
  IoSparkles,
  IoSnow,
  IoWater,
  IoSpeedometer,
  IoCamera,
  IoVideocam,
  IoMic,
  IoGlobe,
} from "react-icons/io5";
import { FaFire, FaShower, FaHammer, FaShoePrints } from "react-icons/fa";

/**
 * Scenario Showcase
 *
 * Interactive demo with 10+ real-world scenarios
 * Smooth transitions between scenarios with D3 visualizations
 * Shows decision steps, cost, risk, and next actions
 */

interface Scenario {
  id: string;
  category: "home" | "auto" | "diy" | "purchase";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  inputType: "photo" | "video" | "voice";
  decision: "diy" | "outsource" | "defer";
  steps: {
    title: string;
    description: string;
    duration: string;
  }[];
  costs: {
    diy: number;
    pro: number;
    deferred: number;
  };
  risk: "low" | "medium" | "high";
  ppeRequired: string[];
  timeSaved: number;
  outcome: string;
}

const SCENARIO_ICONS = {
  "ceiling-crack": <IoHome className="w-5 h-5" />,
  "garage-door": <IoCar className="w-5 h-5" />,
  "pond-algae": <IoFish className="w-5 h-5" />,
  "sole-swap": <FaShoePrints className="w-5 h-5" />,
  "unyellow-soles": <IoSparkles className="w-5 h-5" />,
  "car-shudder": <IoConstruct className="w-5 h-5" />,
  "ac-filter": <IoSnow className="w-5 h-5" />,
  "faucet-drip": <IoWater className="w-5 h-5" />,
  "furnace-click": <FaFire className="w-5 h-5" />,
  "bathroom-clog": <FaShower className="w-5 h-5" />,
  "tire-pressure": <IoSpeedometer className="w-5 h-5" />,
  "drywall-hole": <FaHammer className="w-5 h-5" />,
};

const INPUT_TYPE_ICONS = {
  photo: <IoCamera className="w-4 h-4" />,
  video: <IoVideocam className="w-4 h-4" />,
  voice: <IoMic className="w-4 h-4" />,
};

const SCENARIOS: Scenario[] = [
  {
    id: "ceiling-crack",
    category: "home",
    title: "Ceiling Crack",
    subtitle: "Hairline crack near corner",
    icon: SCENARIO_ICONS["ceiling-crack"],
    inputType: "photo",
    decision: "diy",
    steps: [
      { title: "Assess crack type", description: "Measure width: < 1/8\" = cosmetic", duration: "2 min" },
      { title: "Check for water", description: "No staining = structural unlikely", duration: "1 min" },
      { title: "Prep and patch", description: "Mesh tape + joint compound", duration: "30 min" },
      { title: "Sand and paint", description: "Match existing ceiling", duration: "45 min" },
    ],
    costs: { diy: 35, pro: 250, deferred: 400 },
    risk: "low",
    ppeRequired: ["Safety glasses", "Dust mask"],
    timeSaved: 2,
    outcome: "DIY saves $215. No structural concern detected.",
  },
  {
    id: "garage-door",
    category: "home",
    title: "Garage Door Noise",
    subtitle: "Squeaking and grinding",
    icon: SCENARIO_ICONS["garage-door"],
    inputType: "video",
    decision: "diy",
    steps: [
      { title: "Identify source", description: "Rollers vs springs vs opener", duration: "5 min" },
      { title: "Lubricate rollers", description: "White lithium grease on tracks", duration: "10 min" },
      { title: "Tighten hardware", description: "Check all bolts and brackets", duration: "15 min" },
      { title: "Test operation", description: "Verify smooth movement", duration: "5 min" },
    ],
    costs: { diy: 15, pro: 175, deferred: 350 },
    risk: "low",
    ppeRequired: ["Work gloves"],
    timeSaved: 1.5,
    outcome: "Simple fix. Spring replacement would need a pro.",
  },
  {
    id: "pond-algae",
    category: "home",
    title: "Pond Algae Bloom",
    subtitle: "Green water, fish visible",
    icon: SCENARIO_ICONS["pond-algae"],
    inputType: "photo",
    decision: "diy",
    steps: [
      { title: "Test water quality", description: "pH, ammonia, nitrate levels", duration: "15 min" },
      { title: "Reduce light exposure", description: "Add floating plants or shade", duration: "30 min" },
      { title: "Improve filtration", description: "Clean or upgrade filter media", duration: "45 min" },
      { title: "Add beneficial bacteria", description: "Establish biological balance", duration: "5 min" },
    ],
    costs: { diy: 45, pro: 200, deferred: 300 },
    risk: "low",
    ppeRequired: ["Rubber gloves"],
    timeSaved: 3,
    outcome: "Natural treatment effective. Fish safe.",
  },
  {
    id: "sole-swap",
    category: "diy",
    title: "Sole Swapping Shoes",
    subtitle: "Replace worn outsoles",
    icon: SCENARIO_ICONS["sole-swap"],
    inputType: "video",
    decision: "outsource",
    steps: [
      { title: "Remove old sole", description: "Heat gun + acetone for adhesive", duration: "30 min" },
      { title: "Prep midsole", description: "Sand and clean surface", duration: "20 min" },
      { title: "Apply new sole", description: "Contact cement + pressure clamp", duration: "45 min" },
      { title: "Cure and trim", description: "24hr cure, trim excess", duration: "24 hrs" },
    ],
    costs: { diy: 60, pro: 85, deferred: 0 },
    risk: "high",
    ppeRequired: ["Respirator", "Safety glasses", "Gloves"],
    timeSaved: -1,
    outcome: "Pro recommended. High risk of ruining shoes.",
  },
  {
    id: "unyellow-soles",
    category: "diy",
    title: "Unyellowing Soles",
    subtitle: "Restore clear/icy soles",
    icon: SCENARIO_ICONS["unyellow-soles"],
    inputType: "photo",
    decision: "diy",
    steps: [
      { title: "Clean soles", description: "Acetone wipe to remove oils", duration: "10 min" },
      { title: "Apply solution", description: "Salon Care 40 + plastic wrap", duration: "15 min" },
      { title: "UV exposure", description: "Direct sunlight 4-6 hours", duration: "5 hrs" },
      { title: "Repeat if needed", description: "Multiple sessions for best results", duration: "Variable" },
    ],
    costs: { diy: 25, pro: 75, deferred: 0 },
    risk: "low",
    ppeRequired: ["Rubber gloves", "UV eye protection"],
    timeSaved: 0,
    outcome: "DIY effective. Results vary by yellowing severity.",
  },
  {
    id: "car-shudder",
    category: "auto",
    title: "Car Shudders at Speed",
    subtitle: "Vibration above 60mph",
    icon: SCENARIO_ICONS["car-shudder"],
    inputType: "voice",
    decision: "outsource",
    steps: [
      { title: "Check tire balance", description: "Visual inspection for weights", duration: "5 min" },
      { title: "Inspect brake rotors", description: "Look for warping or grooves", duration: "10 min" },
      { title: "Diagnose drivetrain", description: "CV joints, wheel bearings", duration: "30 min" },
      { title: "Professional repair", description: "Requires alignment equipment", duration: "2 hrs" },
    ],
    costs: { diy: 0, pro: 150, deferred: 800 },
    risk: "high",
    ppeRequired: [],
    timeSaved: 4,
    outcome: "Safety critical. Professional diagnosis required.",
  },
  {
    id: "ac-filter",
    category: "home",
    title: "AC Filter Change",
    subtitle: "Monthly maintenance",
    icon: SCENARIO_ICONS["ac-filter"],
    inputType: "photo",
    decision: "diy",
    steps: [
      { title: "Locate filter slot", description: "Usually near return vent", duration: "1 min" },
      { title: "Check filter size", description: "Note dimensions on old filter", duration: "1 min" },
      { title: "Replace filter", description: "Arrow points toward duct", duration: "2 min" },
      { title: "Set reminder", description: "Every 30-90 days", duration: "1 min" },
    ],
    costs: { diy: 15, pro: 75, deferred: 200 },
    risk: "low",
    ppeRequired: [],
    timeSaved: 0.5,
    outcome: "Essential DIY. Improves efficiency 10-15%.",
  },
  {
    id: "faucet-drip",
    category: "home",
    title: "Kitchen Faucet Drip",
    subtitle: "Slow drip at spout",
    icon: SCENARIO_ICONS["faucet-drip"],
    inputType: "video",
    decision: "diy",
    steps: [
      { title: "Identify faucet type", description: "Ball, disc, cartridge, or compression", duration: "5 min" },
      { title: "Shut off water", description: "Valves under sink", duration: "2 min" },
      { title: "Replace cartridge", description: "Match model number exactly", duration: "25 min" },
      { title: "Test for leaks", description: "Run water 2-3 minutes", duration: "5 min" },
    ],
    costs: { diy: 25, pro: 175, deferred: 50 },
    risk: "low",
    ppeRequired: [],
    timeSaved: 1,
    outcome: "DIY saves $150. Wastes 3,000 gal/year if deferred.",
  },
  {
    id: "furnace-click",
    category: "home",
    title: "Furnace Clicking",
    subtitle: "Won't ignite, clicks repeatedly",
    icon: SCENARIO_ICONS["furnace-click"],
    inputType: "voice",
    decision: "outsource",
    steps: [
      { title: "Safety first", description: "Check for gas smell", duration: "Immediate" },
      { title: "Check thermostat", description: "Batteries, settings", duration: "5 min" },
      { title: "Inspect igniter", description: "Visual crack check only", duration: "10 min" },
      { title: "Call HVAC tech", description: "Igniter replacement", duration: "2 hrs" },
    ],
    costs: { diy: 0, pro: 280, deferred: 500 },
    risk: "high",
    ppeRequired: [],
    timeSaved: 6,
    outcome: "Gas appliance = call a pro. No DIY recommended.",
  },
  {
    id: "bathroom-clog",
    category: "home",
    title: "Bathroom Sink Clog",
    subtitle: "Slow drain, gurgling",
    icon: SCENARIO_ICONS["bathroom-clog"],
    inputType: "photo",
    decision: "diy",
    steps: [
      { title: "Try plunger", description: "Wet rag in overflow hole", duration: "5 min" },
      { title: "Remove P-trap", description: "Bucket underneath, loosen nuts", duration: "10 min" },
      { title: "Snake drain", description: "Hair clog usually 2-3ft in", duration: "15 min" },
      { title: "Reassemble", description: "Hand-tight + 1/4 turn", duration: "5 min" },
    ],
    costs: { diy: 20, pro: 150, deferred: 250 },
    risk: "low",
    ppeRequired: ["Rubber gloves"],
    timeSaved: 1,
    outcome: "DIY success rate 90%+. Hair clog most common.",
  },
  {
    id: "tire-pressure",
    category: "auto",
    title: "Low Tire Pressure",
    subtitle: "TPMS warning light",
    icon: SCENARIO_ICONS["tire-pressure"],
    inputType: "photo",
    decision: "diy",
    steps: [
      { title: "Check current PSI", description: "Use accurate gauge", duration: "2 min" },
      { title: "Find recommended PSI", description: "Door jamb sticker", duration: "1 min" },
      { title: "Fill at station", description: "Add air in short bursts", duration: "10 min" },
      { title: "Verify and reset", description: "Check all 4 + spare", duration: "5 min" },
    ],
    costs: { diy: 2, pro: 25, deferred: 100 },
    risk: "low",
    ppeRequired: [],
    timeSaved: 0.5,
    outcome: "Essential DIY. Improves MPG and tire life.",
  },
  {
    id: "drywall-hole",
    category: "home",
    title: "Drywall Hole Repair",
    subtitle: "Doorknob-sized hole",
    icon: SCENARIO_ICONS["drywall-hole"],
    inputType: "photo",
    decision: "diy",
    steps: [
      { title: "Cut clean square", description: "Use drywall saw", duration: "5 min" },
      { title: "Install backer", description: "Wood strips or California patch", duration: "15 min" },
      { title: "Apply patch piece", description: "Screw into backers", duration: "10 min" },
      { title: "Mud, tape, sand", description: "3 coats, sand between", duration: "3 days" },
    ],
    costs: { diy: 30, pro: 200, deferred: 200 },
    risk: "low",
    ppeRequired: ["Dust mask", "Safety glasses"],
    timeSaved: 2,
    outcome: "DIY saves $170. Takes patience for smooth finish.",
  },
];

// Dark mode with cyan accent colors
const CATEGORY_COLORS = {
  home: "#00F0FF",
  auto: "#FF8800",
  diy: "#00FF88",
  purchase: "#A855F7",
};

const RISK_COLORS = {
  low: "#00FF88",
  medium: "#FF8800",
  high: "#FF4444",
};

const DECISION_COLORS = {
  diy: "#00FF88",
  outsource: "#00F0FF",
  defer: "#FF8800",
};

export function ScenarioShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredScenarios = activeCategory === "all"
    ? SCENARIOS
    : SCENARIOS.filter(s => s.category === activeCategory);

  // Animate scenario change
  const handleScenarioChange = useCallback((scenario: Scenario) => {
    if (scenario.id === selectedScenario.id || isTransitioning) return;

    setIsTransitioning(true);
    setActiveStep(0);

    // Fade out current content
    if (containerRef.current) {
      const content = containerRef.current.querySelector(".scenario-content");
      gsap.to(content, {
        opacity: 0,
        x: -20,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setSelectedScenario(scenario);
          // Fade in new content
          gsap.fromTo(content,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out", onComplete: () => setIsTransitioning(false) }
          );
        },
      });
    } else {
      setSelectedScenario(scenario);
      setIsTransitioning(false);
    }
  }, [selectedScenario.id, isTransitioning]);

  // D3 Cost Comparison Chart
  useEffect(() => {
    if (!chartRef.current || !mounted) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();

    const width = 280;
    const height = 120;
    const margin = { top: 15, right: 15, bottom: 25, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const data = [
      { label: "DIY", value: selectedScenario.costs.diy, color: "#00FF88" },
      { label: "Pro", value: selectedScenario.costs.pro, color: "#00F0FF" },
      { label: "Defer", value: selectedScenario.costs.deferred, color: "#FF8800" },
    ];

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d.value)) * 1.1])
      .range([innerHeight, 0]);

    // Grid lines
    g.append("g")
      .selectAll("line")
      .data(yScale.ticks(4))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#222")
      .attr("stroke-dasharray", "2,2");

    // Bars
    const bars = g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.label) || 0)
      .attr("y", innerHeight)
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .attr("fill", d => d.color)
      .attr("rx", 4);

    // Animate bars
    bars.each(function(d, i) {
      gsap.to(this, {
        attr: { y: yScale(d.value), height: innerHeight - yScale(d.value) },
        duration: 0.5,
        delay: i * 0.1,
        ease: "power2.out",
      });
    });

    // Value labels
    g.selectAll(".value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", d => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.value) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", d => d.color)
      .attr("font-size", 11)
      .attr("font-weight", 600)
      .attr("font-family", "monospace")
      .text(d => `$${d.value}`)
      .attr("opacity", 0);

    g.selectAll(".value-label").each(function(d, i) {
      gsap.to(this, {
        opacity: 1,
        duration: 0.3,
        delay: 0.5 + i * 0.1,
      });
    });

    // X axis labels
    g.selectAll(".x-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "x-label")
      .attr("x", d => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
      .attr("y", innerHeight + 18)
      .attr("text-anchor", "middle")
      .attr("fill", "#666")
      .attr("font-size", 10)
      .text(d => d.label);

  }, [selectedScenario, mounted]);

  // Animate steps progression
  useEffect(() => {
    if (!mounted || !stepsRef.current) return;

    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= selectedScenario.steps.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [selectedScenario, mounted]);

  // Animate active step
  useEffect(() => {
    if (!stepsRef.current || !mounted) return;

    const steps = stepsRef.current.querySelectorAll(".step-item");
    steps.forEach((step, i) => {
      if (i === activeStep) {
        gsap.to(step, {
          scale: 1.02,
          backgroundColor: "rgba(0, 240, 255, 0.1)",
          borderColor: "rgba(0, 240, 255, 0.3)",
          duration: 0.3,
        });
      } else {
        gsap.to(step, {
          scale: 1,
          backgroundColor: "rgba(23, 23, 23, 0.5)",
          borderColor: "rgba(38, 38, 38, 0.5)",
          duration: 0.3,
        });
      }
    });
  }, [activeStep, mounted]);

  if (!mounted) return null;

  const savings = selectedScenario.costs.pro - selectedScenario.costs.diy;

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage: `radial-gradient(circle at center, #00F0FF15 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
            <span className="text-xs font-medium text-[#00F0FF]">Interactive Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Pick a Scenario.
            <span className="text-[#00F0FF]"> See the Analysis.</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            From pond algae to sole swapping—explore real decisions with costs, risks, and step-by-step guidance.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: "all", label: "All", count: SCENARIOS.length },
            { id: "home", label: "Home", count: SCENARIOS.filter(s => s.category === "home").length },
            { id: "auto", label: "Auto", count: SCENARIOS.filter(s => s.category === "auto").length },
            { id: "diy", label: "DIY/Craft", count: SCENARIOS.filter(s => s.category === "diy").length },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-[#00F0FF] text-black"
                  : "bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-neutral-600"
              }`}
            >
              {cat.label}
              <span className="ml-1.5 text-xs opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Scenario Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-4xl mx-auto">
          {filteredScenarios.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => handleScenarioChange(scenario)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                selectedScenario.id === scenario.id
                  ? "bg-[#00F0FF] text-black font-medium"
                  : "bg-neutral-900/80 text-neutral-300 border border-neutral-800 hover:border-neutral-600"
              }`}
            >
              <span className={selectedScenario.id === scenario.id ? "text-black" : "text-[#00F0FF]"}>{scenario.icon}</span>
              <span>{scenario.title}</span>
            </button>
          ))}
        </div>

        {/* Main Demo Area */}
        <div ref={containerRef} className="grid lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {/* Left: Steps */}
          <div className="lg:col-span-2">
            <div className="scenario-content bg-neutral-950/80 rounded-xl border border-neutral-800 p-5 backdrop-blur-sm">
              {/* Scenario Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#00F0FF]">{selectedScenario.icon}</span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[selectedScenario.category]}15`,
                        color: CATEGORY_COLORS[selectedScenario.category]
                      }}
                    >
                      {selectedScenario.category.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{selectedScenario.title}</h3>
                  <p className="text-sm text-neutral-500">{selectedScenario.subtitle}</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-400">{INPUT_TYPE_ICONS[selectedScenario.inputType]}</span>
                  <span className="text-xs text-neutral-400">{selectedScenario.inputType}</span>
                </div>
              </div>

              {/* Decision Badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-5"
                style={{
                  backgroundColor: `${DECISION_COLORS[selectedScenario.decision]}15`,
                  borderWidth: 1,
                  borderColor: `${DECISION_COLORS[selectedScenario.decision]}30`
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: DECISION_COLORS[selectedScenario.decision] }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: DECISION_COLORS[selectedScenario.decision] }}
                >
                  Recommendation: {selectedScenario.decision === "diy" ? "DIY" : selectedScenario.decision === "outsource" ? "Hire Pro" : "Defer"}
                </span>
              </div>

              {/* Steps */}
              <div ref={stepsRef} className="space-y-2">
                {selectedScenario.steps.map((step, i) => (
                  <div
                    key={i}
                    className="step-item p-3 rounded-lg border transition-all duration-200"
                    style={{
                      backgroundColor: i === activeStep ? "rgba(0, 240, 255, 0.1)" : "rgba(23, 23, 23, 0.5)",
                      borderColor: i === activeStep ? "rgba(0, 240, 255, 0.3)" : "rgba(38, 38, 38, 0.5)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                          i === activeStep ? "bg-[#00F0FF] text-black" : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-medium ${i === activeStep ? "text-white" : "text-neutral-300"}`}>
                            {step.title}
                          </span>
                          <span className="text-xs text-neutral-500 font-mono">{step.duration}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Charts & Info */}
          <div className="lg:col-span-3 space-y-4">
            {/* Cost Comparison */}
            <div className="scenario-content bg-neutral-950/80 rounded-xl border border-neutral-800 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-white">Cost Comparison</h4>
                {savings > 0 && selectedScenario.decision === "diy" && (
                  <span className="text-sm font-mono font-semibold text-[#00FF88]">
                    Save ${savings}
                  </span>
                )}
              </div>
              <svg ref={chartRef} viewBox="0 0 280 120" className="w-full" />
            </div>

            {/* Risk & Safety */}
            <div className="grid grid-cols-2 gap-4">
              <div className="scenario-content bg-neutral-950/80 rounded-xl border border-neutral-800 p-4 backdrop-blur-sm">
                <h4 className="text-xs text-neutral-500 mb-2">Risk Level</h4>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[selectedScenario.risk] }}
                  />
                  <span
                    className="text-lg font-semibold capitalize"
                    style={{ color: RISK_COLORS[selectedScenario.risk] }}
                  >
                    {selectedScenario.risk}
                  </span>
                </div>
              </div>
              <div className="scenario-content bg-neutral-950/80 rounded-xl border border-neutral-800 p-4 backdrop-blur-sm">
                <h4 className="text-xs text-neutral-500 mb-2">Time Impact</h4>
                <div className="text-lg font-semibold text-white">
                  {selectedScenario.timeSaved > 0 ? (
                    <span className="text-[#00FF88]">+{selectedScenario.timeSaved}h saved</span>
                  ) : selectedScenario.timeSaved < 0 ? (
                    <span className="text-[#FF8800]">{selectedScenario.timeSaved}h (risky)</span>
                  ) : (
                    <span className="text-neutral-400">Neutral</span>
                  )}
                </div>
              </div>
            </div>

            {/* PPE Required */}
            {selectedScenario.ppeRequired.length > 0 && (
              <div className="scenario-content bg-neutral-950/80 rounded-xl border border-neutral-800 p-4 backdrop-blur-sm">
                <h4 className="text-xs text-neutral-500 mb-2">Safety Equipment Required</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedScenario.ppeRequired.map((ppe, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded bg-[#FF8800]/10 text-[#FF8800] border border-[#FF8800]/20"
                    >
                      {ppe}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Outcome */}
            <div className="scenario-content bg-neutral-950/80 rounded-xl border border-neutral-800 p-4 backdrop-blur-sm">
              <h4 className="text-xs text-neutral-500 mb-2">Bottom Line</h4>
              <p className="text-sm text-white leading-relaxed">{selectedScenario.outcome}</p>
            </div>

            {/* Language Support */}
            <div className="scenario-content flex items-center justify-between bg-neutral-900/40 rounded-lg px-4 py-3 border border-neutral-800/50">
              <div className="flex items-center gap-2">
                <IoGlobe className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-400">Works in any language</span>
              </div>
              <div className="flex items-center gap-2">
                <IoMic className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-400">Voice input supported</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

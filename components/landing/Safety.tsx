"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as d3 from "d3";
import {
  IoShield,
  IoWarning,
  IoCloseCircle,
  IoCheckmarkCircle,
  IoEye,
  IoHandLeft,
  IoFlash,
} from "react-icons/io5";
import { FaFire } from "react-icons/fa";
import { IoStopCircle } from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}


interface RiskLevel {
  level: "low" | "medium" | "high" | "critical";
  label: string;
  color: string;
  description: string;
  angle: number;
}

const RISK_LEVELS: RiskLevel[] = [
  { level: "low", label: "Low Risk", color: "#22c55e", description: "Safe for most DIYers", angle: -60 },
  { level: "medium", label: "Medium Risk", color: "#f59e0b", description: "Requires care & PPE", angle: -20 },
  { level: "high", label: "High Risk", color: "#ef4444", description: "Consider hiring a pro", angle: 20 },
  { level: "critical", label: "Critical", color: "#dc2626", description: "Do not attempt DIY", angle: 60 },
];

const HARD_STOPS = [
  { icon: IoFlash, label: "Electrical Panel Work", reason: "Requires licensed electrician" },
  { icon: FaFire, label: "Gas Line Repairs", reason: "Explosion/fire hazard" },
  { icon: IoStopCircle, label: "Structural Changes", reason: "Permit required" },
];

const SCENARIOS = [
  {
    title: "Ceiling Crack Repair",
    risk: "low" as const,
    ppe: ["Safety Goggles", "Dust Mask"],
    canDiy: true,
  },
  {
    title: "Attic Insulation",
    risk: "medium" as const,
    ppe: ["N95 Respirator", "Safety Goggles", "Coveralls", "Gloves"],
    canDiy: true,
  },
  {
    title: "Electrical Outlet",
    risk: "high" as const,
    ppe: ["Insulated Gloves", "Safety Goggles"],
    canDiy: false,
    warning: "Turn off breaker first. Consider hiring if unsure.",
  },
];

export function Safety() {
  const sectionRef = useRef<HTMLElement>(null);
  const gaugeRef = useRef<SVGSVGElement>(null);
  const needleRef = useRef<SVGGElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!gaugeRef.current || !mounted) return;

    const svg = d3.select(gaugeRef.current);
    svg.selectAll("*").remove();

    const width = 260;
    const height = 160;
    const radius = 100;
    const cx = width / 2;
    const cy = height - 20;

    const g = svg.append("g").attr("transform", `translate(${cx}, ${cy})`);

    // Background arc (darker)
    const arcBg = d3.arc()
      .innerRadius(radius - 30)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2 - 0.1)
      .endAngle(Math.PI / 2 + 0.1);

    g.append("path")
      .attr("d", arcBg as unknown as string)
      .attr("fill", "#0f1419");

    const segments = [
      { start: -90, end: -45, color: "#22c55e" },
      { start: -45, end: 0, color: "#f59e0b" },   
      { start: 0, end: 45, color: "#ef4444" },    
      { start: 45, end: 90, color: "#dc2626" },   
    ];

    segments.forEach(seg => {
      const arc = d3.arc()
        .innerRadius(radius - 28)
        .outerRadius(radius - 2)
        .startAngle((seg.start * Math.PI) / 180)
        .endAngle((seg.end * Math.PI) / 180);

      g.append("path")
        .attr("d", arc as unknown as string)
        .attr("fill", seg.color)
        .attr("opacity", 0.9);
    });

    for (let angle = -90; angle <= 90; angle += 15) {
      const rad = (angle * Math.PI) / 180;
      const isMajor = angle % 45 === 0;
      const innerR = isMajor ? radius - 40 : radius - 36;
      const outerR = radius - 30;

      g.append("line")
        .attr("x1", Math.sin(rad) * innerR)
        .attr("y1", -Math.cos(rad) * innerR)
        .attr("x2", Math.sin(rad) * outerR)
        .attr("y2", -Math.cos(rad) * outerR)
        .attr("stroke", isMajor ? "#fff" : "#666")
        .attr("stroke-width", isMajor ? 2 : 1);
    }

    const labels = [
      { angle: -67, text: "LOW" },
      { angle: -22, text: "MED" },
      { angle: 22, text: "HIGH" },
      { angle: 67, text: "CRIT" },
    ];

    labels.forEach(({ angle, text }) => {
      const rad = (angle * Math.PI) / 180;
      const labelRadius = radius + 14;
      g.append("text")
        .attr("x", Math.sin(rad) * labelRadius)
        .attr("y", -Math.cos(rad) * labelRadius)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .attr("fill", "#9ca3af")
        .text(text);
    });

    const needlePivotY = 0;

    const needle = g.append("g")
      .attr("class", "needle")
      .style("transform-origin", `0px ${needlePivotY}px`);
    needleRef.current = needle.node();

    const needleLength = radius - 35;
    needle.append("path")
      .attr("d", `M -2 ${needlePivotY + 5} L 0 ${needlePivotY - needleLength} L 2 ${needlePivotY + 5} Z`)
      .attr("fill", "#ffffff")
      .attr("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.5))");

    g.append("circle")
      .attr("cy", needlePivotY)
      .attr("r", 12)
      .attr("fill", "#1f2937")
      .attr("stroke", "#374151")
      .attr("stroke-width", 2);

    g.append("circle")
      .attr("cy", needlePivotY)
      .attr("r", 6)
      .attr("fill", "#ffffff");

    gsap.set(needle.node(), { rotation: -60 });
  }, [mounted]);

  useEffect(() => {
    if (!needleRef.current || !mounted) return;

    const scenario = SCENARIOS[selectedScenario];
    const riskLevel = RISK_LEVELS.find(r => r.level === scenario.risk);
    const targetAngle = riskLevel?.angle || 0;

    gsap.to(needleRef.current, {
      rotation: targetAngle,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)",
    });
  }, [selectedScenario, mounted]);

  useEffect(() => {
    if (!sectionRef.current || !mounted) return;

    const ctx = gsap.context(() => {
      gsap.from(".safety-header", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".safety-content", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from(".hard-stop-item", {
        scrollTrigger: {
          trigger: ".hard-stops-container",
          start: "top 85%",
        },
        opacity: 0,
        x: -20,
        stagger: 0.1,
        duration: 0.5,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) return null;

  const currentScenario = SCENARIOS[selectedScenario];
  const currentRisk = RISK_LEVELS.find(r => r.level === currentScenario.risk);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 overflow-hidden bg-gray-900"
    >
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
        <div className="safety-header text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium mb-4">
            <IoShield className="w-3.5 h-3.5" />
            Safety-First Analysis
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
            We Tell You When to{" "}
            <span className="text-amber-400">Stop</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-400">
            Every recommendation includes risk assessment, required safety gear, and clear warnings when a job is beyond safe DIY territory.
          </p>
        </div>
        <div className="safety-content grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-white mb-6">Risk Assessment</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {SCENARIOS.map((scenario, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedScenario(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedScenario === i
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {scenario.title}
                </button>
              ))}
            </div>
            <div className="flex justify-center mb-6">
              <svg ref={gaugeRef} width={260} height={160} />
            </div>
            <div className="text-center mb-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{ backgroundColor: `${currentRisk?.color}20`, color: currentRisk?.color }}
              >
                {currentScenario.canDiy ? (
                  <IoCheckmarkCircle className="w-4 h-4" />
                ) : (
                  <IoWarning className="w-4 h-4" />
                )}
                {currentRisk?.label}: {currentRisk?.description}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-400 mb-3">Required Safety Gear:</div>
              <div className="flex flex-wrap gap-2">
                {currentScenario.ppe.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium"
                  >
                    <IoCheckmarkCircle className="w-3 h-3" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {currentScenario.warning && (
              <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <IoWarning className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-300">{currentScenario.warning}</p>
              </div>
            )}
          </div>
          <div>
            <div className="bg-red-950/30 rounded-2xl border border-red-900/50 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <IoCloseCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Hard Stops</h3>
                  <p className="text-sm text-gray-400">Jobs we won&apos;t recommend for DIY</p>
                </div>
              </div>
              <div className="hard-stops-container space-y-3">
                {HARD_STOPS.map((stop, i) => (
                  <div
                    key={i}
                    className="hard-stop-item flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <stop.icon className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{stop.label}</div>
                      <div className="text-xs text-gray-400">{stop.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
              <div className="flex items-start gap-3">
                <IoShield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">Your safety is our priority.</span>{" "}
                    We&apos;d rather lose a DIY recommendation than see you get hurt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

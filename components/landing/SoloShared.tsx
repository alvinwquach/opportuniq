"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as d3 from "d3";
import {
  IoPerson,
  IoPeople,
  IoHome,
  IoCheckmark,
  IoCash,
  IoChatbox,
  IoArrowForward,
} from "react-icons/io5";
import { FaVoteYea } from "react-icons/fa";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const MODES = [
  {
    id: "solo",
    icon: IoPerson,
    title: "Solo Mode",
    subtitle: "Your decisions, your pace",
    description: "Track personal projects and spending privately. Make decisions on your own timeline without waiting for anyone.",
    features: [
      "Private decision history",
      "Personal budget tracking",
      "Individual time value settings",
    ],
    idealFor: "Renters, solo homeowners, individuals",
  },
  {
    id: "shared",
    icon: IoPeople,
    title: "Shared Mode",
    subtitle: "Decide together",
    description: "Collaborate on household decisions. Everyone sees the same issues, votes on options, and tracks shared spending.",
    features: [
      "Group voting on decisions",
      "Shared budget visibility",
      "Discussion threads on issues",
    ],
    idealFor: "Couples, roommates, co-owners",
  },
  {
    id: "family",
    icon: IoHome,
    title: "Family Mode",
    subtitle: "Multi-property, multi-person",
    description: "Manage multiple properties with different stakeholders. Perfect for helping family members or managing shared assets.",
    features: [
      "Multiple property support",
      "Role-based permissions",
      "Cross-property insights",
    ],
    idealFor: "Families, property managers",
  },
];

const VOTING_EXAMPLE = {
  issue: "Replace vs Repair: Dishwasher",
  votes: [
    { name: "Alex", vote: "repair", avatar: "A" },
    { name: "Jordan", vote: "repair", avatar: "J" },
    { name: "Sam", vote: "replace", avatar: "S" },
  ],
  result: "Repair wins (2-1)",
};

const BUDGET_CONTRIBUTIONS = [
  { name: "Alex", amount: 450, color: "#3b82f6" },
  { name: "Jordan", amount: 350, color: "#10b981" },
  { name: "Sam", amount: 200, color: "#f59e0b" },
];

export function SoloShared() {
  const sectionRef = useRef<HTMLElement>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const [selectedMode, setSelectedMode] = useState(0);

  useEffect(() => {
    if (!chartRef.current || selectedMode !== 1) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 10;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<typeof BUDGET_CONTRIBUTIONS[0]>()
      .value(d => d.amount)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<typeof BUDGET_CONTRIBUTIONS[0]>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);

    const arcs = g.selectAll(".arc")
      .data(pie(BUDGET_CONTRIBUTIONS))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => d.data.color)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay((_, i) => i * 150)
      .attr("opacity", 0.9);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .attr("fill", "#ffffff")
      .text("$1,000");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("font-size", "11px")
      .attr("fill", "#9ca3af")
      .text("Monthly Budget");

  }, [selectedMode]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".solo-header", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".mode-selector", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from(".mode-content", {
        scrollTrigger: {
          trigger: ".mode-content",
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const currentMode = MODES[selectedMode];
  const CurrentIcon = currentMode.icon;

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-black overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at center, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
        <div className="solo-header text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium mb-4">
            <IoPeople className="w-3.5 h-3.5" />
            Flexible Collaboration
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
            Solo or{" "}
            <span className="text-blue-400">Shared</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-300">
            Some decisions are yours alone. Others involve roommates, partners, or family.
            OpportunIQ works either way—without forcing collaboration.
          </p>
        </div>
        <div className="mode-selector flex flex-wrap justify-center gap-2 mb-10">
          {MODES.map((mode, i) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedMode === i
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {mode.title}
              </button>
            );
          })}
        </div>
        <div className="mode-content grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <CurrentIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{currentMode.title}</h3>
                <p className="text-sm text-gray-300">{currentMode.subtitle}</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              {currentMode.description}
            </p>
            <div className="space-y-3 mb-6">
              {currentMode.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <IoCheckmark className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-400">
                <span className="font-medium text-gray-300">Ideal for:</span>{" "}
                {currentMode.idealFor}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {selectedMode === 0 && (
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <IoPerson className="w-5 h-5 text-gray-300" />
                  <span className="text-sm font-medium text-white">Your Private Dashboard</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-300">Decisions this month</span>
                    <span className="text-lg font-bold text-white">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-300">Total saved</span>
                    <span className="text-lg font-bold text-emerald-400">$847</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-300">Your time value</span>
                    <span className="text-lg font-bold text-blue-400">$45/hr</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Only you can see this data
                </p>
              </div>
            )}
            {selectedMode === 1 && (
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FaVoteYea className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-white">Group Decision</span>
                  </div>
                  <div className="text-sm text-gray-300 mb-3">{VOTING_EXAMPLE.issue}</div>
                  <div className="flex items-center gap-3 mb-3">
                    {VOTING_EXAMPLE.votes.map((voter, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                          voter.vote === "repair"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">
                          {voter.avatar}
                        </span>
                        {voter.vote}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <IoCheckmark className="w-4 h-4" />
                    {VOTING_EXAMPLE.result}
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <IoCash className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium text-white">Shared Budget</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <svg ref={chartRef} className="shrink-0" />
                    <div className="space-y-2">
                      {BUDGET_CONTRIBUTIONS.map((contrib, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: contrib.color }}
                          />
                          <span className="text-xs text-gray-300">{contrib.name}</span>
                          <span className="text-xs font-medium text-white">${contrib.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {selectedMode === 2 && (
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <IoHome className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-medium text-white">Your Properties</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Main House", location: "Boston, MA", issues: 2, members: 3 },
                    { name: "Lake Cabin", location: "Vermont", issues: 1, members: 2 },
                    { name: "Parents\' Condo", location: "Florida", issues: 0, members: 1 },
                  ].map((property, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{property.name}</div>
                        <div className="text-xs text-gray-400">{property.location}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {property.issues > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                            {property.issues} issues
                          </span>
                        )}
                        <div className="flex -space-x-1">
                          {Array.from({ length: property.members }).map((_, j) => (
                            <div
                              key={j}
                              className="w-5 h-5 rounded-full bg-gray-600 border border-gray-800 flex items-center justify-center text-[8px] text-gray-300"
                            >
                              {String.fromCharCode(65 + j)}
                            </div>
                          ))}
                        </div>
                        <IoArrowForward className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Collaboration is always optional. Start solo, add people later if you want.
            Each person&apos;s financial context stays private unless explicitly shared.
          </p>
        </div>
      </div>
    </section>
  );
}

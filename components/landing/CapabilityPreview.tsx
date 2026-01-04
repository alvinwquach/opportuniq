"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IoBarChart, IoGitBranch, IoTime, IoConstruct } from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Capability Preview (Zone 5)
 *
 * Answers: "What else can it do?"
 * Visual Weight: Medium
 * Interaction: Tab selection (light interaction)
 * Tech: GSAP for transitions, NO D3/Three.js
 *
 * Shows capabilities without overwhelming demos.
 * Static previews, not live interactions.
 */

interface Capability {
  id: string;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  features: string[];
}

const CAPABILITIES: Capability[] = [
  {
    id: "analytics",
    title: "Track Your Progress",
    description: "See your savings grow over time. Understand your patterns. Make better future decisions.",
    icon: IoBarChart,
    features: [
      "Monthly savings dashboard",
      "DIY success rate tracking",
      "Cost comparison history",
      "Skill level progression",
    ],
  },
  {
    id: "decisions",
    title: "Decision Framework",
    description: "Every repair shows three clear paths: DIY, hire a pro, or defer. No guesswork.",
    icon: IoGitBranch,
    features: [
      "DIY vs Hire analysis",
      "Risk assessment",
      "Time estimates",
      "Tool requirements",
    ],
  },
  {
    id: "history",
    title: "Decision History",
    description: "Complete record of every decision you've made. Learn from the past.",
    icon: IoTime,
    features: [
      "Full audit trail",
      "Outcome tracking",
      "Pattern recognition",
      "Exportable reports",
    ],
  },
  {
    id: "tools",
    title: "Smart Guidance",
    description: "Step-by-step instructions tailored to your skill level. Know before you start.",
    icon: IoConstruct,
    features: [
      "Skill-matched guidance",
      "Safety checklists",
      "Parts lists",
      "Video tutorials",
    ],
  },
];

export function CapabilityPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(CAPABILITIES[0].id);

  const activeCapability = CAPABILITIES.find(c => c.id === activeTab) || CAPABILITIES[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!contentRef.current || !mounted) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      }
    );
  }, [mounted]);

  // Animate content change on tab switch
  useEffect(() => {
    if (!mounted) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const detailsEl = document.querySelector('.capability-details');

    if (detailsEl && !prefersReducedMotion) {
      gsap.fromTo(
        detailsEl,
        { opacity: 0, x: 10 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [activeTab, mounted]);

  if (!mounted) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-neutral-950/50"
    >
      <div className="container mx-auto px-6 max-w-5xl">
        <div ref={contentRef}>
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3 tracking-tight">
              More Than a Calculator
            </h2>
            <p className="text-neutral-400 text-base max-w-md mx-auto">
              A complete system for making confident home decisions.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {CAPABILITIES.map((capability) => (
              <button
                key={capability.id}
                onClick={() => setActiveTab(capability.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all duration-200 ${
                  activeTab === capability.id
                    ? "bg-white text-black font-medium"
                    : "bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                }`}
                aria-pressed={activeTab === capability.id}
              >
                <capability.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{capability.title}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800/50 p-6 sm:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Description */}
              <div className="capability-details">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <activeCapability.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{activeCapability.title}</h3>
                </div>

                <p className="text-neutral-400 leading-relaxed mb-6">
                  {activeCapability.description}
                </p>

                <ul className="space-y-3">
                  {activeCapability.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Static Preview Placeholder */}
              <div className="relative aspect-[4/3] rounded-xl bg-neutral-800/30 border border-neutral-700/30 overflow-hidden">
                {/* Simple visual representation - no complex charts */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <activeCapability.icon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                    <p className="text-neutral-500 text-sm">Preview coming soon</p>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 left-4 right-4">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

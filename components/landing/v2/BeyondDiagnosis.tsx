"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import {
  IoPeople,
  IoScale,
  IoWallet,
  IoClipboard,
  IoSync,
  IoBuild,
  IoPerson,
  IoTime,
  IoCheckmarkCircle,
} from "react-icons/io5";
import type { IconType } from "react-icons";

const tabs: { icon: IconType; label: string; description: string; visual: React.ReactNode }[] = [
  {
    icon: IoPeople,
    label: "Household collaboration",
    description:
      "Create a household group. Invite family or roommates. Everyone sees the same issues, votes on decisions, and tracks expenses.",
    visual: (
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800">
          MR · Coordinator
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800">
          SR · Collaborator
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-500">
          friend@... · Pending
        </span>
      </div>
    ),
  },
  {
    icon: IoScale,
    label: "Decision framework",
    description:
      "For every issue, compare options: DIY, hire a pro, defer, or replace. Vote as a household. Record what actually happened.",
    visual: (
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
          <IoBuild className="w-3 h-3" /> DIY · $80
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800">
          <IoPerson className="w-3 h-3" /> Hire Pro · $450
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-500">
          <IoTime className="w-3 h-3" /> Defer →
        </span>
      </div>
    ),
  },
  {
    icon: IoWallet,
    label: "Financial tracking",
    description:
      "Track income, expenses, and repair budgets. Know what you\u2019ve spent, what\u2019s remaining, and whether you\u2019re over budget.",
    visual: (
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-500">$190 spent</span>
          <span className="text-gray-400">$800 budget</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "24%" }} />
        </div>
        <p className="text-xs text-emerald-600 font-medium mt-1.5">$610 remaining</p>
      </div>
    ),
  },
  {
    icon: IoClipboard,
    label: "Issue tracking",
    description:
      "Track every issue from discovery to resolution. Attach photos, add notes, schedule repairs on your calendar.",
    visual: (
      <div className="flex items-center gap-3 mt-4">
        {["Open", "In Progress", "Resolved"].map((s, i) => (
          <span key={s} className="contents">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                i === 2
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-gray-50 border border-gray-200 text-gray-600"
              }`}
            >
              {i === 2 && <IoCheckmarkCircle className="w-3 h-3" />}
              {s}
            </span>
            {i < 2 && <span className="text-gray-300 text-xs">→</span>}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: IoSync,
    label: "Feedback loop",
    description:
      "Report what contractors actually quote. Record what repairs cost. Your data helps improve cost estimates for your area.",
    visual: (
      <div className="flex items-center gap-2 mt-4 text-xs">
        <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-medium">
          AI: $450
        </span>
        <span className="text-gray-300">→</span>
        <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
          Actual: $380
        </span>
        <span className="text-gray-300">→</span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-600 font-medium">
          <IoCheckmarkCircle className="w-3 h-3 text-emerald-500" /> Within range
        </span>
      </div>
    ),
  },
];

export function BeyondDiagnosis() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);
  const hasAnimated = useRef(false);

  const animateContent = () => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { clipPath: "inset(0 0 100% 0)" },
      { clipPath: "inset(0 0 0% 0)", duration: 0.4, ease: "power3.out" }
    );
  };

  // Heading entrance animation
  useEffect(() => {
    if (!sectionRef.current) return;
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const ctx = gsap.context(() => {
      if (headingRef.current) {
        const split = new SplitText(headingRef.current, { type: "words" });
        gsap.set(split.words, { clipPath: "inset(0 0 100% 0)", display: "inline-block" });
        ScrollTrigger.create({
          trigger: headingRef.current,
          start: "top 80%",
          onEnter: () => {
            gsap.to(split.words, {
              clipPath: "inset(0 0 0% 0)",
              stagger: 0.05,
              duration: 0.6,
              ease: "spring",
            });
          },
          once: true,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Auto-rotate tabs
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setActiveTab((prev) => (prev + 1) % tabs.length);
      }
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    animateContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabClick = (i: number) => {
    setActiveTab(i);
    pausedRef.current = false;
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 sm:py-32 bg-white"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split layout: heading + tabs left, content right */}
        <div className="grid lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16">
          {/* Left — sticky on desktop */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
              Beyond diagnosis
            </p>
            <h2
              ref={headingRef}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight"
            >
              The AI diagnoses it. You manage the rest.
            </h2>
            <p className="text-base text-gray-500 mb-8">
              Track every issue, make decisions together, manage your household repairs.
            </p>

            {/* Desktop: vertical tabs */}
            <div className="hidden lg:flex flex-col gap-1.5">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => handleTabClick(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === i
                      ? "bg-white border border-gray-200 shadow-sm text-gray-900"
                      : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2 inline-block flex-shrink-0" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mobile: horizontal scroll pills */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => handleTabClick(i)}
                  className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === i
                      ? "bg-white border border-gray-200 shadow-sm text-gray-900"
                      : "bg-transparent text-gray-500 border border-transparent"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-1.5 inline-block" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right — tab content */}
          <div className="flex items-start pt-2 lg:pt-12">
            <div
              ref={contentRef}
              className="bg-white border border-gray-200 rounded-2xl p-8 w-full shadow-sm"
            >
              {(() => { const Icon = tabs[activeTab].icon; return <Icon className="w-7 h-7 text-blue-600 mb-4" />; })()}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {tabs[activeTab].label}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {tabs[activeTab].description}
              </p>
              {tabs[activeTab].visual}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import {
  IoWarningOutline,
  IoDocumentTextOutline,
  IoTrendingUpOutline,
  IoCheckmarkCircle,
  IoChevronForward,
} from "react-icons/io5";

// Risk escalation data
const RISK_DATA = [
  { step: 0, cost: 150, label: "Initial estimate" },
  { step: 1, cost: 220, label: "Wrong part ordered" },
  { step: 2, cost: 350, label: "Water damage" },
  { step: 3, cost: 520, label: "Mold remediation" },
  { step: 4, cost: 890, label: "Professional repair" },
];

// Decision ledger data
const LEDGER_DATA = [
  { date: "Jan 15", category: "Plumbing", decision: "DIY", cost: 45, saved: 180 },
  { date: "Feb 3", category: "Electrical", decision: "Pro", cost: 350, saved: 0 },
  { date: "Feb 28", category: "HVAC", decision: "DIY", cost: 120, saved: 400 },
  { date: "Mar 12", category: "Appliance", decision: "DIY", cost: 35, saved: 150 },
  { date: "Apr 5", category: "Plumbing", decision: "Pro", cost: 280, saved: 0 },
  { date: "Apr 22", category: "Outdoor", decision: "DIY", cost: 85, saved: 320 },
];

// Learning curve data
const LEARNING_CURVE = [
  { attempt: 1, time: 180, cost: 450 },
  { attempt: 2, time: 120, cost: 280 },
  { attempt: 3, time: 75, cost: 180 },
  { attempt: 4, time: 50, cost: 120 },
  { attempt: 5, time: 40, cost: 95 },
];

const FEATURE_SECTIONS = [
  {
    id: "risk-assessment",
    title: "Risk Assessment Engine",
    subtitle: "See how mistakes compound",
    description: "Every DIY project carries risk. Our engine calculates the potential cost of mistakes before they happen, so you can make informed decisions.",
    features: [
      "Real-time cost escalation modeling",
      "Safety hazard identification",
      "Skill gap analysis",
      "Worst-case scenario planning",
    ],
    icon: IoWarningOutline,
    color: "red",
  },
  {
    id: "decision-ledger",
    title: "Decision Ledger",
    subtitle: "Every decision. Logged forever.",
    description: "Build a complete history of your home maintenance decisions. Track what worked, what didn't, and learn from every experience.",
    features: [
      "Automatic decision logging",
      "Outcome tracking",
      "Cost vs. savings analysis",
      "Searchable history",
    ],
    icon: IoDocumentTextOutline,
    color: "blue",
  },
  {
    id: "learning-curve",
    title: "Learning Curve Analysis",
    subtitle: "Watch your skills grow",
    description: "See exactly how your DIY skills improve over time. Know when you've crossed the threshold from 'should hire' to 'can handle it'.",
    features: [
      "Time-per-task tracking",
      "Cost efficiency improvements",
      "Skill progression graphs",
      "Confidence scoring",
    ],
    icon: IoTrendingUpOutline,
    color: "green",
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm text-neutral-500 mb-6">
            <Link href="/product" className="hover:text-teal-400 transition-colors">
              Product
            </Link>
            <IoChevronForward className="w-3 h-3" />
            <span className="text-neutral-300">Features</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-xs font-mono mb-6">
            <IoTrendingUpOutline className="w-4 h-4" />
            Deep Dive Features
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Features that{" "}
            <span className="text-teal-400">
              make the difference
            </span>
          </h1>

          <p className="text-lg text-neutral-200 max-w-2xl mx-auto mb-10">
            Dive deep into the tools that help you make smarter decisions about repairs and maintenance.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 font-mono font-bold bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              Get Early Access
            </Button>
          </WaitlistModal>
        </div>
      </section>

      {/* Risk Assessment */}
      <section id="risk-assessment" className="py-20 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono mb-6">
                <IoWarningOutline className="w-4 h-4" />
                Risk Assessment
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                {FEATURE_SECTIONS[0].title}
              </h2>
              <p className="text-sm text-neutral-400 mb-4">{FEATURE_SECTIONS[0].subtitle}</p>
              <p className="text-neutral-300 mb-8 leading-relaxed">
                {FEATURE_SECTIONS[0].description}
              </p>

              <ul className="space-y-3">
                {FEATURE_SECTIONS[0].features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <IoCheckmarkCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-700 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-300">Cost Escalation Risk</span>
                <span className="text-xs text-red-400 font-mono">5.9x potential increase</span>
              </div>
              <div className="p-4 space-y-3">
                {RISK_DATA.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-24 text-xs text-neutral-400">{item.label}</div>
                    <div className="flex-1 h-6 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500/60 to-red-500 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.cost / 890) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">${item.cost}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decision Ledger */}
      <section id="decision-ledger" className="py-20 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="order-2 lg:order-1 bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-700 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-300">Decision History</span>
                <div className="flex gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-500" />
                    <span className="text-neutral-400">Saved</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span className="text-neutral-400">DIY</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-amber-500" />
                    <span className="text-neutral-400">Pro</span>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {LEDGER_DATA.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                    <div className="w-16 text-xs text-neutral-400">{item.date}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-white">{item.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.decision === "DIY"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {item.decision}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className="text-neutral-400">Cost: <span className="text-white">${item.cost}</span></span>
                        {item.saved > 0 && (
                          <span className="text-emerald-400">Saved: ${item.saved}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-mono mb-6">
                <IoDocumentTextOutline className="w-4 h-4" />
                Decision Ledger
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                {FEATURE_SECTIONS[1].title}
              </h2>
              <p className="text-sm text-neutral-400 mb-4">{FEATURE_SECTIONS[1].subtitle}</p>
              <p className="text-neutral-300 mb-8 leading-relaxed">
                {FEATURE_SECTIONS[1].description}
              </p>

              <ul className="space-y-3">
                {FEATURE_SECTIONS[1].features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <IoCheckmarkCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Curve */}
      <section id="learning-curve" className="py-20 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono mb-6">
                <IoTrendingUpOutline className="w-4 h-4" />
                Learning Curve
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                {FEATURE_SECTIONS[2].title}
              </h2>
              <p className="text-sm text-neutral-400 mb-4">{FEATURE_SECTIONS[2].subtitle}</p>
              <p className="text-neutral-300 mb-8 leading-relaxed">
                {FEATURE_SECTIONS[2].description}
              </p>

              <ul className="space-y-3">
                {FEATURE_SECTIONS[2].features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <IoCheckmarkCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-700 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-300">Skill Improvement</span>
                <div className="flex gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-amber-500" />
                    <span className="text-neutral-400">Time</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-500" />
                    <span className="text-neutral-400">Cost</span>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {LEARNING_CURVE.map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Attempt #{item.attempt}</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-amber-400">{item.time} min</span>
                        <span className="text-emerald-400">${item.cost}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(item.time / 180) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(item.cost / 450) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <span className="text-xs text-neutral-400">
                    Time reduced by <span className="text-amber-400 font-semibold">78%</span> · Cost reduced by <span className="text-emerald-400 font-semibold">79%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to make smarter decisions?
          </h2>
          <p className="text-neutral-300 mb-8">
            Join the waitlist to be first in line when we launch.
          </p>
          <WaitlistModal>
            <Button className="h-14 px-8 font-mono font-bold text-lg bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(20,184,166,0.4)]">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>
    </>
  );
}

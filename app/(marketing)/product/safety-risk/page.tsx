"use client";

import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { IoShieldCheckmarkOutline, IoWarningOutline, IoCheckmarkCircle, IoAlertCircleOutline, IoChevronForward } from "react-icons/io5";

const RISK_LEVELS = [
  { level: "Critical", color: "bg-red-500", desc: "Emergency - evacuate, call 911, shut off utilities" },
  { level: "High", color: "bg-orange-500", desc: "Hire a professional - serious safety concern" },
  { level: "Medium", color: "bg-amber-500", desc: "Proceed with caution - proper equipment required" },
  { level: "Low", color: "bg-emerald-500", desc: "Safe for DIY - standard precautions apply" },
];

const SAFETY_CHECKS = [
  { question: "Is there a gas smell?", severity: "critical", action: "Evacuate immediately" },
  { question: "Exposed wires visible?", severity: "high", action: "Turn off breaker first" },
  { question: "Water actively flowing?", severity: "high", action: "Shut off main valve" },
  { question: "Working at height?", severity: "medium", action: "Use fall protection" },
  { question: "Confined space entry?", severity: "medium", action: "Ensure ventilation" },
];

const PPE_ITEMS = [
  { item: "N95 Respirator", priority: "required", reason: "Lead dust present in pre-1978 homes" },
  { item: "Voltage Tester", priority: "required", reason: "Verify circuits are de-energized" },
  { item: "Safety Glasses", priority: "recommended", reason: "Debris protection during demo" },
  { item: "Work Gloves", priority: "suggested", reason: "Hand protection from sharp edges" },
];

const FEATURES = [
  {
    icon: IoShieldCheckmarkOutline,
    title: "PPE Recommendations",
    description: "Get specific protective equipment recommendations with priority levels: required, recommended, or suggested—based on your actual repair task.",
  },
  {
    icon: IoWarningOutline,
    title: "4-Level Risk Assessment",
    description: "Every diagnosis includes a risk level from low to critical, with clear guidance on whether to DIY or call a pro.",
  },
  {
    icon: IoAlertCircleOutline,
    title: "Emergency Detection",
    description: "Gas leaks, electrical hazards, and structural emergencies trigger immediate action instructions—no DIY options shown.",
  },
  {
    icon: IoCheckmarkCircle,
    title: "Do Not Proceed Without",
    description: "Hard stops that prevent you from starting work without required safety items. You can't skip critical PPE.",
  },
];

export default function SafetyRiskPage() {
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
            <span className="text-neutral-300">Safety & Risk</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-xs font-mono mb-6">
            <IoShieldCheckmarkOutline className="w-4 h-4" />
            Safety & Risk
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Safety{" "}
            <span className="text-teal-400">
              built into every diagnosis
            </span>
          </h1>

          <p className="text-lg text-neutral-200 max-w-2xl mx-auto mb-10">
            Every diagnosis includes risk assessment, PPE recommendations, and clear guidance
            on when to call a professional. Safety isn&apos;t an add-on—it&apos;s built into every response.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 font-mono font-bold bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              Get Early Access
            </Button>
          </WaitlistModal>
        </div>
      </section>

      {/* Risk Levels */}
      <section className="py-20 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Four-level risk classification
              </h2>
              <p className="text-neutral-300 mb-8">
                Every issue gets classified from low to critical. This determines if DIY is
                viable and what precautions you need to take.
              </p>

              <div className="space-y-3">
                {RISK_LEVELS.map((item) => (
                  <div key={item.level} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-white font-medium w-16">{item.level}</span>
                    <span className="text-neutral-500">— {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-neutral-400">Safety Assessment</span>
              </div>
              <div className="p-4 space-y-3">
                {SAFETY_CHECKS.map((check, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      check.severity === "critical"
                        ? "border-red-500/30 bg-red-500/10"
                        : check.severity === "high"
                        ? "border-orange-500/30 bg-orange-500/10"
                        : "border-amber-500/30 bg-amber-500/10"
                    }`}
                  >
                    <span className="text-sm text-neutral-300">{check.question}</span>
                    <span className={`text-xs font-medium uppercase ${
                      check.severity === "critical" ? "text-red-400" :
                      check.severity === "high" ? "text-orange-400" : "text-amber-400"
                    }`}>
                      {check.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PPE Recommendations */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-400">PPE for This Task</span>
                <span className="text-xs text-teal-400">Auto-generated</span>
              </div>
              <div className="p-4 space-y-3">
                {PPE_ITEMS.map((ppe, i) => (
                  <div key={i} className="p-3 rounded-lg border border-neutral-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{ppe.item}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ppe.priority === "required"
                          ? "bg-red-500/20 text-red-400"
                          : ppe.priority === "recommended"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-neutral-500/20 text-neutral-400"
                      }`}>
                        {ppe.priority}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">{ppe.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                PPE with context
              </h2>
              <p className="text-neutral-300 mb-8">
                Not just a list of gear—each recommendation includes why it&apos;s needed for
                your specific situation. Required items become hard stops if you don&apos;t have them.
              </p>

              <div className="space-y-4">
                {[
                  { label: "Required", desc: "Do NOT proceed without these items" },
                  { label: "Recommended", desc: "Real risk reduction, strongly advised" },
                  { label: "Suggested", desc: "Nice to have for comfort and convenience" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-sm text-neutral-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Safety built in
            </h2>
            <p className="text-neutral-300 max-w-xl mx-auto">
              Every diagnosis response includes safety information automatically—no extra steps required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-neutral-900 border border-neutral-700">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Safety-first diagnosis
          </h2>
          <p className="text-neutral-300 mb-8">
            Get repair guidance that prioritizes your safety with every response.
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

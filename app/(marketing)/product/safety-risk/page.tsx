"use client";

import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { IoShield, IoWarning, IoCheckmarkCircle, IoAlertCircle } from "react-icons/io5";

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
    icon: IoShield,
    title: "PPE Recommendations",
    description: "Get specific protective equipment recommendations with priority levels: required, recommended, or suggested—based on your actual repair task.",
  },
  {
    icon: IoWarning,
    title: "4-Level Risk Assessment",
    description: "Every diagnosis includes a risk level from low to critical, with clear guidance on whether to DIY or call a pro.",
  },
  {
    icon: IoAlertCircle,
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
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm font-medium mb-6">
            <IoShield className="w-4 h-4" />
            Built Into Every Diagnosis
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-neutral-900 mb-6 tracking-tight">
            Safety & Risk Analysis
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Every diagnosis includes risk assessment, PPE recommendations, and clear guidance on when to call a professional. Safety isn&apos;t an add-on—it&apos;s built into every response.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>

      {/* Risk Levels */}
      <section className="py-20 px-6 border-t border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
                Four-level risk classification
              </h2>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Every issue gets classified from low to critical. This determines if DIY is viable and what precautions you need to take.
              </p>

              <div className="space-y-3">
                {RISK_LEVELS.map((item) => (
                  <div key={item.level} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-neutral-900 font-medium w-16">{item.level}</span>
                    <span className="text-neutral-500">— {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-2 bg-neutral-50">
                <IoShield className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-neutral-900">Safety Assessment</span>
              </div>
              <div className="p-4 space-y-3">
                {SAFETY_CHECKS.map((check, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      check.severity === "critical"
                        ? "border-red-200 bg-red-50"
                        : check.severity === "high"
                        ? "border-orange-200 bg-orange-50"
                        : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <span className="text-sm text-neutral-700">{check.question}</span>
                    <span className={`text-xs font-medium uppercase ${
                      check.severity === "critical" ? "text-red-600" :
                      check.severity === "high" ? "text-orange-600" : "text-amber-600"
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
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <span className="text-sm font-medium text-neutral-900">PPE for This Task</span>
                <span className="text-xs text-neutral-500">Auto-generated</span>
              </div>
              <div className="p-4 space-y-3">
                {PPE_ITEMS.map((ppe, i) => (
                  <div key={i} className="p-3 rounded-lg border border-neutral-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-900">{ppe.item}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ppe.priority === "required"
                          ? "bg-red-100 text-red-700"
                          : ppe.priority === "recommended"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-neutral-100 text-neutral-600"
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
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
                PPE with context
              </h2>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Not just a list of gear—each recommendation includes why it&apos;s needed for your specific situation. Required items become hard stops if you don&apos;t have them.
              </p>

              <div className="space-y-4">
                {[
                  { label: "Required", desc: "Do NOT proceed without these items" },
                  { label: "Recommended", desc: "Real risk reduction, strongly advised" },
                  { label: "Suggested", desc: "Nice to have for comfort and convenience" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-neutral-900 font-medium">{item.label}</p>
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
      <section className="py-20 px-6 border-t border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
              Safety built in
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Every diagnosis response includes safety information automatically—no extra steps required.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
            Safety-first diagnosis
          </h2>
          <p className="text-neutral-600 mb-8">
            Get repair guidance that prioritizes your safety with every response.
          </p>
          <WaitlistModal>
            <Button className="h-12 px-8 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { IoDocumentTextOutline, IoCheckmarkCircle, IoTimeOutline, IoTrendingUpOutline, IoSearchOutline, IoChevronForward } from "react-icons/io5";

const SAMPLE_ISSUES = [
  {
    title: "Water heater not heating",
    status: "completed",
    resolution: "hired",
    severity: "serious",
    cost: 1200,
    date: "Jan 15"
  },
  {
    title: "Leaky kitchen faucet",
    status: "completed",
    resolution: "diy",
    severity: "minor",
    cost: 45,
    date: "Jan 22"
  },
  {
    title: "Garage door opener",
    status: "in_progress",
    resolution: null,
    severity: "moderate",
    cost: null,
    date: "Feb 3"
  },
  {
    title: "HVAC filter replacement",
    status: "completed",
    resolution: "diy",
    severity: "cosmetic",
    cost: 28,
    date: "Feb 10"
  },
  {
    title: "Ceiling crack inspection",
    status: "decided",
    resolution: "monitoring",
    severity: "cosmetic",
    cost: 0,
    date: "Feb 18"
  },
];

const FEATURES = [
  {
    icon: IoDocumentTextOutline,
    title: "Full Issue Lifecycle",
    description: "Track issues from open → investigating → options generated → decided → in progress → completed. See exactly where each project stands.",
  },
  {
    icon: IoTrendingUpOutline,
    title: "Resolution Tracking",
    description: "Record how each issue was resolved: DIY, hired pro, replaced, deferred, or monitoring. Build a history of what works.",
  },
  {
    icon: IoSearchOutline,
    title: "Evidence Storage",
    description: "Photos, videos, and voice notes attached to each issue. End-to-end encrypted so your home details stay private.",
  },
  {
    icon: IoTimeOutline,
    title: "Diagnostic Hypotheses",
    description: "See diagnostic hypotheses ranked by confidence. Track which diagnoses were correct over time.",
  },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-blue-500/20 text-blue-400" },
  investigating: { label: "Investigating", color: "bg-purple-500/20 text-purple-400" },
  options_generated: { label: "Options Ready", color: "bg-amber-500/20 text-amber-400" },
  decided: { label: "Decided", color: "bg-teal-500/20 text-teal-400" },
  in_progress: { label: "In Progress", color: "bg-orange-500/20 text-orange-400" },
  completed: { label: "Completed", color: "bg-emerald-500/20 text-emerald-400" },
  deferred: { label: "Deferred", color: "bg-neutral-500/20 text-neutral-400" },
};

export default function DecisionLedgerPage() {
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
            <span className="text-neutral-300">Decision Ledger</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-xs font-mono mb-6">
            <IoDocumentTextOutline className="w-4 h-4" />
            Decision Ledger
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Track every{" "}
            <span className="text-teal-400">
              repair decision
            </span>
          </h1>

          <p className="text-lg text-neutral-200 max-w-2xl mx-auto mb-10">
            Every diagnosis becomes a trackable issue. See the full lifecycle from initial
            problem through resolution, with evidence, hypotheses, and outcome tracking.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 font-mono font-bold bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              Get Early Access
            </Button>
          </WaitlistModal>
        </div>
      </section>

      {/* Issue Lifecycle */}
      <section className="py-12 px-6 border-t border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Issue Lifecycle</h2>
            <p className="text-sm text-neutral-400">Every issue flows through these stages</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {["open", "investigating", "options_generated", "decided", "in_progress", "completed"].map((status, i) => (
              <div key={status} className="flex items-center">
                <span className={`text-xs px-3 py-1.5 rounded-full ${STATUS_LABELS[status].color}`}>
                  {STATUS_LABELS[status].label}
                </span>
                {i < 5 && <span className="mx-2 text-neutral-600">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Repair History */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Your repair history, organized
              </h2>
              <p className="text-neutral-300 mb-8">
                Every issue tracks severity, status, resolution type, and actual costs. Over time,
                this becomes your home&apos;s maintenance history—useful for insurance, selling, or
                just remembering what you did last time.
              </p>

              <div className="space-y-4">
                {[
                  { label: "7 Status States", desc: "From open to completed, deferred, or abandoned" },
                  { label: "5 Severity Levels", desc: "Cosmetic, minor, moderate, serious, critical" },
                  { label: "6 Resolution Types", desc: "DIY, hired, replaced, abandoned, deferred, monitoring" },
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

            {/* Issues List */}
            <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-400">Recent Issues</span>
                <span className="text-xs text-teal-400">{SAMPLE_ISSUES.length} issues</span>
              </div>
              <div className="divide-y divide-neutral-800">
                {SAMPLE_ISSUES.map((issue, i) => (
                  <div key={i} className="p-4 hover:bg-neutral-900/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{issue.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[issue.status].color}`}>
                        {STATUS_LABELS[issue.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span>{issue.date}</span>
                      {issue.resolution && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{issue.resolution}</span>
                        </>
                      )}
                      {issue.cost !== null && (
                        <>
                          <span>•</span>
                          <span>${issue.cost}</span>
                        </>
                      )}
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
              More than a to-do list
            </h2>
            <p className="text-neutral-300 max-w-xl mx-auto">
              Full project management for home maintenance with smart diagnostics built in.
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
            Build your home&apos;s maintenance history
          </h2>
          <p className="text-neutral-300 mb-8">
            Every diagnosis automatically becomes a trackable issue you can follow to completion.
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

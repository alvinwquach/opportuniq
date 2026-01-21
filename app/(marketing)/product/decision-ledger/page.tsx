"use client";

import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { IoDocument, IoCheckmarkCircle, IoTime, IoTrendingUp, IoSearch } from "react-icons/io5";

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
    icon: IoDocument,
    title: "Full Issue Lifecycle",
    description: "Track issues from open → investigating → options generated → decided → in progress → completed. See exactly where each project stands.",
  },
  {
    icon: IoTrendingUp,
    title: "Resolution Tracking",
    description: "Record how each issue was resolved: DIY, hired pro, replaced, deferred, or monitoring. Build a history of what works.",
  },
  {
    icon: IoSearch,
    title: "Evidence Storage",
    description: "Photos, videos, and voice notes attached to each issue. End-to-end encrypted so your home details stay private.",
  },
  {
    icon: IoTime,
    title: "Diagnostic Hypotheses",
    description: "See diagnostic hypotheses ranked by confidence. Track which diagnoses were correct over time.",
  },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-blue-100 text-blue-700" },
  investigating: { label: "Investigating", color: "bg-purple-100 text-purple-700" },
  options_generated: { label: "Options Ready", color: "bg-amber-100 text-amber-700" },
  decided: { label: "Decided", color: "bg-teal-100 text-teal-700" },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-700" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  deferred: { label: "Deferred", color: "bg-neutral-100 text-neutral-600" },
};

export default function DecisionLedgerPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-6">
            <IoDocument className="w-4 h-4" />
            Full Project Tracking
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-neutral-900 mb-6 tracking-tight">
            Decision Ledger
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Every diagnosis becomes a trackable issue. See the full lifecycle from initial problem through resolution, with evidence, hypotheses, and outcome tracking.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>

      <section className="py-12 px-6 border-t border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Issue Lifecycle</h2>
            <p className="text-sm text-neutral-500">Every issue flows through these stages</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {["open", "investigating", "options_generated", "decided", "in_progress", "completed"].map((status, i) => (
              <div key={status} className="flex items-center">
                <span className={`text-xs px-3 py-1.5 rounded-full ${STATUS_LABELS[status].color}`}>
                  {STATUS_LABELS[status].label}
                </span>
                {i < 5 && <span className="mx-2 text-neutral-300">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
                Your repair history, organized
              </h2>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Every issue tracks severity, status, resolution type, and actual costs. Over time, this becomes your home&apos;s maintenance history—useful for insurance, selling, or just remembering what you did last time.
              </p>

              <div className="space-y-4">
                {[
                  { label: "7 Status States", desc: "From open to completed, deferred, or abandoned" },
                  { label: "5 Severity Levels", desc: "Cosmetic, minor, moderate, serious, critical" },
                  { label: "6 Resolution Types", desc: "DIY, hired, replaced, abandoned, deferred, monitoring" },
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

            {/* Issues List */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <span className="text-sm font-medium text-neutral-900">Recent Issues</span>
                <span className="text-xs text-neutral-500">{SAMPLE_ISSUES.length} issues</span>
              </div>
              <div className="divide-y divide-neutral-100">
                {SAMPLE_ISSUES.map((issue, i) => (
                  <div key={i} className="p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-900">{issue.title}</span>
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
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
              More than a to-do list
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Full project management for home maintenance with smart diagnostics built in.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-neutral-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
            Build your home&apos;s maintenance history
          </h2>
          <p className="text-neutral-600 mb-8">
            Every diagnosis automatically becomes a trackable issue you can follow to completion.
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

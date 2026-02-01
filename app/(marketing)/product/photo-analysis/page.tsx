"use client";

import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import {
  IoCameraOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoConstructOutline,
  IoChevronForward,
} from "react-icons/io5";

const FEATURES = [
  {
    title: "Instant Detection",
    description: "Upload a photo and get analysis in seconds. Works with any angle or lighting.",
    icon: IoCameraOutline,
  },
  {
    title: "Multi-Issue Detection",
    description: "Sometimes there's more than one problem. We identify all visible issues in a single photo.",
    icon: IoAlertCircleOutline,
  },
  {
    title: "Part Recognition",
    description: "Identify specific parts and components that may need replacement or repair.",
    icon: IoConstructOutline,
  },
];

const FEATURE_LIST = [
  "Instant issue identification from any angle",
  "Multi-issue detection in single photos",
  "Severity assessment (minor, moderate, urgent)",
  "Part and component recognition",
  "Brand and model identification",
  "Damage extent estimation",
];

const CATEGORIES = [
  { name: "Plumbing", color: "bg-blue-500" },
  { name: "Electrical", color: "bg-amber-500" },
  { name: "HVAC", color: "bg-green-500" },
  { name: "Structural", color: "bg-red-500" },
  { name: "Appliances", color: "bg-purple-500" },
  { name: "Exterior", color: "bg-cyan-500" },
];

const SAMPLE_ANALYSIS = {
  image: "Kitchen sink photo",
  issues: [
    { issue: "Corroded P-trap", severity: "moderate", confidence: 92 },
    { issue: "Water staining on cabinet", severity: "minor", confidence: 88 },
    { issue: "Loose supply line", severity: "minor", confidence: 76 },
  ],
};

export default function PhotoAnalysisPage() {
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
            <span className="text-neutral-300">Photo Analysis</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-xs font-mono mb-6">
            <IoCameraOutline className="w-4 h-4" />
            Photo Analysis
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            See the problem.{" "}
            <span className="text-teal-400">
              Know the solution.
            </span>
          </h1>

          <p className="text-lg text-neutral-200 max-w-2xl mx-auto mb-10">
            Upload a photo of any issue and get instant analysis.
            Identify problems, estimate severity, and get actionable recommendations in seconds.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 font-mono font-bold bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              Try Photo Analysis
            </Button>
          </WaitlistModal>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
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

      {/* Sample Analysis */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Detailed issue breakdown
              </h2>
              <p className="text-neutral-300 mb-8">
                Each photo is analyzed for multiple potential issues. You get severity levels,
                confidence scores, and specific part identification.
              </p>

              <ul className="space-y-3">
                {FEATURE_LIST.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <IoCheckmarkCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-700 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-300">Analysis Results</span>
                <span className="text-xs text-teal-400">{SAMPLE_ANALYSIS.issues.length} issues found</span>
              </div>
              <div className="p-4 space-y-3">
                {SAMPLE_ANALYSIS.issues.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{item.issue}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.severity === "urgent"
                          ? "bg-red-500/20 text-red-400"
                          : item.severity === "moderate"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-teal-500/20 text-teal-400"
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Confidence</span>
                      <span className="text-xs text-neutral-300">{item.confidence}%</span>
                    </div>
                    <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="order-2 lg:order-1">
              <div className="bg-neutral-900 rounded-xl border border-neutral-700 p-6">
                <h3 className="text-sm font-medium text-neutral-300 mb-4">Supported Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((cat, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                      <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                      <span className="text-sm text-white">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-white mb-4">
                Works across all categories
              </h2>
              <p className="text-neutral-300 mb-8">
                Our system analyzes issues across every home repair category.
                From leaky pipes to faulty wiring, we detect and classify problems.
              </p>

              <ul className="space-y-3">
                {FEATURE_LIST.slice(3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <IoCheckmarkCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to diagnose any problem?
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

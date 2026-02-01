"use client";

import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import {
  IoSearchOutline,
  IoCheckmarkCircle,
  IoHelpCircleOutline,
  IoChevronForward,
} from "react-icons/io5";

const FEATURES = [
  "Adaptive questioning based on responses",
  "Learn from similar cases",
  "Probability scoring for multiple causes",
  "Context-aware follow-ups",
  "Expert-level diagnostic accuracy",
  "Works offline after initial load",
];

const SMART_FEATURES = [
  {
    title: "Adaptive Flow",
    description: "Questions change based on your answers, narrowing down the issue faster.",
    icon: IoSearchOutline,
  },
  {
    title: "Multi-Cause Detection",
    description: "Sometimes problems have multiple causes. We identify all likely culprits.",
    icon: IoHelpCircleOutline,
  },
  {
    title: "Confidence Scoring",
    description: "Know exactly how confident we are in each diagnosis with probability scores.",
    icon: IoCheckmarkCircle,
  },
];

const SAMPLE_QUESTIONS = [
  { question: "What type of issue are you experiencing?", answer: "Plumbing" },
  { question: "Where is the problem located?", answer: "Kitchen sink" },
  { question: "Is there visible water leaking?", answer: "Yes, under the sink" },
  { question: "When did you first notice the issue?", answer: "This morning" },
  { question: "Have you tried any fixes?", answer: "Tightened the pipes" },
];

const SAMPLE_DIAGNOSES = [
  { diagnosis: "Worn P-trap gasket", confidence: 87 },
  { diagnosis: "Loose compression fitting", confidence: 72 },
  { diagnosis: "Cracked drain pipe", confidence: 34 },
];

export default function SmartDiagnosticsPage() {
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
            <span className="text-neutral-300">Smart Diagnostics</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-xs font-mono mb-6">
            <IoSearchOutline className="w-4 h-4" />
            Smart Diagnostics
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Answer questions.{" "}
            <span className="text-teal-400">
              Get answers.
            </span>
          </h1>

          <p className="text-lg text-neutral-200 max-w-2xl mx-auto mb-10">
            Smart diagnostics asks the right questions in the right order, learning from
            similar cases to diagnose your issue with expert-level accuracy.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 font-mono font-bold bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              Start Diagnosis
            </Button>
          </WaitlistModal>
        </div>
      </section>

      {/* Smart Features */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {SMART_FEATURES.map((feature, i) => (
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

      {/* How It Works - Question Flow */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Quick, targeted questions
              </h2>
              <p className="text-neutral-300 mb-8">
                Our diagnostic engine narrows down issues fast. Each question is chosen
                based on your previous answers to get to the root cause quickly.
              </p>

              <ul className="space-y-3">
                {FEATURES.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <IoCheckmarkCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-700 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-300">Diagnostic Session</span>
                <span className="text-xs text-teal-400">5 questions</span>
              </div>
              <div className="p-4 space-y-3">
                {SAMPLE_QUESTIONS.map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                    <p className="text-xs text-neutral-400 mb-1">Q{i + 1}: {item.question}</p>
                    <p className="text-sm text-white">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnosis Results */}
      <section className="py-20 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="order-2 lg:order-1 bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-700">
                <span className="text-sm font-medium text-neutral-300">Diagnosis Results</span>
              </div>
              <div className="p-4 space-y-3">
                {SAMPLE_DIAGNOSES.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{item.diagnosis}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.confidence >= 80
                          ? "bg-teal-500/20 text-teal-400"
                          : item.confidence >= 60
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-neutral-500/20 text-neutral-400"
                      }`}>
                        {item.confidence}% confidence
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.confidence >= 80
                            ? "bg-teal-500"
                            : item.confidence >= 60
                            ? "bg-amber-500"
                            : "bg-neutral-500"
                        }`}
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ranked by confidence
              </h2>
              <p className="text-neutral-300 mb-8">
                Get multiple possible diagnoses ranked by likelihood. Each comes with
                a confidence score so you know how certain the diagnosis is.
              </p>

              <ul className="space-y-3">
                {FEATURES.slice(3).map((feature, i) => (
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
            Ready to diagnose smarter?
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

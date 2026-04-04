"use client";

import { useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import Link from "next/link";
import { Hero } from "@/components/landing/v2/Hero";
import { BetaStrip } from "@/components/landing/v2/BetaStrip";
import { FiveQuestions } from "@/components/landing/v2/FiveQuestions";
import { HorizontalText } from "@/components/landing/v2/HorizontalText";
import { BeforeAfter } from "@/components/landing/v2/BeforeAfter";
import { Features } from "@/components/landing/v2/Features";
import { DashboardSection } from "@/components/landing/v2/DashboardSection";
import { WhoIsThisFor } from "@/components/landing/v2/WhoIsThisFor";
import { Testimonials } from "@/components/landing/v2/Testimonials";
import { Pricing } from "@/components/landing/v2/Pricing";
import { Security } from "@/components/landing/v2/Security";

const faqItems = [
  {
    q: "How accurate is the diagnosis?",
    a: "Cost estimates come from HomeAdvisor and Angi data for your region, not AI guessing. Contractor ratings come from Yelp and Foursquare. Community insights come from real Reddit threads. Every AI response is automatically checked for hallucinated costs and missing safety warnings.",
  },
  {
    q: "What if I\u2019m not handy at all?",
    a: "That\u2019s exactly who this is for. Even if you never DIY, the app tells you what\u2019s wrong, whether it\u2019s urgent, what it should cost, and finds you a professional. It drafts the quote request email and sends it through your Gmail with one click.",
  },
  {
    q: "Does it work in other languages?",
    a: "Yes. Describe problems in Cantonese, Spanish, Vietnamese, Mandarin, Japanese, Korean, Arabic, Hindi, French, Portuguese, and 30+ more languages. The AI understands and responds in your language.",
  },
  {
    q: "Can I record a video?",
    a: "Yes. Record a video of an engine noise, a rattling appliance, or a leak. The AI analyzes what it sees in the video AND what it hears in the audio to give a more accurate diagnosis.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "ChatGPT doesn\u2019t know what things cost in your area, can\u2019t find local contractors, can\u2019t check if your product has a safety recall, and can\u2019t send emails or schedule calendar events. OpportunIQ connects to real data sources and takes real action on your behalf.",
  },
  {
    q: "Is my data secure?",
    a: "Photos and documents are encrypted before they leave your browser using AES-256-GCM. Financial data is encrypted at rest. We never sell your data. You can delete everything at any time.",
  },
  {
    q: "Is it free?",
    a: "Free to start. No credit card required. All features are unlocked during beta.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="text-gray-900 overflow-x-hidden">
      {/* ── 1. HOOK ── */}
      <Hero />

      {/* ── 2. TRUST ANCHOR ── */}
      <BetaStrip />

      {/* ── 3. PROBLEM ── */}
      <FiveQuestions />

      {/* ── 4. HOW IT WORKS ── */}
      <HorizontalText />

      {/* ── 5. BEFORE VS AFTER ── */}
      <BeforeAfter />

      {/* ── 6. FEATURES ── */}
      <Features />

      {/* ── 7. INTERACTIVE DEMO ── */}
      <DashboardSection />

      {/* ── 8. WHO IS THIS FOR ── */}
      <WhoIsThisFor />

      {/* ── 9. SOCIAL PROOF ── */}
      <Testimonials />

      {/* ── 10. PRICING ── */}
      <Pricing />

      {/* ── 11. SECURITY & PRIVACY ── */}
      <Security />

      {/* ── 12. FAQ + CTA ── */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Common questions
              </h2>
              <p className="text-sm text-gray-500">
                Can&apos;t find your answer?{" "}
                <a href="/help-center" className="text-blue-600 hover:text-blue-700 font-medium">
                  Contact us
                </a>
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {faqItems.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-5 text-left"
                  >
                    <span className="text-sm font-medium text-gray-900 pr-4">
                      {faq.q}
                    </span>
                    <IoChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === i ? "max-h-40 pb-5" : "max-h-0"
                    }`}
                  >
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA at bottom of FAQ */}
          <div className="mt-20 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Stop guessing. Start fixing.
            </h3>
            <p className="text-base text-gray-500 max-w-lg mx-auto mb-8">
              Describe the problem. Get the diagnosis. Take action.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Start for free
            </Link>
            <p className="text-sm text-gray-400 mt-4">
              Free to start. No credit card required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

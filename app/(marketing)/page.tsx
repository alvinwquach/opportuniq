"use client";

import { useEffect, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  IoChevronDown, IoWarning, IoLockClosed, IoShield, IoAnalytics,
  IoHome, IoCar, IoPhonePortrait, IoLeaf,
} from "react-icons/io5";
import type { IconType } from "react-icons";
import { Hero } from "@/components/landing/v2/Hero";
import { BetaStrip } from "@/components/landing/v2/BetaStrip";
import { FiveQuestions } from "@/components/landing/v2/FiveQuestions";
import { Pipeline } from "@/components/landing/v2/Pipeline";
import { Features } from "@/components/landing/v2/Features";
import { BeyondDiagnosis } from "@/components/landing/v2/BeyondDiagnosis";
import { DashboardSection } from "@/components/landing/v2/DashboardSection";
import { Testimonials } from "@/components/landing/v2/Testimonials";
import { FinalCTA } from "@/components/landing/v2/FinalCTA";
import { Marquee } from "@/components/landing/v2/Marquee";
import { HorizontalText } from "@/components/landing/v2/HorizontalText";

const dataSources = [
  { name: "Reddit", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF4500"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249z"/></svg> },
  { name: "YouTube", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { name: "iFixit", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0071CE"><circle cx="12" cy="12" r="10" stroke="#0071CE" strokeWidth="2" fill="none"/><path d="M12 6v6l4 2" stroke="#0071CE" strokeWidth="2" strokeLinecap="round"/></svg> },
  { name: "Stack Exchange", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#F48024"><path d="M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.13v6.404h15.012zM6.111 12.83l1.044-2.088 10.481 5.246-1.044 2.088-10.481-5.246z"/></svg> },
  { name: "Instructables", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FAB81E"><path d="M12.002 0a2.39 2.39 0 1 0 0 4.78 2.39 2.39 0 0 0 0-4.78zM7.19 5.966a2.39 2.39 0 1 0 0 4.78 2.39 2.39 0 0 0 0-4.78zm9.62 0a2.39 2.39 0 1 0 0 4.78 2.39 2.39 0 0 0 0-4.78z"/></svg> },
  { name: "HomeAdvisor", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#F68B1E"><path d="M12 2L2 9v13h8v-6h4v6h8V9L12 2z"/></svg> },
  { name: "Angi", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF6153"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H8v-2h4v2zm4-4H8v-2h8v2z"/></svg> },
  { name: "Home Depot", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#F96302"><path d="M3 3h18v18H3V3zm2 2v14h14V5H5z"/><path d="M9 8h6v8H9z" fill="#F96302"/></svg> },
];

const faqItems = [
  {
    q: "How accurate is the diagnosis?",
    a: "Cost estimates come from HomeAdvisor and Angi data for your region, not AI guessing. Contractor ratings come from Yelp and Foursquare. Community insights come from real Reddit threads. Every AI response is automatically checked for hallucinated costs and missing safety warnings. For safety-critical issues, we always recommend professional evaluation.",
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
    q: "Is my data secure?",
    a: "Photos and documents are encrypted before they leave your browser using AES-256-GCM. Financial data is encrypted at rest. You can delete all your data at any time.",
  },
  {
    q: "Is it free?",
    a: "Free to start. No credit card required.",
  },
];

const categories: { icon: IconType; name: string; description: string }[] = [
  {
    icon: IoHome,
    name: "Home",
    description: "Plumbing, electrical, HVAC, roofing, appliances, smart home installs, furniture assembly.",
  },
  {
    icon: IoCar,
    name: "Auto",
    description: "Engine, brakes, battery, strange noises. Record a video \u2014 the AI listens to mechanical sounds.",
  },
  {
    icon: IoPhonePortrait,
    name: "Electronics",
    description: "Phone, laptop, TV, speakers, vintage equipment. Home theater and smart home setup.",
  },
  {
    icon: IoLeaf,
    name: "Outdoor",
    description: "Lawn equipment, sprinklers, fencing, gutters, decks. Weather forecasts for scheduling outdoor projects.",
  },
];

const languages = [
  "English", "Español", "中文", "日本語", "Tiếng Việt", "한국어",
  "Français", "Português", "Deutsch", "العربية", "हिन्दी", "Italiano",
  "Polski", "Русский", "Türkçe", "Nederlands", "Svenska", "Tagalog",
  "ภาษาไทย", "Bahasa Indonesia", "粵語", "עברית", "Ελληνικά", "Română",
];

const dataSourceNames = [
  "Reddit", "YouTube", "iFixit", "Stack Exchange", "Instructables",
  "HomeAdvisor", "Angi", "Home Depot", "Yelp", "Foursquare",
  "CPSC", "NHTSA", "Google Calendar", "Gmail",
];

const trustItems = [
  { icon: IoLockClosed, label: "Encrypted", detail: "Photos and documents encrypted before they leave your browser. AES-256-GCM. Delete everything anytime." },
  { icon: IoShield, label: "Verified", detail: "Every AI response checked." },
  { icon: IoAnalytics, label: "Improving", detail: "Your reports improve accuracy." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.set(el, { clipPath: "inset(0 0 100% 0)" });
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          onEnter: () => {
            gsap.to(el, { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease: "spring" });
          },
          once: true,
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="text-gray-900 overflow-x-hidden">
      {/* ── 1. HOOK — what it is ── */}
      <Hero />

      {/* ── 1b. BETA STRIP — trust anchor ── */}
      <BetaStrip />

      {/* ── 2. PROBLEM — five unanswered questions (split layout) ── */}
      <FiveQuestions />

      {/* ── 3. SOLUTION — how it works (horizontal scroll storytelling) ── */}
      <HorizontalText />

      {/* ── 4. SEE IT — proof (full-width screenshot) ── */}
      <DashboardSection />

      {/* ── 5. DEPTH — everything the AI does (asymmetric bento) ── */}
      <Features />

      {/* ── 6. BREADTH — any category, any language ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
          <div className="text-center">
            <h2 className="reveal text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Any repair. Any project. Any language.
            </h2>
            <p className="reveal text-base text-gray-500 max-w-xl mx-auto">
              Home, auto, electronics, outdoor — in 40+ languages.
            </p>
          </div>
        </div>

        {/* Category cards */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-14">
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="flex-shrink-0 min-w-[260px] snap-start sm:min-w-0 bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
              >
                <cat.icon className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-base font-semibold text-gray-900 mb-2">{cat.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee rows — languages + data sources */}
        <div className="space-y-3">
          <p className="text-center text-xs font-medium text-gray-400 uppercase tracking-widest mb-5">
            Speak in your language — the AI responds in kind
          </p>
          {/* Row 1: languages → left */}
          <Marquee items={languages} speed={50} />
          {/* Row 2: data sources → right */}
          <Marquee items={dataSourceNames} speed={40} reverse />
        </div>
      </section>

      {/* ── 7. BEYOND — it's not just a chatbot (split + tabs) ── */}
      <BeyondDiagnosis />

      {/* ── 8. SOCIAL PROOF — real stories ── */}
      <Testimonials />

      {/* ── 9. TRUST — where the data comes from + security ── */}
      <section id="sources" className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="reveal text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
              Where the data comes from
            </p>
            <h2 className="reveal text-3xl sm:text-4xl font-bold text-gray-900">
              Real data, not AI guesses
            </h2>
          </div>

          {/* Sources grouped by what they provide — 2x2 grid */}
          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            <div className="reveal bg-white border border-gray-200 rounded-2xl p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Cost data
              </p>
              <div className="flex items-center gap-3 mb-3">
                {dataSources.filter(s => s.name === "HomeAdvisor" || s.name === "Angi").map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                    {s.logo}
                    <span className="text-sm font-medium text-gray-700">{s.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Region-specific pricing for DIY and professional repairs. Updated regularly.
              </p>
            </div>

            <div className="reveal bg-white border border-gray-200 rounded-2xl p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                DIY guides & tutorials
              </p>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {dataSources.filter(s => ["iFixit", "YouTube", "Stack Exchange", "Instructables"].includes(s.name)).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                    {s.logo}
                    <span className="text-sm font-medium text-gray-700">{s.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Step-by-step tutorials, video guides, and community Q&A.
              </p>
            </div>

            <div className="reveal bg-white border border-gray-200 rounded-2xl p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Community experience
              </p>
              <div className="flex items-center gap-3 mb-3">
                {dataSources.filter(s => s.name === "Reddit").map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                    {s.logo}
                    <span className="text-sm font-medium text-gray-700">{s.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Real threads from people who had the same issue. What worked, what didn&apos;t.
              </p>
            </div>

            <div className="reveal bg-white border border-gray-200 rounded-2xl p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Parts & availability
              </p>
              <div className="flex items-center gap-3 mb-3">
                {dataSources.filter(s => s.name === "Home Depot").map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                    {s.logo}
                    <span className="text-sm font-medium text-gray-700">{s.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Check in-store availability and pricing before you make the trip.
              </p>
            </div>
          </div>

          {/* Trust bar */}
          <div className="reveal grid grid-cols-3 divide-x divide-gray-200 bg-white border border-gray-200 rounded-2xl py-6 mb-6">
            {trustItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="text-center px-4">
                  <Icon className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <IoWarning className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-600 leading-relaxed">
                <span className="font-medium text-gray-700">Disclaimer:</span>{" "}
                OpportunIQ is not affiliated with any of the websites shown above.
                All trademarks are property of their respective owners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. FAQ — objection handling (two-column split) ── */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="reveal text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
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
        </div>
      </section>

      {/* ── 10. ACTION — CTA (full-bleed blue-700) ── */}
      <FinalCTA />
    </div>
  );
}

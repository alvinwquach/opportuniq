"use client";

import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import {
  IoSearchOutline,
  IoCameraOutline,
  IoDocumentTextOutline,
  IoCalculatorOutline,
  IoShieldCheckmarkOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoBookOutline,
  IoPeopleOutline,
  IoConstructOutline,
  IoCartOutline,
  IoSparkles,
  IoMedkitOutline,
  IoGitCompareOutline,
  IoSettingsOutline,
  IoArrowForward,
} from "react-icons/io5";

const PRODUCT_CATEGORIES = [
  {
    id: "diagnose",
    title: "Diagnose",
    description: "Identify issues quickly with AI-powered analysis",
    icon: IoMedkitOutline,
    color: "teal",
    features: [
      {
        title: "Smart Diagnostics",
        description: "Answer questions, get expert-level diagnoses. Our AI pinpoints issues fast with adaptive questioning.",
        href: "/product/smart-diagnostics",
        icon: IoSearchOutline,
        highlight: "Avg 5 questions to diagnose",
      },
      {
        title: "Photo Analysis",
        description: "Snap a photo, get instant analysis. Our vision AI identifies problems you might miss.",
        href: "/product/photo-analysis",
        icon: IoCameraOutline,
        highlight: "Multi-issue detection",
      },
      {
        title: "Safety & Risk",
        description: "Know when to DIY and when to call a pro. Get PPE recommendations and safety alerts.",
        href: "/product/safety-risk",
        icon: IoShieldCheckmarkOutline,
        highlight: "4-level risk classification",
      },
    ],
  },
  {
    id: "decide",
    title: "Decide",
    description: "Make informed choices with full cost visibility",
    icon: IoGitCompareOutline,
    color: "amber",
    features: [
      {
        title: "Opportunity Cost",
        description: "See the true cost of DIY vs hiring. Factor in your time, risk, and skill level.",
        href: "/product/opportunity-cost",
        icon: IoCalculatorOutline,
        highlight: "Compare all options",
      },
      {
        title: "Decision Ledger",
        description: "Track every issue from discovery to resolution. Never lose context on repairs.",
        href: "/product/decision-ledger",
        icon: IoDocumentTextOutline,
        highlight: "Full issue lifecycle",
      },
      {
        title: "Pro Finder",
        description: "Find vetted local contractors. Compare quotes and send RFQs with one click.",
        href: "/product/pro-finder",
        icon: IoConstructOutline,
        highlight: "Yelp, Angi, Thumbtack",
      },
    ],
  },
  {
    id: "manage",
    title: "Manage",
    description: "Stay organized with tools that keep you on track",
    icon: IoSettingsOutline,
    color: "emerald",
    features: [
      {
        title: "Budget Tracking",
        description: "Track repair costs, manage budgets, and see your DIY savings add up.",
        href: "/product/budget",
        icon: IoWalletOutline,
        highlight: "What-if scenarios",
      },
      {
        title: "Calendar",
        description: "Schedule maintenance, set reminders, and never miss a seasonal task.",
        href: "/product/calendar",
        icon: IoCalendarOutline,
        highlight: "Recurring events",
      },
      {
        title: "DIY Guides",
        description: "Curated guides from iFixit, YouTube, and expert sources matched to your diagnosis.",
        href: "/product/guides",
        icon: IoBookOutline,
        highlight: "9+ trusted sources",
      },
      {
        title: "Collaboration",
        description: "Coordinate repairs with your household. Share decisions, split costs, track progress together.",
        href: "/product/collaboration",
        icon: IoPeopleOutline,
        highlight: "Role-based permissions",
      },
      {
        title: "Parts Finder",
        description: "Find parts at local stores with live pricing, stock status, and directions.",
        href: "/product/parts-finder",
        icon: IoCartOutline,
        highlight: "4+ retailers",
      },
    ],
  },
];

const getCategoryColors = (color: string) => {
  switch (color) {
    case "teal":
      return {
        bg: "bg-teal-500/20",
        border: "border-teal-500/40",
        text: "text-teal-400",
        hoverBorder: "hover:border-teal-500/50",
      };
    case "amber":
      return {
        bg: "bg-amber-500/20",
        border: "border-amber-500/40",
        text: "text-amber-400",
        hoverBorder: "hover:border-amber-500/50",
      };
    case "emerald":
      return {
        bg: "bg-emerald-500/20",
        border: "border-emerald-500/40",
        text: "text-emerald-400",
        hoverBorder: "hover:border-emerald-500/50",
      };
    default:
      return {
        bg: "bg-teal-500/20",
        border: "border-teal-500/40",
        text: "text-teal-400",
        hoverBorder: "hover:border-teal-500/50",
      };
  }
};

export default function ProductPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-xs font-mono mb-6">
            <IoSparkles className="w-4 h-4" />
            Product Overview
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Everything you need to{" "}
            <span className="text-teal-400">
              fix smarter
            </span>
          </h1>

          <p className="text-lg text-neutral-200 max-w-2xl mx-auto mb-10">
            From diagnosis to completion, OpportunIQ guides you through every repair decision
            with AI-powered insights, cost analysis, and expert recommendations.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 font-mono font-bold bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              Get Early Access
            </Button>
          </WaitlistModal>
        </div>
      </section>

      {/* Category Sections */}
      {PRODUCT_CATEGORIES.map((category, categoryIndex) => {
        const colors = getCategoryColors(category.color);
        return (
          <section
            key={category.id}
            className={`py-20 px-6 ${
              categoryIndex % 2 === 0 ? "bg-neutral-950" : "bg-neutral-900/50"
            } border-t border-neutral-800`}
          >
            <div className="max-w-6xl mx-auto">
              {/* Category Header */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-12">
                <div className={`w-14 h-14 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.text}`}>
                  <category.icon className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{category.title}</h2>
                  <p className="text-neutral-400">{category.description}</p>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.features.map((feature) => (
                  <Link
                    key={feature.title}
                    href={feature.href}
                    className={`group p-6 rounded-xl bg-neutral-900 border border-neutral-700 ${colors.hoverBorder} transition-all duration-300`}
                  >
                    <div className={`w-12 h-12 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.text} mb-4 group-hover:scale-105 transition-transform`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className={`text-lg font-semibold text-white mb-2 group-hover:${colors.text} transition-colors`}>
                      {feature.title}
                    </h3>
                    <p className="text-sm text-neutral-300 mb-4">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${colors.text} font-mono`}>{feature.highlight}</span>
                      <IoArrowForward className={`w-4 h-4 ${colors.text} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-neutral-800 bg-neutral-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-teal-400 mb-3">How It Works</p>
            <h2 className="text-3xl font-bold text-white mb-4">From problem to solution in minutes</h2>
            <p className="text-neutral-400 max-w-lg mx-auto">Five simple steps to diagnose, decide, and manage any repair</p>
          </div>

          {/* Horizontal Steps - Desktop */}
          <div className="hidden lg:block px-[5%]">
            {/* Top row: circles and connectors */}
            <div className="flex items-center justify-center mb-6">
              {[
                { step: "1", color: "teal" },
                { step: "2", color: "teal" },
                { step: "3", color: "amber" },
                { step: "4", color: "amber" },
                { step: "5", color: "emerald" },
              ].map((item, index, arr) => {
                const stepColors = getCategoryColors(item.color);
                const isLast = index === arr.length - 1;
                const nextColor = !isLast ? arr[index + 1].color : item.color;

                return (
                  <div key={item.step} className="flex items-center">
                    {/* Circle */}
                    <div className={`w-12 h-12 rounded-full ${stepColors.bg} border-2 ${stepColors.border} flex items-center justify-center ${stepColors.text} font-mono font-bold text-lg bg-neutral-950`}>
                      {item.step}
                    </div>

                    {/* Connector line */}
                    {!isLast && (
                      <div
                        className="w-24 xl:w-32 h-px mx-1"
                        style={{
                          background: `linear-gradient(to right, ${
                            item.color === 'teal' ? 'rgba(20,184,166,0.5)' :
                            item.color === 'amber' ? 'rgba(245,158,11,0.5)' :
                            'rgba(16,185,129,0.5)'
                          }, ${
                            nextColor === 'teal' ? 'rgba(20,184,166,0.5)' :
                            nextColor === 'amber' ? 'rgba(245,158,11,0.5)' :
                            'rgba(16,185,129,0.5)'
                          })`
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom row: labels */}
            <div className="flex items-start justify-between">
              {[
                { title: "Describe", desc: "Type or snap a photo", color: "teal", phase: "Diagnose" },
                { title: "Analyze", desc: "AI identifies the issue", color: "teal", phase: "Diagnose" },
                { title: "Compare", desc: "See all your options", color: "amber", phase: "Decide" },
                { title: "Act", desc: "DIY or hire a pro", color: "amber", phase: "Decide" },
                { title: "Track", desc: "Log and learn", color: "emerald", phase: "Manage" },
              ].map((item, index) => {
                const stepColors = getCategoryColors(item.color);
                return (
                  <div key={index} className="flex flex-col items-center text-center flex-1">
                    <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-neutral-500 max-w-[120px]">{item.desc}</p>
                    <span className={`mt-2 text-[10px] font-medium ${stepColors.text} opacity-60`}>{item.phase}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical Steps - Mobile/Tablet */}
          <div className="lg:hidden">
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-teal-500/40 via-amber-500/40 to-emerald-500/40" />

              <div className="space-y-6">
                {[
                  { step: "1", title: "Describe your issue", desc: "Type it out or snap a photo", color: "teal" },
                  { step: "2", title: "Get AI analysis", desc: "Instant identification", color: "teal" },
                  { step: "3", title: "Compare options", desc: "DIY vs hire with real costs", color: "amber" },
                  { step: "4", title: "Take action", desc: "Follow guides or contact pros", color: "amber" },
                  { step: "5", title: "Track & learn", desc: "Build your repair expertise", color: "emerald" },
                ].map((item) => {
                  const stepColors = getCategoryColors(item.color);
                  return (
                    <div key={item.step} className="flex gap-5 items-start relative">
                      <div className={`w-10 h-10 rounded-full ${stepColors.bg} border-2 ${stepColors.border} flex items-center justify-center ${stepColors.text} font-mono font-bold flex-shrink-0 relative z-10 bg-neutral-950`}>
                        {item.step}
                      </div>
                      <div className="pt-1.5">
                        <h3 className="text-base font-semibold text-white mb-0.5">{item.title}</h3>
                        <p className="text-sm text-neutral-500">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-900 to-neutral-950 border-t border-neutral-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to fix smarter?
          </h2>
          <p className="text-neutral-400 mb-8">
            Get AI-powered repair guidance that saves you time and money.
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

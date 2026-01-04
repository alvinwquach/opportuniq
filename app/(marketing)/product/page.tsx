"use client";

import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import {
  HybridPageWrapper,
  LightSection,
  ContentCard,
  SectionHeader,
  ThemeToggle,
} from "@/components/ui/hybrid-layout";
import { useTheme } from "@/lib/theme-context";

/**
 * Product Overview Page
 *
 * Central hub for all product features
 * Links to Analytics, Insights, and other feature pages
 *
 * Theme: Hybrid layout - light sections with theme toggle
 */

const PRODUCT_SECTIONS = [
  {
    title: "Analytics Dashboard",
    description: "Track every decision, measure savings, and watch your DIY skills grow with comprehensive analytics.",
    href: "/product/analytics",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    features: ["Real-time cost tracking", "Skill progression", "Decision history", "ROI calculations"],
    color: "#14b8a6", // teal-500
  },
  {
    title: "Decision Insights",
    description: "Real-time contractor pricing, seasonal availability, and smart risk assessment for informed decisions.",
    href: "/product/insights",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    features: ["Contractor pricing", "Seasonal availability", "Safety checks", "Cost breakdown"],
    color: "#10b981", // emerald-500
  },
];

const CORE_CAPABILITIES = [
  {
    title: "Decision Frames",
    description: "We don't tell you what to do. We show you DIY vs. hire vs. defer, with clear tradeoffs for each path.",
    href: "/product/decision-frames",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Safety & Risk Analysis",
    description: "What PPE do you need? Can you make this worse? When should you stop and call a pro?",
    href: "/product/safety-risk",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Opportunity Cost",
    description: "If your time is worth $50/hour and a repair takes 4 hours, the 'savings' might not be savings.",
    href: "/product/opportunity-cost",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Budget Tracking",
    description: "Track what you spend on repairs, contractors, and projects. See patterns. Make better decisions.",
    href: "/product/budget-tracking",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    title: "Solo or Shared",
    description: "Use it alone or collaborate with family, roommates, or partners. Shared budgets, shared accountability.",
    href: "/product/collaboration",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "Decision Ledger",
    description: "Every decision logged: what you chose, why, and what happened. Build judgment over time.",
    href: "/product/decision-ledger",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

const USE_CASES = [
  {
    title: "Homeowners",
    description: "Save thousands on home repairs by knowing when to DIY and when to call a pro.",
    stats: ["$2,400 avg. annual savings", "89% DIY success rate"],
  },
  {
    title: "Property Managers",
    description: "Reduce maintenance costs across your portfolio with data-driven decisions.",
    stats: ["40% faster response times", "Track unlimited properties"],
  },
  {
    title: "Landlords",
    description: "Minimize tenant downtime and optimize contractor spending.",
    stats: ["Contractor performance tracking", "Maintenance history audit trail"],
  },
  {
    title: "Real Estate Investors",
    description: "Make informed decisions on property condition and renovation ROI.",
    stats: ["Pre-purchase assessments", "Renovation cost projections"],
  },
];

export default function ProductPage() {
  const { mode } = useTheme();

  return (
    <HybridPageWrapper>
      {/* Hero Section */}
      <LightSection variant="gradient" className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Theme Toggle */}
          <div className="flex justify-end mb-8">
            <ThemeToggle />
          </div>

          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono mb-6 ${
              mode === "dark"
                ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                : "bg-teal-50 border-teal-200 text-teal-700"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Product Overview
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
              mode === "dark" ? "text-white" : "text-neutral-900"
            }`}>
              Decision intelligence for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
                everyday repairs
              </span>
            </h1>

            <p className={`text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed ${
              mode === "dark" ? "text-neutral-400" : "text-neutral-600"
            }`}>
              From photo analysis to risk assessment, OpportunIQ gives you the tools
              to tackle any repair, upgrade, or project with confidence.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <WaitlistModal>
                <Button className="h-12 px-8 font-mono font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                  Join the Waitlist
                </Button>
              </WaitlistModal>
              <Link href="/case-studies">
                <Button variant="outline" className={`h-12 px-8 font-mono transition-colors ${
                  mode === "dark"
                    ? "border-neutral-700 text-neutral-300 hover:border-teal-500 hover:text-teal-400"
                    : "border-neutral-300 text-neutral-700 hover:border-teal-500 hover:text-teal-600"
                }`}>
                  View Case Studies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </LightSection>

      {/* Product Sections */}
      <LightSection className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Explore our platform"
            subtitle="Two powerful modules that work together to transform how you make repair and maintenance decisions."
            badge="Features"
            badgeColor="teal"
          />

          <div className="grid md:grid-cols-2 gap-8">
            {PRODUCT_SECTIONS.map((section, i) => (
              <Link
                key={i}
                href={section.href}
                className={`group block p-8 rounded-2xl border transition-all duration-300 ${
                  mode === "dark"
                    ? "bg-neutral-900 border-neutral-800 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10"
                    : "bg-white border-neutral-200 hover:border-teal-300 hover:shadow-lg"
                }`}
              >
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all duration-300"
                  style={{
                    backgroundColor: mode === "dark" ? `${section.color}15` : `${section.color}10`,
                    borderColor: mode === "dark" ? `${section.color}40` : `${section.color}30`,
                    borderWidth: 1,
                    color: section.color,
                  }}
                >
                  {section.icon}
                </div>

                <h3 className={`text-2xl font-bold mb-3 transition-colors ${
                  mode === "dark"
                    ? "text-white group-hover:text-teal-400"
                    : "text-neutral-900 group-hover:text-teal-600"
                }`}>
                  {section.title}
                </h3>

                <p className={`mb-6 ${
                  mode === "dark" ? "text-neutral-400" : "text-neutral-600"
                }`}>
                  {section.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {section.features.map((feature, j) => (
                    <li key={j} className={`flex items-center gap-2 text-sm ${
                      mode === "dark" ? "text-neutral-300" : "text-neutral-700"
                    }`}>
                      <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className={`flex items-center gap-2 font-mono text-sm group-hover:gap-4 transition-all ${
                  mode === "dark" ? "text-teal-400" : "text-teal-600"
                }`}>
                  Learn more
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </LightSection>

      {/* Core Capabilities */}
      <LightSection variant="subtle" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Core capabilities"
            subtitle="Everything you need to make smarter decisions about repairs, maintenance, and home projects."
            badge="Capabilities"
            badgeColor="blue"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_CAPABILITIES.map((capability, i) => (
              <Link
                key={i}
                href={capability.href}
                className="group"
              >
                <ContentCard hoverable className="h-full">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                    mode === "dark"
                      ? "bg-teal-500/10 border border-teal-500/30 text-teal-400 group-hover:bg-teal-500/20"
                      : "bg-teal-50 border border-teal-200 text-teal-600 group-hover:bg-teal-100"
                  }`}>
                    {capability.icon}
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                    mode === "dark"
                      ? "text-white group-hover:text-teal-400"
                      : "text-neutral-900 group-hover:text-teal-600"
                  }`}>
                    {capability.title}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-4 ${
                    mode === "dark" ? "text-neutral-400" : "text-neutral-600"
                  }`}>
                    {capability.description}
                  </p>
                  <div className={`flex items-center gap-2 text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity ${
                    mode === "dark" ? "text-teal-400" : "text-teal-600"
                  }`}>
                    Learn more
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </ContentCard>
              </Link>
            ))}
          </div>
        </div>
      </LightSection>

      {/* Use Cases */}
      <LightSection className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Built for everyone who makes decisions"
            subtitle="Whether you own one home or manage hundreds of properties, OpportunIQ scales with your needs."
            badge="Use Cases"
            badgeColor="amber"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {USE_CASES.map((useCase, i) => (
              <ContentCard key={i}>
                <h3 className={`text-lg font-semibold mb-3 ${
                  mode === "dark" ? "text-white" : "text-neutral-900"
                }`}>
                  {useCase.title}
                </h3>
                <p className={`text-sm mb-4 ${
                  mode === "dark" ? "text-neutral-400" : "text-neutral-600"
                }`}>
                  {useCase.description}
                </p>
                <ul className="space-y-2">
                  {useCase.stats.map((stat, j) => (
                    <li key={j} className={`flex items-center gap-2 text-xs font-medium ${
                      mode === "dark" ? "text-teal-400" : "text-teal-600"
                    }`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      {stat}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            ))}
          </div>
        </div>
      </LightSection>

      {/* Enterprise CTA */}
      <LightSection variant="subtle" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`p-8 sm:p-12 rounded-2xl border ${
            mode === "dark"
              ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30"
              : "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200"
          }`}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono mb-4 ${
                  mode === "dark"
                    ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                    : "bg-purple-100 border-purple-300 text-purple-700"
                }`}>
                  Enterprise
                </div>
                <h3 className={`text-2xl sm:text-3xl font-bold mb-4 ${
                  mode === "dark" ? "text-white" : "text-neutral-900"
                }`}>
                  Need a custom solution?
                </h3>
                <p className={`mb-6 ${
                  mode === "dark" ? "text-neutral-400" : "text-neutral-600"
                }`}>
                  We offer custom integrations, dedicated support, and enterprise-grade security for organizations of all sizes.
                </p>
                <a
                  href="mailto:enterprise@opportuniq.com"
                  className={`inline-flex items-center gap-2 font-mono hover:underline ${
                    mode === "dark" ? "text-teal-400" : "text-teal-600"
                  }`}
                >
                  Contact our sales team
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
              <div className="space-y-3">
                {["SSO & SAML", "API Access", "Custom Integrations", "Dedicated Support", "SLA Guarantees"].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 ${
                    mode === "dark" ? "text-neutral-300" : "text-neutral-700"
                  }`}>
                    <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LightSection>

      {/* Final CTA */}
      <LightSection variant="gradient" className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${
            mode === "dark" ? "text-white" : "text-neutral-900"
          }`}>
            Ready to make smarter decisions?
          </h2>
          <p className={`mb-8 ${
            mode === "dark" ? "text-neutral-400" : "text-neutral-600"
          }`}>
            Join thousands of homeowners and property managers who trust OpportunIQ
            to help them save time and money on every repair.
          </p>
          <WaitlistModal>
            <Button className="h-14 px-8 font-mono font-bold text-lg bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </LightSection>
    </HybridPageWrapper>
  );
}

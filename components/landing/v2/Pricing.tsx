"use client";

import Link from "next/link";
import { IoCheckmarkCircle } from "react-icons/io5";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Get started with basic diagnosis and DIY guides.",
    cta: "Get started",
    highlighted: false,
    badge: null,
    features: [
      "5 projects per month",
      "Photo and text input",
      "Community DIY guides",
      "Basic cost estimates",
      "40+ languages",
    ],
  },
  {
    name: "Pro",
    price: "$0",
    period: "/month",
    description: "Everything you need to diagnose, fix, and manage.",
    cta: "Start free beta",
    highlighted: true,
    badge: "Free during beta",
    features: [
      "Unlimited projects",
      "Photo, video, and voice input",
      "Real cost data from HomeAdvisor & Angi",
      "Contractor search with one-click quotes",
      "Safety recall checks (CPSC & NHTSA)",
      "Gmail & Google Calendar integration",
      "In-store parts availability",
      "DIY guides from YouTube, iFixit, and more",
    ],
  },
  {
    name: "Household",
    price: "$0",
    period: "/month",
    description: "Manage repairs as a team with shared budgets.",
    cta: "Start free beta",
    highlighted: false,
    badge: "Free during beta",
    features: [
      "Everything in Pro",
      "Shared household budgets",
      "Group voting on decisions",
      "Multiple saved locations",
      "Member roles and permissions",
      "Household activity feed",
    ],
  },
];

export function Pricing() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Free during beta. No credit card.
          </h2>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            Every feature is unlocked right now. When we launch paid plans, beta users keep their access.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 flex flex-col ${
                tier.highlighted
                  ? "border-2 border-blue-600 bg-white relative"
                  : "border border-gray-200 bg-white"
              }`}
            >
              {tier.badge && tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white whitespace-nowrap">
                    {tier.badge}
                  </span>
                </div>
              )}
              {tier.badge && !tier.highlighted && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600">
                    {tier.badge}
                  </span>
                </div>
              )}

              <h3 className={`text-base font-semibold text-gray-900 ${tier.badge && tier.highlighted ? "mt-2" : ""}`}>{tier.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                <span className="text-sm text-gray-400">{tier.period}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2 mb-6">{tier.description}</p>

              <div className="space-y-2.5 flex-1">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <IoCheckmarkCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${tier.highlighted ? "text-blue-600" : "text-gray-300"}`} />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/login"
                className={`mt-6 w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  tier.highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import {
  IoConstructOutline,
  IoMailOutline,
  IoStarOutline,
  IoLocationOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoChevronForward,
} from "react-icons/io5";
import { FaYelp } from "react-icons/fa";

const FEATURES = [
  {
    title: "Vetted Local Pros",
    description: "Find contractors from Yelp, Angi, and Thumbtack. See ratings, reviews, and real customer feedback.",
    icon: IoConstructOutline,
  },
  {
    title: "One-Click RFQs",
    description: "Request quotes from multiple pros at once. We draft the email, you review and send.",
    icon: IoMailOutline,
  },
  {
    title: "Compare & Choose",
    description: "See all responses in one place. Compare quotes, availability, and reviews side by side.",
    icon: IoStarOutline,
  },
  {
    title: "Location-Aware",
    description: "Find pros near you with accurate distance and availability info. No more guessing who serves your area.",
    icon: IoLocationOutline,
  },
];

const SAMPLE_PROS = [
  {
    name: "Mike's Plumbing",
    source: "yelp",
    rating: 4.9,
    reviews: 127,
    distance: "2.3 mi",
    price: "$150-200",
    available: "Tomorrow",
  },
  {
    name: "Bay Area Plumbers",
    source: "angi",
    rating: 4.7,
    reviews: 89,
    distance: "4.1 mi",
    price: "$175-225",
    available: "Same day",
  },
  {
    name: "Quick Fix Pro",
    source: "thumbtack",
    rating: 4.8,
    reviews: 64,
    distance: "3.5 mi",
    price: "$140-190",
    available: "This week",
  },
  {
    name: "Premium Home Services",
    source: "yelp",
    rating: 4.6,
    reviews: 203,
    distance: "5.2 mi",
    price: "$200-250",
    available: "Tomorrow",
  },
];

const RFQ_STEPS = [
  { step: "1", title: "Select pros", desc: "Choose which contractors to contact" },
  { step: "2", title: "Review email", desc: "We draft an RFQ with your issue details" },
  { step: "3", title: "Send", desc: "One click sends to all selected pros" },
  { step: "4", title: "Compare", desc: "Review quotes as they come in" },
];

export default function ProFinderPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm text-neutral-500 mb-6">
            <Link href="/product" className="hover:text-blue-400 transition-colors">
              Product
            </Link>
            <IoChevronForward className="w-3 h-3" />
            <span className="text-neutral-300">Pro Finder</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-mono mb-6">
            <IoConstructOutline className="w-4 h-4" />
            Pro Finder
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Find the right{" "}
            <span className="text-blue-400">
              pro, fast
            </span>
          </h1>

          <p className="text-lg text-neutral-200 max-w-2xl mx-auto mb-10">
            When DIY isn&apos;t the answer, find vetted local contractors in seconds.
            Compare quotes and book with confidence.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 font-mono font-bold bg-blue-500 hover:bg-blue-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              Get Early Access
            </Button>
          </WaitlistModal>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-neutral-900 border border-neutral-700">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Pros */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Pros from sources you trust
              </h2>
              <p className="text-neutral-300 mb-8">
                We aggregate contractors from Yelp, Angi, Thumbtack, and more.
                See real ratings, reviews, and availability in one place.
              </p>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                  <FaYelp className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400">Yelp</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <span className="text-xs text-orange-400 font-medium">Angi</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
                  <span className="text-xs text-green-400 font-medium">Thumbtack</span>
                </div>
              </div>

              <ul className="space-y-3">
                {[
                  "Verified ratings and reviews",
                  "Real-time availability",
                  "Distance from your location",
                  "Price estimates upfront",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <IoCheckmarkCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-sm font-medium text-neutral-400">Local Plumbers</span>
                <span className="text-xs text-blue-400">4 found</span>
              </div>
              <div className="space-y-3">
                {SAMPLE_PROS.map((pro, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-white">{pro.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <IoStarOutline className="w-3 h-3 text-amber-400" />
                            <span className="text-xs text-neutral-400">{pro.rating}</span>
                          </div>
                          <span className="text-xs text-neutral-600">({pro.reviews})</span>
                          <span className="text-xs text-neutral-600">•</span>
                          <span className="text-xs text-neutral-500">{pro.distance}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        pro.source === "yelp"
                          ? "bg-red-500/20 text-red-400"
                          : pro.source === "angi"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-green-500/20 text-green-400"
                      }`}>
                        {pro.source}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                      <span className="text-sm font-medium text-white">{pro.price}</span>
                      <div className="flex items-center gap-1 text-blue-400">
                        <IoTimeOutline className="w-3 h-3" />
                        <span className="text-xs">{pro.available}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RFQ Flow */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Request quotes in seconds</h2>
            <p className="text-neutral-300">
              No more calling around. Send professional quote requests to multiple contractors at once.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {RFQ_STEPS.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "3+", label: "Pro networks" },
              { value: "1-click", label: "Quote requests" },
              { value: "< 24h", label: "Avg response time" },
              { value: "4.5+", label: "Avg pro rating" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-blue-400 mb-1">{stat.value}</p>
                <p className="text-sm text-neutral-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-neutral-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Never overpay for repairs
          </h2>
          <p className="text-neutral-300 mb-8">
            Join the waitlist and get access to vetted local contractors at fair prices.
          </p>
          <WaitlistModal>
            <Button className="h-14 px-8 font-mono font-bold text-lg bg-blue-500 hover:bg-blue-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(20,184,166,0.4)]">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>
    </>
  );
}

"use client";

import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import {
  IoBookOutline,
  IoPlayCircleOutline,
  IoBookmarkOutline,
  IoTrophyOutline,
  IoCheckmarkCircle,
  IoLogoYoutube,
  IoStarOutline,
  IoChevronForward,
} from "react-icons/io5";

const FEATURES = [
  {
    title: "Curated from Trusted Sources",
    description: "We pull the best guides from iFixit, YouTube, manufacturer docs, and DIY experts. No searching required.",
    icon: IoBookOutline,
  },
  {
    title: "Matched to Your Diagnosis",
    description: "Get guides specifically for your issue. Our AI matches your diagnosis to the most relevant tutorials.",
    icon: IoPlayCircleOutline,
  },
  {
    title: "Save for Later",
    description: "Bookmark guides you want to try. Build your personal DIY library for future reference.",
    icon: IoBookmarkOutline,
  },
  {
    title: "Track Your Progress",
    description: "Mark guides as complete. See your DIY journey and the skills you've built over time.",
    icon: IoTrophyOutline,
  },
];

const SAMPLE_GUIDES = [
  {
    title: "How to Replace a Kitchen Faucet",
    source: "iFixit",
    duration: "45 min",
    difficulty: "Beginner",
    rating: 4.8,
    savings: "$150",
  },
  {
    title: "Dishwasher Not Draining - Complete Fix",
    source: "YouTube",
    duration: "12 min",
    difficulty: "Beginner",
    rating: 4.9,
    savings: "$200",
  },
  {
    title: "Replace HVAC Air Filter",
    source: "Manufacturer",
    duration: "5 min",
    difficulty: "Easy",
    rating: 5.0,
    savings: "$50",
  },
  {
    title: "Fix a Running Toilet",
    source: "This Old House",
    duration: "20 min",
    difficulty: "Beginner",
    rating: 4.7,
    savings: "$125",
  },
  {
    title: "Unclog a Drain Without Chemicals",
    source: "YouTube",
    duration: "8 min",
    difficulty: "Easy",
    rating: 4.6,
    savings: "$100",
  },
];

const SOURCES = [
  { name: "iFixit" },
  { name: "YouTube" },
  { name: "This Old House" },
  { name: "Manufacturer Docs" },
  { name: "Home Depot" },
  { name: "Family Handyman" },
  { name: "Bob Vila" },
  { name: "DIY Network" },
];

export default function GuidesPage() {
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
            <span className="text-neutral-300">DIY Guides</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-mono mb-6">
            <IoBookOutline className="w-4 h-4" />
            DIY Guides
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Learn to fix{" "}
            <span className="text-blue-400">
              anything
            </span>
          </h1>

          <p className="text-lg text-neutral-200 max-w-2xl mx-auto mb-10">
            The best DIY tutorials from across the web, curated and matched to your
            specific issue. No more searching - just learning and fixing.
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

      {/* Sample Guides */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Guides matched to your issue</h2>
            <p className="text-neutral-300">
              When you diagnose an issue, we find the best tutorials automatically
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_GUIDES.map((guide, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-blue-500/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  {guide.source === "YouTube" ? (
                    <IoLogoYoutube className="w-4 h-4 text-red-500" />
                  ) : (
                    <IoBookOutline className="w-4 h-4 text-blue-400" />
                  )}
                  <span className="text-xs text-neutral-500">{guide.source}</span>
                  <span className="text-xs text-neutral-600">•</span>
                  <span className="text-xs text-neutral-500">{guide.duration}</span>
                </div>
                <h3 className="text-sm font-medium text-white mb-2">{guide.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      guide.difficulty === "Easy"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {guide.difficulty}
                    </span>
                    <div className="flex items-center gap-1">
                      <IoStarOutline className="w-3 h-3 text-amber-400" />
                      <span className="text-xs text-neutral-500">{guide.rating}</span>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">Save {guide.savings}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Trusted sources, one place</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SOURCES.map((source, i) => (
              <div key={i} className="p-4 rounded-lg bg-neutral-900 border border-neutral-700 text-center">
                <p className="text-white font-medium">{source.name}</p>
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
              { value: "9+", label: "Trusted sources" },
              { value: "Curated", label: "Quality guides" },
              { value: "4.7", label: "Avg rating" },
              { value: "$180", label: "Avg savings/guide" },
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
            Start your DIY journey
          </h2>
          <p className="text-neutral-300 mb-8">
            Join the waitlist and get access to the best DIY guides on the web.
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

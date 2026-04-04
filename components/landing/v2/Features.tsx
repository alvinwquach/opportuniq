"use client";

import { IoCamera, IoStar } from "react-icons/io5";
import {
  IoShieldCheckmarkOutline,
  IoChatbubblesOutline,
  IoBookOutline,
  IoConstructOutline,
  IoMicOutline,
  IoWalletOutline,
  IoTrendingUpOutline,
  IoRainyOutline,
} from "react-icons/io5";

const stripFeatures = [
  {
    icon: IoShieldCheckmarkOutline,
    title: "Safety Recalls",
    desc: "CPSC and NHTSA recall checks for your products and vehicles",
  },
  {
    icon: IoChatbubblesOutline,
    title: "Community Research",
    desc: "Real Reddit threads from people who had the same issue",
  },
  {
    icon: IoBookOutline,
    title: "DIY Guides",
    desc: "Step-by-step guides from iFixit, YouTube, and Instructables",
  },
  {
    icon: IoConstructOutline,
    title: "Permits & Rebates",
    desc: "Checks if you need a permit and finds tax credits in your area",
  },
  {
    icon: IoRainyOutline,
    title: "Weather Alerts",
    desc: "Warns you before outdoor projects if bad weather is forecast",
  },
  {
    icon: IoMicOutline,
    title: "Voice-First",
    desc: "Speak your problem, get the diagnosis read back in your language",
  },
  {
    icon: IoWalletOutline,
    title: "Track Spending",
    desc: "Monitor repair costs, budgets, and DIY savings over time",
  },
  {
    icon: IoTrendingUpOutline,
    title: "Gets Smarter",
    desc: "Report actual costs to improve estimates for your area",
  },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything the AI does for you
          </h2>
        </div>

        {/* ============================================================= */}
        {/* Part 1 — Three hero features in alternating left/right layout */}
        {/* ============================================================= */}

        {/* Hero 1: AI Diagnosis — visual on RIGHT */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12">
          {/* Text */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              AI Diagnosis
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Type, snap a photo, record a video, or speak in any of 40+
              languages. The AI analyzes what it sees and hears — record an
              engine noise or a rattling pipe and get a diagnosis from the
              audio. It reads the answer back to you in your language.
            </p>
          </div>
          {/* Visual: chat mockup */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <IoCamera className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
              <div className="bg-gray-50 border border-gray-200 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-xs text-gray-700 max-w-xs">
                I need to clean the algae out of my pond
              </div>
            </div>
            <div className="flex items-start gap-2.5 justify-end">
              <div className="bg-blue-600 rounded-xl rounded-tr-sm px-3.5 py-2.5 text-xs text-white max-w-sm">
                <span className="font-semibold">Safety note first.</span>{" "}
                Algaecides and decomposing algae release toxic gases —
                you&apos;ll need a respirator, nitrile gloves, and eye
                protection before you start.
              </div>
            </div>
          </div>
        </div>

        {/* Hero 2: Real Cost Data — visual on LEFT */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12">
          {/* Visual: cost comparison bars */}
          <div className="order-2 lg:order-1 space-y-3">
            {[
              {
                label: "DIY",
                range: "$80–$150",
                pct: "30%",
                color: "bg-blue-500",
              },
              {
                label: "Professional",
                range: "$350–$800",
                pct: "75%",
                color: "bg-blue-500",
              },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500 font-medium">{row.label}</span>
                  <span className="font-semibold text-blue-600">
                    {row.range}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${row.color} rounded-full`}
                    style={{ width: row.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
          {/* Text */}
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Real Cost Data
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              DIY vs professional breakdowns sourced from HomeAdvisor and Angi.
              Specific to your region and updated regularly so you always know
              what the job should actually cost.
            </p>
          </div>
        </div>

        {/* Hero 3: Find Help & Take Action — visual on RIGHT */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12">
          {/* Text */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Find Help & Take Action
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Searches Yelp and Foursquare for rated pros near you. Drafts a
              quote request and sends it from your Gmail in one click. Schedule
              contractor visits and maintenance reminders on Google Calendar.
            </p>
          </div>
          {/* Visual: contractor card mockup */}
          <div className="space-y-2">
            {[
              {
                name: "Mike's Plumbing",
                rating: "4.8",
                reviews: "142 reviews",
                tag: "Licensed",
              },
              {
                name: "Bay Area Rooter",
                rating: "4.6",
                reviews: "89 reviews",
                tag: "Same-day",
              },
            ].map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div>
                  <p className="text-xs font-medium text-gray-800">{c.name}</p>
                  <p className="text-[10px] text-gray-400">{c.reviews}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-100">
                    {c.tag}
                  </span>
                  <span className="text-xs font-semibold text-gray-700 flex items-center gap-0.5">
                    {c.rating}
                    <IoStar className="w-3 h-3 text-amber-400" />
                  </span>
                </div>
              </div>
            ))}
            <button className="w-full mt-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg py-1.5">
              Send quote request via Gmail
            </button>
          </div>
        </div>

        {/* ============================================================= */}
        {/* Part 2 — Feature strip: compact grid of everything else       */}
        {/* ============================================================= */}

        <div className="pt-16 pb-8">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
            Everything else the AI does
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stripFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title}>
                  <Icon className="w-5 h-5 text-blue-600 mb-2" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {f.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

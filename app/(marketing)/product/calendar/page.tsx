"use client";

import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import {
  IoCalendarOutline,
  IoRepeatOutline,
  IoNotificationsOutline,
  IoLinkOutline,
  IoCheckmarkCircle,
  IoChevronForward,
} from "react-icons/io5";

const FEATURES = [
  {
    title: "Monthly & Weekly Views",
    description: "See your maintenance schedule at a glance. Switch between views to plan ahead or focus on this week.",
    icon: IoCalendarOutline,
  },
  {
    title: "Recurring Events",
    description: "Set up recurring maintenance tasks. HVAC filter changes, gutter cleaning, seasonal prep - never forget again.",
    icon: IoRepeatOutline,
  },
  {
    title: "Smart Reminders",
    description: "Get notified before tasks are due. Reminders adapt based on weather and your schedule.",
    icon: IoNotificationsOutline,
  },
  {
    title: "Issue Linking",
    description: "Connect calendar events to active issues. Schedule DIY time and track progress in one place.",
    icon: IoLinkOutline,
  },
];

const SAMPLE_EVENTS = [
  { title: "HVAC Filter Change", date: "Every 3 months", type: "recurring", category: "HVAC" },
  { title: "Gutter Cleaning", date: "Apr 15, Oct 15", type: "seasonal", category: "Exterior" },
  { title: "Fix Kitchen Faucet", date: "This Saturday", type: "scheduled", category: "Plumbing" },
  { title: "Smoke Detector Batteries", date: "Every 6 months", type: "recurring", category: "Safety" },
  { title: "Lawn Mower Service", date: "March", type: "seasonal", category: "Outdoor" },
  { title: "Water Heater Flush", date: "Annually", type: "recurring", category: "Plumbing" },
];

const BENEFITS = [
  "Never miss seasonal maintenance",
  "Coordinate DIY time with household",
  "Track repair progress over time",
  "Sync with Google Calendar",
  "Weather-aware scheduling",
  "Reduce emergency repairs",
];

export default function CalendarPage() {
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
            <span className="text-neutral-300">Calendar</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-mono mb-6">
            <IoCalendarOutline className="w-4 h-4" />
            Calendar
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Maintenance on{" "}
            <span className="text-blue-400">
              autopilot
            </span>
          </h1>

          <p className="text-lg text-neutral-200 max-w-2xl mx-auto mb-10">
            Schedule recurring maintenance, coordinate repairs with your household,
            and never let a small problem become a big one.
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

      {/* Sample Calendar */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Your home maintenance, organized
              </h2>
              <p className="text-neutral-300 mb-8">
                See all your scheduled maintenance, upcoming repairs, and recurring tasks
                in one unified calendar. Filter by category, urgency, or household member.
              </p>

              <ul className="space-y-3">
                {BENEFITS.slice(0, 4).map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <IoCheckmarkCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-neutral-400">Upcoming Maintenance</span>
                <span className="text-xs text-blue-400 font-mono">6 scheduled</span>
              </div>
              <div className="space-y-3">
                {SAMPLE_EVENTS.map((event, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50 border border-neutral-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{event.title}</p>
                      <p className="text-xs text-neutral-500">{event.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        event.type === "recurring"
                          ? "bg-blue-500/20 text-blue-400"
                          : event.type === "seasonal"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {event.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "Recurring", label: "Events & reminders" },
              { value: "15+", label: "Maintenance categories" },
              { value: "2-way", label: "Calendar sync" },
              { value: "Smart", label: "Weather alerts" },
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
      <section className="py-20 px-6 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Stop forgetting maintenance
          </h2>
          <p className="text-neutral-300 mb-8">
            Join the waitlist and get early access to smart home maintenance scheduling.
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

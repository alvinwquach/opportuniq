"use client";

import { IoFlask, IoCheckmarkCircle, IoRocket } from "react-icons/io5";

// Launch date: Monday 2026-04-06 at 08:00:00 PST (UTC-7 during PDT)
const LAUNCH_DATE = new Date("2026-04-06T08:00:00-07:00");

const betaItems = [
  "Free during beta",
  "No credit card required",
  "40+ languages",
  "9 data sources",
];

const launchItems = [
  "Free to start",
  "No credit card required",
  "40+ languages",
  "9 data sources",
];

export function BetaStrip() {
  const isLaunched = new Date() >= LAUNCH_DATE;
  const items = isLaunched ? launchItems : betaItems;

  return (
    <div className="relative bg-blue-600 overflow-hidden">
      {/* Subtle texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          {/* Badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isLaunched ? (
              <IoRocket className="w-4 h-4 text-blue-200" />
            ) : (
              <IoFlask className="w-4 h-4 text-blue-200" />
            )}
            <span className="text-sm font-semibold text-white tracking-wide uppercase">
              {isLaunched ? "Now live" : "Currently in beta"}
            </span>
          </div>

          {/* Divider — desktop only */}
          <div className="hidden sm:block w-px h-4 bg-blue-400" />

          {/* Items */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {items.map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-sm text-blue-100">
                <IoCheckmarkCircle className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

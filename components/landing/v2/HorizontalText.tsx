"use client";

import {
  IoMicOutline,
  IoShieldCheckmarkOutline,
  IoConstructOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoRocketOutline,
} from "react-icons/io5";

const steps = [
  {
    number: "01",
    icon: IoMicOutline,
    headline: "Describe it.",
    body: "Type, speak, snap a photo, or record a video. Any language. Any device.",
  },
  {
    number: "02",
    icon: IoShieldCheckmarkOutline,
    headline: "Is it safe?",
    body: "Immediate safety risks flagged first — electrical hazards, gas leaks, structural concerns, and what PPE you need before touching anything.",
  },
  {
    number: "03",
    icon: IoConstructOutline,
    headline: "Can I do it myself?",
    body: "Honest assessment of skill level, tools required, and time. Step-by-step DIY guides if you can. A clear reason why not if you shouldn't.",
  },
  {
    number: "04",
    icon: IoTimeOutline,
    headline: "Is it urgent?",
    body: "Know whether to act today or if it can wait — and exactly what gets worse the longer you leave it.",
  },
  {
    number: "05",
    icon: IoCalendarOutline,
    headline: "Can I defer?",
    body: "If you can wait, here's what to watch for, how long is safe, and the warning signs that mean stop waiting.",
  },
  {
    number: "06",
    icon: IoCashOutline,
    headline: "Know the cost.",
    body: "Real DIY vs. professional pricing from HomeAdvisor and Angi — specific to your region.",
  },
  {
    number: "07",
    icon: IoRocketOutline,
    headline: "Take action.",
    body: "Find rated contractors, get step-by-step guides, check parts availability, or schedule a reminder.",
  },
];

export function HorizontalText() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-widest mb-4">
            How it works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
            From question to fixed.
          </h2>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            Seven steps
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-400">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
                  {step.headline}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-base font-medium text-gray-400 text-center mt-12">
          No experience required.
        </p>
      </div>
    </section>
  );
}

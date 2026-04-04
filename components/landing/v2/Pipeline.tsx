"use client";

import { IoKeypad, IoCamera, IoVideocam, IoMic } from "react-icons/io5";

const steps = [
  {
    number: "01",
    title: "Share your problem",
    description:
      "Type it out, snap a photo, record a video, or speak in your language — the AI understands all of it.",
    hasIcons: true,
  },
  {
    number: "02",
    title: "Get a diagnosis",
    description:
      "Identifies the issue, assesses severity, checks safety, recommends DIY or professional.",
    hasIcons: false,
  },
  {
    number: "03",
    title: "See real costs",
    description:
      "DIY vs professional breakdowns from HomeAdvisor and Angi. Real data for your region.",
    hasIcons: false,
  },
  {
    number: "04",
    title: "Find help",
    description:
      "If you need a pro, find rated contractors. If DIY, find the right parts, tools, and tutorials.",
    hasIcons: false,
  },
  {
    number: "05",
    title: "Take action",
    description:
      "Send a quote request through Gmail, schedule a reminder, or follow a step-by-step guide.",
    hasIcons: false,
  },
];

const inputIcons = [IoKeypad, IoCamera, IoVideocam, IoMic];

function StepContent({
  step,
  align,
}: {
  step: (typeof steps)[number];
  align: "left" | "right";
}) {
  return (
    <div className={align === "left" ? "text-right pr-6" : "pl-6"}>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {step.title}
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed">
        {step.description}
      </p>
      {step.hasIcons && (
        <div
          className={`flex gap-2 mt-3 ${
            align === "left" ? "justify-end" : "justify-start"
          }`}
        >
          {inputIcons.map((Icon, j) => (
            <div
              key={j}
              className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center"
            >
              <Icon className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Pipeline() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            From question to answer in 90 seconds
          </h2>
        </div>

        <div className="relative">
          {/* Center line — desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-px w-px bg-gray-200" />

          {/* Mobile line — left edge */}
          <div className="md:hidden absolute left-5 top-0 bottom-0">
            <div className="w-px h-full bg-gray-200" />
          </div>

          <div className="space-y-12 md:space-y-16">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;

              return (
                <div key={i} className="relative">
                  {/* Desktop: alternating left/right */}
                  <div className="hidden md:grid md:grid-cols-[1fr_40px_1fr] items-start">
                    <div>
                      {isLeft && <StepContent step={step} align="left" />}
                    </div>
                    <div className="flex justify-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-mono font-bold z-10 relative shadow-sm">
                        {step.number}
                      </div>
                    </div>
                    <div>
                      {!isLeft && <StepContent step={step} align="right" />}
                    </div>
                  </div>

                  {/* Mobile: single column, line on left */}
                  <div className="md:hidden flex gap-5 items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-mono font-bold z-10 relative shadow-sm">
                      {step.number}
                    </div>
                    <div className="pt-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                      {step.hasIcons && (
                        <div className="flex gap-2 mt-3">
                          {inputIcons.map((Icon, j) => (
                            <div
                              key={j}
                              className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center"
                            >
                              <Icon className="w-4 h-4 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

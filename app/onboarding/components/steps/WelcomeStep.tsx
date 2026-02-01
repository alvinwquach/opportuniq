"use client";

import { IoArrowForward, IoHome, IoCar, IoPhonePortrait, IoLeaf } from "react-icons/io5";
import type { StepProps } from "../../types";

export function WelcomeStepLeft() {
  const features = [
    { icon: IoHome, label: "Home Repairs", stat: "50K+ issues" },
    { icon: IoCar, label: "Auto Diagnostics", stat: "95% accuracy" },
    { icon: IoPhonePortrait, label: "Electronics", stat: "<2s analysis" },
    { icon: IoLeaf, label: "Outdoor", stat: "$2,400 saved" },
  ];

  return (
    <div className="w-full max-w-sm space-y-6 px-8">
      <div className="grid grid-cols-2 gap-4">
        {features.map((item, i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-teal-500/30 transition-colors"
          >
            <item.icon className="w-7 h-7 text-teal-400 mb-3" />
            <p className="font-medium">{item.label}</p>
            <p className="text-sm text-white/40">{item.stat}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-white/30 text-center">
        Join thousands making smarter repair decisions
      </p>
    </div>
  );
}

export function WelcomeStepRight({ onNext, userName }: Pick<StepProps, "onNext" | "userName">) {
  return (
    <div className="text-center lg:text-left">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm mb-8">
        <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
        Takes less than a minute
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
        {userName ? (
          <>
            Welcome,{" "}
            <span className="text-teal-400">{userName.split(" ")[0]}</span>
          </>
        ) : (
          <>
            Welcome to{" "}
            <span className="text-teal-400">OpportunIQ</span>
          </>
        )}
      </h1>

      <p className="text-lg text-white/50 mb-10 max-w-sm">
        Let's personalize your experience so we can give you the best recommendations.
      </p>

      <button
        onClick={onNext}
        className="group px-8 py-4 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl text-lg inline-flex items-center gap-3 transition-all hover:scale-105"
      >
        Get Started
        <IoArrowForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

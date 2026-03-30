"use client";

import { IoCheckmark, IoHammer, IoConstruct, IoBuild, IoSettings, IoCog, IoHandLeft } from "react-icons/io5";
import { COMFORT_LEVELS } from "../../constants";
import { NavigationButtons } from "../NavigationButtons";
import type { StepProps } from "../../types";

// Map comfort levels to visual representation
const LEVEL_CONFIGS: Record<string, {
  icon: typeof IoHammer;
  gradient: string;
  iconCount: number;
}> = {
  none: { icon: IoHandLeft, gradient: "from-blue-500/30 via-blue-400/10 to-transparent", iconCount: 0 },
  very_low: { icon: IoHandLeft, gradient: "from-blue-400/30 via-blue-300/10 to-transparent", iconCount: 1 },
  low: { icon: IoCog, gradient: "from-cyan-400/30 via-cyan-300/10 to-transparent", iconCount: 2 },
  moderate: { icon: IoSettings, gradient: "from-teal-400/30 via-teal-300/10 to-transparent", iconCount: 3 },
  high: { icon: IoBuild, gradient: "from-emerald-400/30 via-emerald-300/10 to-transparent", iconCount: 4 },
  very_high: { icon: IoConstruct, gradient: "from-green-400/30 via-green-300/10 to-transparent", iconCount: 5 },
};

export function ComfortStepLeft({ formData }: Pick<StepProps, "formData">) {
  const selectedLevel = COMFORT_LEVELS.find((l) => l.value === formData.riskTolerance);
  const config = formData.riskTolerance ? LEVEL_CONFIGS[formData.riskTolerance] : null;

  // No selection state
  if (!selectedLevel || !config) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        {/* Default gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-teal-500/10 via-teal-400/5 to-transparent" />

        <div className="relative z-10 text-center px-8">
          <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <IoSettings className="w-12 h-12 text-white/20" />
          </div>
          <p className="text-white/30 text-lg">
            Select your comfort level<br />to see personalized recommendations
          </p>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  const getRecommendations = () => {
    const isHireFocused = ["none", "very_low"].includes(formData.riskTolerance);
    const isDIYFocused = ["high", "very_high"].includes(formData.riskTolerance);

    return [
      isHireFocused ? "Contractor-first recommendations" : "DIY-first when safe",
      isDIYFocused ? "Advanced repair guides" : "Step-by-step beginner guides",
      "Safety warnings tailored to your level",
      isHireFocused ? "Price comparison for quotes" : "Tool & parts cost estimates",
    ];
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-radial ${config.gradient}`} />

      {/* Main content card */}
      <div className="relative z-10 w-full max-w-md px-8">
        {/* Large icon display */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/20 flex items-center justify-center">
            <Icon className="w-16 h-16 text-teal-400" />
          </div>
        </div>

        {/* Level indicator */}
        <div className="text-center mb-8">
          <p className="text-sm text-white/40 uppercase tracking-wider mb-2">Your Style</p>
          <p className="text-4xl font-bold text-teal-400">{selectedLevel?.label}</p>
          <p className="text-white/50 mt-2">{selectedLevel?.description}</p>
        </div>

        {/* Skill meter */}
        <div className="flex justify-center gap-2 mb-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-8 h-2 rounded-full transition-all duration-300 ${
                i <= config.iconCount ? 'bg-teal-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Recommendations */}
        <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/[0.06]">
          <p className="text-sm text-white/50 mb-4">We&apos;ll show you:</p>
          <ul className="space-y-3">
            {getRecommendations().map((rec, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <IoCheckmark className="w-3 h-3 text-teal-400" />
                </div>
                <span className="text-sm text-white/70">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ComfortStepRight({
  formData,
  setFormData,
  onNext,
  onPrev,
}: StepProps) {
  return (
    <div>
      <div className="mb-2 text-sm text-teal-400 font-medium">Step 3 of 5 · Optional</div>

      <h2 className="text-3xl sm:text-4xl font-bold mb-4">
        What&apos;s your DIY comfort level?
      </h2>

      <p className="text-lg text-white/50 mb-8">
        This helps us tailor recommendations to your experience.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {COMFORT_LEVELS.map((level) => {
          const isSelected = formData.riskTolerance === level.value;
          return (
            <button
              key={level.value}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  riskTolerance: isSelected ? "" : level.value,
                }))
              }
              className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                isSelected
                  ? "bg-teal-500/15 border-teal-500/50 ring-2 ring-teal-500/20"
                  : "bg-white/[0.03] border-white/10 hover:border-white/20"
              }`}
            >
              <p
                className={`font-semibold mb-1 ${
                  isSelected ? "text-teal-400" : ""
                }`}
              >
                {level.label}
              </p>
              <p className="text-xs text-white/40">{level.description}</p>
            </button>
          );
        })}
      </div>

      <NavigationButtons onNext={onNext} onPrev={onPrev} showSkip />
    </div>
  );
}

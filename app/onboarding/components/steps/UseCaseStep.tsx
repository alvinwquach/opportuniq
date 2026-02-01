"use client";

import { IoGrid } from "react-icons/io5";
import { USE_CASES } from "../../constants";
import { NavigationButtons } from "../NavigationButtons";
import type { StepProps } from "../../types";

const POPULAR_ISSUES: Record<string, string[]> = {
  home: ["Leaky faucet", "HVAC not cooling", "Electrical issues", "Appliance repairs"],
  auto: ["Check engine light", "Brake problems", "Battery issues", "Strange noises"],
  electronics: ["Won't charge", "Overheating", "Screen damage", "Speaker issues"],
  outdoor: ["Mower won't start", "Sprinkler leak", "Fence repair", "Gutter cleaning"],
};

// Category-specific gradients
const CATEGORY_GRADIENTS: Record<string, string> = {
  home: "from-amber-500/20 via-amber-400/5 to-transparent",
  auto: "from-blue-500/20 via-blue-400/5 to-transparent",
  electronics: "from-purple-500/20 via-purple-400/5 to-transparent",
  outdoor: "from-green-500/20 via-green-400/5 to-transparent",
};

export function UseCaseStepLeft({ formData }: Pick<StepProps, "formData">) {
  const selectedCase = USE_CASES.find((u) => u.value === formData.primaryUseCase);
  const issues = formData.primaryUseCase ? POPULAR_ISSUES[formData.primaryUseCase] : [];
  const gradient = formData.primaryUseCase
    ? CATEGORY_GRADIENTS[formData.primaryUseCase]
    : "from-teal-500/10 via-teal-400/5 to-transparent";

  if (!selectedCase) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        {/* Default gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-teal-500/10 via-teal-400/5 to-transparent" />

        <div className="relative z-10 text-center px-8">
          <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <IoGrid className="w-12 h-12 text-white/20" />
          </div>
          <p className="text-white/30 text-lg">
            Select a category to see<br />popular issues we can help with
          </p>
        </div>
      </div>
    );
  }

  const Icon = selectedCase.icon;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      {/* Dynamic gradient background */}
      <div className={`absolute inset-0 bg-gradient-radial ${gradient}`} />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-8">
        {/* Large category icon */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/20 flex items-center justify-center">
            <Icon className="w-16 h-16 text-teal-400" />
          </div>
        </div>

        {/* Category info */}
        <div className="text-center mb-8">
          <p className="text-sm text-white/40 uppercase tracking-wider mb-2">Selected Focus</p>
          <p className="text-4xl font-bold text-teal-400">{selectedCase.label}</p>
          <p className="text-white/50 mt-2">{selectedCase.description}</p>
        </div>

        {/* Popular issues */}
        <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/[0.06]">
          <p className="text-sm text-white/50 mb-4">Popular issues we help with:</p>
          <div className="flex flex-wrap gap-2">
            {issues.map((issue, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm"
              >
                {issue}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function UseCaseStepRight({
  formData,
  setFormData,
  onNext,
  onPrev,
}: StepProps) {
  return (
    <div>
      <div className="mb-2 text-sm text-teal-400 font-medium">Step 4 of 5 · Optional</div>

      <h2 className="text-3xl sm:text-4xl font-bold mb-4">
        What brings you here?
      </h2>

      <p className="text-lg text-white/50 mb-8">
        Select your primary focus. You can always change this later.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {USE_CASES.map((useCase) => {
          const Icon = useCase.icon;
          const isSelected = formData.primaryUseCase === useCase.value;
          return (
            <button
              key={useCase.value}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  primaryUseCase: isSelected ? "" : useCase.value,
                }))
              }
              className={`p-5 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                isSelected
                  ? "bg-teal-500/15 border-teal-500/50 ring-2 ring-teal-500/20"
                  : "bg-white/[0.03] border-white/10 hover:border-white/20"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                  isSelected
                    ? "bg-teal-500/20 text-teal-400"
                    : "bg-white/5 text-white/40"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p
                className={`font-semibold mb-1 ${
                  isSelected ? "text-teal-400" : ""
                }`}
              >
                {useCase.label}
              </p>
              <p className="text-xs text-white/40">{useCase.description}</p>
            </button>
          );
        })}
      </div>

      <NavigationButtons onNext={onNext} onPrev={onPrev} showSkip />
    </div>
  );
}

"use client";

import { IoCheckmark, IoArrowForward, IoLocation, IoResize, IoHammer, IoApps } from "react-icons/io5";
import { COUNTRIES, COMFORT_LEVELS, USE_CASES, MILES_COUNTRIES } from "../../constants";
import type { OnboardingFormData } from "../../types";

interface CompleteStepLeftProps {
  formData: OnboardingFormData;
}

export function CompleteStepLeft({ formData }: CompleteStepLeftProps) {
  const usesMiles = MILES_COUNTRIES.includes(formData.country);
  const unit = usesMiles ? "miles" : "km";
  const countryName = COUNTRIES.find((c) => c.code === formData.country)?.name;
  const comfortLabel = COMFORT_LEVELS.find((l) => l.value === formData.riskTolerance)?.label;
  const selectedUseCase = USE_CASES.find((u) => u.value === formData.primaryUseCase);
  const UseCaseIcon = selectedUseCase?.icon || IoApps;

  const summaryItems = [
    { icon: IoLocation, label: "Location", value: `${formData.postalCode}, ${countryName}` },
    { icon: IoResize, label: "Search Radius", value: `${formData.searchRadius} ${unit}` },
    { icon: IoHammer, label: "DIY Comfort", value: comfortLabel || "Balanced" },
    ...(formData.primaryUseCase
      ? [{ icon: UseCaseIcon, label: "Primary Focus", value: selectedUseCase?.label || "" }]
      : []),
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      {/* Celebratory gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-teal-500/20 via-teal-400/5 to-transparent" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-8">
        {/* Success icon */}
        <div className="flex justify-center mb-8">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-500/30 to-teal-500/10 border-2 border-teal-500/30 flex items-center justify-center">
            <IoCheckmark className="w-14 h-14 text-teal-400" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-white/40 uppercase tracking-wider mb-2">Ready to Go</p>
          <p className="text-3xl font-bold text-white">Your Preferences</p>
        </div>

        {/* Summary cards */}
        <div className="space-y-3">
          {summaryItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-white/[0.06] flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/40">{item.label}</p>
                  <p className="font-medium text-white truncate">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface CompleteStepRightProps {
  formData: OnboardingFormData;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isPreview?: boolean;
  error?: string | null;
}

export function CompleteStepRight({
  formData,
  onPrev,
  onSubmit,
  isSubmitting,
  isPreview,
  error,
}: CompleteStepRightProps) {
  return (
    <div className="text-center lg:text-left">
      <div className="w-20 h-20 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto lg:mx-0 mb-8">
        <IoCheckmark className="w-10 h-10 text-teal-400" />
      </div>

      <h2 className="text-3xl sm:text-4xl font-bold mb-4">You're all set!</h2>

      <p className="text-lg text-white/50 mb-8">
        {isPreview
          ? "This is a preview. Sign in to save your preferences."
          : "Your preferences have been saved. Let's start diagnosing."}
      </p>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6 text-left">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={onPrev}
          className="px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 px-6 py-4 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              Saving...
            </>
          ) : isPreview ? (
            <>
              Preview Complete
              <IoCheckmark className="w-5 h-5" />
            </>
          ) : (
            <>
              Go to Dashboard
              <IoArrowForward className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

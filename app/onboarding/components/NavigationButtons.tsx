"use client";

import { IoArrowDown } from "react-icons/io5";

interface NavigationButtonsProps {
  onNext: () => void;
  onPrev: () => void;
  canProceed?: boolean;
  showBack?: boolean;
  showSkip?: boolean;
  nextLabel?: string;
}

export function NavigationButtons({
  onNext,
  onPrev,
  canProceed = true,
  showBack = true,
  showSkip = false,
  nextLabel = "Continue",
}: NavigationButtonsProps) {
  return (
    <div className="mt-10">
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={onPrev}
            className="px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all"
          >
            Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 px-6 py-4 bg-teal-500 hover:bg-teal-400 disabled:bg-white/10 disabled:text-white/30 text-black font-semibold rounded-xl text-lg flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
        >
          {nextLabel}
          <IoArrowDown className="w-5 h-5" />
        </button>
      </div>

      {showSkip && (
        <button
          onClick={onNext}
          className="w-full mt-4 text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          Skip this step
        </button>
      )}
    </div>
  );
}

"use client";

import { forwardRef, type ReactNode } from "react";

interface StepLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
  isVisible?: boolean;
  /** When true, left column is full-bleed (e.g. map) and not centered in max-w-sm */
  leftFullBleed?: boolean;
  /** When true with leftFullBleed, removes all padding (for maps) */
  leftNoPadding?: boolean;
}

export const StepLayout = forwardRef<HTMLElement, StepLayoutProps>(
  ({ leftContent, rightContent, isVisible = false, leftFullBleed = false, leftNoPadding = false }, ref) => {
    const getLeftContentClass = () => {
      if (!leftFullBleed) {
        return "left-content w-full max-w-sm flex flex-col items-center justify-center";
      }
      if (leftNoPadding) {
        return "left-content w-full h-full";
      }
      return "left-content w-full h-full p-4 lg:p-6";
    };

    return (
      <section
        ref={ref}
        className="absolute inset-0 flex"
        style={{ display: isVisible ? "flex" : "none" }}
      >
        {/* Left Column - Static visual/context (no animation) */}
        <div
          className={
            leftFullBleed
              ? "hidden lg:flex lg:w-1/2 h-full bg-[#080808] relative overflow-hidden"
              : "hidden lg:flex lg:w-1/2 h-full bg-[#080808] relative overflow-hidden items-center justify-center p-6 lg:p-12"
          }
        >
          <div className={getLeftContentClass()}>
            {leftContent}
          </div>
        </div>

        {/* Right Column - Animated form/input; vertically centered with scroll fallback */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto flex items-center justify-center p-6 lg:p-12 pt-20 lg:pt-24 pb-12 bg-[#0a0a0a]">
          <div className="right-content w-full max-w-md">
            {rightContent}
          </div>
        </div>
      </section>
    );
  }
);

StepLayout.displayName = "StepLayout";

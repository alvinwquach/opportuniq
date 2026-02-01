"use client";

import { MILES_COUNTRIES } from "../../constants";
import { NavigationButtons } from "../NavigationButtons";
import { OnboardingMap } from "../OnboardingMap";
import type { StepProps } from "../../types";

interface RadiusStepLeftProps extends Pick<StepProps, "formData"> {
  initialCoords?: { lat: number; lng: number } | null;
  initialLocationInfo?: { city: string; region?: string; countryName?: string } | null;
}

export function RadiusStepLeft({ formData, initialCoords, initialLocationInfo }: RadiusStepLeftProps) {
  return (
    <div className="w-full h-full">
      <OnboardingMap
        postalCode={formData.postalCode}
        country={formData.country}
        searchRadius={formData.searchRadius}
        initialCoords={initialCoords}
        initialLocationInfo={initialLocationInfo}
      />
    </div>
  );
}

export function RadiusStepRight({
  formData,
  setFormData,
  onNext,
  onPrev,
}: StepProps) {
  const usesMiles = MILES_COUNTRIES.includes(formData.country);
  const unit = usesMiles ? "miles" : "km";

  return (
    <div>
      <div className="mb-2 text-sm text-teal-400 font-medium">Step 2 of 5</div>

      <h2 className="text-3xl sm:text-4xl font-bold mb-4">
        How far should we search?
      </h2>

      <p className="text-lg text-white/50 mb-8">
        Set your radius for finding local professionals and stores.
      </p>

      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <span className="text-white/60">Search Radius</span>
          <span className="text-3xl font-bold text-teal-400">
            {formData.searchRadius} <span className="text-lg">{unit}</span>
          </span>
        </div>

        <input
          type="range"
          value={formData.searchRadius}
          onChange={(e) => setFormData((prev) => ({ ...prev, searchRadius: Number(e.target.value) }))}
          min={5}
          max={100}
          step={5}
          className="w-full h-3 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${
              ((formData.searchRadius - 5) / 95) * 100
            }%, rgba(255,255,255,0.1) ${((formData.searchRadius - 5) / 95) * 100}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />

        <div className="flex justify-between text-sm text-white/40 mt-3">
          <span>5 {unit}</span>
          <span>50 {unit}</span>
          <span>100 {unit}</span>
        </div>
      </div>

      <NavigationButtons onNext={onNext} onPrev={onPrev} />
    </div>
  );
}

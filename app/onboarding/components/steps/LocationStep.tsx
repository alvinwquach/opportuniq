"use client";

import { COUNTRIES } from "../../constants";
import { NavigationButtons } from "../NavigationButtons";
import { OnboardingMap } from "../OnboardingMap";
import type { StepProps } from "../../types";

interface LocationStepLeftProps extends Pick<StepProps, "formData"> {
  onGeocodeSuccess?: (coords: { lat: number; lng: number }, locationInfo: { city: string; region?: string; countryName?: string }) => void;
}

export function LocationStepLeft({ formData, onGeocodeSuccess }: LocationStepLeftProps) {
  return (
    <div className="w-full h-full">
      <OnboardingMap
        postalCode={formData.postalCode}
        country={formData.country}
        searchRadius={formData.searchRadius}
        onGeocodeSuccess={onGeocodeSuccess}
      />
    </div>
  );
}

export function LocationStepRight({
  formData,
  setFormData,
  onNext,
  onPrev,
  canProceed,
}: StepProps) {
  return (
    <div>
      <div className="mb-2 text-sm text-teal-400 font-medium">Step 1 of 5</div>

      <h2 className="text-3xl sm:text-4xl font-bold mb-4">
        Where are you located?
      </h2>

      <p className="text-lg text-white/50 mb-8">
        This helps us find local contractors and accurate pricing.
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Country
          </label>
          <select
            value={formData.country}
            onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
            className="w-full h-14 px-5 rounded-xl bg-white/5 border border-white/10 text-white text-lg focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 16px center",
            }}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-neutral-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Postal Code
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => setFormData((prev) => ({ ...prev, postalCode: e.target.value }))}
            placeholder="e.g., 94102"
            className="w-full h-14 px-5 rounded-xl bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/30 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
            autoComplete="postal-code"
          />
        </div>
      </div>

      <NavigationButtons
        onNext={onNext}
        onPrev={onPrev}
        canProceed={canProceed}
      />
    </div>
  );
}

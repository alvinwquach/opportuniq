"use client";

import { useState } from "react";
import {
  IoCheckmark,
  IoLocationSharp,
  IoHome,
  IoSpeedometer,
} from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";

interface LocationFormProps {
  initialValues: {
    zipCode: string;
    address: string;
    searchRadius: number;
    distanceUnit: "miles" | "kilometers";
  };
}

export function LocationForm({ initialValues }: LocationFormProps) {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveMessage(null);

    // Simulate save for demo
    await new Promise((resolve) => setTimeout(resolve, 800));

    setSaveMessage("Location saved");
    setIsSubmitting(false);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Why Location Matters */}
      <div className="p-4 rounded-xl bg-[#00D4FF]/5 border border-[#00D4FF]/20">
        <p className="text-sm text-[#00D4FF]">
          <strong>Why we need your location:</strong> We use your ZIP code to
          find local contractors, check store availability, and show accurate
          pricing for your area.
        </p>
      </div>

      {/* ZIP Code Field */}
      <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center">
            <IoLocationSharp className="w-5 h-5 text-[#00D4FF]" />
          </div>
          <div>
            <label className="text-sm font-medium text-white block">
              ZIP Code <span className="text-red-400">*</span>
            </label>
            <p className="text-[11px] text-[#555]">
              Required for local search results
            </p>
          </div>
        </div>
        <input
          type="text"
          value={values.zipCode}
          onChange={(e) => setValues({ ...values, zipCode: e.target.value })}
          placeholder="e.g., 90210"
          maxLength={10}
          className="w-full h-11 px-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
        />
      </div>

      {/* Full Address Field (Optional) */}
      <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <IoHome className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-white block">
              Full Address
            </label>
            <p className="text-[11px] text-[#555]">
              Optional - helps find closest contractors
            </p>
          </div>
        </div>
        <input
          type="text"
          value={values.address}
          onChange={(e) => setValues({ ...values, address: e.target.value })}
          placeholder="123 Main St, City, State"
          className="w-full h-11 px-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
        <p className="text-[11px] text-[#444] mt-2">
          Your address is encrypted and never shared with third parties
        </p>
      </div>

      {/* Search Radius */}
      <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <IoSpeedometer className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-white block">
              Search Radius
            </label>
            <p className="text-[11px] text-[#555]">
              How far to search for contractors
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <select
              value={values.searchRadius}
              onChange={(e) =>
                setValues({ ...values, searchRadius: Number(e.target.value) })
              }
              className="w-full h-11 px-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="w-32">
            <select
              value={values.distanceUnit}
              onChange={(e) =>
                setValues({
                  ...values,
                  distanceUnit: e.target.value as "miles" | "kilometers",
                })
              }
              className="w-full h-11 px-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="miles">miles</option>
              <option value="kilometers">km</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-[#666] mt-3">
          Current: Searching within{" "}
          <span className="text-white font-medium">
            {values.searchRadius} {values.distanceUnit}
          </span>{" "}
          of your location
        </p>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !values.zipCode}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00D4FF] hover:bg-[#00D4FF]/90 disabled:bg-[#1f1f1f] disabled:text-[#555] text-[#0c0c0c] font-medium text-sm transition-colors"
        >
          {isSubmitting ? (
            <ImSpinner8 className="w-4 h-4 animate-spin" />
          ) : (
            <IoCheckmark className="w-4 h-4" />
          )}
          Save Location
        </button>
        {saveMessage && (
          <span className="text-sm text-[#00D4FF]">{saveMessage}</span>
        )}
      </div>
    </form>
  );
}

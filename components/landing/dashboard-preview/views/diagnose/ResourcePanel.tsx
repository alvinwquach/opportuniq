"use client";

import { useState, useEffect } from "react";
import { IoHammerOutline, IoShieldCheckmark } from "react-icons/io5";
import { DIYTab } from "./DIYTab";
import { HireProTab } from "./HireProTab";
import type { IssueData } from "./types";

type TabType = "diy" | "hire";

interface ResourcePanelProps {
  issue: IssueData | null;
  isCreatingNewIssue: boolean;
}

// PPE pricing and availability data
const ppeData: Record<string, { price: number; store: string; distance: string }> = {
  "Safety Glasses": { price: 12.97, store: "Home Depot", distance: "2.3 mi" },
  "Work Gloves": { price: 14.97, store: "Home Depot", distance: "2.3 mi" },
  "Insulated Gloves": { price: 24.97, store: "Home Depot", distance: "2.3 mi" },
  "Voltage Tester": { price: 19.97, store: "Home Depot", distance: "2.3 mi" },
  "N95 Mask": { price: 3.97, store: "Home Depot", distance: "2.3 mi" },
  "Hard Hat": { price: 14.97, store: "Home Depot", distance: "2.3 mi" },
  "Safety Harness": { price: 79.97, store: "Home Depot", distance: "2.3 mi" },
  "Non-slip Boots": { price: 89.97, store: "Home Depot", distance: "2.3 mi" },
};

// Helper function to get safety gear names based on issue category
function getSafetyGearNames(issue: IssueData): string[] {
  // Use the safety.ppe from the data if available
  if (issue.safety?.ppe?.length > 0) {
    return issue.safety.ppe;
  }

  // Fallback based on title/difficulty
  const titleLower = issue.title.toLowerCase();
  const gear: string[] = [];

  if (titleLower.includes("faucet") || titleLower.includes("plumbing") || titleLower.includes("water")) {
    gear.push("Safety Glasses", "Work Gloves");
  }
  if (titleLower.includes("electrical") || titleLower.includes("outlet") || titleLower.includes("light")) {
    gear.push("Insulated Gloves", "Safety Glasses", "Voltage Tester");
  }
  if (titleLower.includes("hvac") || titleLower.includes("ac") || titleLower.includes("air")) {
    gear.push("N95 Mask", "Safety Glasses", "Work Gloves");
  }
  if (titleLower.includes("garage")) {
    gear.push("Safety Glasses", "Work Gloves");
  }

  // Default gear
  if (gear.length === 0) {
    gear.push("Safety Glasses", "Work Gloves");
  }

  return gear;
}

// Convert safety gear names to PartItem objects
function getSafetyGearParts(issue: IssueData): IssueData["parts"] {
  const gearNames = getSafetyGearNames(issue);
  const uniqueGear = [...new Set(gearNames)];

  return uniqueGear.map((name) => {
    const data = ppeData[name] ?? { price: 15.00, store: "Home Depot", distance: "2.3 mi" };
    return {
      name,
      price: data.price,
      store: data.store,
      address: "123 Main St",
      distance: data.distance,
      inStock: true,
      link: `https://www.homedepot.com/s/${encodeURIComponent(name)}`,
      isPPE: true,
    };
  });
}

export function ResourcePanel({ issue, isCreatingNewIssue }: ResourcePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("diy");

  // Reset tab when issue changes
  useEffect(() => {
    setActiveTab("diy");
  }, [issue?.title]);

  if (isCreatingNewIssue || !issue) {
    return (
      <div className="w-[340px] flex-shrink-0 border-l border-white/[0.06] flex flex-col bg-[#0f0f0f]">
        {/* Disabled Tabs */}
        <div className="flex border-b border-white/[0.06]">
          {["DIY", "Hire Pro"].map((tab) => (
            <div
              key={tab}
              className="flex-1 px-4 py-3 text-sm font-medium text-[#444] text-center"
            >
              {tab}
            </div>
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <IoHammerOutline className="w-10 h-10 text-[#333] mx-auto mb-2" />
            <p className="text-sm text-[#666]">Select an issue to view options</p>
            <p className="text-xs text-[#555] mt-1">Or report a new issue to get started</p>
          </div>
        </div>
      </div>
    );
  }

  const hasGuides = issue.guides.length > 0;
  const hasParts = issue.parts.length > 0;
  const hasDiyContent = hasGuides || hasParts;
  const hasProContent = issue.pros.length > 0;

  // Combine PPE parts with regular parts
  const ppeParts = getSafetyGearParts(issue);
  const allParts = [...ppeParts, ...issue.parts];

  return (
    <div className="w-[340px] flex-shrink-0 border-l border-white/[0.06] flex flex-col bg-[#0f0f0f]">
      {/* Tabs */}
      <div className="flex border-b border-white/[0.06]">
        {[
          { id: "diy" as TabType, label: "DIY", available: hasDiyContent },
          { id: "hire" as TabType, label: "Hire Pro", available: hasProContent },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={!tab.available}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              !tab.available
                ? "text-[#444] cursor-not-allowed"
                : activeTab === tab.id
                ? "text-emerald-400"
                : "text-[#888] hover:text-white"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && tab.available && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "diy" && (
          <DIYTab
            issue={{ ...issue, parts: allParts }}
            onSwitchToHire={() => setActiveTab("hire")}
          />
        )}

        {activeTab === "hire" && (
          <HireProTab
            issue={issue}
            onSwitchToDIY={() => setActiveTab("diy")}
          />
        )}
      </div>

      {/* Safety Notice */}
      <div className="p-4 border-t border-white/[0.06]">
        <div
          className={`p-3 rounded-lg ${
            issue.difficulty.includes("Professional")
              ? "bg-red-500/10 border border-red-500/20"
              : "bg-amber-500/10 border border-amber-500/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <IoShieldCheckmark
              className={`w-4 h-4 ${
                issue.difficulty.includes("Professional")
                  ? "text-red-400"
                  : "text-amber-400"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                issue.difficulty.includes("Professional")
                  ? "text-red-400"
                  : "text-amber-400"
              }`}
            >
              Safety Note
            </span>
          </div>
          <p
            className={`text-[10px] leading-relaxed ${
              issue.difficulty.includes("Professional")
                ? "text-red-400/80"
                : "text-amber-400/80"
            }`}
          >
            {issue.safety?.doNotProceed?.[0] ??
              (issue.difficulty.includes("Professional")
                ? "This repair requires professional expertise. Attempting DIY may void warranties or cause injury."
                : "Always turn off water/power before starting. Wear appropriate safety gear.")}
          </p>
        </div>
      </div>
    </div>
  );
}

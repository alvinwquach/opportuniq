"use client";

import { useState, useEffect, useMemo } from "react";
import { IoHammerOutline, IoShieldCheckmark } from "react-icons/io5";
import { DIYTab } from "./DIYTab";
import { HireProTab } from "./HireProTab";
import { useDemoFlowContextSafe } from "./DemoFlowContext";
import type { IssueData } from "./types";

type TabType = "diy" | "hire";

interface ResourcePanelProps {
  issue: IssueData | null;
  isCreatingNewIssue: boolean;
}

// PPE pricing and availability data
const ppeData: Record<string, { price: number; store: string; distance: string }> = {
  "Safety Glasses": { price: 12.97, store: "Home Depot", distance: "2.3 mi" },
  "Work Gloves": { price: 9.97, store: "Home Depot", distance: "2.3 mi" },
  "Insulated Gloves": { price: 29.97, store: "Home Depot", distance: "2.3 mi" },
  "Voltage Tester": { price: 22.97, store: "Home Depot", distance: "2.3 mi" },
  "N95 Mask": { price: 22.47, store: "Home Depot", distance: "2.3 mi" },
  "Hard Hat": { price: 26.97, store: "Home Depot", distance: "2.3 mi" },
  "Safety Harness": { price: 69.97, store: "Home Depot", distance: "2.3 mi" },
  "Non-slip Boots": { price: 49.97, store: "Home Depot", distance: "2.3 mi" },
};

// Helper function to get safety gear names based on issue category
function getSafetyGearNames(issue: IssueData): string[] {
  if (issue.difficulty.includes("Professional")) {
    return [];
  }

  if (issue.safety?.ppe?.length > 0) {
    const validPpe = issue.safety.ppe.filter(
      (item) => !item.toLowerCase().includes("n/a") && !item.toLowerCase().includes("professional")
    );
    if (validPpe.length > 0) {
      return validPpe;
    }
  }

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

  if (gear.length === 0) {
    gear.push("Safety Glasses", "Work Gloves");
  }

  return gear;
}

// Convert safety gear names to PartItem objects
function getSafetyGearParts(issue: IssueData): IssueData["parts"] {
  const gearNames = getSafetyGearNames(issue);
  if (gearNames.length === 0) {
    return [];
  }

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
  const demoFlow = useDemoFlowContextSafe();

  // Progressive reveal from demo flow
  const isLoading = demoFlow?.isLoading ?? false;
  const visibleGuides = demoFlow?.visibleGuides ?? issue?.guides.length ?? 0;
  const visibleParts = demoFlow?.visibleParts ?? (issue?.parts.length ?? 0);
  const showTools = demoFlow?.showTools ?? true;
  const showSafety = demoFlow?.showSafety ?? true;
  const showCost = demoFlow?.showCost ?? true;

  // Reset tab when issue changes
  useEffect(() => {
    setActiveTab("diy");
  }, [issue?.title]);

  // Memoize PPE parts calculation
  const ppeParts = useMemo(() => {
    if (!issue) return [];
    return getSafetyGearParts(issue);
  }, [issue]);

  const allParts = useMemo(() => {
    if (!issue) return [];
    return [...ppeParts, ...issue.parts];
  }, [issue, ppeParts]);

  if (isCreatingNewIssue || !issue) {
    return (
      <div className="w-full lg:w-[340px] h-full shrink-0 lg:border-l border-white/[0.06] flex flex-col bg-[#0f0f0f]">
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

  // Show content after diagnosis completes (researching phase or later)
  const showContent = !isLoading;

  return (
    <div className="w-full lg:w-[340px] h-full shrink-0 lg:border-l border-white/[0.06] flex flex-col bg-[#0f0f0f]">
      {/* Tabs */}
      <div className="flex border-b border-white/[0.06]">
        {[
          { id: "diy" as TabType, label: "DIY", available: hasDiyContent },
          { id: "hire" as TabType, label: "Hire Pro", available: hasProContent },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
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
        {/* Loading State */}
        {isLoading && activeTab === "diy" && (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-[#1a1a1a] rounded-xl" />
            <div className="h-8 bg-[#1a1a1a] rounded-lg w-2/3" />
            <div className="space-y-2">
              <div className="h-16 bg-[#1a1a1a] rounded-xl" />
              <div className="h-16 bg-[#1a1a1a] rounded-xl" />
            </div>
          </div>
        )}

        {showContent && activeTab === "diy" && (
          <DIYTab
            issue={{ ...issue, parts: allParts }}
            onSwitchToHire={() => setActiveTab("hire")}
            visibleGuides={visibleGuides}
            visibleParts={visibleParts}
            showTools={showTools}
            showCost={showCost}
          />
        )}

        {showContent && activeTab === "hire" && (
          <HireProTab
            issue={issue}
            onSwitchToDIY={() => setActiveTab("diy")}
          />
        )}
      </div>

      {/* Safety Notice */}
      {showSafety && (
        <div
          className="p-4 border-t border-white/[0.06] animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
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
      )}
    </div>
  );
}

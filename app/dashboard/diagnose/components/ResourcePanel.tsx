"use client";

import { useState } from "react";
import { IoHammerOutline, IoShieldCheckmark, IoBuildOutline, IoPersonOutline } from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DIYTab } from "./DIYTab";
import { HireProTab } from "./HireProTab";
import type { DiagnoseIssueDetail, TabType } from "../types";

interface ResourcePanelProps {
  issue: DiagnoseIssueDetail | null;
}

export function ResourcePanel({ issue }: ResourcePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("diy");

  if (!issue) {
    return (
      <div className="w-[340px] flex-shrink-0 border-l border-white/[0.06] flex flex-col bg-[#0f0f0f]">
        {/* Disabled Tabs */}
        <div className="flex border-b border-white/[0.06]">
          {[
            { id: "diy", label: "DIY", icon: IoBuildOutline },
            { id: "hire", label: "Hire Pro", icon: IoPersonOutline },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-[#444]">
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">{tab.label}</TooltipContent>
              </Tooltip>
            );
          })}
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

  const hasGuides = (issue.guides?.length ?? 0) > 0;
  const hasParts = (issue.parts?.length ?? 0) > 0;
  const hasDiyContent = hasGuides || hasParts;
  const hasProContent = (issue.pros?.length ?? 0) > 0;

  const savings =
    issue.proCost && issue.diyCost ? issue.proCost - issue.diyCost : 0;

  // Generate order parts URL
  const handleOrderParts = () => {
    if (!issue.parts?.length) return;
    const searchTerms = issue.parts.map((p) => p.name).join(" ");
    window.open(`https://www.homedepot.com/s/${encodeURIComponent(searchTerms)}`, "_blank");
  };

  const handleGetDirections = () => {
    if (!issue.parts?.length) return;
    window.open(
      `https://www.google.com/maps/search/${encodeURIComponent(
        issue.parts[0]?.store ?? "hardware store"
      )}`,
      "_blank"
    );
  };

  // Parts come from the backend (including PPE items marked with isPPE: true)
  const parts = issue.parts ?? [];

  return (
    <div className="w-[340px] flex-shrink-0 border-l border-white/[0.06] flex flex-col bg-[#0f0f0f]">
      {/* Tabs */}
      <div className="flex border-b border-white/[0.06]">
        {[
          { id: "diy" as TabType, label: "DIY", icon: IoBuildOutline, available: hasDiyContent },
          { id: "hire" as TabType, label: "Hire Pro", icon: IoPersonOutline, available: hasProContent },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Tooltip key={tab.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  disabled={!tab.available}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                    !tab.available
                      ? "text-[#444] cursor-not-allowed"
                      : activeTab === tab.id
                      ? "text-emerald-400"
                      : "text-[#888] hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {activeTab === tab.id && tab.available && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{tab.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "diy" && (
          <DIYTab
            guides={issue.guides ?? []}
            parts={parts}
            diyCost={issue.diyCost}
            savings={savings}
            onOrderParts={handleOrderParts}
            onGetDirections={handleGetDirections}
            onSwitchToHire={() => setActiveTab("hire")}
          />
        )}

        {activeTab === "hire" && (
          <HireProTab
            pros={issue.pros ?? []}
            proCost={issue.proCost}
            issueTitle={issue.title}
            issueDiagnosis={issue.diagnosis}
            issueId={issue.id}
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
            {issue.safetyNote ??
              (issue.difficulty.includes("Professional")
                ? "This repair requires professional expertise. Attempting DIY may void warranties or cause injury."
                : "Always turn off water/power before starting. Wear appropriate safety gear.")}
          </p>
        </div>
      </div>
    </div>
  );
}

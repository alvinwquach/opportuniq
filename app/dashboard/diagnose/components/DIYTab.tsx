"use client";

import { useState } from "react";
import {
  IoPlayCircle,
  IoConstruct,
  IoBookOutline,
  IoStorefront,
  IoCheckmarkCircle,
  IoNavigate,
  IoOpenOutline,
  IoHammerOutline,
  IoShieldCheckmark,
  IoChevronDown,
  IoChevronUp,
  IoBuildOutline,
  IoCheckmark,
} from "react-icons/io5";
import type { Guide, Part } from "../types";

interface DIYTabProps {
  guides: Guide[];
  parts: Part[];
  diyCost: number | null;
  savings: number;
  onOrderParts: () => void;
  onGetDirections: () => void;
  onSwitchToHire: () => void;
}

export function DIYTab({
  guides,
  parts,
  diyCost,
  savings,
  onOrderParts,
  onGetDirections,
  onSwitchToHire,
}: DIYTabProps) {
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});
  const hasGuides = guides.length > 0;
  const hasParts = parts.length > 0;
  const hasDiyContent = hasGuides || hasParts;

  const toggleStepComplete = (guideId: string, stepNumber: number) => {
    setCompletedSteps((prev) => {
      const guideSteps = new Set(prev[guideId] || []);
      if (guideSteps.has(stepNumber)) {
        guideSteps.delete(stepNumber);
      } else {
        guideSteps.add(stepNumber);
      }
      return { ...prev, [guideId]: guideSteps };
    });
  };

  const getCompletedCount = (guideId: string) => {
    return completedSteps[guideId]?.size || 0;
  };

  const isStepCompleted = (guideId: string, stepNumber: number) => {
    return completedSteps[guideId]?.has(stepNumber) || false;
  };

  const handleGuideClick = (guide: Guide) => {
    // If guide has step content, toggle expand instead of opening external link
    if (guide.stepContent && guide.stepContent.length > 0) {
      setExpandedGuide(expandedGuide === guide.id ? null : guide.id);
      return;
    }
    // Open external URL for video/external guides
    if (guide.url) {
      window.open(guide.url, "_blank");
    }
  };

  if (!hasDiyContent) {
    return (
      <div className="text-center py-8">
        <IoHammerOutline className="w-10 h-10 text-[#333] mx-auto mb-2" />
        <p className="text-sm text-[#666]">DIY not recommended</p>
        <p className="text-xs text-[#555] mt-1">
          This repair requires professional service
        </p>
        <button
          onClick={onSwitchToHire}
          className="mt-4 px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          View Professionals →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cost Summary */}
      <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-400/70">Estimated DIY Cost</p>
            <p className="text-xl font-bold text-emerald-400">
              ${diyCost?.toFixed(2) ?? "0.00"}
            </p>
          </div>
          {savings > 0 && (
            <div className="text-right">
              <p className="text-xs text-emerald-400/70">You Save</p>
              <p className="text-lg font-bold text-emerald-400">${savings.toFixed(0)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Guides Section */}
      {hasGuides && (
        <div>
          <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-2">
            Step-by-Step Guides
          </h3>
          <div className="space-y-2">
            {guides.map((guide) => {
              const hasStepContent = guide.stepContent && guide.stepContent.length > 0;
              const isExpanded = expandedGuide === guide.id;

              return (
                <div
                  key={guide.id}
                  className={`bg-[#1a1a1a] rounded-xl border transition-colors ${
                    isExpanded ? "border-emerald-500/40" : "border-[#2a2a2a] hover:border-emerald-500/30"
                  }`}
                >
                  <div
                    onClick={() => handleGuideClick(guide)}
                    className="p-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      {guide.icon === "youtube" ? (
                        <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <IoPlayCircle className="w-4 h-4 text-red-400" />
                        </div>
                      ) : guide.icon === "ifixit" ? (
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <IoConstruct className="w-4 h-4 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <IoBookOutline className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white leading-tight">
                          {guide.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#888]">
                          <span>{guide.source}</span>
                          {guide.duration && (
                            <>
                              <span>·</span>
                              <span>{guide.duration}</span>
                            </>
                          )}
                          {guide.steps && (
                            <>
                              <span>·</span>
                              <span>{guide.steps} steps</span>
                            </>
                          )}
                          {guide.rating && (
                            <>
                              <span>·</span>
                              <span className="text-amber-400">★ {guide.rating.toFixed(1)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {hasStepContent ? (
                        isExpanded ? (
                          <IoChevronUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <IoChevronDown className="w-4 h-4 text-[#555] flex-shrink-0" />
                        )
                      ) : (
                        <IoOpenOutline className="w-4 h-4 text-[#555] flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Step Content */}
                  {hasStepContent && isExpanded && (
                    <div className="px-3 pb-3 border-t border-[#2a2a2a]">
                      {/* Tools Needed */}
                      {guide.toolsNeeded && guide.toolsNeeded.length > 0 && (
                        <div className="pt-3 pb-2 mb-2 border-b border-[#2a2a2a]">
                          <div className="flex items-center gap-2 mb-2">
                            <IoBuildOutline className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs font-medium text-amber-400">Tools Needed</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {guide.toolsNeeded.map((tool, toolIdx) => (
                              <span
                                key={toolIdx}
                                className="text-[10px] px-2 py-1 bg-[#252525] text-[#999] rounded-md"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Progress Indicator */}
                      <div className="flex items-center justify-between pt-2 pb-2">
                        <span className="text-[10px] text-[#666]">
                          {getCompletedCount(guide.id)} of {guide.stepContent!.length} steps completed
                        </span>
                        <div className="flex-1 mx-3 h-1 bg-[#252525] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{
                              width: `${(getCompletedCount(guide.id) / guide.stepContent!.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Steps */}
                      <div className="pt-1 space-y-2">
                        {guide.stepContent!.map((step) => {
                          const completed = isStepCompleted(guide.id, step.stepNumber);
                          return (
                            <div
                              key={step.stepNumber}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStepComplete(guide.id, step.stepNumber);
                              }}
                              className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                completed ? "bg-emerald-500/10" : "hover:bg-[#222]"
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                  completed
                                    ? "bg-emerald-500 text-white"
                                    : "bg-emerald-500/20"
                                }`}
                              >
                                {completed ? (
                                  <IoCheckmark className="w-3.5 h-3.5" />
                                ) : (
                                  <span className="text-xs font-semibold text-emerald-400">
                                    {step.stepNumber}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium transition-colors ${
                                    completed ? "text-emerald-400 line-through" : "text-white"
                                  }`}
                                >
                                  {step.title}
                                </p>
                                <p
                                  className={`text-xs mt-0.5 leading-relaxed transition-colors ${
                                    completed ? "text-[#555]" : "text-[#888]"
                                  }`}
                                >
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* View Full Guide Link */}
                      {guide.url && (
                        <div className="pt-3 mt-2 border-t border-[#2a2a2a]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(guide.url!, "_blank");
                            }}
                            className="flex items-center justify-center gap-2 w-full py-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            <IoOpenOutline className="w-3.5 h-3.5" />
                            View full guide on {guide.source}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Parts Section */}
      {hasParts && (
        <div>
          <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-2">
            Parts & Materials
          </h3>
          <div className="space-y-2">
            {parts.map((part) => (
              <div
                key={part.id}
                onClick={() => {
                  // Generate a search URL for the part at the store
                  const storeUrls: Record<string, string> = {
                    "Home Depot": `https://www.homedepot.com/s/${encodeURIComponent(part.name)}`,
                    "Lowe's": `https://www.lowes.com/search?searchTerm=${encodeURIComponent(part.name)}`,
                    "Ace Hardware": `https://www.acehardware.com/search?query=${encodeURIComponent(part.name)}`,
                    "Amazon": `https://www.amazon.com/s?k=${encodeURIComponent(part.name)}`,
                  };
                  const url = storeUrls[part.store] ?? `https://www.homedepot.com/s/${encodeURIComponent(part.name)}`;
                  window.open(url, "_blank");
                }}
                className="p-3 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-emerald-500/30 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{part.name}</p>
                      {part.isPPE && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded flex items-center gap-1">
                          <IoShieldCheckmark className="w-2.5 h-2.5" />
                          PPE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#888]">
                      <IoStorefront className="w-3 h-3" />
                      <span>{part.store}</span>
                      {part.distance && (
                        <>
                          <span>·</span>
                          <span>{part.distance}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-sm font-semibold text-emerald-400">
                      ${part.price.toFixed(2)}
                    </p>
                    {part.inStock && (
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
                        <IoCheckmarkCircle className="w-3 h-3" />
                        In Stock
                      </p>
                    )}
                    <IoOpenOutline className="w-3 h-3 text-[#555] mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={onOrderParts}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <IoStorefront className="w-4 h-4" />
              Order Parts
            </button>
            <button
              onClick={onGetDirections}
              className="px-3 py-2.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-sm rounded-lg border border-[#2a2a2a] transition-colors"
              title="Get Directions"
            >
              <IoNavigate className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

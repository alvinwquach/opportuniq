"use client";

import { useState, useEffect, useCallback } from "react";
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
  IoCheckmarkDone,
  IoSquareOutline,
  IoCheckbox,
  IoStar,
} from "react-icons/io5";
import type { IssueData, GuideItem } from "./types";
import { useDarkMode } from "../../DarkModeContext";

interface DIYTabProps {
  issue: IssueData;
  onSwitchToHire: () => void;
  // Progressive reveal props
  visibleGuides?: number;
  visibleParts?: number;
  showTools?: boolean;
  showCost?: boolean;
}

// Helper to generate a stable key for localStorage based on issue
const getStorageKey = (issueTitle: string, type: "steps" | "tools") => {
  const slug = issueTitle.toLowerCase().replace(/\s+/g, "-");
  return `diy-progress-${slug}-${type}`;
};

export function DIYTab({
  issue,
  onSwitchToHire,
  visibleGuides = issue.guides.length,
  visibleParts = issue.parts.length,
  showTools = true,
  showCost = true,
}: DIYTabProps) {
  const dark = useDarkMode();
  const b = dark ? "border-white/[0.06]" : "border-gray-200";
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});
  const [checkedTools, setCheckedTools] = useState<Set<string>>(new Set());
  const [isToolChecklistExpanded, setIsToolChecklistExpanded] = useState(false);
  const hasGuides = issue.guides.length > 0;
  const hasParts = issue.parts.length > 0;
  const hasDiyContent = hasGuides || hasParts;
  const savings = issue.proCost - issue.diyCost;

  // Calculate total cost from all parts (including PPE)
  const totalPartsCost = issue.parts.reduce((sum, part) => sum + part.price, 0);
  const ppeParts = issue.parts.filter((part) => part.isPPE);
  const regularParts = issue.parts.filter((part) => !part.isPPE);
  const ppeCost = ppeParts.reduce((sum, part) => sum + part.price, 0);
  const partsCost = regularParts.reduce((sum, part) => sum + part.price, 0);

  // Collect all unique tools from all guides
  const allTools = Array.from(
    new Set(issue.guides.flatMap((guide) => guide.toolsNeeded || []))
  );

  // Load persisted progress from localStorage on mount
  useEffect(() => {
    try {
      // Load completed steps
      const stepsKey = getStorageKey(issue.title, "steps");
      const savedSteps = localStorage.getItem(stepsKey);
      if (savedSteps) {
        const parsed = JSON.parse(savedSteps);
        const restored: Record<string, Set<number>> = {};
        for (const [key, steps] of Object.entries(parsed)) {
          restored[key] = new Set(steps as number[]);
        }
        setCompletedSteps(restored);
      }

      // Load checked tools
      const toolsKey = getStorageKey(issue.title, "tools");
      const savedTools = localStorage.getItem(toolsKey);
      if (savedTools) {
        setCheckedTools(new Set(JSON.parse(savedTools)));
      }
    } catch {
      // Ignore localStorage errors (SSR, disabled, etc.)
    }
  }, [issue.title]);

  // Persist completed steps to localStorage
  const persistSteps = useCallback(
    (steps: Record<string, Set<number>>) => {
      try {
        const stepsKey = getStorageKey(issue.title, "steps");
        const serializable: Record<string, number[]> = {};
        for (const [key, set] of Object.entries(steps)) {
          serializable[key] = Array.from(set);
        }
        localStorage.setItem(stepsKey, JSON.stringify(serializable));
      } catch {
        // Ignore localStorage errors
      }
    },
    [issue.title]
  );

  // Persist checked tools to localStorage
  const persistTools = useCallback(
    (tools: Set<string>) => {
      try {
        const toolsKey = getStorageKey(issue.title, "tools");
        localStorage.setItem(toolsKey, JSON.stringify(Array.from(tools)));
      } catch {
        // Ignore localStorage errors
      }
    },
    [issue.title]
  );

  const toggleStepComplete = (guideIdx: number, stepNumber: number) => {
    const guideKey = `guide-${guideIdx}`;
    setCompletedSteps((prev) => {
      const guideSteps = new Set(prev[guideKey] || []);
      if (guideSteps.has(stepNumber)) {
        guideSteps.delete(stepNumber);
      } else {
        guideSteps.add(stepNumber);
      }
      const newState = { ...prev, [guideKey]: guideSteps };
      persistSteps(newState);
      return newState;
    });
  };

  const toggleToolChecked = (tool: string) => {
    setCheckedTools((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tool)) {
        newSet.delete(tool);
      } else {
        newSet.add(tool);
      }
      persistTools(newSet);
      return newSet;
    });
  };

  const allToolsChecked = allTools.length > 0 && allTools.every((tool) => checkedTools.has(tool));
  const checkedToolsCount = allTools.filter((tool) => checkedTools.has(tool)).length;

  const getCompletedCount = (guideIdx: number) => {
    const guideKey = `guide-${guideIdx}`;
    return completedSteps[guideKey]?.size || 0;
  };

  const isStepCompleted = (guideIdx: number, stepNumber: number) => {
    const guideKey = `guide-${guideIdx}`;
    return completedSteps[guideKey]?.has(stepNumber) || false;
  };

  const handleOrderParts = () => {
    if (!issue.parts.length) return;
    const searchTerms = issue.parts.map((p) => p.name).join(" ");
    window.open(`https://www.homedepot.com/s/${encodeURIComponent(searchTerms)}`, "_blank");
  };

  const handleGetDirections = () => {
    if (!issue.parts.length) return;
    window.open(
      `https://www.google.com/maps/search/${encodeURIComponent(
        issue.parts[0]?.store ?? "hardware store"
      )}`,
      "_blank"
    );
  };


  const handlePartClick = (partName: string, store: string) => {
    const storeUrls: Record<string, string> = {
      "Home Depot": `https://www.homedepot.com/s/${encodeURIComponent(partName)}`,
      "Lowe's": `https://www.lowes.com/search?searchTerm=${encodeURIComponent(partName)}`,
      "Ace Hardware": `https://www.acehardware.com/search?query=${encodeURIComponent(partName)}`,
      "Amazon": `https://www.amazon.com/s?k=${encodeURIComponent(partName)}`,
      "Walmart": `https://www.walmart.com/search?q=${encodeURIComponent(partName)}`,
    };
    const url = storeUrls[store] ?? `https://www.google.com/search?q=${encodeURIComponent(partName + " " + store)}`;
    window.open(url, "_blank");
  };

  const handleGuideClick = (guide: GuideItem, idx: number) => {
    // If guide has step content, toggle expand instead of opening external link
    if (guide.stepContent && guide.stepContent.length > 0) {
      setExpandedGuide(expandedGuide === idx ? null : idx);
      return;
    }

    // Generate search URLs based on source for video/external guides
    const searchUrls: Record<string, string> = {
      "YouTube": `https://www.youtube.com/results?search_query=${encodeURIComponent(guide.title)}`,
      "iFixit": `https://www.ifixit.com/Search?query=${encodeURIComponent(guide.title)}`,
      "Family Handyman": `https://www.familyhandyman.com/search/?q=${encodeURIComponent(guide.title)}`,
      "This Old House": `https://www.thisoldhouse.com/search?q=${encodeURIComponent(guide.title)}`,
    };
    const url = searchUrls[guide.source] ?? `https://www.google.com/search?q=${encodeURIComponent(guide.title)}`;
    window.open(url, "_blank");
  };

  if (!hasDiyContent) {
    return (
      <div className="text-center py-8">
        <IoHammerOutline className={`w-10 h-10 mx-auto mb-2 ${dark ? "text-gray-700" : "text-gray-300"}`} />
        <p className={`text-sm ${dark ? "text-gray-500" : "text-gray-500"}`}>DIY not recommended</p>
        <p className={`text-xs mt-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>
          This repair requires professional service
        </p>
        <button
          onClick={onSwitchToHire}
          className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-500 transition-colors"
        >
          View Professionals →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cost Summary with Breakdown */}
      {showCost && (
        <div className={`p-3 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${dark ? "bg-green-900/20 border-green-500/30" : "bg-green-50 border-blue-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-green-600/70">Total DIY Cost</p>
              <p className="text-xl font-bold text-green-500">
                ${totalPartsCost.toFixed(2)}
              </p>
            </div>
            {savings > 0 && (
              <div className="text-right">
                <p className="text-xs text-green-600/70">You Save</p>
                <p className="text-lg font-bold text-green-500">${savings.toFixed(0)}</p>
              </div>
            )}
          </div>
          {/* Cost Breakdown */}
          {hasParts && (partsCost > 0 || ppeCost > 0) && (
            <div className={`pt-2 border-t space-y-1 ${dark ? "border-green-500/20" : "border-blue-200"}`}>
              {partsCost > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className={dark ? "text-gray-500" : "text-gray-500"}>Parts & Materials ({regularParts.length})</span>
                  <span className={dark ? "text-gray-600" : "text-gray-400"}>${partsCost.toFixed(2)}</span>
                </div>
              )}
              {ppeCost > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-1 ${dark ? "text-gray-500" : "text-gray-500"}`}>
                    <IoShieldCheckmark className="w-3 h-3 text-amber-500" />
                    Safety/PPE ({ppeParts.length})
                  </span>
                  <span className={dark ? "text-gray-600" : "text-gray-400"}>${ppeCost.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tool Checklist */}
      {showTools && allTools.length > 0 && (
        <div className={`rounded-xl border animate-in fade-in slide-in-from-bottom-2 duration-300 ${dark ? "bg-[#252525] border-white/10" : "bg-white border-gray-200"}`}>
          <button
            onClick={() => setIsToolChecklistExpanded(!isToolChecklistExpanded)}
            className="w-full p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                allToolsChecked ? "bg-green-500/20" : "bg-amber-500/20"
              }`}>
                {allToolsChecked ? (
                  <IoCheckmarkDone className="w-4 h-4 text-green-500" />
                ) : (
                  <IoBuildOutline className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="text-left">
                <p className={`text-sm font-medium ${dark ? "text-gray-200" : "text-gray-900"}`}>Tool Checklist</p>
                <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-500"}`}>
                  {checkedToolsCount} of {allTools.length} tools ready
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {allToolsChecked && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${dark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"}`}>
                  Ready to start!
                </span>
              )}
              {isToolChecklistExpanded ? (
                <IoChevronUp className={`w-4 h-4 ${dark ? "text-gray-500" : "text-gray-600"}`} />
              ) : (
                <IoChevronDown className={`w-4 h-4 ${dark ? "text-gray-500" : "text-gray-600"}`} />
              )}
            </div>
          </button>
          {isToolChecklistExpanded && (
            <div className={`px-3 pb-3 border-t ${b}`}>
              <div className="pt-3 space-y-1.5">
                {allTools.map((tool, idx) => {
                  const isChecked = checkedTools.has(tool);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleToolChecked(tool)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left ${
                        isChecked
                          ? dark ? "bg-green-500/10" : "bg-green-50"
                          : dark ? "hover:bg-white/[0.04]" : "hover:bg-gray-100"
                      }`}
                    >
                      {isChecked ? (
                        <IoCheckbox className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <IoSquareOutline className={`w-4 h-4 flex-shrink-0 ${dark ? "text-gray-600" : "text-gray-600"}`} />
                      )}
                      <span
                        className={`text-sm transition-colors ${
                          isChecked ? "text-green-500 line-through" : dark ? "text-gray-300" : "text-gray-900"
                        }`}
                      >
                        {tool}
                      </span>
                    </button>
                  );
                })}
              </div>
              {!allToolsChecked && (
                <p className={`mt-3 pt-2 border-t text-[10px] ${b} ${dark ? "text-gray-600" : "text-gray-500"}`}>
                  Check off each tool to verify you have everything before starting
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Guides Section */}
      {hasGuides && visibleGuides > 0 && (
        <div>
          <h3 className={`text-xs font-medium uppercase tracking-wider mb-2 animate-in fade-in duration-200 ${dark ? "text-gray-600" : "text-gray-500"}`}>
            Step-by-Step Guides
          </h3>
          <div className="space-y-2">
            {issue.guides.slice(0, visibleGuides).map((guide, idx) => {
              const hasStepContent = guide.stepContent && guide.stepContent.length > 0;
              const isExpanded = expandedGuide === idx;

              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    dark
                      ? isExpanded ? "bg-[#252525] border-blue-500/40" : "bg-[#252525] border-white/10 hover:border-blue-500/30"
                      : isExpanded ? "bg-white border-blue-200" : "bg-white border-gray-200 hover:border-blue-200"
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div
                    onClick={() => handleGuideClick(guide, idx)}
                    className="p-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      {guide.icon === "youtube" ? (
                        <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <IoPlayCircle className="w-4 h-4 text-red-500" />
                        </div>
                      ) : guide.icon === "ifixit" ? (
                        <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <IoConstruct className="w-4 h-4 text-green-500" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <IoBookOutline className="w-4 h-4 text-amber-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-tight ${dark ? "text-gray-200" : "text-gray-900"}`}>
                          {guide.title}
                        </p>
                        <div className={`flex items-center gap-2 mt-1 text-xs ${dark ? "text-gray-600" : "text-gray-500"}`}>
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
                              <span className="text-amber-500 flex items-center gap-0.5"><IoStar className="w-3 h-3 inline" /> {guide.rating.toFixed(1)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {hasStepContent ? (
                        isExpanded ? (
                          <IoChevronUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <IoChevronDown className={`w-4 h-4 flex-shrink-0 ${dark ? "text-gray-500" : "text-gray-600"}`} />
                        )
                      ) : (
                        <IoOpenOutline className={`w-4 h-4 flex-shrink-0 ${dark ? "text-gray-500" : "text-gray-600"}`} />
                      )}
                    </div>
                  </div>

                  {/* Expanded Step Content */}
                  {hasStepContent && isExpanded && (
                    <div className={`px-3 pb-3 border-t ${b}`}>
                      {/* Tools Needed */}
                      {guide.toolsNeeded && guide.toolsNeeded.length > 0 && (
                        <div className={`pt-3 pb-2 mb-2 border-b ${b}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <IoBuildOutline className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-medium text-amber-500">Tools Needed</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {guide.toolsNeeded.map((tool, toolIdx) => (
                              <span
                                key={toolIdx}
                                className={`text-[10px] px-2 py-1 rounded-md ${dark ? "bg-white/[0.06] text-gray-500" : "bg-gray-100 text-gray-400"}`}
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Progress Indicator */}
                      <div className="flex items-center justify-between pt-2 pb-2">
                        <span className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-500"}`}>
                          {getCompletedCount(idx)} of {guide.stepContent!.length} steps completed
                        </span>
                        <div className={`flex-1 mx-3 h-1 rounded-full overflow-hidden ${dark ? "bg-white/[0.06]" : "bg-gray-100"}`}>
                          <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{
                              width: `${(getCompletedCount(idx) / guide.stepContent!.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Steps */}
                      <div className="pt-1 space-y-2">
                        {guide.stepContent!.map((step) => {
                          const completed = isStepCompleted(idx, step.stepNumber);
                          return (
                            <div
                              key={step.stepNumber}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStepComplete(idx, step.stepNumber);
                              }}
                              className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                completed
                                  ? dark ? "bg-green-500/10" : "bg-green-50"
                                  : dark ? "hover:bg-white/[0.04]" : "hover:bg-gray-100"
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                  completed
                                    ? "bg-green-500 text-white"
                                    : dark ? "bg-green-500/20" : "bg-green-50"
                                }`}
                              >
                                {completed ? (
                                  <IoCheckmark className="w-3.5 h-3.5" />
                                ) : (
                                  <span className="text-xs font-semibold text-green-500">
                                    {step.stepNumber}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium transition-colors ${
                                    completed ? "text-green-500 line-through" : dark ? "text-gray-200" : "text-gray-900"
                                  }`}
                                >
                                  {step.title}
                                </p>
                                <p
                                  className={`text-xs mt-0.5 leading-relaxed transition-colors ${
                                    completed ? dark ? "text-gray-600" : "text-gray-600" : dark ? "text-gray-500" : "text-gray-500"
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
                        <div className={`pt-3 mt-2 border-t ${b}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(guide.url, "_blank");
                            }}
                            className="flex items-center justify-center gap-2 w-full py-2 text-xs text-green-500 hover:text-green-400 transition-colors"
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
      {hasParts && visibleParts > 0 && (
        <div>
          <h3 className={`text-xs font-medium uppercase tracking-wider mb-2 animate-in fade-in duration-200 ${dark ? "text-gray-600" : "text-gray-500"}`}>
            Parts & Materials
          </h3>
          <div className="space-y-2">
            {issue.parts.slice(0, visibleParts).map((part, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border animate-in fade-in slide-in-from-bottom-2 duration-300 ${dark ? "bg-[#252525] border-white/10" : "bg-white border-gray-200"}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${dark ? "text-gray-200" : "text-gray-900"}`}>{part.name}</p>
                      {part.isPPE && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-500 rounded flex items-center gap-1">
                          <IoShieldCheckmark className="w-2.5 h-2.5" />
                          PPE
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-green-500">
                    ~${part.price.toFixed(2)}
                  </p>
                </div>

                {/* Store Options */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    onClick={() => handlePartClick(part.name, part.store)}
                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] bg-green-500/20 text-green-500 rounded-md hover:bg-green-500/30 transition-colors"
                  >
                    <IoStorefront className="w-3 h-3" />
                    {part.store}
                    {part.inStock && <IoCheckmarkCircle className="w-2.5 h-2.5" />}
                    <IoOpenOutline className="w-2.5 h-2.5" />
                  </button>
                  {part.comparePrices?.map((compare, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => handlePartClick(part.name, compare.store)}
                      className={`flex items-center gap-1.5 px-2 py-1 text-[10px] rounded-md transition-colors ${
                        compare.inStock
                          ? dark
                            ? "bg-white/[0.06] text-gray-500 hover:bg-white/10 hover:text-gray-300"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-900"
                          : dark
                            ? "bg-white/[0.04] text-gray-700 cursor-not-allowed"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={!compare.inStock}
                    >
                      <IoStorefront className="w-3 h-3" />
                      {compare.store}
                      <span className={dark ? "text-gray-600" : "text-gray-500"}>${compare.price.toFixed(2)}</span>
                      {compare.inStock ? (
                        <IoOpenOutline className="w-2.5 h-2.5" />
                      ) : (
                        <span className="text-red-500/70">Out</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleOrderParts}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <IoStorefront className="w-4 h-4" />
              Order Parts
            </button>
            <button
              onClick={handleGetDirections}
              className={`px-3 py-2.5 text-sm rounded-lg border transition-colors ${dark ? "bg-white/[0.06] hover:bg-white/10 text-gray-300 border-white/10" : "bg-white hover:bg-gray-100 text-gray-900 border-gray-200"}`}
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

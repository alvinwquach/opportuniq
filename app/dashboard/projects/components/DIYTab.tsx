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
} from "react-icons/io5";
import type { Guide, Part } from "../types";

interface DIYTabProps {
  guides: Guide[];
  parts: Part[];
  savings: number;
  onOrderParts: () => void;
  onGetDirections: () => void;
  onSwitchToHire: () => void;
}

// Helper to generate a stable key for localStorage based on issue title
const getStorageKey = (issueTitle: string, type: "steps" | "tools") => {
  const slug = issueTitle.toLowerCase().replace(/\s+/g, "-");
  return `diy-progress-${slug}-${type}`;
};

export function DIYTab({
  guides,
  parts,
  savings,
  onOrderParts,
  onGetDirections,
  onSwitchToHire,
}: DIYTabProps) {
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});
  const [checkedTools, setCheckedTools] = useState<Set<string>>(new Set());
  const [isToolChecklistExpanded, setIsToolChecklistExpanded] = useState(false);
  const hasGuides = guides.length > 0;
  const hasParts = parts.length > 0;
  const hasDiyContent = hasGuides || hasParts;

  // Calculate total cost from all parts (including PPE)
  const totalPartsCost = parts.reduce((sum, part) => sum + part.price, 0);
  const ppeParts = parts.filter((part) => part.isPPE);
  const regularParts = parts.filter((part) => !part.isPPE);
  const ppeCost = ppeParts.reduce((sum, part) => sum + part.price, 0);
  const partsCost = regularParts.reduce((sum, part) => sum + part.price, 0);

  // Collect all unique tools from all guides
  const allTools = Array.from(
    new Set(guides.flatMap((guide) => guide.toolsNeeded || []))
  );

  // Use a stable title for storage key (from the first guide or fallback)
  const storageTitle = guides[0]?.title ?? "unknown";

  // Load persisted progress from localStorage on mount
  useEffect(() => {
    try {
      const stepsKey = getStorageKey(storageTitle, "steps");
      const savedSteps = localStorage.getItem(stepsKey);
      if (savedSteps) {
        const parsed = JSON.parse(savedSteps);
        const restored: Record<string, Set<number>> = {};
        for (const [key, steps] of Object.entries(parsed)) {
          restored[key] = new Set(steps as number[]);
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCompletedSteps(restored);
      }

      const toolsKey = getStorageKey(storageTitle, "tools");
      const savedTools = localStorage.getItem(toolsKey);
      if (savedTools) {

        setCheckedTools(new Set(JSON.parse(savedTools)));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageTitle]);

  // Persist completed steps to localStorage
  const persistSteps = useCallback(
    (steps: Record<string, Set<number>>) => {
      try {
        const stepsKey = getStorageKey(storageTitle, "steps");
        const serializable: Record<string, number[]> = {};
        for (const [key, set] of Object.entries(steps)) {
          serializable[key] = Array.from(set);
        }
        localStorage.setItem(stepsKey, JSON.stringify(serializable));
      } catch {
        // Ignore localStorage errors
      }
    },
    [storageTitle]
  );

  // Persist checked tools to localStorage
  const persistTools = useCallback(
    (tools: Set<string>) => {
      try {
        const toolsKey = getStorageKey(storageTitle, "tools");
        localStorage.setItem(toolsKey, JSON.stringify(Array.from(tools)));
      } catch {
        // Ignore localStorage errors
      }
    },
    [storageTitle]
  );

  const toggleStepComplete = (guideId: string, stepNumber: number) => {
    setCompletedSteps((prev) => {
      const guideSteps = new Set(prev[guideId] || []);
      if (guideSteps.has(stepNumber)) {
        guideSteps.delete(stepNumber);
      } else {
        guideSteps.add(stepNumber);
      }
      const newState = { ...prev, [guideId]: guideSteps };
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

  const getCompletedCount = (guideId: string) => {
    return completedSteps[guideId]?.size || 0;
  };

  const isStepCompleted = (guideId: string, stepNumber: number) => {
    return completedSteps[guideId]?.has(stepNumber) || false;
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

  const handleGuideClick = (guide: Guide) => {
    // If guide has step content, toggle expand instead of opening external link
    if (guide.stepContent && guide.stepContent.length > 0) {
      setExpandedGuide(expandedGuide === guide.id ? null : guide.id);
      return;
    }

    // Generate search URLs based on source for video/external guides
    const searchUrls: Record<string, string> = {
      "YouTube": `https://www.youtube.com/results?search_query=${encodeURIComponent(guide.title)}`,
      "iFixit": `https://www.ifixit.com/Search?query=${encodeURIComponent(guide.title)}`,
      "Family Handyman": `https://www.familyhandyman.com/search/?q=${encodeURIComponent(guide.title)}`,
      "This Old House": `https://www.thisoldhouse.com/search?q=${encodeURIComponent(guide.title)}`,
    };
    const url = guide.url ?? searchUrls[guide.source] ?? `https://www.google.com/search?q=${encodeURIComponent(guide.title)}`;
    window.open(url, "_blank");
  };

  if (!hasDiyContent) {
    return (
      <div className="text-center py-8">
        <IoHammerOutline className="w-10 h-10 text-[#333] mx-auto mb-2" />
        <p className="text-sm text-gray-500">DIY not recommended</p>
        <p className="text-xs text-gray-400 mt-1">
          This repair requires professional service
        </p>
        <button
          onClick={onSwitchToHire}
          className="mt-4 px-4 py-2 text-sm text-green-600 hover:text-green-500 transition-colors"
        >
          View Professionals →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cost Summary with Breakdown */}
      <div className="p-3 bg-green-50 rounded-xl border border-green-500/20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-green-600/70">Total DIY Cost</p>
            <p className="text-xl font-bold text-green-600">
              ${totalPartsCost.toFixed(2)}
            </p>
          </div>
          {savings > 0 && (
            <div className="text-right">
              <p className="text-xs text-green-600/70">You Save</p>
              <p className="text-lg font-bold text-green-600">${savings.toFixed(0)}</p>
            </div>
          )}
        </div>
        {/* Cost Breakdown */}
        {hasParts && (partsCost > 0 || ppeCost > 0) && (
          <div className="pt-2 border-t border-green-500/20 space-y-1">
            {partsCost > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Parts & Materials ({regularParts.length})</span>
                <span className="text-[#aaa]">${partsCost.toFixed(2)}</span>
              </div>
            )}
            {ppeCost > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1">
                  <IoShieldCheckmark className="w-3 h-3 text-amber-400" />
                  Safety/PPE ({ppeParts.length})
                </span>
                <span className="text-[#aaa]">${ppeCost.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tool Checklist */}
      {allTools.length > 0 && (
        <div className="bg-gray-100 rounded-xl border border-gray-200">
          <button
            onClick={() => setIsToolChecklistExpanded(!isToolChecklistExpanded)}
            className="w-full p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                allToolsChecked ? "bg-green-100" : "bg-amber-500/20"
              }`}>
                {allToolsChecked ? (
                  <IoCheckmarkDone className="w-4 h-4 text-green-600" />
                ) : (
                  <IoBuildOutline className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Tool Checklist</p>
                <p className="text-[10px] text-gray-500">
                  {checkedToolsCount} of {allTools.length} tools ready
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {allToolsChecked && (
                <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-600 rounded-full">
                  Ready to start!
                </span>
              )}
              {isToolChecklistExpanded ? (
                <IoChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <IoChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </button>
          {isToolChecklistExpanded && (
            <div className="px-3 pb-3 border-t border-gray-200">
              <div className="pt-3 space-y-1.5">
                {allTools.map((tool, idx) => {
                  const isChecked = checkedTools.has(tool);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleToolChecked(tool)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left ${
                        isChecked ? "bg-green-50" : "hover:bg-[#222]"
                      }`}
                    >
                      {isChecked ? (
                        <IoCheckbox className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <IoSquareOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm transition-colors ${
                          isChecked ? "text-green-600 line-through" : "text-gray-900"
                        }`}
                      >
                        {tool}
                      </span>
                    </button>
                  );
                })}
              </div>
              {!allToolsChecked && (
                <p className="mt-3 pt-2 border-t border-gray-200 text-[10px] text-gray-500">
                  Check off each tool to verify you have everything before starting
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Guides Section */}
      {hasGuides && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Step-by-Step Guides
          </h3>
          <div className="space-y-2">
            {guides.map((guide) => {
              const hasStepContent = guide.stepContent && guide.stepContent.length > 0;
              const isExpanded = expandedGuide === guide.id;

              return (
                <div
                  key={guide.id}
                  className={`bg-gray-100 rounded-xl border transition-colors ${
                    isExpanded ? "border-green-500/40" : "border-gray-200 hover:border-green-500/30"
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
                        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <IoConstruct className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <IoBookOutline className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 leading-tight">
                          {guide.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
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
                          <IoChevronUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <IoChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )
                      ) : (
                        <IoOpenOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Step Content */}
                  {hasStepContent && isExpanded && (
                    <div className="px-3 pb-3 border-t border-gray-200">
                      {/* Tools Needed */}
                      {guide.toolsNeeded && guide.toolsNeeded.length > 0 && (
                        <div className="pt-3 pb-2 mb-2 border-b border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <IoBuildOutline className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs font-medium text-amber-400">Tools Needed</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {guide.toolsNeeded.map((tool, toolIdx) => (
                              <span
                                key={toolIdx}
                                className="text-[10px] px-2 py-1 bg-gray-100 text-gray-400 rounded-md"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Progress Indicator */}
                      <div className="flex items-center justify-between pt-2 pb-2">
                        <span className="text-[10px] text-gray-500">
                          {getCompletedCount(guide.id)} of {guide.stepContent!.length} steps completed
                        </span>
                        <div className="flex-1 mx-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-300"
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
                                completed ? "bg-green-50" : "hover:bg-[#222]"
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                  completed
                                    ? "bg-green-500 text-white"
                                    : "bg-green-100"
                                }`}
                              >
                                {completed ? (
                                  <IoCheckmark className="w-3.5 h-3.5" />
                                ) : (
                                  <span className="text-xs font-semibold text-green-600">
                                    {step.stepNumber}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium transition-colors ${
                                    completed ? "text-green-600 line-through" : "text-gray-900"
                                  }`}
                                >
                                  {step.title}
                                </p>
                                <p
                                  className={`text-xs mt-0.5 leading-relaxed transition-colors ${
                                    completed ? "text-gray-400" : "text-gray-500"
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
                        <div className="pt-3 mt-2 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(guide.url!, "_blank");
                            }}
                            className="flex items-center justify-center gap-2 w-full py-2 text-xs text-green-600 hover:text-green-500 transition-colors"
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
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Parts & Materials
          </h3>
          <div className="space-y-2">
            {parts.map((part) => (
              <div
                key={part.id}
                className="p-3 bg-gray-100 rounded-xl border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
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
                  </div>
                  <p className="text-sm font-semibold text-green-600">
                    ~${part.price.toFixed(2)}
                  </p>
                </div>

                {/* Store Options */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    onClick={() => handlePartClick(part.name, part.store)}
                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] bg-green-100 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                  >
                    <IoStorefront className="w-3 h-3" />
                    {part.store}
                    {part.inStock && <IoCheckmarkCircle className="w-2.5 h-2.5" />}
                    <IoOpenOutline className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={onOrderParts}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-green-500 text-gray-900 text-sm font-medium rounded-lg transition-colors"
            >
              <IoStorefront className="w-4 h-4" />
              Order Parts
            </button>
            <button
              onClick={onGetDirections}
              className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm rounded-lg border border-gray-200 transition-colors"
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

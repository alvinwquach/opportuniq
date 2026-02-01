"use client";

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
} from "react-icons/io5";
import type { IssueData } from "./types";

interface DIYTabProps {
  issue: IssueData;
  safetyGear: string[];
  onSwitchToHire: () => void;
}

export function DIYTab({ issue, safetyGear, onSwitchToHire }: DIYTabProps) {
  const hasGuides = issue.guides.length > 0;
  const hasParts = issue.parts.length > 0;
  const hasDiyContent = hasGuides || hasParts;
  const savings = issue.proCost - issue.diyCost;

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

  const handleFindPPE = () => {
    const searchTerms = safetyGear.join(" ");
    window.open(
      `https://www.homedepot.com/s/${encodeURIComponent(searchTerms + " safety")}`,
      "_blank"
    );
  };

  const handlePartClick = (partName: string, store: string) => {
    const storeUrls: Record<string, string> = {
      "Home Depot": `https://www.homedepot.com/s/${encodeURIComponent(partName)}`,
      "Lowe's": `https://www.lowes.com/search?searchTerm=${encodeURIComponent(partName)}`,
      "Ace Hardware": `https://www.acehardware.com/search?query=${encodeURIComponent(partName)}`,
      "Amazon": `https://www.amazon.com/s?k=${encodeURIComponent(partName)}`,
    };
    const url = storeUrls[store] ?? `https://www.homedepot.com/s/${encodeURIComponent(partName)}`;
    window.open(url, "_blank");
  };

  const handleGuideClick = (guide: IssueData["guides"][0]) => {
    // Generate search URLs based on source
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
              ${issue.diyCost.toFixed(2)}
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

      {/* Safety Gear / PPE Section */}
      {safetyGear.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-2">
            Safety Gear Needed
          </h3>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <div className="flex items-start gap-2">
              <IoShieldCheckmark className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex flex-wrap gap-1.5">
                  {safetyGear.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <button
                  onClick={handleFindPPE}
                  className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Find PPE at Home Depot →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guides Section */}
      {hasGuides && (
        <div>
          <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-2">
            Step-by-Step Guides
          </h3>
          <div className="space-y-2">
            {issue.guides.map((guide, idx) => (
              <div
                key={idx}
                onClick={() => handleGuideClick(guide)}
                className="p-3 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-emerald-500/30 cursor-pointer transition-colors"
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
                  <IoOpenOutline className="w-4 h-4 text-[#555] flex-shrink-0" />
                </div>
              </div>
            ))}
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
            {issue.parts.map((part, idx) => (
              <div
                key={idx}
                onClick={() => handlePartClick(part.name, part.store)}
                className="p-3 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-emerald-500/30 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{part.name}</p>
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
              onClick={handleOrderParts}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <IoStorefront className="w-4 h-4" />
              Order Parts
            </button>
            <button
              onClick={handleGetDirections}
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

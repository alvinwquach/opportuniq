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
import type { Guide, Part } from "../types";

interface DIYTabProps {
  guides: Guide[];
  parts: Part[];
  diyCost: number | null;
  savings: number;
  safetyGear?: string[];
  onOrderParts: () => void;
  onGetDirections: () => void;
  onSwitchToHire: () => void;
}

export function DIYTab({
  guides,
  parts,
  diyCost,
  savings,
  safetyGear = [],
  onOrderParts,
  onGetDirections,
  onSwitchToHire,
}: DIYTabProps) {
  const hasGuides = guides.length > 0;
  const hasParts = parts.length > 0;
  const hasDiyContent = hasGuides || hasParts;

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
                  onClick={() => {
                    const searchTerms = safetyGear.join(" ");
                    window.open(
                      `https://www.homedepot.com/s/${encodeURIComponent(searchTerms + " safety")}`,
                      "_blank"
                    );
                  }}
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
            {guides.map((guide) => (
              <div
                key={guide.id}
                onClick={() => guide.url && window.open(guide.url, "_blank")}
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

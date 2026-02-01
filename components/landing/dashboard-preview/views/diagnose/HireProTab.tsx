"use client";

import { useState } from "react";
import {
  IoCheckmarkCircle,
  IoTime,
  IoLocationSharp,
  IoCallOutline,
  IoClose,
  IoSend,
  IoPeople,
} from "react-icons/io5";
import { FaYelp } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import type { IssueData } from "./types";

interface HireProTabProps {
  issue: IssueData;
  onSwitchToDIY: () => void;
}

export function HireProTab({ issue, onSwitchToDIY }: HireProTabProps) {
  const [selectedProIndices, setSelectedProIndices] = useState<number[]>([]);
  const [emailSent, setEmailSent] = useState(false);

  const hasProContent = issue.pros.length > 0;
  const selectedPros = selectedProIndices.map((idx) => issue.pros[idx]).filter(Boolean);

  const toggleProSelection = (idx: number) => {
    setSelectedProIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
    setEmailSent(false);
  };

  const selectAllPros = () => {
    setSelectedProIndices(issue.pros.map((_, idx) => idx));
    setEmailSent(false);
  };

  const deselectAllPros = () => {
    setSelectedProIndices([]);
    setEmailSent(false);
  };

  if (!hasProContent) {
    return (
      <div className="text-center py-8">
        <IoPeople className="w-10 h-10 text-[#333] mx-auto mb-2" />
        <p className="text-sm text-[#666]">No professionals found</p>
        <p className="text-xs text-[#555] mt-1">Try the DIY option instead</p>
        <button
          onClick={onSwitchToDIY}
          className="mt-4 px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          ← View DIY Guide
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cost Summary */}
      <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-400/70">Estimated Pro Cost</p>
            <p className="text-xl font-bold text-white">${issue.proCost.toFixed(0)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#888]">Includes</p>
            <p className="text-xs text-[#666]">Labor + Parts</p>
          </div>
        </div>
      </div>

      {/* Pros List Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#666]">From Yelp, Angi, Thumbtack</p>
        {issue.pros.length > 1 && (
          <div className="flex items-center gap-3">
            {selectedProIndices.length > 0 && (
              <button
                onClick={deselectAllPros}
                className="text-xs text-[#888] hover:text-white transition-colors"
              >
                Deselect all
              </button>
            )}
            {selectedProIndices.length < issue.pros.length && (
              <button
                onClick={selectAllPros}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Select all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pros List */}
      <div className="space-y-2">
        {issue.pros.map((pro, idx) => {
          const isSelected = selectedProIndices.includes(idx);
          return (
            <div
              key={idx}
              className={`p-3 bg-[#1a1a1a] rounded-xl border transition-colors ${
                isSelected ? "border-emerald-500/50" : "border-[#2a2a2a]"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleProSelection(idx)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      isSelected
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-[#444] hover:border-[#666]"
                    }`}
                  >
                    {isSelected && <IoCheckmarkCircle className="w-4 h-4 text-white" />}
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-white">{pro.name}</p>
                    <div className="flex items-center gap-2 text-xs text-[#888] mt-0.5">
                      <span className="text-amber-400">★ {pro.rating.toFixed(1)}</span>
                      <span>({pro.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                {pro.source === "yelp" && <FaYelp className="w-5 h-5 text-red-400" />}
                {pro.source === "angi" && (
                  <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg font-medium">
                    Angi
                  </span>
                )}
                {pro.source === "thumbtack" && (
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-lg font-medium">
                    Thumbtack
                  </span>
                )}
                {pro.source === "homeadvisor" && (
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg font-medium">
                    HomeAdvisor
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-[#888] mb-3">
                <span className="flex items-center gap-1">
                  <IoLocationSharp className="w-3 h-3" />
                  {pro.distance}
                </span>
                {pro.available && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <IoTime className="w-3 h-3" />
                    {pro.available}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <p className="text-base font-bold text-white">${pro.price.toFixed(0)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleProSelection(idx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <SiGmail className="w-3 h-3" />
                    Quote
                  </button>
                  {pro.phone && (
                    <a
                      href={`tel:${pro.phone.replace(/[^0-9+]/g, "")}`}
                      className="px-2 py-1.5 bg-[#2a2a2a] hover:bg-[#333] text-white text-xs rounded-lg transition-colors flex items-center justify-center"
                      title={`Call ${pro.phone}`}
                    >
                      <IoCallOutline className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Draft RFQs Section */}
      {selectedPros.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SiGmail className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-white">Draft RFQs</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                {selectedPros.length} {selectedPros.length === 1 ? "email" : "emails"}
              </span>
            </div>
          </div>

          {emailSent ? (
            <div className="text-center py-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
              <IoCheckmarkCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">
                {selectedPros.length}{" "}
                {selectedPros.length === 1 ? "email" : "separate emails"} sent!
              </p>
              <p className="text-xs text-[#666] mt-1">
                {selectedPros.map((p) => p.name).join(", ")}
              </p>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setSelectedProIndices([]);
                }}
                className="text-xs text-emerald-400 mt-3 hover:underline"
              >
                Send more RFQs
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-3">
                {selectedProIndices.map((proIdx) => {
                  const pro = issue.pros[proIdx];
                  if (!pro) return null;
                  return (
                    <div
                      key={proIdx}
                      className="p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium">{pro.name}</p>
                        <button
                          onClick={() => toggleProSelection(proIdx)}
                          className="text-[#666] hover:text-red-400 transition-colors"
                        >
                          <IoClose className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[#666]">{pro.email}</p>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] mb-3 text-xs">
                <p className="text-[#666] mb-2">
                  <span className="text-[#555]">Subject:</span> Quote Request - {issue.title}
                </p>
                <div className="text-[#999] leading-relaxed">
                  <p>Hi,</p>
                  <p className="mt-2">
                    I&apos;m reaching out to request a quote for:{" "}
                    <span className="text-white">{issue.title.toLowerCase()}</span>
                  </p>
                  <p className="mt-2">Issue: {issue.diagnosis}</p>
                  <p className="mt-2">
                    Please let me know your availability and estimated cost.
                  </p>
                </div>
              </div>

              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors"
                onClick={() => setEmailSent(true)}
              >
                <IoSend className="w-4 h-4" />
                Send {selectedPros.length} Separate{" "}
                {selectedPros.length === 1 ? "Email" : "Emails"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

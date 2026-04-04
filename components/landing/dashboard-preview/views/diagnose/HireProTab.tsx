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
import { useDarkMode } from "../../DarkModeContext";

interface HireProTabProps {
  issue: IssueData;
  onSwitchToDIY: () => void;
}

export function HireProTab({ issue, onSwitchToDIY }: HireProTabProps) {
  const [selectedProIndices, setSelectedProIndices] = useState<number[]>([]);
  const [emailSent, setEmailSent] = useState(false);
  const dark = useDarkMode();
  const b = dark ? "border-white/[0.06]" : "border-gray-200";

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
        <IoPeople className={`w-10 h-10 mx-auto mb-2 ${dark ? "text-gray-700" : "text-gray-300"}`} />
        <p className={`text-sm ${dark ? "text-gray-500" : "text-gray-500"}`}>No professionals found</p>
        <p className={`text-xs mt-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>Try the DIY option instead</p>
        <button
          onClick={onSwitchToDIY}
          className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-500 transition-colors"
        >
          ← View DIY Guide
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cost Summary */}
      <div className={`p-3 rounded-xl border ${dark ? "bg-blue-900/20 border-blue-500/30" : "bg-blue-50 border-blue-200"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600/70">Estimated Pro Cost</p>
            <p className={`text-xl font-bold ${dark ? "text-gray-100" : "text-gray-900"}`}>${issue.proCost.toFixed(0)}</p>
          </div>
          <div className="text-right">
            <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-500"}`}>Includes</p>
            <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-500"}`}>Labor + Parts</p>
          </div>
        </div>
      </div>

      {/* Pros List Header */}
      <div className="flex items-center justify-between">
        <p className={`text-xs ${dark ? "text-gray-600" : "text-gray-500"}`}>From Yelp, Angi, Thumbtack</p>
        {issue.pros.length > 1 && (
          <div className="flex items-center gap-3">
            {selectedProIndices.length > 0 && (
              <button
                onClick={deselectAllPros}
                className={`text-xs transition-colors ${dark ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-900"}`}
              >
                Deselect all
              </button>
            )}
            {selectedProIndices.length < issue.pros.length && (
              <button
                onClick={selectAllPros}
                className="text-xs text-blue-600 hover:text-blue-500 transition-colors"
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
              className={`p-3 rounded-xl border transition-colors ${
                dark
                  ? isSelected ? "bg-[#252525] border-blue-500/40" : "bg-[#252525] border-white/10"
                  : isSelected ? "bg-white border-blue-200" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleProSelection(idx)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : dark ? "border-white/20 hover:border-white/40" : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {isSelected && <IoCheckmarkCircle className="w-4 h-4 text-white" />}
                  </button>
                  <div>
                    <p className={`text-sm font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>{pro.name}</p>
                    <div className={`flex items-center gap-2 text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-500"}`}>
                      <span className="text-amber-500">★ {pro.rating.toFixed(1)}</span>
                      <span>({pro.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                {pro.source === "yelp" && <FaYelp className="w-5 h-5 text-red-500" />}
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
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${dark ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                    HomeAdvisor
                  </span>
                )}
              </div>
              <div className={`flex items-center gap-4 text-xs mb-3 ${dark ? "text-gray-500" : "text-gray-500"}`}>
                <span className="flex items-center gap-1">
                  <IoLocationSharp className="w-3 h-3" />
                  {pro.distance}
                </span>
                {pro.available && (
                  <span className="flex items-center gap-1 text-blue-500">
                    <IoTime className="w-3 h-3" />
                    {pro.available}
                  </span>
                )}
              </div>
              <div className={`flex items-center justify-between pt-2 border-t ${b}`}>
                <p className={`text-base font-bold ${dark ? "text-gray-100" : "text-gray-900"}`}>${pro.price.toFixed(0)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleProSelection(idx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <SiGmail className="w-3 h-3" />
                    Quote
                  </button>
                  {pro.phone && (
                    <a
                      href={`tel:${pro.phone.replace(/[^0-9+]/g, "")}`}
                      className={`px-2 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-center ${
                        dark ? "bg-white/[0.06] hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                      }`}
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
        <div className={`mt-4 pt-4 border-t ${b}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SiGmail className="w-4 h-4 text-red-500" />
              <span className={`text-sm font-semibold ${dark ? "text-gray-200" : "text-gray-900"}`}>Draft RFQs</span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                {selectedPros.length} {selectedPros.length === 1 ? "email" : "emails"}
              </span>
            </div>
          </div>

          {emailSent ? (
            <div className={`text-center py-4 rounded-xl border ${dark ? "bg-[#252525] border-white/10" : "bg-white border-gray-200"}`}>
              <IoCheckmarkCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className={`text-sm font-medium ${dark ? "text-gray-200" : "text-gray-900"}`}>
                {selectedPros.length}{" "}
                {selectedPros.length === 1 ? "email" : "separate emails"} sent!
              </p>
              <p className={`text-xs mt-1 ${dark ? "text-gray-500" : "text-gray-500"}`}>
                {selectedPros.map((p) => p.name).join(", ")}
              </p>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setSelectedProIndices([]);
                }}
                className="text-xs text-blue-600 mt-3 hover:underline"
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
                      className={`p-3 rounded-lg border text-xs ${dark ? "bg-[#252525] border-white/10" : "bg-white border-gray-200"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-medium ${dark ? "text-gray-200" : "text-gray-900"}`}>{pro.name}</p>
                        <button
                          onClick={() => toggleProSelection(proIdx)}
                          className={`transition-colors ${dark ? "text-gray-600 hover:text-red-400" : "text-gray-500 hover:text-red-600"}`}
                        >
                          <IoClose className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className={dark ? "text-gray-600" : "text-gray-500"}>{pro.email}</p>
                    </div>
                  );
                })}
              </div>

              <div className={`p-3 rounded-lg border mb-3 text-xs ${dark ? "bg-[#1a1a1a] border-white/[0.06]" : "bg-gray-50 border-gray-200"}`}>
                <p className={`mb-2 ${dark ? "text-gray-500" : "text-gray-500"}`}>
                  <span className={dark ? "text-gray-400" : "text-gray-600"}>Subject:</span> Quote Request - {issue.title}
                </p>
                <div className={`leading-relaxed ${dark ? "text-gray-600" : "text-gray-400"}`}>
                  <p>Hi,</p>
                  <p className="mt-2">
                    I&apos;m reaching out to request a quote for:{" "}
                    <span className={dark ? "text-gray-300" : "text-gray-900"}>{issue.title.toLowerCase()}</span>
                  </p>
                  <p className="mt-2">Issue: {issue.diagnosis}</p>
                  <p className="mt-2">
                    Please let me know your availability and estimated cost.
                  </p>
                </div>
              </div>

              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
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

"use client";

import { useState, useTransition } from "react";
import {
  IoCheckmarkCircle,
  IoTime,
  IoLocationSharp,
  IoCallOutline,
  IoClose,
  IoSend,
  IoPeople,
  IoAlertCircle,
} from "react-icons/io5";
import { FaYelp } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { ImSpinner2 } from "react-icons/im";
import type { Pro } from "../types";
import { sendRfqEmails } from "../actions";

interface HireProTabProps {
  pros: Pro[];
  proCost: number | null;
  issueTitle: string;
  issueDiagnosis: string | null;
  issueId: string;
  onSwitchToDIY: () => void;
}

interface SendResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  error?: string;
}

export function HireProTab({
  pros,
  proCost,
  issueTitle,
  issueDiagnosis,
  issueId,
  onSwitchToDIY,
}: HireProTabProps) {
  const [selectedProIndices, setSelectedProIndices] = useState<number[]>([]);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasProContent = pros.length > 0;
  const selectedPros = selectedProIndices.map((idx) => pros[idx]).filter(Boolean);

  const toggleProSelection = (idx: number) => {
    setSelectedProIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
    setSendResult(null);
  };

  const selectAllPros = () => {
    setSelectedProIndices(pros.map((_, idx) => idx));
    setSendResult(null);
  };

  const deselectAllPros = () => {
    setSelectedProIndices([]);
    setSendResult(null);
  };

  const handleSendEmails = () => {
    const prosToEmail = selectedPros.filter((p) => p.email);
    if (prosToEmail.length === 0) return;

    startTransition(async () => {
      const result = await sendRfqEmails({
        issueId,
        issueTitle,
        issueDiagnosis: issueDiagnosis ?? issueTitle,
        pros: prosToEmail.map((p) => ({
          name: p.name,
          email: p.email!,
          phone: p.phone,
          rating: p.rating,
          reviews: p.reviews,
          distance: p.distance,
          price: p.price,
          available: p.available,
          source: p.source,
        })),
      });

      setSendResult({
        success: result.success,
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        error: result.error,
      });
    });
  };

  if (!hasProContent) {
    return (
      <div className="text-center py-8">
        <IoPeople className="w-10 h-10 text-[#333] mx-auto mb-2" />
        <p className="text-sm text-gray-500">No professionals found</p>
        <p className="text-xs text-gray-400 mt-1">Try the DIY option instead</p>
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
      <div className="p-3 bg-blue-50 rounded-xl border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600/70">Estimated Pro Cost</p>
            <p className="text-xl font-bold text-white">${proCost?.toFixed(0) ?? "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Includes</p>
            <p className="text-xs text-gray-500">Labor + Parts</p>
          </div>
        </div>
      </div>

      {/* Pros List Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">From Yelp, Angi, Thumbtack</p>
        {pros.length > 1 && (
          <div className="flex items-center gap-3">
            {selectedProIndices.length > 0 && (
              <button
                onClick={deselectAllPros}
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
              >
                Deselect all
              </button>
            )}
            {selectedProIndices.length < pros.length && (
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
        {pros.map((pro, idx) => {
          const isSelected = selectedProIndices.includes(idx);
          return (
            <div
              key={pro.id}
              className={`p-3 bg-gray-100 rounded-xl border transition-colors ${
                isSelected ? "border-blue-500/50" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleProSelection(idx)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-[#444] hover:border-[#666]"
                    }`}
                  >
                    {isSelected && <IoCheckmarkCircle className="w-4 h-4 text-white" />}
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-white">{pro.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
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
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-lg font-medium">
                    HomeAdvisor
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <IoLocationSharp className="w-3 h-3" />
                  {pro.distance}
                </span>
                {pro.available && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <IoTime className="w-3 h-3" />
                    {pro.available}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <p className="text-base font-bold text-white">${pro.price.toFixed(0)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleProSelection(idx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-gray-900 text-xs font-medium rounded-lg transition-colors"
                  >
                    <SiGmail className="w-3 h-3" />
                    Quote
                  </button>
                  {pro.phone && (
                    <a
                      href={`tel:${pro.phone.replace(/[^0-9+]/g, "")}`}
                      className="px-2 py-1.5 bg-gray-200 hover:bg-[#333] text-gray-900 text-xs rounded-lg transition-colors flex items-center justify-center"
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

      {/* Draft RFQs */}
      {selectedPros.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SiGmail className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-white">Draft RFQs</span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                {selectedPros.length} {selectedPros.length === 1 ? "email" : "emails"}
              </span>
            </div>
          </div>

          {sendResult ? (
            <div className="text-center py-4 bg-gray-100 rounded-xl border border-gray-200">
              {sendResult.success ? (
                <>
                  <IoCheckmarkCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">
                    {sendResult.sentCount}{" "}
                    {sendResult.sentCount === 1 ? "email" : "emails"} sent!
                  </p>
                  {sendResult.failedCount > 0 && (
                    <p className="text-xs text-amber-400 mt-1">
                      {sendResult.failedCount} failed to send
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedPros
                      .filter((p) => p.email)
                      .map((p) => p.name)
                      .join(", ")}
                  </p>
                </>
              ) : (
                <>
                  <IoAlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">
                    Failed to send emails
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {sendResult.error ?? "Please try again"}
                  </p>
                </>
              )}
              <button
                onClick={() => {
                  setSendResult(null);
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
                  const pro = pros[proIdx];
                  if (!pro) return null;
                  return (
                    <div
                      key={proIdx}
                      className="p-3 bg-gray-100 rounded-lg border border-gray-200 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-gray-900 font-medium">{pro.name}</p>
                        <button
                          onClick={() => toggleProSelection(proIdx)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <IoClose className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-gray-500">{pro.email ?? "No email available"}</p>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3 text-xs">
                <p className="text-gray-500 mb-2">
                  <span className="text-gray-400">Subject:</span> Quote Request - {issueTitle}
                </p>
                <div className="text-gray-400 leading-relaxed">
                  <p>Hi,</p>
                  <p className="mt-2">
                    I&apos;m reaching out to request a quote for:{" "}
                    <span className="text-gray-900">{issueTitle.toLowerCase()}</span>
                  </p>
                  <p className="mt-2">Issue: {issueDiagnosis}</p>
                  <p className="mt-2">
                    Please let me know your availability and estimated cost.
                  </p>
                </div>
              </div>

              {selectedPros.filter((p) => p.email).length === 0 ? (
                <p className="text-xs text-amber-400 text-center py-2">
                  No email addresses available for selected professionals
                </p>
              ) : (
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-gray-900 text-sm font-medium rounded-xl transition-colors"
                  onClick={handleSendEmails}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <ImSpinner2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <IoSend className="w-4 h-4" />
                      Send {selectedPros.filter((p) => p.email).length}{" "}
                      {selectedPros.filter((p) => p.email).length === 1
                        ? "Email"
                        : "Emails"}
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

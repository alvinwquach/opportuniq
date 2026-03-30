"use client";

import { useState } from "react";
import { IoCheckmarkCircle, IoTrendingUp, IoTrendingDown } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOutcomeSubmission } from "@/hooks/useOutcomeSubmission";

export interface OutcomeFormProps {
  decisionId: string;
  issueId: string;
  groupId: string;
  /** Predicted cost midpoint from decisionOptions.costMin/costMax (optional) */
  predictedCostMin?: number | null;
  predictedCostMax?: number | null;
  onSuccess?: () => void;
}

type SuccessValue = "success" | "partial" | "failed";

export function OutcomeForm({
  decisionId,
  issueId,
  groupId,
  predictedCostMin,
  predictedCostMax,
  onSuccess,
}: OutcomeFormProps) {
  const [actualCostInput, setActualCostInput] = useState("");
  const [actualTime, setActualTime] = useState("");
  const [successValue, setSuccessValue] = useState<SuccessValue | "">("");
  const [completedAt, setCompletedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const { mutate: submitOutcome, isPending, isSuccess, data } = useOutcomeSubmission();

  // Derived: predicted midpoint
  const hasPredicted =
    predictedCostMin !== null && predictedCostMin !== undefined;
  const predictedMid = hasPredicted
    ? (predictedCostMin! +
        (predictedCostMax !== null && predictedCostMax !== undefined
          ? predictedCostMax
          : predictedCostMin!)) /
      2
    : null;

  const actualCostNum =
    actualCostInput !== "" && !isNaN(Number(actualCostInput))
      ? Number(actualCostInput)
      : null;

  const costDeltaPreview =
    actualCostNum !== null && predictedMid !== null
      ? actualCostNum - predictedMid
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!successValue) {
      setValidationError("Please select an outcome status.");
      return;
    }
    if (!completedAt) {
      setValidationError("Please select a completion date.");
      return;
    }
    if (
      actualCostInput !== "" &&
      (isNaN(Number(actualCostInput)) || Number(actualCostInput) < 0)
    ) {
      setValidationError("Please enter a valid cost.");
      return;
    }

    submitOutcome(
      {
        decisionId,
        issueId,
        groupId,
        actualCost: actualCostNum,
        actualTime: actualTime.trim() || null,
        success: successValue === "success" || successValue === "partial",
        completedAt: new Date(completedAt).toISOString(),
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => onSuccess?.(),
      }
    );
  };

  if (isSuccess && data) {
    const delta =
      data.outcome.costDelta !== null ? parseFloat(data.outcome.costDelta) : null;

    return (
      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-400 flex items-center gap-2">
            <IoCheckmarkCircle className="w-4 h-4 shrink-0" />
            Outcome recorded — thanks for the feedback!
          </p>
        </div>

        {delta !== null && predictedMid !== null && (
          <div className="p-3 rounded-lg bg-[#141414] border border-[#2a2a2a] space-y-1">
            <p className="text-xs text-[#666] font-medium">Predicted vs Actual</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9a9a9a]">Predicted</span>
              <span className="text-white">${predictedMid.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9a9a9a]">Actual</span>
              <span className="text-white">
                ${parseFloat(data.outcome.actualCost ?? "0").toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm pt-1 border-t border-[#2a2a2a]">
              <span className="text-[#9a9a9a]">Delta</span>
              <span
                className={`flex items-center gap-1 font-medium ${
                  delta > 0 ? "text-red-400" : delta < 0 ? "text-teal-400" : "text-[#9a9a9a]"
                }`}
              >
                {delta > 0 ? (
                  <IoTrendingUp className="w-3.5 h-3.5" />
                ) : delta < 0 ? (
                  <IoTrendingDown className="w-3.5 h-3.5" />
                ) : null}
                {delta > 0 ? "+" : ""}${delta.toFixed(2)}
                {delta > 0 ? " over" : delta < 0 ? " under" : " on target"}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[#9a9a9a]">How did it go?</p>

      {/* Outcome status */}
      <div className="space-y-1.5">
        <Label className="text-xs text-[#666]">Outcome *</Label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: "success", label: "Success", color: "text-green-400 border-green-500/30 bg-green-500/5" },
              { value: "partial", label: "Partial", color: "text-amber-400 border-amber-500/30 bg-amber-500/5" },
              { value: "failed", label: "Failed", color: "text-red-400 border-red-500/30 bg-red-500/5" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSuccessValue(opt.value)}
              className={`py-2 rounded-lg border text-xs font-medium transition-colors ${
                successValue === opt.value
                  ? opt.color
                  : "border-[#1f1f1f] text-[#666] hover:border-[#2a2a2a]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cost + time row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="actual-cost" className="text-xs text-[#666]">
            Actual cost ($)
          </Label>
          <Input
            id="actual-cost"
            type="number"
            min="0"
            step="0.01"
            placeholder={predictedMid ? `Predicted ~$${predictedMid.toFixed(0)}` : "e.g. 250"}
            value={actualCostInput}
            onChange={(e) => setActualCostInput(e.target.value)}
            className="h-8 text-sm bg-[#0c0c0c] border-[#1f1f1f]"
          />
          {costDeltaPreview !== null && (
            <p
              className={`text-xs ${
                costDeltaPreview > 0 ? "text-red-400" : "text-teal-400"
              }`}
            >
              {costDeltaPreview > 0 ? "+" : ""}${costDeltaPreview.toFixed(2)} vs estimate
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="actual-time" className="text-xs text-[#666]">
            Time taken
          </Label>
          <Input
            id="actual-time"
            type="text"
            placeholder="e.g. 3 hours"
            value={actualTime}
            onChange={(e) => setActualTime(e.target.value)}
            className="h-8 text-sm bg-[#0c0c0c] border-[#1f1f1f]"
          />
        </div>
      </div>

      {/* Completion date */}
      <div className="space-y-1.5">
        <Label htmlFor="completed-at" className="text-xs text-[#666]">
          Completed on *
        </Label>
        <Input
          id="completed-at"
          type="date"
          value={completedAt}
          onChange={(e) => setCompletedAt(e.target.value)}
          className="h-8 text-sm bg-[#0c0c0c] border-[#1f1f1f]"
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="outcome-notes" className="text-xs text-[#666]">
          Notes (optional)
        </Label>
        <Textarea
          id="outcome-notes"
          placeholder="What worked? What didn't? Any lessons for next time?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="text-sm bg-[#0c0c0c] border-[#1f1f1f] resize-none"
          rows={2}
        />
      </div>

      {validationError && (
        <p className="text-xs text-red-400">{validationError}</p>
      )}

      <Button type="submit" size="sm" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : "Record Outcome"}
      </Button>
    </form>
  );
}

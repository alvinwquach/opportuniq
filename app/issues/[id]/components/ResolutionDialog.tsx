"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  IoConstruct,
  IoPerson,
  IoSwapHorizontal,
  IoStopCircle,
  IoTime,
  IoEye,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { setIssueResolution, getDecisionForIssue, type DecisionSummary } from "../../actions";
import { OutcomeForm } from "@/components/dashboard/OutcomeForm";
import { trackIssueResolved } from "@/lib/analytics";

interface ResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: string;
  onComplete: () => void;
}

type Step = "resolution" | "outcome";

type ResolutionType = "diy" | "hired" | "replaced" | "abandoned" | "deferred" | "monitoring";

const resolutionOptions: {
  type: ResolutionType;
  label: string;
  description: string;
  icon: typeof IoConstruct;
  color: string;
}[] = [
  {
    type: "diy",
    label: "Fixed it myself (DIY)",
    description: "I resolved this issue on my own or with household help",
    icon: IoConstruct,
    color: "text-green-500",
  },
  {
    type: "hired",
    label: "Hired a professional",
    description: "A contractor or service provider handled this",
    icon: IoPerson,
    color: "text-[#00D4FF]",
  },
  {
    type: "replaced",
    label: "Replaced the item",
    description: "Bought a new one instead of repairing",
    icon: IoSwapHorizontal,
    color: "text-purple-400",
  },
  {
    type: "abandoned",
    label: "Gave up / Not worth it",
    description: "Decided not to pursue this further",
    icon: IoStopCircle,
    color: "text-red-400",
  },
  {
    type: "deferred",
    label: "Postponed for later",
    description: "Will revisit this at a future date",
    icon: IoTime,
    color: "text-amber-500",
  },
  {
    type: "monitoring",
    label: "Watching and waiting",
    description: "Keeping an eye on it to see if it worsens",
    icon: IoEye,
    color: "text-[#666]",
  },
];

export function ResolutionDialog({
  isOpen,
  onClose,
  issueId,
  onComplete,
}: ResolutionDialogProps) {
  const [step, setStep] = useState<Step>("resolution");
  const [selectedType, setSelectedType] = useState<ResolutionType | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<DecisionSummary | null>(null);

  const handleSubmit = async () => {
    if (!selectedType) {
      setError("Please select a resolution type");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await setIssueResolution(issueId, {
        type: selectedType,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        // Map resolution type to PostHog event value
        const resolutionTypeMap: Record<ResolutionType, "diy" | "hired_pro" | "deferred"> = {
          diy: "diy",
          hired: "hired_pro",
          replaced: "hired_pro",
          abandoned: "deferred",
          deferred: "deferred",
          monitoring: "deferred",
        };
        trackIssueResolved({ issueId, resolutionType: resolutionTypeMap[selectedType] });

        // Try to advance to outcome step if there's a decision
        const decisionResult = await getDecisionForIssue(issueId);
        if (decisionResult.success && decisionResult.decision && !decisionResult.decision.hasOutcome) {
          setDecision(decisionResult.decision);
          setStep("outcome");
        } else {
          onComplete();
          onClose();
          setSelectedType(null);
          setNotes("");
        }
      } else {
        setError(result.error || "Failed to set resolution");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Resolution error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      onClose();
      setError(null);
      setStep("resolution");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[#161616] border-[#1f1f1f]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
            {step === "resolution" ? "Resolve Issue" : "Record Outcome"}
          </DialogTitle>
        </DialogHeader>

        {step === "outcome" && decision ? (
          <div className="py-2">
            <OutcomeForm
              decisionId={decision.decisionId}
              issueId={issueId}
              groupId={decision.groupId}
              predictedCostMin={decision.costMin ? parseFloat(decision.costMin) : null}
              predictedCostMax={decision.costMax ? parseFloat(decision.costMax) : null}
              onSuccess={() => {
                onComplete();
                onClose();
                setStep("resolution");
              }}
            />
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { onComplete(); onClose(); setStep("resolution"); }}
                className="text-xs text-[#666] hover:text-[#9a9a9a]"
              >
                Skip for now
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <p className="text-sm text-[#9a9a9a]">
                How was this issue resolved? This helps track outcomes and improve future recommendations.
              </p>

              {/* Resolution options */}
              <div className="space-y-2">
                {resolutionOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedType === option.type;

                  return (
                    <button
                      key={option.type}
                      onClick={() => setSelectedType(option.type)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${
                        isSelected
                          ? "border-[#00D4FF] bg-[#00D4FF]/5"
                          : "border-[#1f1f1f] hover:border-[#2a2a2a] hover:bg-[#1a1a1a]"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-[#00D4FF]/10" : "bg-[#1f1f1f]"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected ? option.color : "text-[#666]"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isSelected ? "text-white" : "text-[#9a9a9a]"
                          }`}
                        >
                          {option.label}
                        </p>
                        <p className="text-xs text-[#666] mt-0.5">
                          {option.description}
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 transition-colors flex items-center justify-center ${
                          isSelected
                            ? "border-[#00D4FF] bg-[#00D4FF]"
                            : "border-[#2a2a2a]"
                        }`}
                      >
                        {isSelected && (
                          <IoCheckmarkCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs font-medium text-[#666]">
                  Notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about the resolution, lessons learned, costs, etc."
                  rows={3}
                  className="bg-[#0c0c0c] border-[#1f1f1f] text-white placeholder:text-[#666] focus:border-[#00D4FF]/50 resize-none"
                />
              </div>

              {/* Error message */}
              {error && (
                <p className="text-xs text-red-400 px-1">{error}</p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                className="text-[#9a9a9a] hover:text-white hover:bg-[#1f1f1f]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedType}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircle className="w-4 h-4 mr-2" />
                    Resolve Issue
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

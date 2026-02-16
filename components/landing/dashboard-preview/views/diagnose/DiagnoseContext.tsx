"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import type { IssueData } from "./types";
import { useProgressiveReveal, RevealState, RevealPhase } from "./useProgressiveReveal";

interface DiagnoseContextValue {
  // Current issue
  selectedIssue: IssueData | null;
  setSelectedIssue: (issue: IssueData | null) => void;

  // Creating new issue state
  isCreatingNewIssue: boolean;
  setIsCreatingNewIssue: (value: boolean) => void;

  // Progressive reveal state
  revealState: RevealState & {
    reset: () => void;
    skipToComplete: () => void;
    isLoading: boolean;
    isComplete: boolean;
  };

  // Computed helpers
  canShowCost: boolean;
  visibleGuideCount: number;
  visiblePartCount: number;
  canShowTools: boolean;
  canShowSafety: boolean;

  // Phase messages for UI
  phaseMessage: string | null;
}

const DiagnoseContext = createContext<DiagnoseContextValue | null>(null);

export function useDiagnoseContext() {
  const context = useContext(DiagnoseContext);
  if (!context) {
    throw new Error("useDiagnoseContext must be used within DiagnoseProvider");
  }
  return context;
}

interface DiagnoseProviderProps {
  children: ReactNode;
  initialIssue?: IssueData | null;
}

export function DiagnoseProvider({ children, initialIssue = null }: DiagnoseProviderProps) {
  const [selectedIssue, setSelectedIssueInternal] = useState<IssueData | null>(initialIssue);
  const [isCreatingNewIssue, setIsCreatingNewIssue] = useState(false);

  // Calculate totals for reveal
  const totalGuides = selectedIssue?.guides.length ?? 0;
  // Include PPE parts in count (matching ResourcePanel logic)
  const totalParts = selectedIssue?.parts.length ?? 0;
  const ppeCount = selectedIssue?.difficulty.includes("Professional") ? 0 : 2; // Approximate PPE items
  const totalPartsWithPPE = totalParts + ppeCount;

  const revealState = useProgressiveReveal(
    selectedIssue?.title ?? null,
    {
      totalGuides,
      totalParts: totalPartsWithPPE,
    }
  );

  // Wrapper to handle issue selection
  const setSelectedIssue = useCallback((issue: IssueData | null) => {
    if (issue) {
      setIsCreatingNewIssue(false);
    }
    setSelectedIssueInternal(issue);
  }, []);

  // Computed helpers for determining what to show
  const canShowCost = revealState.costRevealed;
  const visibleGuideCount = revealState.guidesRevealed;
  const visiblePartCount = revealState.partsRevealed;
  const canShowTools = revealState.toolsRevealed;
  const canShowSafety = revealState.safetyRevealed;

  // Phase-specific messages
  const phaseMessage = useMemo(() => {
    switch (revealState.phase) {
      case "analyzing":
        return "Analyzing your issue...";
      case "diagnosis":
        return "Understanding the problem...";
      case "researching":
        return "Finding the best solutions...";
      case "cost":
        return "Calculating costs...";
      case "guides":
        return "Finding step-by-step guides...";
      case "parts":
        return "Locating parts nearby...";
      case "tools":
        return "Checking tool requirements...";
      default:
        return null;
    }
  }, [revealState.phase]);

  const value = useMemo<DiagnoseContextValue>(() => ({
    selectedIssue,
    setSelectedIssue,
    isCreatingNewIssue,
    setIsCreatingNewIssue,
    revealState,
    canShowCost,
    visibleGuideCount,
    visiblePartCount,
    canShowTools,
    canShowSafety,
    phaseMessage,
  }), [
    selectedIssue,
    setSelectedIssue,
    isCreatingNewIssue,
    setIsCreatingNewIssue,
    revealState,
    canShowCost,
    visibleGuideCount,
    visiblePartCount,
    canShowTools,
    canShowSafety,
    phaseMessage,
  ]);

  return (
    <DiagnoseContext.Provider value={value}>
      {children}
    </DiagnoseContext.Provider>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type RevealPhase =
  | "idle"
  | "analyzing"      // Initial analysis
  | "diagnosis"      // Streaming diagnosis text
  | "researching"    // Finding guides/parts
  | "cost"           // Reveal cost summary
  | "guides"         // Reveal guides one by one
  | "parts"          // Reveal parts one by one
  | "tools"          // Reveal tool checklist
  | "complete";      // All revealed

export interface RevealState {
  phase: RevealPhase;
  diagnosisProgress: number;      // 0-100 for diagnosis text
  guidesRevealed: number;         // Number of guides shown
  partsRevealed: number;          // Number of parts shown
  costRevealed: boolean;
  toolsRevealed: boolean;
  safetyRevealed: boolean;
}

interface UseProgressiveRevealOptions {
  totalGuides: number;
  totalParts: number;
  onPhaseChange?: (phase: RevealPhase) => void;
  // Timing options (in ms)
  analyzingDuration?: number;
  diagnosisDuration?: number;
  researchingDuration?: number;
  guideRevealInterval?: number;
  partRevealInterval?: number;
}

const defaultOptions: Required<Omit<UseProgressiveRevealOptions, 'totalGuides' | 'totalParts' | 'onPhaseChange'>> = {
  analyzingDuration: 800,
  diagnosisDuration: 1500,
  researchingDuration: 600,
  guideRevealInterval: 300,
  partRevealInterval: 250,
};

export function useProgressiveReveal(
  issueId: string | null,
  options: UseProgressiveRevealOptions
) {
  const {
    totalGuides,
    totalParts,
    onPhaseChange,
    analyzingDuration = defaultOptions.analyzingDuration,
    diagnosisDuration = defaultOptions.diagnosisDuration,
    researchingDuration = defaultOptions.researchingDuration,
    guideRevealInterval = defaultOptions.guideRevealInterval,
    partRevealInterval = defaultOptions.partRevealInterval,
  } = options;

  const [state, setState] = useState<RevealState>({
    phase: "idle",
    diagnosisProgress: 0,
    guidesRevealed: 0,
    partsRevealed: 0,
    costRevealed: false,
    toolsRevealed: false,
    safetyRevealed: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousIssueRef = useRef<string | null>(null);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    clearTimers();
    setState({
      phase: "idle",
      diagnosisProgress: 0,
      guidesRevealed: 0,
      partsRevealed: 0,
      costRevealed: false,
      toolsRevealed: false,
      safetyRevealed: false,
    });
  }, [clearTimers]);

  // Skip to complete (for users who want to skip animations)
  const skipToComplete = useCallback(() => {
    clearTimers();
    setState({
      phase: "complete",
      diagnosisProgress: 100,
      guidesRevealed: totalGuides,
      partsRevealed: totalParts,
      costRevealed: true,
      toolsRevealed: true,
      safetyRevealed: true,
    });
  }, [clearTimers, totalGuides, totalParts]);

  // Start the reveal sequence
  const startReveal = useCallback(() => {
    clearTimers();

    // Phase 1: Analyzing
    setState(prev => ({ ...prev, phase: "analyzing" }));
    onPhaseChange?.("analyzing");

    timeoutRef.current = setTimeout(() => {
      // Phase 2: Diagnosis streaming
      setState(prev => ({ ...prev, phase: "diagnosis" }));
      onPhaseChange?.("diagnosis");

      let progress = 0;
      intervalRef.current = setInterval(() => {
        progress += 5;
        if (progress >= 100) {
          clearInterval(intervalRef.current!);
          setState(prev => ({ ...prev, diagnosisProgress: 100 }));

          // Phase 3: Researching
          timeoutRef.current = setTimeout(() => {
            setState(prev => ({ ...prev, phase: "researching" }));
            onPhaseChange?.("researching");

            // Phase 4: Cost reveal
            timeoutRef.current = setTimeout(() => {
              setState(prev => ({
                ...prev,
                phase: "cost",
                costRevealed: true
              }));
              onPhaseChange?.("cost");

              // Phase 5: Guides reveal (one by one)
              timeoutRef.current = setTimeout(() => {
                setState(prev => ({ ...prev, phase: "guides" }));
                onPhaseChange?.("guides");

                let guidesShown = 0;
                if (totalGuides > 0) {
                  intervalRef.current = setInterval(() => {
                    guidesShown++;
                    setState(prev => ({ ...prev, guidesRevealed: guidesShown }));

                    if (guidesShown >= totalGuides) {
                      clearInterval(intervalRef.current!);
                      revealParts();
                    }
                  }, guideRevealInterval);
                } else {
                  revealParts();
                }
              }, 200);
            }, researchingDuration);
          }, 100);
        } else {
          setState(prev => ({ ...prev, diagnosisProgress: progress }));
        }
      }, diagnosisDuration / 20);
    }, analyzingDuration);

    function revealParts() {
      setState(prev => ({ ...prev, phase: "parts" }));
      onPhaseChange?.("parts");

      let partsShown = 0;
      if (totalParts > 0) {
        intervalRef.current = setInterval(() => {
          partsShown++;
          setState(prev => ({ ...prev, partsRevealed: partsShown }));

          if (partsShown >= totalParts) {
            clearInterval(intervalRef.current!);
            revealTools();
          }
        }, partRevealInterval);
      } else {
        revealTools();
      }
    }

    function revealTools() {
      setState(prev => ({ ...prev, phase: "tools", toolsRevealed: true }));
      onPhaseChange?.("tools");

      // Final: Safety and complete
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          phase: "complete",
          safetyRevealed: true
        }));
        onPhaseChange?.("complete");
      }, 300);
    }
  }, [
    clearTimers,
    onPhaseChange,
    analyzingDuration,
    diagnosisDuration,
    researchingDuration,
    guideRevealInterval,
    partRevealInterval,
    totalGuides,
    totalParts,
  ]);

  // Trigger reveal when issue changes
  useEffect(() => {
    if (issueId && issueId !== previousIssueRef.current) {
      previousIssueRef.current = issueId;
      startReveal();
    } else if (!issueId) {
      previousIssueRef.current = null;
      reset();
    }
  }, [issueId, startReveal, reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
    ...state,
    reset,
    skipToComplete,
    isLoading: state.phase !== "idle" && state.phase !== "complete",
    isComplete: state.phase === "complete",
  };
}

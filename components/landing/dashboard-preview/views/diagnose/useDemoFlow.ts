"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type DemoPhase =
  | "idle"           // No issue selected
  | "streaming"      // AI is streaming the diagnosis
  | "researching"    // Showing tool call indicators
  | "revealing"      // Progressive reveal of resources
  | "complete";      // Everything shown, interactive

export interface DemoFlowState {
  phase: DemoPhase;
  // Diagnosis streaming
  streamedDiagnosis: string;
  diagnosisComplete: boolean;
  // Tool call indicators
  visibleToolCalls: number;
  // Resource reveal progress
  showCost: boolean;
  visibleGuides: number;
  visibleParts: number;
  showTools: boolean;
  showSafety: boolean;
}

interface UseDemoFlowOptions {
  diagnosis: string;
  totalGuides: number;
  totalParts: number;
  // Timing (ms)
  streamSpeed?: number;        // ms per character chunk
  charsPerTick?: number;       // characters per tick
  researchDelay?: number;      // delay before revealing resources
  guideRevealDelay?: number;   // delay between each guide
  partRevealDelay?: number;    // delay between each part
}

const DEFAULT_OPTIONS = {
  streamSpeed: 20,
  charsPerTick: 3,
  researchDelay: 2200,
  guideRevealDelay: 200,
  partRevealDelay: 150,
};

export function useDemoFlow(issueId: string | null, options: UseDemoFlowOptions) {
  const {
    diagnosis,
    totalGuides,
    totalParts,
    streamSpeed = DEFAULT_OPTIONS.streamSpeed,
    charsPerTick = DEFAULT_OPTIONS.charsPerTick,
    researchDelay = DEFAULT_OPTIONS.researchDelay,
    guideRevealDelay = DEFAULT_OPTIONS.guideRevealDelay,
    partRevealDelay = DEFAULT_OPTIONS.partRevealDelay,
  } = options;

  const [state, setState] = useState<DemoFlowState>({
    phase: "idle",
    streamedDiagnosis: "",
    diagnosisComplete: false,
    visibleToolCalls: 0,
    showCost: false,
    visibleGuides: 0,
    visibleParts: 0,
    showTools: false,
    showSafety: false,
  });

  const intervalsRef = useRef<NodeJS.Timeout[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const previousIssueRef = useRef<string | null>(null);

  // Clear all timers
  const clearTimers = useCallback(() => {
    intervalsRef.current.forEach(clearInterval);
    timeoutsRef.current.forEach(clearTimeout);
    intervalsRef.current = [];
    timeoutsRef.current = [];
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    clearTimers();
    setState({
      phase: "idle",
      streamedDiagnosis: "",
      diagnosisComplete: false,
      visibleToolCalls: 0,
      showCost: false,
      visibleGuides: 0,
      visibleParts: 0,
      showTools: false,
      showSafety: false,
    });
  }, [clearTimers]);

  // Skip to complete (for impatient users)
  const skipToComplete = useCallback(() => {
    clearTimers();
    setState({
      phase: "complete",
      streamedDiagnosis: diagnosis,
      diagnosisComplete: true,
      visibleToolCalls: 4,
      showCost: true,
      visibleGuides: totalGuides,
      visibleParts: totalParts,
      showTools: true,
      showSafety: true,
    });
  }, [clearTimers, diagnosis, totalGuides, totalParts]);

  // Start the demo flow
  const startFlow = useCallback(() => {
    clearTimers();

    // Phase 1: Start streaming diagnosis
    setState(prev => ({
      ...prev,
      phase: "streaming",
      streamedDiagnosis: "",
      diagnosisComplete: false,
      showCost: false,
      visibleGuides: 0,
      visibleParts: 0,
      showTools: false,
      showSafety: false,
    }));

    let charIndex = 0;
    const streamInterval = setInterval(() => {
      if (charIndex < diagnosis.length) {
        charIndex = Math.min(charIndex + charsPerTick, diagnosis.length);
        setState(prev => ({
          ...prev,
          streamedDiagnosis: diagnosis.slice(0, charIndex),
        }));
      } else {
        clearInterval(streamInterval);
        setState(prev => ({
          ...prev,
          diagnosisComplete: true,
          phase: "researching",
        }));

        // Phase 2: Show tool call indicators one by one
        const TOOL_CALL_INTERVAL = 500;
        const NUM_TOOL_CALLS = 4;
        let toolCallsShown = 0;
        const toolCallInterval = setInterval(() => {
          toolCallsShown++;
          setState(prev => ({ ...prev, visibleToolCalls: toolCallsShown }));
          if (toolCallsShown >= NUM_TOOL_CALLS) {
            clearInterval(toolCallInterval);
          }
        }, TOOL_CALL_INTERVAL);
        intervalsRef.current.push(toolCallInterval);

        const researchTimeout = setTimeout(() => {
          setState(prev => ({ ...prev, phase: "revealing", showCost: true }));

          // Phase 3: Reveal guides one by one
          let guidesShown = 0;
          const guideInterval = setInterval(() => {
            if (guidesShown < totalGuides) {
              guidesShown++;
              setState(prev => ({ ...prev, visibleGuides: guidesShown }));
            } else {
              clearInterval(guideInterval);

              // Reveal parts one by one
              let partsShown = 0;
              const partInterval = setInterval(() => {
                if (partsShown < totalParts) {
                  partsShown++;
                  setState(prev => ({ ...prev, visibleParts: partsShown }));
                } else {
                  clearInterval(partInterval);

                  // Show tools
                  const toolsTimeout = setTimeout(() => {
                    setState(prev => ({ ...prev, showTools: true }));

                    // Show safety and complete
                    const safetyTimeout = setTimeout(() => {
                      setState(prev => ({
                        ...prev,
                        showSafety: true,
                        phase: "complete",
                      }));
                    }, 200);
                    timeoutsRef.current.push(safetyTimeout);
                  }, 150);
                  timeoutsRef.current.push(toolsTimeout);
                }
              }, partRevealDelay);
              intervalsRef.current.push(partInterval);
            }
          }, guideRevealDelay);
          intervalsRef.current.push(guideInterval);
        }, researchDelay);
        timeoutsRef.current.push(researchTimeout);
      }
    }, streamSpeed);
    intervalsRef.current.push(streamInterval);
  }, [
    clearTimers,
    diagnosis,
    totalGuides,
    totalParts,
    streamSpeed,
    charsPerTick,
    researchDelay,
    guideRevealDelay,
    partRevealDelay,
  ]);

  // Trigger flow when issue changes
  useEffect(() => {
    if (issueId && issueId !== previousIssueRef.current) {
      previousIssueRef.current = issueId;
      startFlow();
    } else if (!issueId) {
      previousIssueRef.current = null;
      reset();
    }
    return () => {
      // Reset ref so Strict Mode's cleanup+re-run correctly restarts the flow
      previousIssueRef.current = null;
      clearTimers();
    };
  }, [issueId, startFlow, reset, clearTimers]);

  return {
    ...state,
    reset,
    skipToComplete,
    isStreaming: state.phase === "streaming",
    isResearching: state.phase === "researching",
    isRevealing: state.phase === "revealing",
    isComplete: state.phase === "complete",
    isLoading: state.phase === "streaming" || state.phase === "researching",
  };
}

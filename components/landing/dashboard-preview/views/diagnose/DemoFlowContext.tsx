"use client";

import { createContext, useContext, useMemo, useEffect, ReactNode } from "react";
import { useDemoFlow, DemoFlowState } from "./useDemoFlow";
import type { IssueData } from "./types";

interface DemoFlowContextValue extends DemoFlowState {
  reset: () => void;
  skipToComplete: () => void;
  isStreaming: boolean;
  isResearching: boolean;
  isRevealing: boolean;
  isComplete: boolean;
  isLoading: boolean;
}

const DemoFlowContext = createContext<DemoFlowContextValue | null>(null);

export function useDemoFlowContext() {
  const context = useContext(DemoFlowContext);
  if (!context) {
    throw new Error("useDemoFlowContext must be used within DemoFlowProvider");
  }
  return context;
}

// Safe hook that returns null if not in provider
export function useDemoFlowContextSafe(): DemoFlowContextValue | null {
  return useContext(DemoFlowContext);
}

interface DemoFlowProviderProps {
  children: ReactNode;
  issue: IssueData | null;
  /** Skip straight to complete state — use in landing page previews */
  skipToComplete?: boolean;
}

export function DemoFlowProvider({ children, issue, skipToComplete: autoComplete = false }: DemoFlowProviderProps) {
  // Calculate totals including PPE
  const totalGuides = issue?.guides.length ?? 0;
  const baseParts = issue?.parts.length ?? 0;
  const ppeCount = issue && !issue.difficulty.includes("Professional") ? 2 : 0;
  const totalParts = baseParts + ppeCount;

  const demoFlow = useDemoFlow(
    issue?.title ?? null,
    {
      diagnosis: issue?.diagnosis ?? "",
      totalGuides,
      totalParts,
    }
  );

  // For landing page previews: jump straight to complete so visitors see the full UI
  useEffect(() => {
    if (autoComplete && issue) {
      demoFlow.skipToComplete();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoComplete, issue?.title]);

  const value = useMemo(() => demoFlow, [demoFlow]);

  return (
    <DemoFlowContext.Provider value={value}>
      {children}
    </DemoFlowContext.Provider>
  );
}

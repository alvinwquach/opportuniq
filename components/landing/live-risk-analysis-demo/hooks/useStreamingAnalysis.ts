import { useEffect, useRef, useState, useCallback } from "react";
import type { CardId, DemoScenario } from "../types";
import { STREAMING_PHASES, CARD_ANIMATION_DELAY } from "../data";

interface UseStreamingAnalysisOptions {
  scenario: DemoScenario;
  mounted: boolean;
  sectionRef: React.RefObject<HTMLElement | null>;
}

interface UseStreamingAnalysisReturn {
  isStreaming: boolean;
  streamedText: string[];
  analysisComplete: boolean;
  visibleCards: CardId[];
  startStreaming: () => Promise<void>;
  resetAnalysis: () => void;
}

export function useStreamingAnalysis({
  scenario,
  mounted,
  sectionRef,
}: UseStreamingAnalysisOptions): UseStreamingAnalysisReturn {
  const hasAutoStarted = useRef(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState<string[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [visibleCards, setVisibleCards] = useState<CardId[]>([]);

  const startStreaming = useCallback(async () => {
    setIsStreaming(true);
    setStreamedText([]);
    setVisibleCards([]);
    setAnalysisComplete(false);

    const phases = STREAMING_PHASES[scenario.id];

    for (const phase of phases) {
      // Stream each message in the phase
      for (const message of phase.messages) {
        await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 150));
        setStreamedText((prev) => [...prev, message]);
      }

      // Reveal the card after the phase messages
      if (phase.cardToReveal) {
        await new Promise((resolve) => setTimeout(resolve, CARD_ANIMATION_DELAY));
        setVisibleCards((prev) => [...prev, phase.cardToReveal!]);
      }
    }

    setIsStreaming(false);
    setAnalysisComplete(true);
  }, [scenario.id]);

  const resetAnalysis = useCallback(() => {
    setStreamedText([]);
    setVisibleCards([]);
    setAnalysisComplete(false);
    hasAutoStarted.current = false;
  }, []);

  // Auto-start analysis when section scrolls into view
  useEffect(() => {
    if (!mounted || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAutoStarted.current && !isStreaming && !analysisComplete) {
            hasAutoStarted.current = true;
            setTimeout(() => {
              startStreaming();
            }, 800);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [mounted, isStreaming, analysisComplete, startStreaming, sectionRef]);

  return {
    isStreaming,
    streamedText,
    analysisComplete,
    visibleCards,
    startStreaming,
    resetAnalysis,
  };
}

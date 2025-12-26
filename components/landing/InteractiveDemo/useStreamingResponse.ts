"use client";

import { useState, useCallback, useRef } from "react";
import type { StreamingCardType } from "./types";

interface UseStreamingResponseOptions {
  delays?: number[];
  onComplete?: () => void;
}

const DEFAULT_DELAYS = [200, 400, 400, 400];

export function useStreamingResponse(options: UseStreamingResponseOptions = {}) {
  const { delays = DEFAULT_DELAYS, onComplete } = options;

  const [visibleCards, setVisibleCards] = useState<StreamingCardType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const cardOrder: StreamingCardType[] = ["diagnosis", "risks", "budget", "options"];

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const startStreaming = useCallback(() => {
    clearTimeouts();
    setVisibleCards([]);
    setIsStreaming(true);

    let cumulativeDelay = 0;

    cardOrder.forEach((card, index) => {
      cumulativeDelay += delays[index] || 400;

      const timeout = setTimeout(() => {
        setVisibleCards(prev => [...prev, card]);

        if (index === cardOrder.length - 1) {
          setTimeout(() => {
            setIsStreaming(false);
            onComplete?.();
          }, 200);
        }
      }, cumulativeDelay);

      timeoutsRef.current.push(timeout);
    });
  }, [delays, onComplete, clearTimeouts]);

  const reset = useCallback(() => {
    clearTimeouts();
    setVisibleCards([]);
    setIsStreaming(false);
  }, [clearTimeouts]);

  const isCardVisible = useCallback((card: StreamingCardType) => {
    return visibleCards.includes(card);
  }, [visibleCards]);

  return {
    visibleCards,
    isStreaming,
    startStreaming,
    reset,
    isCardVisible,
  };
}

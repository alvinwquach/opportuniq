/**
 * Hook for translating text between languages.
 *
 * Provides translation toggle functionality with caching.
 */

import { useState, useCallback, useRef } from "react";

// ============================================
// TYPES
// ============================================

interface TranslationCache {
  [key: string]: string; // `${messageId}-${targetLanguage}` -> translated text
}

interface UseTranslationOptions {
  defaultTargetLanguage?: string;
  onError?: (error: Error) => void;
}

export interface UseTranslationResult {
  // State
  isTranslating: boolean;
  error: string | null;

  // Actions
  translate: (
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    messageId: string
  ) => Promise<string | null>;
  getTranslation: (messageId: string, targetLanguage: string) => string | null;
  clearCache: () => void;
  clearError: () => void;
}

// ============================================
// HOOK
// ============================================

export function useTranslation({
  onError,
}: UseTranslationOptions = {}): UseTranslationResult {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache translations to avoid re-fetching
  const cacheRef = useRef<TranslationCache>({});

  // Get cache key
  const getCacheKey = (messageId: string, targetLanguage: string): string => {
    return `${messageId}-${targetLanguage}`;
  };

  // Get cached translation
  const getTranslation = useCallback(
    (messageId: string, targetLanguage: string): string | null => {
      const key = getCacheKey(messageId, targetLanguage);
      return cacheRef.current[key] || null;
    },
    []
  );

  // Translate text
  const translate = useCallback(
    async (
      text: string,
      sourceLanguage: string,
      targetLanguage: string,
      messageId: string
    ): Promise<string | null> => {
      // Check cache first
      const cacheKey = getCacheKey(messageId, targetLanguage);
      const cached = cacheRef.current[cacheKey];
      if (cached) {
        return cached;
      }

      // Skip if same language
      if (sourceLanguage === targetLanguage) {
        return text;
      }

      setIsTranslating(true);
      setError(null);

      try {
        const response = await fetch("/api/voice/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            sourceLanguage,
            targetLanguage,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Translation failed: ${response.status}`);
        }

        const result = await response.json();
        const translatedText = result.translatedText;

        // Cache the translation
        cacheRef.current[cacheKey] = translatedText;

        return translatedText;
      } catch (err) {
        const error = err as Error;
        console.error("[useTranslation] Error:", error);
        setError(error.message || "Translation failed");
        onError?.(error);
        return null;
      } finally {
        setIsTranslating(false);
      }
    },
    [onError]
  );

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isTranslating,
    error,
    translate,
    getTranslation,
    clearCache,
    clearError,
  };
}

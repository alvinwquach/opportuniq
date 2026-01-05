"use client";

import { useState, useCallback } from "react";
import { IoLanguage } from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { getLanguageName } from "@/lib/schemas/voice";
import {
  trackTranslationRequested,
  trackTranslationToggled,
} from "@/lib/analytics";

interface TranslateButtonProps {
  text: string;
  originalLanguage: string;
  messageId: string;
  conversationId?: string | null;
  onTranslationChange?: (translatedText: string | null, isTranslated: boolean) => void;
  className?: string;
  size?: "sm" | "md";
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
};

export function TranslateButton({
  text,
  originalLanguage,
  messageId,
  conversationId,
  onTranslationChange,
  className,
  size = "sm",
}: TranslateButtonProps) {
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);

  const { isTranslating, error, translate, getTranslation } = useTranslation();

  // Determine target language (toggle between original and English)
  const targetLanguage = isTranslated ? originalLanguage : "en";
  const currentSourceLanguage = isTranslated ? "en" : originalLanguage;

  // Don't show if already in English
  if (originalLanguage === "en") {
    return null;
  }

  const handleClick = useCallback(async () => {
    if (isTranslating) return;

    if (isTranslated) {
      // Toggle back to original
      trackTranslationToggled({
        conversationId,
        messageId,
        showingTranslation: false,
      });
      setIsTranslated(false);
      setTranslatedText(null);
      onTranslationChange?.(null, false);
      return;
    }

    // Check cache first
    const cached = getTranslation(messageId, "en");
    if (cached) {
      trackTranslationToggled({
        conversationId,
        messageId,
        showingTranslation: true,
      });
      setTranslatedText(cached);
      setIsTranslated(true);
      onTranslationChange?.(cached, true);
      return;
    }

    // Track translation request
    trackTranslationRequested({
      conversationId,
      messageId,
      fromLanguage: originalLanguage,
      toLanguage: "en",
      textLength: text.length,
    });

    // Translate to English
    const result = await translate(text, originalLanguage, "en", messageId);
    if (result) {
      trackTranslationToggled({
        conversationId,
        messageId,
        showingTranslation: true,
      });
      setTranslatedText(result);
      setIsTranslated(true);
      onTranslationChange?.(result, true);
    }
  }, [
    isTranslating,
    isTranslated,
    text,
    originalLanguage,
    messageId,
    conversationId,
    translate,
    getTranslation,
    onTranslationChange,
  ]);

  const languageName = getLanguageName(originalLanguage);
  const buttonTitle = isTranslated
    ? `Show original (${languageName})`
    : `Translate to English`;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isTranslating}
      className={cn(
        "rounded-full flex items-center justify-center transition-all duration-200",
        sizeClasses[size],
        // Base state
        !isTranslated &&
          !isTranslating &&
          "bg-[#2a2a2a]/80 text-[#888] hover:text-[#5eead4] hover:bg-[#3a3a3a]",
        // Translated state (active)
        isTranslated && "bg-[#5eead4]/20 text-[#5eead4]",
        // Loading state
        isTranslating && "bg-[#2a2a2a]/80 text-[#5eead4] cursor-wait",
        // Error state
        error && "bg-red-500/20 text-red-400",
        className
      )}
      title={buttonTitle}
      aria-label={buttonTitle}
    >
      {isTranslating ? (
        <ImSpinner8 className={cn(iconSizes[size], "animate-spin")} />
      ) : (
        <IoLanguage className={iconSizes[size]} />
      )}
    </button>
  );
}

// Compound component for message with translation support
interface TranslatableMessageProps {
  content: string;
  originalLanguage: string;
  messageId: string;
  children: (displayContent: string) => React.ReactNode;
}

export function TranslatableMessage({
  content,
  originalLanguage,
  messageId,
  children,
}: TranslatableMessageProps) {
  const [displayContent, setDisplayContent] = useState(content);
  const [isTranslated, setIsTranslated] = useState(false);

  const handleTranslationChange = useCallback(
    (translatedText: string | null, translated: boolean) => {
      setDisplayContent(translated && translatedText ? translatedText : content);
      setIsTranslated(translated);
    },
    [content]
  );

  // Don't show translation UI for English
  if (originalLanguage === "en") {
    return <>{children(content)}</>;
  }

  return (
    <div className="relative">
      {children(displayContent)}
      <div className="flex items-center gap-1 mt-2">
        <TranslateButton
          text={content}
          originalLanguage={originalLanguage}
          messageId={messageId}
          onTranslationChange={handleTranslationChange}
          size="sm"
        />
        {isTranslated && (
          <span className="text-xs text-[#5eead4]">
            Translated from {getLanguageName(originalLanguage)}
          </span>
        )}
      </div>
    </div>
  );
}

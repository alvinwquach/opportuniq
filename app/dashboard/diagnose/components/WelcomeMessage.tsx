"use client";

import { useState, useEffect } from "react";
import { OpportunIQLogo } from "@/components/landing/OpportunIQLogo";

const WELCOME_MESSAGE = "Hey! I'm here to help you diagnose issues, plan DIY projects, or find the right professional for the job. Describe what you're working on, share a photo, or use voice in any language.";

interface WelcomeMessageProps {
  shouldAnimate: boolean;
}

export function WelcomeMessage({ shouldAnimate }: WelcomeMessageProps) {
  const [welcomeText, setWelcomeText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) {
      setWelcomeText("");
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < WELCOME_MESSAGE.length) {
        currentIndex++;
        setWelcomeText(WELCOME_MESSAGE.slice(0, currentIndex));
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 20);

    return () => clearInterval(typingInterval);
  }, [shouldAnimate]);

  if (!shouldAnimate && !welcomeText) return null;

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <OpportunIQLogo className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-white">OpportunIQ</span>
        </div>
        <div className="pl-10">
          <p className="text-[15px] text-gray-700 leading-relaxed">
            {welcomeText}
            {isTyping && (
              <span className="inline-block w-2 h-4 bg-blue-400 ml-0.5 animate-pulse" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

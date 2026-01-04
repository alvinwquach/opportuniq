"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// SplitText is a premium plugin, so we'll create a wrapper
// For now, we'll use a character-by-character split approach
export function useSplitText(
  options: {
    trigger?: string;
    start?: string;
    stagger?: number;
    duration?: number;
  } = {}
) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const text = ref.current.textContent || "";
    const chars = text.split("");
    
    // Clear and wrap each character
    ref.current.innerHTML = chars
      .map((char, i) => {
        if (char === " ") return " ";
        return `<span class="char" style="display: inline-block; opacity: 0;">${char}</span>`;
      })
      .join("");

    const charElements = ref.current.querySelectorAll(".char");

    const animation = gsap.from(charElements, {
      opacity: 0,
      y: 20,
      rotationX: -90,
      stagger: options.stagger || 0.02,
      duration: options.duration || 0.5,
      ease: "power2.out",
      scrollTrigger: options.trigger
        ? {
            trigger: ref.current,
            start: options.start || "top 80%",
            toggleActions: "play none none none",
          }
        : undefined,
    });

    return () => {
      animation.kill();
    };
  }, []);

  return ref;
}





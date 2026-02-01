import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

export { gsap, ScrollTrigger, TextPlugin };

// Scramble text effect (custom implementation since ScrambleText is Club GreenSock)
export function scrambleText(
  element: HTMLElement,
  finalText: string,
  options: {
    duration?: number;
    chars?: string;
    revealDelay?: number;
    onComplete?: () => void;
  } = {}
) {
  const {
    duration = 1.5,
    chars = "!<>-_\\/[]{}—=+*^?#_",
    revealDelay = 0.03,
    onComplete,
  } = options;

  const originalText = finalText;
  const length = originalText.length;
  let frame = 0;
  const frameRate = 30;
  const totalFrames = duration * frameRate;
  const revealFrame = revealDelay * frameRate;

  const scramble = () => {
    let output = "";
    const progress = frame / totalFrames;

    for (let i = 0; i < length; i++) {
      const charProgress = (frame - i * revealFrame) / (totalFrames - i * revealFrame);

      if (charProgress >= 1) {
        output += originalText[i];
      } else if (charProgress > 0) {
        output += chars[Math.floor(Math.random() * chars.length)];
      } else {
        output += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    element.textContent = output;
    frame++;

    if (frame <= totalFrames) {
      requestAnimationFrame(scramble);
    } else {
      element.textContent = originalText;
      onComplete?.();
    }
  };

  scramble();
}

// Split text into spans for individual character animation
export function splitTextIntoChars(element: HTMLElement): HTMLSpanElement[] {
  const text = element.textContent || "";
  element.textContent = "";

  const chars: HTMLSpanElement[] = [];

  for (const char of text) {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00A0" : char;
    span.style.display = "inline-block";
    element.appendChild(span);
    chars.push(span);
  }

  return chars;
}

// Split text into words for word-by-word animation
export function splitTextIntoWords(element: HTMLElement): HTMLSpanElement[] {
  const text = element.textContent || "";
  element.textContent = "";

  const words: HTMLSpanElement[] = [];
  const wordArray = text.split(" ");

  wordArray.forEach((word, index) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.style.display = "inline-block";
    element.appendChild(span);
    words.push(span);

    if (index < wordArray.length - 1) {
      element.appendChild(document.createTextNode(" "));
    }
  });

  return words;
}

// Counter animation
export function animateCounter(
  element: HTMLElement,
  endValue: number,
  options: {
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
  } = {}
) {
  const { duration = 2, prefix = "", suffix = "", decimals = 0 } = options;

  const obj = { value: 0 };

  gsap.to(obj, {
    value: endValue,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      element.textContent = `${prefix}${obj.value.toFixed(decimals)}${suffix}`;
    },
  });
}

// Typewriter effect
export function typewriter(
  element: HTMLElement,
  text: string,
  options: {
    duration?: number;
    delay?: number;
    cursor?: boolean;
  } = {}
) {
  const { duration = 2, delay = 0, cursor = true } = options;

  element.textContent = "";

  if (cursor) {
    element.style.borderRight = "2px solid currentColor";
  }

  return gsap.to(element, {
    duration,
    delay,
    text: {
      value: text,
      delimiter: "",
    },
    ease: "none",
    onComplete: () => {
      if (cursor) {
        gsap.to(element, {
          borderRightColor: "transparent",
          repeat: -1,
          yoyo: true,
          duration: 0.5,
        });
      }
    },
  });
}

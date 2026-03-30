"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register core plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Conditionally load premium plugins if available
let ScrollSmoother: unknown = null;
let Observer: unknown = null;
let Flip: unknown = null;

if (typeof window !== "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ScrollSmoother = require("gsap/ScrollSmoother").ScrollSmoother;
    if (ScrollSmoother) gsap.registerPlugin(ScrollSmoother);
  } catch (e) {
    // ScrollSmoother not available
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Observer = require("gsap/Observer").Observer;
    if (Observer) gsap.registerPlugin(Observer);
  } catch (e) {
    // Observer not available
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Flip = require("gsap/Flip").Flip;
    if (Flip) gsap.registerPlugin(Flip);
  } catch (e) {
    // Flip not available
  }
}

export { gsap, ScrollTrigger, ScrollSmoother, Observer, Flip };


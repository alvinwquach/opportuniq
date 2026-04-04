import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/dist/Flip";
import { Observer } from "gsap/dist/Observer";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

export const SPRING_EASE = "M0,0 C0.14,0 0.242,0.438 0.272,0.561 0.313,0.728 0.354,0.963 0.362,1";

// Registration must be client-only — GSAP plugins reference DOM/window APIs
// and will throw during SSR/build if called unconditionally.
if (typeof window !== "undefined") {
  gsap.registerPlugin(
    ScrollTrigger,
    TextPlugin,
    SplitText,
    ScrambleTextPlugin,
    DrawSVGPlugin,
    CustomEase,
    Flip,
    Observer,
    MorphSVGPlugin,
  );
  CustomEase.create("spring", SPRING_EASE);
}

export {
  gsap,
  ScrollTrigger,
  TextPlugin,
  SplitText,
  ScrambleTextPlugin,
  DrawSVGPlugin,
  CustomEase,
  Flip,
  Observer,
  MorphSVGPlugin,
};

"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import Link from "next/link";

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const ctx = gsap.context(() => {
      if (headingRef.current) {
        const split = new SplitText(headingRef.current, { type: "words" });
        gsap.set(split.words, { clipPath: "inset(0 0 100% 0)", display: "inline-block" });

        ScrollTrigger.create({
          trigger: headingRef.current,
          start: "top 80%",
          onEnter: () => {
            gsap.to(split.words, {
              clipPath: "inset(0 0 0% 0)",
              stagger: 0.08,
              duration: 0.7,
              ease: "spring",
            });
          },
          once: true,
        });
      }

      if (contentRef.current) {
        const children = contentRef.current.children;
        gsap.set(children, { clipPath: "inset(0 0 100% 0)" });

        ScrollTrigger.create({
          trigger: contentRef.current,
          start: "top 80%",
          onEnter: () => {
            gsap.to(children, {
              clipPath: "inset(0 0 0% 0)",
              stagger: 0.12,
              duration: 0.6,
              ease: "spring",
            });
          },
          once: true,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 sm:py-40 overflow-hidden bg-gray-900"
    >
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          ref={headingRef}
          className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight"
        >
          Stop guessing. Start fixing.
        </h2>

        <div ref={contentRef} className="space-y-8">
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Is it safe? Can I do it myself? Is it urgent? Can I defer — and if so, what do I watch for? What PPE do I need? What should it cost?
          </p>

          <div>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-lg hover:shadow-xl"
            >
              Start Diagnosing — Free
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            Free to start · No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}

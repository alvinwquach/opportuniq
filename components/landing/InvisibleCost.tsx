"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function InvisibleCost() {
  const sectionRef = useRef<HTMLElement>(null);
  const hoursRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const reframeRef = useRef<HTMLParagraphElement>(null);
  const [mounted, setMounted] = useState(false);
  const [currentHours, setCurrentHours] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Pin the section and animate on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            // Update counter based on scroll progress
            const progress = self.progress;

            if (progress < 0.5) {
              // First half: counting up hours
              const hours = Math.floor((progress / 0.5) * 4.2 * 10) / 10;
              setCurrentHours(hours);

              // Update progress bar
              if (progressRef.current) {
                progressRef.current.style.width = `${(progress / 0.5) * 100}%`;
              }
            } else if (progress < 0.7) {
              // Hold at max
              setCurrentHours(4.2);
              if (progressRef.current) {
                progressRef.current.style.width = "100%";
              }
            } else {
              // Drain the bar
              const drainProgress = (progress - 0.7) / 0.3;
              if (progressRef.current) {
                progressRef.current.style.width = `${(1 - drainProgress) * 100}%`;
              }
            }
          },
        },
      });

      // Fade in the main text
      tl.from(".cost-headline", {
        opacity: 0,
        y: 30,
        duration: 0.3,
      }, 0);

      // Fade in secondary text
      tl.from(".cost-subtext", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.2,
      }, 0.1);

      // At 50% progress, show the "this is what uncertainty costs" message
      tl.to(".cost-message-1", {
        opacity: 1,
        y: 0,
        duration: 0.1,
      }, 0.45);

      // At 70%, hide first message and start showing the reframe
      tl.to(".cost-message-1", {
        opacity: 0,
        duration: 0.05,
      }, 0.65);

      // Show the reframe with scramble effect
      tl.to(".cost-message-2", {
        opacity: 1,
        y: 0,
        duration: 0.1,
        onStart: () => {
          if (reframeRef.current) {
            scrambleText(reframeRef.current, "What if you could skip this?", 0.8);
          }
        },
      }, 0.7);

    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  function scrambleText(element: HTMLElement, finalText: string, duration: number) {
    const length = finalText.length;
    const startTime = performance.now();

    function update() {
      const now = performance.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const charsRevealed = Math.floor(progress * length * 1.5);

      let output = "";
      for (let i = 0; i < length; i++) {
        if (i < charsRevealed) {
          output += finalText[i];
        } else if (finalText[i] === " ") {
          output += " ";
        } else {
          output += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }

      element.textContent = output;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = finalText;
      }
    }

    element.textContent = SCRAMBLE_CHARS.slice(0, length).split("").map(() =>
      SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
    ).join("");

    requestAnimationFrame(update);
  }

  if (!mounted) {
    return (
      <section className="relative min-h-screen bg-neutral-950" />
    );
  }

  return (
    <section
      id="cost"
      ref={sectionRef}
      className="relative min-h-screen bg-neutral-950 overflow-hidden"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950" />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-4xl mx-auto w-full">
          {/* Main content */}
          <div className="text-center mb-16">
            <p className="cost-headline text-neutral-500 text-lg sm:text-xl mb-8 tracking-wide">
              Last month, Americans spent
            </p>

            {/* The big number */}
            <div className="flex items-baseline justify-center gap-3 mb-4">
              <span
                ref={hoursRef}
                className="font-mono text-6xl sm:text-7xl md:text-8xl font-bold text-amber-500 tabular-nums"
              >
                {currentHours.toFixed(1)}
              </span>
              <span className="text-amber-500/70 text-2xl sm:text-3xl font-light">
                million hours
              </span>
            </div>

            <p className="cost-subtext text-neutral-500 text-lg sm:text-xl tracking-wide">
              researching home repairs.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-neutral-600 uppercase tracking-widest">
                Time spent guessing
              </span>
              <span className="text-xs font-mono text-neutral-600">
                {(currentHours / 4.2 * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                ref={progressRef}
                className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full transition-none"
                style={{ width: "0%" }}
              />
            </div>
          </div>

          {/* Supporting text */}
          <div className="text-center space-y-3 mb-16">
            <p className="cost-subtext text-neutral-400 text-base sm:text-lg">
              They&apos;ll never get that time back.
            </p>
            <p className="cost-subtext text-neutral-500 text-base sm:text-lg">
              They still won&apos;t know if they chose right.
            </p>
          </div>

          {/* Messages that swap */}
          <div className="relative h-16 flex items-center justify-center">
            {/* Message 1: What uncertainty costs */}
            <p className="cost-message-1 absolute text-xl sm:text-2xl text-neutral-300 font-medium opacity-0 translate-y-4">
              This is what uncertainty costs.
            </p>

            {/* Message 2: The reframe */}
            <p
              ref={reframeRef}
              className="cost-message-2 absolute text-xl sm:text-2xl text-white font-medium opacity-0 translate-y-4 font-mono"
            >
              What if you could skip this?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChatDemo } from "./ChatDemo";

const cycleWords = ["breaks.", "leaks.", "fails.", "sparks.", "floods."];

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % cycleWords.length);
    }, 2500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-16">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
          {/* Left column */}
          <div className="space-y-8 text-left">
            <span className="inline-block text-sm font-medium text-blue-600 tracking-wider uppercase">
              AI-powered home &amp; auto assistant
            </span>

            <h1
              className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Get answers the moment
              <br />
              something <span>{cycleWords[wordIndex]}</span>
            </h1>

            <p className="text-xl text-gray-500 max-w-xl leading-relaxed">
              Is it urgent? Safe to handle? What will it cost? Describe the
              problem in any language — the AI diagnoses it, catches hazards
              you didn&apos;t know to ask about, and finds help if you need it.
              No experience required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Start for free
              </Link>
              <a
                href="#what-you-can-do"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                See how it works
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Free to start</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>No credit card</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>40+ languages</span>
            </div>
          </div>

          {/* Right column — ChatDemo */}
          <div>
            <ChatDemo />
          </div>
        </div>
      </div>
    </section>
  );
}

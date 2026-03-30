"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SCRAMBLE_CHARS = "0123456789$,.";

export function CompoundEffect() {
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const chartRef = useRef<SVGPathElement>(null);
  const [showLine1, setShowLine1] = useState(false);
  const [showLine2, setShowLine2] = useState(false);
  const [showLine3, setShowLine3] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [line1Value, setLine1Value] = useState(0);
  const [line2Value, setLine2Value] = useState(0);
  const [line3Text, setLine3Text] = useState("Priceless");
  const [chartProgress, setChartProgress] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;

          // Line 1: One good decision
          if (progress >= 0.1) {
            setShowLine1(true);
            const val = Math.min((progress - 0.1) / 0.15, 1);
            setLine1Value(Math.floor(val * 187));
          }

          // Line 2: Twelve good decisions
          if (progress >= 0.3) {
            setShowLine2(true);
            const val = Math.min((progress - 0.3) / 0.15, 1);
            setLine2Value(Math.floor(val * 2244));
          }

          // Line 3: A year of clarity - scramble from "Priceless" to "$2,244"
          if (progress >= 0.5) {
            setShowLine3(true);
            const scrambleProgress = (progress - 0.5) / 0.2;

            if (scrambleProgress < 0.3) {
              setLine3Text("Priceless");
            } else if (scrambleProgress < 0.5) {
              // Scrambling
              const chars = "Priceless".split("");
              const scrambled = chars.map((c, i) => {
                if (Math.random() > 0.5) return "$0123456789"[Math.floor(Math.random() * 11)];
                return c;
              }).join("");
              setLine3Text(scrambled);
            } else if (scrambleProgress < 0.7) {
              setLine3Text("$2,2" + "4".repeat(Math.floor(Math.random() * 3)));
            } else {
              setLine3Text("$2,244");
            }
          }

          // Chart draws in
          if (progress >= 0.7) {
            setShowChart(true);
            setChartProgress(Math.min((progress - 0.7) / 0.25, 1));
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Generate chart path points
  const chartPoints = [
    { x: 0, y: 100 },
    { x: 8.33, y: 85 },
    { x: 16.66, y: 75 },
    { x: 25, y: 62 },
    { x: 33.33, y: 55 },
    { x: 41.66, y: 45 },
    { x: 50, y: 38 },
    { x: 58.33, y: 30 },
    { x: 66.66, y: 24 },
    { x: 75, y: 18 },
    { x: 83.33, y: 12 },
    { x: 91.66, y: 8 },
    { x: 100, y: 5 },
  ];

  const pathD = chartPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <section
      ref={sectionRef}
      className="relative py-32 lg:py-40 bg-neutral-950 overflow-hidden"
    >
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 via-neutral-950 to-neutral-950" />

      <div className="relative container mx-auto px-6 max-w-4xl">
        {/* Section header */}
        <div className="text-center mb-20">
          <span className="text-xs font-mono text-neutral-600 uppercase tracking-[0.3em]">
            The Compound Effect
          </span>
        </div>

        {/* The three lines */}
        <div className="space-y-8 mb-20">
          {/* Line 1 */}
          <div
            className="flex items-baseline justify-between border-b border-neutral-800 pb-6 transition-all duration-500"
            style={{
              opacity: showLine1 ? 1 : 0.2,
              transform: showLine1 ? "translateX(0)" : "translateX(-20px)",
            }}
          >
            <span className="text-neutral-400 text-lg sm:text-xl">
              One good decision
            </span>
            <span
              ref={line1Ref}
              className="font-mono text-3xl sm:text-4xl font-bold text-emerald-400 tabular-nums"
            >
              ${line1Value}
            </span>
          </div>

          {/* Line 2 */}
          <div
            className="flex items-baseline justify-between border-b border-neutral-800 pb-6 transition-all duration-500"
            style={{
              opacity: showLine2 ? 1 : 0.2,
              transform: showLine2 ? "translateX(0)" : "translateX(-20px)",
            }}
          >
            <span className="text-neutral-400 text-lg sm:text-xl">
              Twelve good decisions
            </span>
            <span
              ref={line2Ref}
              className="font-mono text-3xl sm:text-4xl font-bold text-emerald-400 tabular-nums"
            >
              ${line2Value.toLocaleString()}
            </span>
          </div>

          {/* Line 3 - The punchline */}
          <div
            className="flex items-baseline justify-between pb-6 transition-all duration-500"
            style={{
              opacity: showLine3 ? 1 : 0.2,
              transform: showLine3 ? "translateX(0)" : "translateX(-20px)",
            }}
          >
            <span className="text-neutral-200 text-lg sm:text-xl font-medium">
              A year of clarity
            </span>
            <span
              ref={line3Ref}
              className={`font-mono text-3xl sm:text-4xl font-bold tabular-nums transition-colors duration-300 ${
                line3Text === "$2,244" ? "text-emerald-400" : "text-neutral-500"
              }`}
            >
              {line3Text}
            </span>
          </div>

          {/* Joke parenthetical */}
          <p
            className="text-center text-neutral-600 text-sm transition-all duration-500"
            style={{
              opacity: line3Text === "$2,244" ? 1 : 0,
            }}
          >
            (just kidding, it&apos;s $2,244)
          </p>
        </div>

        {/* Chart */}
        <div
          className="transition-all duration-700"
          style={{
            opacity: showChart ? 1 : 0,
            transform: showChart ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
                Cumulative Savings
              </span>
              <span className="text-xs font-mono text-emerald-400">
                12 months
              </span>
            </div>

            {/* SVG Chart */}
            <div className="relative h-40">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                {/* Grid lines */}
                <g className="text-neutral-800">
                  {[25, 50, 75].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />
                  ))}
                </g>

                {/* Chart line */}
                <path
                  ref={chartRef}
                  d={pathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 300,
                    strokeDashoffset: 300 - chartProgress * 300,
                    transition: "stroke-dashoffset 0.1s ease-out",
                  }}
                />

                {/* Gradient fill under the line */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${pathD} L 100 100 L 0 100 Z`}
                  fill="url(#chartGradient)"
                  style={{
                    opacity: chartProgress,
                  }}
                />

                {/* End dot */}
                <circle
                  cx="100"
                  cy="5"
                  r="3"
                  fill="#10b981"
                  style={{
                    opacity: chartProgress > 0.95 ? 1 : 0,
                    transition: "opacity 0.3s",
                  }}
                />
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs font-mono text-neutral-600 -translate-x-8">
                <span>$2.2k</span>
                <span>$1.1k</span>
                <span>$0</span>
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-4 text-xs font-mono text-neutral-600">
              <span>Jan</span>
              <span>Apr</span>
              <span>Jul</span>
              <span>Oct</span>
              <span>Dec</span>
            </div>
          </div>
        </div>

        {/* Bottom message */}
        <p className="text-center text-neutral-500 text-sm mt-12 max-w-md mx-auto">
          Every decision you make with clarity compounds.
          <br />
          <span className="text-neutral-300">
            The question is: how many are you making without it?
          </span>
        </p>
      </div>
    </section>
  );
}

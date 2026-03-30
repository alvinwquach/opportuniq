"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import * as d3 from "d3";

/**
 * Cost Logic Demo
 *
 * Interactive opportunity cost calculator with D3 gauge + GSAP animations
 * Sliders for hourly rate + DIY time → animated gauge shows true cost
 *
 * 5-second insight: "My time has a price. This shows me when DIY actually costs more."
 */

export function CostLogicDemo() {
  const gaugeRef = useRef<SVGSVGElement>(null);
  const needleRef = useRef<SVGGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hourlyRate, setHourlyRate] = useState(45);
  const [diyHours, setDiyHours] = useState(5);
  const contractorCost = 180;

  const trueDiyCost = hourlyRate * diyHours;
  const savings = contractorCost - trueDiyCost;
  const diyWins = trueDiyCost < contractorCost;
  const ratio = Math.min(Math.max(trueDiyCost / contractorCost, 0.2), 2.5);


  // D3 Gauge setup
  useEffect(() => {
    if (!gaugeRef.current) return;

    const svg = d3.select(gaugeRef.current);
    svg.selectAll("*").remove();

    const width = 280;
    const height = 160;
    const radius = 100;
    const cx = width / 2;
    const cy = height - 20;

    const g = svg.append("g").attr("transform", `translate(${cx}, ${cy})`);

    // Background arc (gray)
    const arcBg = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append("path")
      .attr("d", arcBg as unknown as string)
      .attr("fill", "#1a1a1a");

    // Green zone (DIY wins: 0 to contractor cost)
    const greenAngle = Math.PI / 2 * 0.6; // 60% of arc
    const arcGreen = d3.arc()
      .innerRadius(radius - 18)
      .outerRadius(radius - 2)
      .startAngle(-Math.PI / 2)
      .endAngle(-Math.PI / 2 + greenAngle);

    g.append("path")
      .attr("d", arcGreen as unknown as string)
      .attr("fill", "#00FF88")
      .attr("opacity", 0.3);

    // Orange zone (close call)
    const arcOrange = d3.arc()
      .innerRadius(radius - 18)
      .outerRadius(radius - 2)
      .startAngle(-Math.PI / 2 + greenAngle)
      .endAngle(-Math.PI / 2 + greenAngle + Math.PI / 2 * 0.25);

    g.append("path")
      .attr("d", arcOrange as unknown as string)
      .attr("fill", "#FF8800")
      .attr("opacity", 0.3);

    // Red zone (DIY loses badly)
    const arcRed = d3.arc()
      .innerRadius(radius - 18)
      .outerRadius(radius - 2)
      .startAngle(-Math.PI / 2 + greenAngle + Math.PI / 2 * 0.25)
      .endAngle(Math.PI / 2);

    g.append("path")
      .attr("d", arcRed as unknown as string)
      .attr("fill", "#FF4444")
      .attr("opacity", 0.3);

    // Tick marks
    const tickScale = d3.scaleLinear().domain([0, 2.5]).range([-90, 90]);
    [0, 0.5, 1, 1.5, 2, 2.5].forEach(val => {
      const angle = (tickScale(val) * Math.PI) / 180;
      const x1 = Math.cos(angle - Math.PI / 2) * (radius - 25);
      const y1 = Math.sin(angle - Math.PI / 2) * (radius - 25);
      const x2 = Math.cos(angle - Math.PI / 2) * (radius + 5);
      const y2 = Math.sin(angle - Math.PI / 2) * (radius + 5);

      g.append("line")
        .attr("x1", x1).attr("y1", y1)
        .attr("x2", x2).attr("y2", y2)
        .attr("stroke", "#444")
        .attr("stroke-width", val === 1 ? 2 : 1);
    });

    // Labels
    g.append("text")
      .attr("x", -radius + 10)
      .attr("y", -5)
      .attr("fill", "#00FF88")
      .attr("font-size", 9)
      .attr("text-anchor", "start")
      .text("DIY Wins");

    g.append("text")
      .attr("x", radius - 10)
      .attr("y", -5)
      .attr("fill", "#FF4444")
      .attr("font-size", 9)
      .attr("text-anchor", "end")
      .text("Hire Out");

    // "1x" marker (break-even)
    g.append("text")
      .attr("x", 0)
      .attr("y", -radius - 10)
      .attr("fill", "#666")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .text("Break Even");

    // Needle group
    const needle = g.append("g").attr("class", "needle");
    needleRef.current = needle.node();

    // Needle
    needle.append("path")
      .attr("d", "M -4 0 L 0 -70 L 4 0 Z")
      .attr("fill", "#00F0FF");

    // Center dot
    needle.append("circle")
      .attr("r", 8)
      .attr("fill", "#00F0FF");

    needle.append("circle")
      .attr("r", 4)
      .attr("fill", "#0a0a0a");

  }, []);

  // Animate needle with GSAP
  useEffect(() => {
    if (!needleRef.current) return;

    // Map ratio to angle: 0.2 = -90deg, 1 = 0deg, 2.5 = 90deg
    const angle = ((ratio - 0.2) / (2.5 - 0.2)) * 180 - 90;

    gsap.to(needleRef.current, {
      rotation: angle,
      duration: 0.6,
      ease: "elastic.out(1, 0.6)",
      transformOrigin: "center bottom",
    });
  }, [ratio]);

  const handleHourlyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHourlyRate(Number(e.target.value));
  }, []);

  const handleHoursChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDiyHours(Number(e.target.value));
  }, []);


  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-black via-cyan-950/10 to-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Interactive Demo */}
          <div ref={containerRef} className="order-2 md:order-1">
            <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 p-6 backdrop-blur-sm">
              {/* Sliders */}
              <div className="space-y-5 mb-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-neutral-400">Your hourly value</label>
                    <span className="text-sm font-mono font-semibold text-[#00F0FF]">${hourlyRate}/hr</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="150"
                    value={hourlyRate}
                    onChange={handleHourlyChange}
                    className="w-full h-2 bg-neutral-800 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-5
                      [&::-webkit-slider-thumb]:h-5
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-[#00F0FF]
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(0,240,255,0.6)]
                      [&::-webkit-slider-thumb]:border-2
                      [&::-webkit-slider-thumb]:border-black"
                  />
                  <div className="flex justify-between mt-1.5 text-xs text-neutral-600">
                    <span>$15/hr</span>
                    <span>$150/hr</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-neutral-400">Estimated DIY time</label>
                    <span className="text-sm font-mono font-semibold text-[#00F0FF]">{diyHours} hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="0.5"
                    value={diyHours}
                    onChange={handleHoursChange}
                    className="w-full h-2 bg-neutral-800 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-5
                      [&::-webkit-slider-thumb]:h-5
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-[#00F0FF]
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(0,240,255,0.6)]
                      [&::-webkit-slider-thumb]:border-2
                      [&::-webkit-slider-thumb]:border-black"
                  />
                  <div className="flex justify-between mt-1.5 text-xs text-neutral-600">
                    <span>1 hour</span>
                    <span>12 hours</span>
                  </div>
                </div>
              </div>

              {/* D3 Gauge */}
              <div className="flex justify-center mb-4">
                <svg
                  ref={gaugeRef}
                  viewBox="0 0 280 160"
                  className="w-full max-w-[280px]"
                />
              </div>

              {/* Cost Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-lg border ${diyWins ? 'bg-[#00FF88]/10 border-[#00FF88]/30' : 'bg-neutral-900 border-neutral-800'}`}>
                  <div className="text-xs text-neutral-500 mb-1">DIY True Cost</div>
                  <div className={`text-2xl font-mono font-bold ${diyWins ? 'text-[#00FF88]' : 'text-white'}`}>
                    ${trueDiyCost}
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">
                    ${hourlyRate} × {diyHours}h
                  </div>
                </div>
                <div className={`p-4 rounded-lg border ${!diyWins ? 'bg-[#00FF88]/10 border-[#00FF88]/30' : 'bg-neutral-900 border-neutral-800'}`}>
                  <div className="text-xs text-neutral-500 mb-1">Contractor Quote</div>
                  <div className={`text-2xl font-mono font-bold ${!diyWins ? 'text-[#00FF88]' : 'text-white'}`}>
                    ${contractorCost}
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">
                    Fixed price
                  </div>
                </div>
              </div>

              {/* Verdict */}
              <div className={`text-center p-3 rounded-lg ${diyWins ? 'bg-[#00FF88]/10' : 'bg-[#FF8800]/10'}`}>
                <span className={`text-sm font-semibold ${diyWins ? 'text-[#00FF88]' : 'text-[#FF8800]'}`}>
                  {diyWins
                    ? `DIY saves you $${Math.abs(savings)}`
                    : `Hiring saves you $${Math.abs(savings)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="order-1 md:order-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              Your Time<br />
              <span className="text-[#00F0FF]">Has a Price.</span>
            </h2>

            <p className="text-lg text-neutral-400 mb-6 leading-relaxed">
              Slide to set your hourly value and estimated DIY time.
              Watch the needle move to show the true cost of each choice.
            </p>

            <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
              <p className="text-sm text-neutral-300 leading-relaxed">
                <span className="text-[#FF8800] font-semibold">Example:</span> Saving $180 on a repair sounds great.
                But if it takes 6 hours and your time is worth $50/hour,
                you spent <span className="text-[#FF8800] font-mono">$300</span> to save <span className="text-[#00FF88] font-mono">$180</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

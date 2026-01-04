"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as d3 from "d3";
import {
  IoGrid,
  IoHome,
  IoCar,
  IoConstruct,
  IoLeaf,
  IoWarning,
} from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Risk Heatmap
 *
 * Interactive D3 heatmap showing risk levels across categories
 * Hover for details, animated reveal
 */

interface HeatmapCell {
  category: string;
  riskLevel: string;
  count: number;
  examples: string[];
}

const CATEGORIES = ["Plumbing", "Electrical", "HVAC", "Exterior", "Appliances", "Structural"];
const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Plumbing: IoConstruct,
  Electrical: IoWarning,
  HVAC: IoHome,
  Exterior: IoLeaf,
  Appliances: IoConstruct,
  Structural: IoHome,
};

// Generate heatmap data
const generateHeatmapData = (): HeatmapCell[] => {
  const data: HeatmapCell[] = [];

  const examples: Record<string, Record<string, string[]>> = {
    Plumbing: {
      Low: ["Faucet drip", "Clogged drain", "Running toilet"],
      Medium: ["Water heater flush", "Pipe insulation", "Garbage disposal"],
      High: ["Water heater replacement", "Main line clog", "Sump pump"],
      Critical: ["Gas water heater", "Sewer line", "Frozen pipes"],
    },
    Electrical: {
      Low: ["Light bulb", "Outlet cover", "Switch plate"],
      Medium: ["Ceiling fan install", "Dimmer switch", "USB outlet"],
      High: ["Outlet replacement", "Light fixture", "GFCI install"],
      Critical: ["Panel work", "Circuit addition", "Whole-house rewire"],
    },
    HVAC: {
      Low: ["Filter change", "Vent cleaning", "Thermostat battery"],
      Medium: ["Thermostat upgrade", "Duct sealing", "Humidifier"],
      High: ["Condenser cleaning", "Refrigerant check", "Blower motor"],
      Critical: ["Gas furnace", "AC compressor", "Ductwork"],
    },
    Exterior: {
      Low: ["Gutter cleaning", "Power washing", "Caulking"],
      Medium: ["Fence repair", "Deck staining", "Shutter install"],
      High: ["Roof shingle", "Siding repair", "Window seal"],
      Critical: ["Roof replacement", "Foundation", "Tree removal"],
    },
    Appliances: {
      Low: ["Cleaning", "Filter replace", "Gasket swap"],
      Medium: ["Dishwasher drain", "Dryer vent", "Ice maker"],
      High: ["Washer pump", "Oven element", "Compressor"],
      Critical: ["Gas range", "Refrigerant", "Combo units"],
    },
    Structural: {
      Low: ["Drywall patch", "Door adjustment", "Trim repair"],
      Medium: ["Ceiling crack", "Subfloor squeak", "Stair tread"],
      High: ["Load-bearing ID", "Joist repair", "Foundation crack"],
      Critical: ["Wall removal", "Beam replacement", "Foundation work"],
    },
  };

  // Count distribution (more low/medium, fewer high/critical)
  const countRanges: Record<string, [number, number]> = {
    Low: [15, 25],
    Medium: [10, 18],
    High: [5, 12],
    Critical: [2, 6],
  };

  CATEGORIES.forEach(category => {
    RISK_LEVELS.forEach(riskLevel => {
      const [min, max] = countRanges[riskLevel];
      data.push({
        category,
        riskLevel,
        count: Math.floor(Math.random() * (max - min + 1)) + min,
        examples: examples[category]?.[riskLevel] || [],
      });
    });
  });

  return data;
};

const HEATMAP_DATA = generateHeatmapData();

const RISK_COLORS: Record<string, string> = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#ef4444",
  Critical: "#dc2626",
};

export function RiskHeatmap() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 400 });

  useEffect(() => {
    setMounted(true);

    const updateDimensions = () => {
      const width = Math.min(window.innerWidth - 48, 700);
      const height = width < 500 ? 350 : 400;
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // D3 Heatmap
  useEffect(() => {
    if (!svgRef.current || !mounted) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 50, right: 30, bottom: 30, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(RISK_LEVELS)
      .range([0, innerWidth])
      .padding(0.08);

    const yScale = d3.scaleBand()
      .domain(CATEGORIES)
      .range([0, innerHeight])
      .padding(0.08);

    // Color scale based on count
    const maxCount = d3.max(HEATMAP_DATA, d => d.count) || 25;
    const colorScale = (riskLevel: string, count: number) => {
      const baseColor = RISK_COLORS[riskLevel];
      const opacity = 0.3 + (count / maxCount) * 0.7;
      return d3.color(baseColor)?.copy({ opacity }) || baseColor;
    };

    // Cells
    const cells = g.selectAll(".heatmap-cell")
      .data(HEATMAP_DATA)
      .enter()
      .append("g")
      .attr("class", "heatmap-cell")
      .style("cursor", "pointer")
      .on("mouseenter", (event, d) => setHoveredCell(d))
      .on("mouseleave", () => setHoveredCell(null));

    cells.append("rect")
      .attr("x", d => xScale(d.riskLevel) || 0)
      .attr("y", d => yScale(d.category) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("rx", 6)
      .attr("fill", d => colorScale(d.riskLevel, d.count).toString())
      .attr("stroke", d => RISK_COLORS[d.riskLevel])
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.5)
      .attr("opacity", 0)
      .attr("transform", "scale(0.8)")
      .attr("transform-origin", d => {
        const x = (xScale(d.riskLevel) || 0) + xScale.bandwidth() / 2;
        const y = (yScale(d.category) || 0) + yScale.bandwidth() / 2;
        return `${x}px ${y}px`;
      });

    // Count labels
    cells.append("text")
      .attr("x", d => (xScale(d.riskLevel) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#ffffff")
      .attr("opacity", 0)
      .text(d => d.count);

    // X Axis (Risk Levels)
    g.selectAll(".x-label")
      .data(RISK_LEVELS)
      .enter()
      .append("text")
      .attr("class", "x-label")
      .attr("x", d => (xScale(d) || 0) + xScale.bandwidth() / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("fill", d => RISK_COLORS[d])
      .text(d => d);

    // Y Axis (Categories)
    g.selectAll(".y-label")
      .data(CATEGORIES)
      .enter()
      .append("text")
      .attr("class", "y-label")
      .attr("x", -10)
      .attr("y", d => (yScale(d) || 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#9ca3af")
      .text(d => d);

    // Scroll-triggered animation
    if (sectionRef.current) {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        onEnter: () => {
          // Animate cells
          cells.selectAll("rect")
            .transition()
            .duration(400)
            .delay((_, i) => i * 30)
            .attr("opacity", 1)
            .attr("transform", "scale(1)");

          // Animate counts
          cells.selectAll("text")
            .transition()
            .duration(300)
            .delay((_, i) => i * 30 + 200)
            .attr("opacity", 1);
        },
      });
    }

  }, [mounted, dimensions]);

  // Section animations
  useEffect(() => {
    if (!sectionRef.current || !mounted) return;

    const ctx = gsap.context(() => {
      gsap.from(".heatmap-header", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-black overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(45deg, #ef4444 25%, transparent 25%),
                           linear-gradient(-45deg, #ef4444 25%, transparent 25%),
                           linear-gradient(45deg, transparent 75%, #ef4444 75%),
                           linear-gradient(-45deg, transparent 75%, #ef4444 75%)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative">
        {/* Header */}
        <div className="heatmap-header text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium mb-4">
            <IoGrid className="w-3.5 h-3.5" />
            Risk Analysis
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
            Know Your{" "}
            <span className="text-red-400">Risk</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-400">
            See at a glance where DIY makes sense and where you need professional help.
            Numbers show issue frequency in each category.
          </p>
        </div>

        {/* Heatmap */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-4 lg:p-6 overflow-x-auto">
          <div className="flex justify-center min-w-[500px]">
            <svg ref={svgRef} />
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredCell && (
          <div className="mt-6 flex justify-center">
            <div
              className="inline-block px-5 py-4 rounded-xl border bg-gray-900"
              style={{ borderColor: RISK_COLORS[hoveredCell.riskLevel] + "60" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: RISK_COLORS[hoveredCell.riskLevel] }}
                />
                <span className="text-sm font-medium text-white">
                  {hoveredCell.category} - {hoveredCell.riskLevel} Risk
                </span>
                <span className="text-xs text-gray-400">
                  ({hoveredCell.count} common issues)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {hoveredCell.examples.map((example, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {RISK_LEVELS.map(level => (
            <div key={level} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: RISK_COLORS[level] }}
              />
              <span className="text-xs text-gray-400">{level}</span>
            </div>
          ))}
          <div className="text-xs text-gray-500 ml-4">
            Intensity = frequency
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import * as d3 from "d3";

/**
 * Risk Heatmap
 *
 * D3.js heatmap showing risk levels across different issue categories
 * Interactive cells with PPE recommendations
 * GSAP animations on load and hover
 */

interface RiskCell {
  category: string;
  severity: string;
  risk: number;
  ppe: string[];
}

const CATEGORIES = ["Plumbing", "Electrical", "HVAC", "Structural", "Auto", "DIY Craft"];
const SEVERITY_LEVELS = ["Minor", "Moderate", "Major", "Critical"];

const RISK_DATA: RiskCell[] = [
  // Plumbing
  { category: "Plumbing", severity: "Minor", risk: 1, ppe: [] },
  { category: "Plumbing", severity: "Moderate", risk: 2, ppe: ["Gloves"] },
  { category: "Plumbing", severity: "Major", risk: 4, ppe: ["Gloves", "Eye protection"] },
  { category: "Plumbing", severity: "Critical", risk: 8, ppe: ["Call professional"] },
  // Electrical
  { category: "Electrical", severity: "Minor", risk: 3, ppe: ["Non-contact tester"] },
  { category: "Electrical", severity: "Moderate", risk: 6, ppe: ["Insulated gloves", "Tester"] },
  { category: "Electrical", severity: "Major", risk: 9, ppe: ["Call professional"] },
  { category: "Electrical", severity: "Critical", risk: 10, ppe: ["Call professional"] },
  // HVAC
  { category: "HVAC", severity: "Minor", risk: 1, ppe: [] },
  { category: "HVAC", severity: "Moderate", risk: 3, ppe: ["Dust mask"] },
  { category: "HVAC", severity: "Major", risk: 7, ppe: ["Call professional"] },
  { category: "HVAC", severity: "Critical", risk: 10, ppe: ["Gas = Call 911"] },
  // Structural
  { category: "Structural", severity: "Minor", risk: 2, ppe: ["Dust mask"] },
  { category: "Structural", severity: "Moderate", risk: 4, ppe: ["Hard hat", "Dust mask"] },
  { category: "Structural", severity: "Major", risk: 8, ppe: ["Call engineer"] },
  { category: "Structural", severity: "Critical", risk: 10, ppe: ["Evacuate", "Call engineer"] },
  // Auto
  { category: "Auto", severity: "Minor", risk: 1, ppe: [] },
  { category: "Auto", severity: "Moderate", risk: 3, ppe: ["Gloves", "Jack stands"] },
  { category: "Auto", severity: "Major", risk: 6, ppe: ["Call mechanic"] },
  { category: "Auto", severity: "Critical", risk: 9, ppe: ["Call professional"] },
  // DIY Craft
  { category: "DIY Craft", severity: "Minor", risk: 1, ppe: [] },
  { category: "DIY Craft", severity: "Moderate", risk: 2, ppe: ["Eye protection"] },
  { category: "DIY Craft", severity: "Major", risk: 4, ppe: ["Respirator", "Gloves"] },
  { category: "DIY Craft", severity: "Critical", risk: 6, ppe: ["Full PPE", "Ventilation"] },
];

const getRiskColor = (risk: number): string => {
  if (risk <= 2) return "#00FF88";
  if (risk <= 4) return "#7FFF00";
  if (risk <= 6) return "#FF8800";
  if (risk <= 8) return "#FF4444";
  return "#FF0000";
};

export function RiskHeatmap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedCell, setSelectedCell] = useState<RiskCell | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !mounted) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 420;
    const height = 260;
    const margin = { top: 40, right: 16, bottom: 16, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const cellWidth = innerWidth / SEVERITY_LEVELS.length;
    const cellHeight = innerHeight / CATEGORIES.length;

    // Column headers
    g.selectAll(".col-header")
      .data(SEVERITY_LEVELS)
      .enter()
      .append("text")
      .attr("class", "col-header")
      .attr("x", (d, i) => i * cellWidth + cellWidth / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("fill", "#666")
      .attr("font-size", 10)
      .text(d => d);

    // Row headers
    g.selectAll(".row-header")
      .data(CATEGORIES)
      .enter()
      .append("text")
      .attr("class", "row-header")
      .attr("x", -10)
      .attr("y", (d, i) => i * cellHeight + cellHeight / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#888")
      .attr("font-size", 10)
      .text(d => d);

    // Cells
    const cells = g.selectAll(".cell")
      .data(RISK_DATA)
      .enter()
      .append("g")
      .attr("class", "cell")
      .attr("transform", d => {
        const col = SEVERITY_LEVELS.indexOf(d.severity);
        const row = CATEGORIES.indexOf(d.category);
        return `translate(${col * cellWidth}, ${row * cellHeight})`;
      });

    cells.append("rect")
      .attr("width", cellWidth - 2)
      .attr("height", cellHeight - 2)
      .attr("rx", 4)
      .attr("fill", d => getRiskColor(d.risk))
      .attr("fill-opacity", 0)
      .attr("stroke", "#222")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseenter", function(event, d) {
        gsap.to(this, {
          fillOpacity: 1,
          strokeWidth: 2,
          stroke: "#fff",
          duration: 0.2,
        });
        setSelectedCell(d);
        if (tooltipRef.current) {
          tooltipRef.current.style.display = "block";
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            tooltipRef.current.style.left = `${event.clientX - rect.left + 10}px`;
            tooltipRef.current.style.top = `${event.clientY - rect.top - 10}px`;
          }
        }
      })
      .on("mouseleave", function() {
        gsap.to(this, {
          fillOpacity: 0.7,
          strokeWidth: 1,
          stroke: "#222",
          duration: 0.2,
        });
        setSelectedCell(null);
        if (tooltipRef.current) {
          tooltipRef.current.style.display = "none";
        }
      });

    // Animate cells
    cells.selectAll("rect").each(function(d, i) {
      gsap.to(this, {
        fillOpacity: 0.7,
        duration: 0.4,
        delay: i * 0.02,
        ease: "power2.out",
      });
    });

    // Risk level numbers
    cells.append("text")
      .attr("x", (cellWidth - 2) / 2)
      .attr("y", (cellHeight - 2) / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", d => d.risk >= 6 ? "#fff" : "#000")
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .attr("opacity", 0)
      .text(d => d.risk);

    cells.selectAll("text:last-child").each(function(d, i) {
      gsap.to(this, {
        opacity: 1,
        duration: 0.3,
        delay: 0.3 + i * 0.02,
      });
    });

  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Risk Assessment Matrix</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#00FF88" }} />
            <span className="text-xs text-neutral-500">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#FF8800" }} />
            <span className="text-xs text-neutral-500">Med</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#FF0000" }} />
            <span className="text-xs text-neutral-500">High</span>
          </div>
        </div>
      </div>
      <svg ref={svgRef} viewBox="0 0 420 260" className="w-full" />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute hidden pointer-events-none z-10 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl min-w-[160px]"
        style={{ display: "none" }}
      >
        {selectedCell && (
          <>
            <div className="font-semibold text-white text-sm">
              {selectedCell.category} · {selectedCell.severity}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-neutral-400">Risk Level:</span>
              <span
                className="text-sm font-mono font-bold"
                style={{ color: getRiskColor(selectedCell.risk) }}
              >
                {selectedCell.risk}/10
              </span>
            </div>
            {selectedCell.ppe.length > 0 && (
              <div className="mt-2 pt-2 border-t border-neutral-700">
                <div className="text-xs text-neutral-500 mb-1">Safety Required:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedCell.ppe.map((item, i) => (
                    <span
                      key={i}
                      className="text-xs px-1.5 py-0.5 rounded bg-[#FF8800]/20 text-[#FF8800]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

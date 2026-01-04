"use client";

import { useRef, useEffect } from "react";
import * as d3 from "d3";

interface SpendingBarProps {
  data: { category: string; total: number }[];
  height?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Repairs: "#5eead4",
  Groceries: "#a78bfa",
  Utilities: "#fbbf24",
  Transportation: "#3b82f6",
  Entertainment: "#f472b6",
  Healthcare: "#22c55e",
  Other: "#64748b",
};

export function SpendingBar({ data, height = 200 }: SpendingBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const margin = { top: 8, right: 8, bottom: 24, left: 8 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.category) || 0)
      .attr("width", x.bandwidth())
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("rx", 4)
      .attr("fill", (d) => CATEGORY_COLORS[d.category] || "#64748b")
      .transition()
      .duration(800)
      .delay((_, i) => i * 100)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => y(d.total))
      .attr("height", (d) => innerHeight - y(d.total));

    // X Axis labels
    g.selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => (x(d.category) || 0) + x.bandwidth() / 2)
      .attr("y", innerHeight + 16)
      .attr("text-anchor", "middle")
      .attr("fill", "#666")
      .attr("font-size", "10px")
      .text((d) => d.category.slice(0, 8));

    // Value labels on bars
    g.selectAll(".value")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value")
      .attr("x", (d) => (x(d.category) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.total) - 6)
      .attr("text-anchor", "middle")
      .attr("fill", "#888")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .style("opacity", 0)
      .text((d) => `$${d.total.toLocaleString()}`)
      .transition()
      .duration(400)
      .delay(800)
      .style("opacity", 1);

  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-[#666] text-sm">
        No spending data this month
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}

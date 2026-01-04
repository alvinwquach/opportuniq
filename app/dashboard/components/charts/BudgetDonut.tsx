"use client";

import { useRef, useEffect } from "react";
import * as d3 from "d3";

interface BudgetDonutProps {
  spent: number;
  remaining: number;
  total: number;
  size?: number;
}

export function BudgetDonut({ spent, remaining, total, size = 120 }: BudgetDonutProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.7;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Data for the donut
    const data = [
      { label: "Spent", value: spent, color: "#5eead4" },
      { label: "Remaining", value: Math.max(0, remaining), color: "#1f1f1f" },
    ];

    // If overspent, show in red
    if (remaining < 0) {
      data[0].color = "#f87171";
      data[1].value = 0;
    }

    const pie = d3
      .pie<{ label: string; value: number; color: string }>()
      .value((d) => d.value)
      .sort(null)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI * 1.5);

    const arc = d3
      .arc<d3.PieArcDatum<{ label: string; value: number; color: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4)
      .padAngle(0.02);

    // Background track
    g.append("circle")
      .attr("r", (radius + innerRadius) / 2)
      .attr("fill", "none")
      .attr("stroke", "#1f1f1f")
      .attr("stroke-width", radius - innerRadius);

    // Arcs
    const arcs = g
      .selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("class", "arc")
      .attr("fill", (d) => d.data.color)
      .attr("d", arc)
      .style("opacity", 0)
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .style("opacity", 1)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: d.startAngle, endAngle: d.startAngle }, d);
        return (t) => arc(interpolate(t)) || "";
      });

    // Center text - percentage
    const percent = total > 0 ? Math.round((spent / total) * 100) : 0;

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.1em")
      .attr("fill", "#fff")
      .attr("font-size", "1.5rem")
      .attr("font-weight", "600")
      .text(`${percent}%`);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .attr("fill", "#666")
      .attr("font-size", "0.65rem")
      .text("of budget");

  }, [spent, remaining, total, size]);

  return <svg ref={svgRef} />;
}

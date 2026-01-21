import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import type { Risk } from "../types";

interface UseRiskChartOptions {
  risks: Risk[];
  isVisible: boolean;
}

export function useRiskChart({ risks, isVisible }: UseRiskChartOptions) {
  const riskChartRef = useRef<SVGSVGElement>(null);

  const drawRiskChart = useCallback(() => {
    if (!riskChartRef.current || !isVisible) return;

    const svg = d3.select(riskChartRef.current);
    svg.selectAll("*").remove();

    const width = riskChartRef.current.clientWidth;
    const height = riskChartRef.current.clientHeight;

    if (width === 0 || height === 0) return;

    const margin = { top: 20, right: 50, bottom: 40, left: 130 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);
    const yScale = d3
      .scaleBand()
      .domain(risks.map((d) => d.category))
      .range([0, innerHeight])
      .padding(0.3);

    // Background gridlines
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(innerHeight)
          .tickFormat(() => "")
          .ticks(5)
      )
      .attr("stroke-opacity", 0.1)
      .attr("stroke", "#a3a3a3")
      .selectAll("line")
      .attr("stroke-dasharray", "3,3");

    // Bars with animation
    g.selectAll(".bar")
      .data(risks)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => yScale(d.category)!)
      .attr("height", yScale.bandwidth())
      .attr("x", 0)
      .attr("width", 0)
      .attr("fill", (d) => d.color)
      .attr("rx", 4)
      .transition()
      .duration(800)
      .delay((_, i) => i * 100)
      .attr("width", (d) => xScale(d.likelihood));

    // Severity indicators
    g.selectAll(".severity-badge")
      .data(risks)
      .enter()
      .append("text")
      .attr("class", "severity-badge")
      .attr("x", innerWidth + 8)
      .attr("y", (d) => yScale(d.category)! + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("fill", (d) => d.color)
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .text((d) => d.severity.toUpperCase())
      .attr("opacity", 0)
      .transition()
      .duration(400)
      .delay((_, i) => i * 100 + 800)
      .attr("opacity", 1);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .attr("font-size", "11px")
      .attr("color", "#525252")
      .selectAll("path, line")
      .attr("stroke", "#e5e5e5");

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat((d) => `${d}%`))
      .attr("font-size", "10px")
      .attr("color", "#737373")
      .selectAll("path, line")
      .attr("stroke", "#e5e5e5");

    svg
      .append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#737373")
      .attr("font-size", "10px")
      .text("Likelihood (%)");
  }, [risks, isVisible]);

  // Redraw chart when risks card becomes visible
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        drawRiskChart();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, drawRiskChart]);

  return { riskChartRef };
}

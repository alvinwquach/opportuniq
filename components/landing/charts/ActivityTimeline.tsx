"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import * as d3 from "d3";

/**
 * Activity Timeline
 *
 * D3.js timeline showing user activity over time
 * Issues submitted, decisions made, savings accumulated
 * Animated scroll-based reveal
 */

interface Activity {
  date: Date;
  type: "issue" | "decision" | "savings";
  label: string;
  value?: number;
}

// Generate sample data for last 30 days
const generateSampleData = (): Activity[] => {
  const activities: Activity[] = [];
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Random activities per day
    const numActivities = Math.floor(Math.random() * 3);
    for (let j = 0; j < numActivities; j++) {
      const types: Array<"issue" | "decision" | "savings"> = ["issue", "decision", "savings"];
      const type = types[Math.floor(Math.random() * types.length)];

      activities.push({
        date: new Date(date),
        type,
        label: type === "issue" ? "New issue submitted" :
               type === "decision" ? "Decision made" :
               "Savings recorded",
        value: type === "savings" ? Math.floor(Math.random() * 200) + 50 : undefined,
      });
    }
  }

  return activities.sort((a, b) => a.date.getTime() - b.date.getTime());
};

const TYPE_COLORS = {
  issue: "#00F0FF",
  decision: "#00FF88",
  savings: "#FF8800",
};

export function ActivityTimeline() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);
  const [data] = useState<Activity[]>(generateSampleData());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !mounted) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 480;
    const height = 180;
    const margin = { top: 16, right: 16, bottom: 32, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Group by date
    const dateGroups = d3.group(data, d => d3.timeDay(d.date).getTime());
    const aggregatedData = Array.from(dateGroups, ([time, activities]) => ({
      date: new Date(time),
      issues: activities.filter(a => a.type === "issue").length,
      decisions: activities.filter(a => a.type === "decision").length,
      savings: activities.filter(a => a.type === "savings").reduce((sum, a) => sum + (a.value || 0), 0),
    }));

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(aggregatedData, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d.issues + d.decisions) || 5])
      .range([innerHeight, 0])
      .nice();

    // Area for stacked data
    const stackedData = d3.stack<typeof aggregatedData[0]>()
      .keys(["issues", "decisions"])
      .value((d, key) => d[key as keyof typeof d] as number)
      (aggregatedData);

    const area = d3.area<d3.SeriesPoint<typeof aggregatedData[0]>>()
      .x(d => xScale(d.data.date))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    // Draw stacked areas
    const colors = ["#00F0FF", "#00FF88"];
    stackedData.forEach((layer, i) => {
      const path = g.append("path")
        .datum(layer)
        .attr("fill", colors[i])
        .attr("fill-opacity", 0.3)
        .attr("d", area);

      // Animate area
      const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0;
      gsap.fromTo(path.node(),
        { opacity: 0 },
        { opacity: 1, duration: 0.8, delay: i * 0.2, ease: "power2.out" }
      );
    });

    // Line for savings trend
    const savingsLine = d3.line<typeof aggregatedData[0]>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.savings / 50)) // Normalize
      .curve(d3.curveMonotoneX);

    const linePath = g.append("path")
      .datum(aggregatedData)
      .attr("fill", "none")
      .attr("stroke", "#FF8800")
      .attr("stroke-width", 2)
      .attr("d", savingsLine);

    const lineLength = linePath.node()?.getTotalLength() || 0;
    linePath
      .attr("stroke-dasharray", lineLength)
      .attr("stroke-dashoffset", lineLength);

    gsap.to(linePath.node(), {
      strokeDashoffset: 0,
      duration: 1.5,
      delay: 0.5,
      ease: "power2.out",
    });

    // Points for savings
    const savingsPoints = g.selectAll(".savings-point")
      .data(aggregatedData.filter(d => d.savings > 0))
      .enter()
      .append("circle")
      .attr("class", "savings-point")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.savings / 50))
      .attr("r", 0)
      .attr("fill", "#FF8800");

    savingsPoints.each(function(d, i) {
      gsap.to(this, {
        attr: { r: 4 },
        duration: 0.3,
        delay: 1 + i * 0.05,
        ease: "back.out(1.7)",
      });
    });

    // X Axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat("%b %d") as any));

    xAxis.selectAll("text").attr("fill", "#666").attr("font-size", 9);
    xAxis.selectAll("line").attr("stroke", "#333");
    xAxis.select(".domain").attr("stroke", "#333");

    // Y Axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(4));

    yAxis.selectAll("text").attr("fill", "#666").attr("font-size", 9);
    yAxis.selectAll("line").attr("stroke", "#333");
    yAxis.select(".domain").attr("stroke", "#333");

  }, [data, mounted]);

  // Calculate totals
  const totals = data.reduce((acc, activity) => ({
    issues: acc.issues + (activity.type === "issue" ? 1 : 0),
    decisions: acc.decisions + (activity.type === "decision" ? 1 : 0),
    savings: acc.savings + (activity.value || 0),
  }), { issues: 0, decisions: 0, savings: 0 });

  if (!mounted) return null;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Activity Timeline (30 days)</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS.issue }} />
            <span className="text-xs text-neutral-400">Issues ({totals.issues})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS.decision }} />
            <span className="text-xs text-neutral-400">Decisions ({totals.decisions})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS.savings }} />
            <span className="text-xs text-neutral-400">Savings (${totals.savings})</span>
          </div>
        </div>
      </div>
      <svg ref={svgRef} viewBox="0 0 480 180" className="w-full" />
    </div>
  );
}

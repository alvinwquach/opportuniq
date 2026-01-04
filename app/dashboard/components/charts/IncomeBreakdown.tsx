"use client";

import { useRef, useEffect } from "react";
import * as d3 from "d3";

interface IncomeStream {
  id: string;
  source: string;
  amount: string;
  frequency: string;
}

interface IncomeBreakdownProps {
  streams: IncomeStream[];
  monthlyTotal: number;
  size?: number;
}

const FREQUENCY_TO_MONTHLY: Record<string, number> = {
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
};

const COLORS = ["#5eead4", "#a78bfa", "#fbbf24", "#3b82f6", "#f472b6", "#22c55e"];

export function IncomeBreakdown({ streams, monthlyTotal, size = 100 }: IncomeBreakdownProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || streams.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.6;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Convert streams to monthly values
    const data = streams.map((s, i) => ({
      source: s.source,
      value: Number(s.amount) * (FREQUENCY_TO_MONTHLY[s.frequency] || 0),
      color: COLORS[i % COLORS.length],
    }));

    const pie = d3
      .pie<{ source: string; value: number; color: string }>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<{ source: string; value: number; color: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(2)
      .padAngle(0.03);

    // Arcs
    g.selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("class", "arc")
      .attr("fill", (d) => d.data.color)
      .style("opacity", 0)
      .transition()
      .duration(600)
      .ease(d3.easeCubicOut)
      .style("opacity", 1)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t) => arc(interpolate(t)) || "";
      });

  }, [streams, size]);

  if (streams.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <svg ref={svgRef} />
      <div className="flex flex-col gap-1.5">
        {streams.slice(0, 4).map((stream, i) => {
          const monthly = Number(stream.amount) * (FREQUENCY_TO_MONTHLY[stream.frequency] || 0);
          const percent = monthlyTotal > 0 ? Math.round((monthly / monthlyTotal) * 100) : 0;
          return (
            <div key={stream.id} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-[11px] text-[#888]">
                {stream.source} <span className="text-[#555]">({percent}%)</span>
              </span>
            </div>
          );
        })}
        {streams.length > 4 && (
          <span className="text-[10px] text-[#555]">+{streams.length - 4} more</span>
        )}
      </div>
    </div>
  );
}

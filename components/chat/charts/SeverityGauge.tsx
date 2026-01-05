"use client";

import type { SeverityData } from "@/lib/types/diagnosis";

interface SeverityGaugeProps {
  data: SeverityData;
  className?: string;
}

export function SeverityGauge({ data, className }: SeverityGaugeProps) {
  const percentage = (data.score / 10) * 100;

  // Gauge dimensions
  const cx = 100; // center x
  const cy = 90;  // center y (pivot point at bottom)
  const innerRadius = 55;
  const outerRadius = 75;

  // Arc segments: green -> yellow -> orange -> red
  const segments = [
    { color: "#22c55e", start: 0, end: 30 },
    { color: "#eab308", start: 30, end: 60 },
    { color: "#f97316", start: 60, end: 80 },
    { color: "#ef4444", start: 80, end: 100 },
  ];

  // Convert percentage (0-100) to angle in radians
  // 0% = left (π radians = 180°), 100% = right (0 radians = 0°)
  // Arc goes counterclockwise from left to right across the TOP
  const pctToAngle = (pct: number) => Math.PI * (1 - pct / 100);

  // Create arc path for a segment
  const describeArc = (startPct: number, endPct: number) => {
    const startAngle = pctToAngle(startPct);
    const endAngle = pctToAngle(endPct);

    // Start point (outer arc, at startPct)
    const x1 = cx + outerRadius * Math.cos(startAngle);
    const y1 = cy - outerRadius * Math.sin(startAngle);

    // End point (outer arc, at endPct)
    const x2 = cx + outerRadius * Math.cos(endAngle);
    const y2 = cy - outerRadius * Math.sin(endAngle);

    // Inner arc start (at endPct)
    const x3 = cx + innerRadius * Math.cos(endAngle);
    const y3 = cy - innerRadius * Math.sin(endAngle);

    // Inner arc end (at startPct)
    const x4 = cx + innerRadius * Math.cos(startAngle);
    const y4 = cy - innerRadius * Math.sin(startAngle);

    const largeArc = (endPct - startPct) > 50 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  // Needle position - points from center upward into the arc
  const needleAngle = pctToAngle(percentage);
  const needleLength = 50;
  const needleTipX = cx + needleLength * Math.cos(needleAngle);
  const needleTipY = cy - needleLength * Math.sin(needleAngle);

  // Needle base (perpendicular to needle direction, for triangular shape)
  const baseAngle = needleAngle + Math.PI / 2;
  const baseWidth = 4;
  const base1X = cx + baseWidth * Math.cos(baseAngle);
  const base1Y = cy - baseWidth * Math.sin(baseAngle);
  const base2X = cx - baseWidth * Math.cos(baseAngle);
  const base2Y = cy + baseWidth * Math.sin(baseAngle);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-white">Severity</h4>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${data.color}20`, color: data.color }}
        >
          {data.label}
        </span>
      </div>
      <div className="relative w-full flex items-center justify-center">
        <svg viewBox="0 0 200 115" className="w-full max-w-[200px]">
          {segments.map((segment, i) => (
            <path
              key={i}
              d={describeArc(segment.start, segment.end)}
              fill={segment.color}
              opacity={0.2}
            />
          ))}
          {percentage > 0 && (
            <path
              d={describeArc(0, Math.min(percentage, 100))}
              fill={data.color}
            />
          )}
          <polygon
            points={`${base1X},${base1Y} ${base2X},${base2Y} ${needleTipX},${needleTipY}`}
            fill="#ffffff"
          />
          <circle cx={cx} cy={cy} r="8" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="3" fill="#ffffff" />
          <text x={cx} y="110" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="600">
            {data.score}/10
          </text>
        </svg>
      </div>
      <p className="text-xs text-[#888888] text-center mt-2 leading-relaxed">
        {data.description}
      </p>
    </div>
  );
}

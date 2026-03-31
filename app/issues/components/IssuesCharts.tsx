// Tell Next.js this component runs in the browser (not on the server).
// Recharts uses browser-specific APIs (like canvas and SVG measurements) that
// are not available during server-side rendering, so this directive is required.
"use client";

// Import chart building blocks from the Recharts library.
// Recharts is a React charting library built on top of SVG.
// Each import is a specific piece used to construct the three charts on this page:
//
// For the "Savings Over Time" area chart:
// - AreaChart: the outer container for an area (filled line) chart
// - Area: defines the line and the filled area beneath it
//
// For the "By Category" donut/pie chart:
// - PieChart: the outer container for a pie or donut chart
// - Pie: defines the slices of the pie
// - Cell: lets us color each individual slice differently
//
// For the "How Issues Were Resolved" bar chart:
// - BarChart: the outer container for a bar chart
// - Bar: defines the bars; Cell is reused here too for per-bar coloring
//
// Shared across all three charts:
// - XAxis: the horizontal axis with labels
// - YAxis: the vertical axis with labels
// - Tooltip: the popup that appears when hovering over a data point
// - ResponsiveContainer: a wrapper that makes any chart resize fluidly to fill its parent element
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Import TypeScript types for the shape of each chart's data:
// - MonthlySavingsPoint: one data point for the savings chart (month label + cumulative savings amount)
// - CategoryCount: one entry in the category pie chart (category name + issue count + display color)
// - IssueResolutionStats: an object with diy count, pro count, and diySuccessRate percentage
import type { MonthlySavingsPoint, CategoryCount, IssueResolutionStats } from "@/lib/hooks/types";

// Define the props (inputs) this component accepts:
// - savingsOverTime: array of monthly data points for the "Savings Over Time" area chart
// - categoryDistribution: array of category counts for the "By Category" donut chart
// - resolutionBreakdown: DIY vs professional counts and success rate for the bar chart
interface IssuesChartsProps {
  savingsOverTime: MonthlySavingsPoint[];
  categoryDistribution: CategoryCount[];
  resolutionBreakdown: IssueResolutionStats;
}

// IssuesCharts renders a row of three data visualisation panels:
// 1. Savings Over Time — an area chart showing cumulative DIY savings per month
// 2. By Category — a donut pie chart showing how issues are distributed across categories
// 3. How Issues Were Resolved — a horizontal bar chart comparing DIY vs professional repairs
export function IssuesCharts({
  savingsOverTime,
  categoryDistribution,
  resolutionBreakdown,
}: IssuesChartsProps) {
  // Build the data array for the "How Issues Were Resolved" bar chart.
  // Each object has a name (the bar label), a value (bar length = issue count),
  // and a color (the fill color of that bar).
  // We define this here rather than inline in JSX to keep the chart markup readable.
  const resolutionData = [
    // Green bar for issues resolved by the user themselves (DIY)
    { name: "DIY", value: resolutionBreakdown.diy, color: "#3ECF8E" },
    // Purple bar for issues resolved by hiring a professional
    { name: "Professional", value: resolutionBreakdown.pro, color: "#8b5cf6" },
  ];

  return (
    // Outer grid: 1 column on mobile, 3 equal columns on medium+ screens.
    // Each column holds one chart panel. Bottom margin separates charts from the filters below.
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

      {/* ── Chart 1: Savings Over Time ── */}
      {/* Dark card panel with a border and padding */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-1">Savings Over Time</h3>
        <p className="text-xs text-[#666] mb-3">Cumulative savings from DIY repairs</p>

        {/* Fixed-height container for the chart — Recharts needs an explicit height to render */}
        <div className="h-32">
          {/* ResponsiveContainer makes the chart stretch to 100% of the parent div's width */}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={savingsOverTime}>

              {/* SVG <defs> block lets us define reusable SVG definitions, like a gradient.
                  This gradient is referenced by the Area fill below — it makes the filled area
                  fade from semi-transparent green at the top to fully transparent at the bottom. */}
              <defs>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  {/* Top of the gradient: green at 30% opacity */}
                  <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} />
                  {/* Bottom of the gradient: fully transparent (fade to nothing) */}
                  <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* X-axis: uses the "month" field from each data point as the tick label.
                  axisLine=false and tickLine=false hide the axis baseline and tick marks
                  to keep the chart looking minimal and clean. */}
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#666", fontSize: 10 }}
              />

              {/* Y-axis: hidden entirely so the chart is cleaner.
                  The area shape itself conveys the trend without needing numeric y-axis labels. */}
              <YAxis hide />

              {/* Tooltip: the popup box that appears when the user hovers over a data point.
                  contentStyle sets the dark background and rounded border to match the page theme.
                  formatter: converts the raw number to a dollar string like "$120" with "Saved" as the label. */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#888" }}
                formatter={(value: number) => [`$${value.toFixed(0)}`, "Saved"]}
              />

              {/* The Area itself: draws the line and fills the area beneath it.
                  - type="monotone" makes the line curve smoothly between points
                  - dataKey="savings" tells Recharts which field from each data object to plot on the y-axis
                  - stroke: the color of the line itself (green)
                  - strokeWidth: how thick the line is (2px)
                  - fill: references the gradient defined above so the area fades from green to transparent */}
              <Area
                type="monotone"
                dataKey="savings"
                stroke="#3ECF8E"
                strokeWidth={2}
                fill="url(#savingsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Chart 2: Issues by Category ── */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-1">By Category</h3>
        <p className="text-xs text-[#666] mb-3">Issue distribution</p>

        {/* Side-by-side layout: the donut chart on the left, the legend list on the right */}
        <div className="flex items-center gap-4">
          {/* Fixed square box for the donut chart */}
          <div className="h-32 w-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* Pie component: renders the donut slices.
                    - cx/cy: position the center of the donut in the middle of the container
                    - innerRadius/outerRadius: the hole in the middle makes it a "donut" shape
                    - paddingAngle: a small gap between slices for visual separation
                    - dataKey="value" tells Recharts which field is the numeric size of each slice */}
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {/* Render one <Cell> per category entry so each slice gets its own unique color.
                      `index` is the position in the array, used to build a unique React key. */}
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>

                {/* Tooltip: shows the category name and count when hovering over a slice */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend list: shows the top 4 categories with a colored dot, name, and count.
              flex-1 makes this column expand to fill the remaining space beside the donut. */}
          <div className="flex-1 space-y-1.5">
            {/* slice(0, 4) limits the legend to the four most common categories
                so the panel doesn't overflow if there are many categories */}
            {categoryDistribution.slice(0, 4).map((cat) => (
              // Each row: colored dot on the left, category name, and issue count on the right
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {/* Small colored circle — same color as the corresponding donut slice */}
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {/* Category name in muted grey */}
                  <span className="text-[#888]">{cat.name}</span>
                </div>
                {/* Issue count in white, bold — the number of issues in this category */}
                <span className="text-white font-medium">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chart 3: Resolution Breakdown ── */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-1">How Issues Were Resolved</h3>
        <p className="text-xs text-[#666] mb-3">DIY vs Professional</p>

        {/* Fixed-height container for the horizontal bar chart */}
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            {/* layout="vertical" makes the bars run horizontally (left to right)
                instead of the default vertical (bottom to top) orientation */}
            <BarChart data={resolutionData} layout="vertical">

              {/* X-axis: represents the number of issues (numeric).
                  Hidden to keep the chart clean — the bar lengths convey the values. */}
              <XAxis type="number" hide />

              {/* Y-axis: shows the category labels ("DIY" and "Professional").
                  - type="category" tells Recharts these are text labels, not numbers
                  - dataKey="name" reads the bar label from each data object's "name" field
                  - axisLine/tickLine hidden for a cleaner look
                  - width=80 gives enough space for the "Professional" label without truncation */}
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888", fontSize: 11 }}
                width={80}
              />

              {/* Tooltip: shows the count and a "Issues" label when hovering over a bar */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [value, "Issues"]}
              />

              {/* Bar: renders each horizontal bar.
                  - dataKey="value" reads the bar length from each data object's "value" field
                  - radius=[0, 4, 4, 0] rounds only the right end of each bar (the far end from the y-axis)
                    so it looks polished without clashing with the axis */}
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {/* Give each bar its own color by rendering one Cell per data entry */}
                {resolutionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary footer below the chart: shows the calculated DIY success rate as a percentage */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2a2a2a]">
          <span className="text-xs text-[#666]">DIY Success Rate</span>
          {/* The percentage is displayed in large green text to highlight it as a positive metric */}
          <span className="text-sm font-semibold text-emerald-400">
            {resolutionBreakdown.diySuccessRate}%
          </span>
        </div>
      </div>
    </div>
  );
}

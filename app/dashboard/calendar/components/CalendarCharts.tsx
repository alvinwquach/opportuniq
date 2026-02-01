"use client";

import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type {
  EventTypeDistribution,
  WeeklyActivity,
  MonthlyComparison,
} from "../types";

interface CalendarChartsProps {
  eventTypeDistribution: EventTypeDistribution[];
  weeklyActivity: WeeklyActivity[];
  monthlyComparison: MonthlyComparison[];
}

export function CalendarCharts({
  eventTypeDistribution,
  weeklyActivity,
  monthlyComparison,
}: CalendarChartsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Event Distribution */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5 overflow-visible">
        <h3 className="text-sm font-medium text-white mb-4">
          Event Distribution
        </h3>
        <div className="h-[180px] overflow-visible">
          {eventTypeDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[#666] text-sm">
              No events this month
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {eventTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  wrapperStyle={{ zIndex: 1000 }}
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#888" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {eventTypeDistribution.length > 0 && (
          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            {eventTypeDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-[#888]">
                  {item.name.replace(" Projects", "")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Activity */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5 overflow-visible">
        <h3 className="text-sm font-medium text-white mb-4">Weekly Activity</h3>
        <div className="h-[180px] overflow-visible">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivity} barGap={4}>
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "#666" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#888" }}
                formatter={(value: number, name: string) => [
                  value,
                  name === "events" ? "Events" : `$${value}`,
                ]}
              />
              <Bar
                dataKey="events"
                fill="#3ECF8E"
                radius={[4, 4, 0, 0]}
                name="Events"
              />
              <Bar
                dataKey="expenses"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name="Expenses"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-[#888]">Events</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-[#888]">Expenses</span>
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
        <h3 className="text-sm font-medium text-white mb-4">Monthly Trend</h3>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyComparison}>
              <defs>
                <linearGradient id="colorEventsChart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="colorCompletedChart"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#249361" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#249361" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#666" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#888" }}
              />
              <Area
                type="monotone"
                dataKey="events"
                stroke="#3ECF8E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEventsChart)"
                name="Scheduled"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#249361"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCompletedChart)"
                name="Completed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-[#888]">Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-[#888]">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

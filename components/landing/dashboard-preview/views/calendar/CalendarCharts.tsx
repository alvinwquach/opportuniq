"use client";

import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { eventTypeData, weeklyActivityData, monthComparisonData } from './data';

export function CalendarCharts() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Event Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-visible">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Event Distribution</h3>
        <p className="text-xs text-gray-500 mb-3">By type this month</p>
        <div className="h-[160px] overflow-visible">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={eventTypeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={3}
                dataKey="value"
              >
                {eventTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#111827',
                }}
                formatter={(value: number, name: string) => [value, '']}
                labelFormatter={(label: string) => label}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          {eventTypeData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-gray-500">{item.name.replace(' Projects', '')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-visible">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Weekly Activity</h3>
        <p className="text-xs text-gray-500 mb-3">Events vs expenses</p>
        <div className="h-[160px] overflow-visible">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weeklyActivityData} barGap={2}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} hide />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#111827',
                }}
                formatter={(value: number, name: string) => [
                  name === 'expenses' ? `$${value}` : value,
                  name === 'expenses' ? 'Expenses' : 'Events'
                ]}
              />
              <Bar yAxisId="left" dataKey="events" fill="#2563EB" radius={[4, 4, 0, 0]} name="Events" barSize={16} />
              <Line yAxisId="right" type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} name="Expenses" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-gray-500">Events</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-gray-500">Expenses</span>
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Completion Rate</h3>
        <p className="text-xs text-gray-500 mb-3">Scheduled vs completed</p>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthComparisonData}>
              <defs>
                <linearGradient id="colorEventsChart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCompletedChart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#111827',
                }}
              />
              <Area
                type="monotone"
                dataKey="events"
                stroke="#2563EB"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEventsChart)"
                name="Scheduled"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#3b82f6"
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
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-gray-500">Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-gray-500">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

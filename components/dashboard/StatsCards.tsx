"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IoTrendingUp,
  IoTrendingDown,
  IoCash,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoCalendar,
} from "react-icons/io5";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

function StatCard({ title, value, description, trend, icon: Icon, iconColor = "text-primary" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center gap-2 mt-3">
            {trend.isPositive ? (
              <IoTrendingUp className="h-4 w-4 text-primary" />
            ) : (
              <IoTrendingDown className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium text-foreground">
              {trend.value}
            </span>
            <span className="text-sm text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  // Replace with real data from your database
  const stats = [
    {
      title: "Money Saved",
      value: "$847",
      description: "vs. hiring professionals",
      trend: {
        value: "+$127",
        isPositive: true,
        label: "vs last month",
      },
      icon: IoCash,
      iconColor: "text-primary",
    },
    {
      title: "Completed Projects",
      value: "12",
      description: "8 DIY, 4 hired",
      trend: {
        value: "+3",
        isPositive: true,
        label: "vs last month",
      },
      icon: IoCheckmarkCircle,
      iconColor: "text-primary",
    },
    {
      title: "Budget Remaining",
      value: "$432",
      description: "of $500 repair budget",
      trend: {
        value: "-$68",
        isPositive: false,
        label: "spent this month",
      },
      icon: IoTrendingUp,
      iconColor: "text-primary",
    },
    {
      title: "Active Projects",
      value: "3",
      description: "2 moderate, 1 low urgency",
      icon: IoAlertCircle,
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
}

// Alternative: Progress Ring Stats (like Mantine's Stats with Ring Progress)
export function ProgressRingStats() {
  const stats = [
    {
      label: "Budget Used",
      value: "$68",
      total: "$500",
      percentage: 14,
      color: "text-primary",
    },
    {
      label: "Projects Completed",
      value: "12",
      total: "15",
      percentage: 80,
      color: "text-primary",
    },
    {
      label: "DIY Success Rate",
      value: "88%",
      total: "100%",
      percentage: 88,
      color: "text-primary",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">of {stat.total}</p>
              </div>
              <div className="relative h-16 w-16">
                {/* Simple progress ring using conic-gradient */}
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background: `conic-gradient(
                      hsl(var(--primary)) ${stat.percentage}%,
                      hsl(var(--muted)) ${stat.percentage}%
                    )`,
                  }}
                >
                  <div className="absolute inset-2 rounded-full bg-card flex items-center justify-center">
                    <span className={cn("text-sm font-bold", stat.color)}>
                      {stat.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Segmented Stats (like Mantine's Stats Segments)
export function SegmentedStats() {
  const breakdown = [
    { category: "DIY Projects", count: 8, percentage: 67, color: "bg-primary" },
    { category: "Hired Help", count: 4, percentage: 33, color: "bg-muted" },
  ];

  const total = breakdown.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repair Method Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-3xl font-bold">{total} Total Repairs</div>

          {/* Segmented progress bar */}
          <div className="flex h-4 rounded-full overflow-hidden">
            {breakdown.map((item, i) => (
              <div
                key={i}
                className={cn(item.color)}
                style={{ width: `${item.percentage}%` }}
                title={`${item.category}: ${item.count}`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-2">
            {breakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn("h-3 w-3 rounded-full", item.color)} />
                  <span className="text-muted-foreground">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.count}</span>
                  <span className="text-muted-foreground">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

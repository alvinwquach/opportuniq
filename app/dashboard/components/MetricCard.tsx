"use client";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "teal" | "purple" | "blue" | "amber" | "red";
}

const colorClasses = {
  teal: "bg-blue-50 text-blue-600",
  purple: "bg-purple-500/10 text-purple-400",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-500/10 text-amber-400",
  red: "bg-red-500/10 text-red-400",
};

export function MetricCard({ label, value, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", colorClasses[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-lg font-semibold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
    </div>
  );
}

"use client";

import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
  color?: "default" | "success" | "warning" | "danger" | "info";
}

const colorClasses = {
  default: "text-white",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
  info: "text-blue-400",
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = "default",
}: MetricCardProps) {
  return (
    <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[11px] font-medium text-[#666] uppercase tracking-wider">
          {title}
        </p>
        {icon && <div className="text-[#444]">{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-semibold ${colorClasses[color]}`}>
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-[11px] text-[#555] mt-1">{subtitle}</p>
      )}
    </div>
  );
}

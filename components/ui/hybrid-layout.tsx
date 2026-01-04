"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { IoSunny, IoMoon } from "react-icons/io5";
import { TbSunMoon } from "react-icons/tb";

// ============================================================================
// THEME TOGGLE
// ============================================================================

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();

  return (
    <div className={cn("flex items-center gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800", className)}>
      <button
        onClick={() => setMode("light")}
        className={cn(
          "p-2 rounded-md transition-colors",
          mode === "light"
            ? "bg-white text-teal-600 shadow-sm"
            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        )}
        title="Light mode"
      >
        <IoSunny className="w-4 h-4" />
      </button>
      <button
        onClick={() => setMode("hybrid")}
        className={cn(
          "p-2 rounded-md transition-colors",
          mode === "hybrid"
            ? "bg-white dark:bg-neutral-700 text-teal-600 shadow-sm"
            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        )}
        title="Hybrid mode (default)"
      >
        <TbSunMoon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setMode("dark")}
        className={cn(
          "p-2 rounded-md transition-colors",
          mode === "dark"
            ? "bg-neutral-700 text-teal-400 shadow-sm"
            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        )}
        title="Dark mode"
      >
        <IoMoon className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================================
// PAGE WRAPPER - Handles full page background based on theme
// ============================================================================

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function HybridPageWrapper({ children, className }: PageWrapperProps) {
  const { mode } = useTheme();

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        mode === "dark" ? "bg-[#111111]" : "bg-white",
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// LIGHT SECTION - Text-heavy content areas
// ============================================================================

interface LightSectionProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "gradient" | "muted";
}

export function LightSection({ children, className, variant = "default" }: LightSectionProps) {
  const { mode } = useTheme();

  const variants = {
    default: mode === "dark" ? "bg-neutral-900" : "bg-white",
    subtle: mode === "dark" ? "bg-neutral-900/50" : "bg-neutral-50",
    gradient: mode === "dark"
      ? "bg-gradient-to-b from-neutral-900 to-[#111111]"
      : "bg-gradient-to-b from-neutral-50 to-white",
    muted: mode === "dark" ? "bg-neutral-950" : "bg-neutral-100",
  };

  return (
    <section
      className={cn(
        "transition-colors duration-300",
        variants[variant],
        className
      )}
    >
      {children}
    </section>
  );
}

// ============================================================================
// DARK PANEL - For charts, maps, and visual elements
// ============================================================================

interface DarkPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: "teal" | "blue" | "red" | "amber" | "purple";
}

const badgeColors = {
  teal: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function DarkPanel({
  children,
  className,
  title,
  subtitle,
  badge,
  badgeColor = "teal"
}: DarkPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden",
        "bg-[#111111] border-neutral-800",
        className
      )}
    >
      {(title || badge) && (
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          {badge && (
            <span className={cn("px-2 py-1 text-xs font-medium rounded-full border", badgeColors[badgeColor])}>
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// CHART CONTAINER - Specifically for D3/chart visualizations
// ============================================================================

interface ChartContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  legend?: Array<{ label: string; color: string; type?: "square" | "circle" }>;
}

export function ChartContainer({
  children,
  className,
  title,
  subtitle,
  legend
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden",
        "bg-[#111111] border-neutral-800",
        className
      )}
    >
      {title && (
        <div className="p-4 border-b border-neutral-800">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
      {legend && (
        <div className="px-4 pb-4 flex flex-wrap gap-4 justify-center">
          {legend.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className={cn("w-3 h-3", item.type === "circle" ? "rounded-full" : "rounded")}
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-neutral-400">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAP CONTAINER - For Mapbox visualizations
// ============================================================================

interface MapContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  location?: string;
  controls?: ReactNode;
  legend?: Array<{ label: string; color: string; type?: "square" | "circle" }>;
}

export function MapContainer({
  children,
  className,
  title,
  location,
  controls,
  legend
}: MapContainerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden",
        "bg-[#111111] border-neutral-800",
        className
      )}
    >
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="text-sm font-medium text-white">{title || "Map View"}</span>
        </div>
        <div className="flex items-center gap-3">
          {controls}
          {location && <span className="text-xs text-neutral-500">{location}</span>}
        </div>
      </div>
      <div className="relative">
        {children}
      </div>
      {legend && (
        <div className="p-3 border-t border-neutral-800 bg-neutral-900/50 flex flex-wrap gap-3">
          {legend.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "w-3 h-3",
                  item.type === "circle" ? "rounded-full" : "rounded",
                  !item.color.startsWith("#") && item.color
                )}
                style={item.color.startsWith("#") ? { backgroundColor: item.color } : undefined}
              />
              <span className="text-xs text-neutral-400">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STATS CARD - For metric displays in dark panels
// ============================================================================

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: { value: number; positive?: boolean };
  icon?: ReactNode;
  color?: "teal" | "blue" | "red" | "amber" | "green" | "purple";
}

const statColors = {
  teal: "text-teal-400",
  blue: "text-blue-400",
  red: "text-red-400",
  amber: "text-amber-400",
  green: "text-emerald-400",
  purple: "text-purple-400",
};

export function StatsCard({ label, value, change, icon, color = "teal" }: StatsCardProps) {
  return (
    <div className="p-4 rounded-xl bg-neutral-800/50 text-center">
      {icon && (
        <div className={cn("w-8 h-8 mx-auto mb-2 flex items-center justify-center", statColors[color])}>
          {icon}
        </div>
      )}
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className={cn("text-xl font-bold", statColors[color])}>{value}</p>
      {change && (
        <p className={cn("text-xs mt-1", change.positive ? "text-emerald-400" : "text-red-400")}>
          {change.positive ? "+" : ""}{change.value}%
        </p>
      )}
    </div>
  );
}

// ============================================================================
// CONTENT CARD - Light mode card for text content
// ============================================================================

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function ContentCard({ children, className, hoverable = false }: ContentCardProps) {
  const { mode } = useTheme();

  return (
    <div
      className={cn(
        "rounded-xl border p-6 transition-all duration-200",
        mode === "dark"
          ? "bg-neutral-900 border-neutral-800"
          : "bg-white border-neutral-200",
        hoverable && (mode === "dark"
          ? "hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10"
          : "hover:border-teal-300 hover:shadow-md"),
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// HYBRID SECTION - Side by side text + visual
// ============================================================================

interface HybridSectionProps {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
}

export function HybridSection({ children, className, reverse = false }: HybridSectionProps) {
  const { mode } = useTheme();

  return (
    <section
      className={cn(
        "py-20 px-6",
        mode === "dark" ? "bg-[#111111]" : "bg-white",
        className
      )}
    >
      <div className={cn(
        "max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center",
        reverse && "lg:[&>*:first-child]:order-2"
      )}>
        {children}
      </div>
    </section>
  );
}

// ============================================================================
// SECTION HEADER - Consistent section titles
// ============================================================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string; // Alias for subtitle
  badge?: string;
  badgeColor?: "teal" | "blue" | "red" | "amber" | "purple";
  align?: "left" | "center";
  centered?: boolean; // Alias for align="center"
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  description,
  badge,
  badgeColor = "teal",
  align = "center",
  centered,
  className
}: SectionHeaderProps) {
  // Support both subtitle and description props
  const displaySubtitle = subtitle || description;
  // Support centered prop as alias for align="center"
  const alignment = centered ? "center" : align;
  const { mode } = useTheme();

  const badgeStyles = {
    teal: mode === "dark"
      ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
      : "bg-teal-50 border-teal-200 text-teal-700",
    blue: mode === "dark"
      ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
      : "bg-blue-50 border-blue-200 text-blue-700",
    red: mode === "dark"
      ? "bg-red-500/10 border-red-500/30 text-red-400"
      : "bg-red-50 border-red-200 text-red-700",
    amber: mode === "dark"
      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
      : "bg-amber-50 border-amber-200 text-amber-700",
    purple: mode === "dark"
      ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
      : "bg-purple-50 border-purple-200 text-purple-700",
  };

  return (
    <div className={cn(
      "mb-12",
      alignment === "center" && "text-center",
      className
    )}>
      {badge && (
        <span className={cn(
          "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono mb-6",
          badgeStyles[badgeColor]
        )}>
          {badge}
        </span>
      )}
      <h2 className={cn(
        "text-3xl sm:text-4xl font-bold mb-4",
        mode === "dark" ? "text-white" : "text-neutral-900"
      )}>
        {title}
      </h2>
      {displaySubtitle && (
        <p className={cn(
          "max-w-2xl",
          alignment === "center" && "mx-auto",
          mode === "dark" ? "text-neutral-400" : "text-neutral-600"
        )}>
          {displaySubtitle}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// DARK MODE CHART COLORS
// ============================================================================

export const DARK_CHART_COLORS = {
  // Primary colors
  teal: "#14b8a6",
  blue: "#3b82f6",
  red: "#ef4444",
  amber: "#f59e0b",
  green: "#22c55e",
  purple: "#a855f7",

  // Risk levels
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",

  // UI elements
  grid: "#262626",
  axis: "#525252",
  text: "#e5e5e5",
  textMuted: "#a3a3a3",
  background: "#171717",

  // Gradients
  tealGradient: ["#14b8a6", "#0d9488"],
  blueGradient: ["#3b82f6", "#2563eb"],
  redGradient: ["#ef4444", "#dc2626"],
};

// ============================================================================
// LIGHT MODE CHART COLORS (for reference)
// ============================================================================

export const LIGHT_CHART_COLORS = {
  // Primary colors
  teal: "#0d9488",
  blue: "#2563eb",
  red: "#dc2626",
  amber: "#d97706",
  green: "#16a34a",
  purple: "#7c3aed",

  // Risk levels
  low: "#16a34a",
  medium: "#d97706",
  high: "#dc2626",

  // UI elements
  grid: "#e5e7eb",
  axis: "#9ca3af",
  text: "#374151",
  textMuted: "#6b7280",
  background: "#f9fafb",
};

"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type CardVariant = "default" | "warning" | "success";

interface StreamingCardProps {
  icon: LucideIcon;
  title: string;
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<CardVariant, {
  container: string;
  iconWrapper: string;
  icon: string;
}> = {
  default: {
    container: "bg-slate-800/50 border-slate-700",
    iconWrapper: "bg-emerald-500/10 border-emerald-500/20",
    icon: "text-emerald-400",
  },
  warning: {
    container: "bg-orange-500/5 border-orange-500/20",
    iconWrapper: "bg-orange-500/10 border-orange-500/20",
    icon: "text-orange-400",
  },
  success: {
    container: "bg-green-500/5 border-green-500/20",
    iconWrapper: "bg-green-500/10 border-green-500/20",
    icon: "text-green-400",
  },
};

export function StreamingCard({
  icon: Icon,
  title,
  variant = "default",
  children,
  className,
}: StreamingCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "p-5 rounded-xl border animate-in fade-in slide-in-from-bottom-2 duration-300",
        styles.container,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-9 w-9 rounded-lg border flex items-center justify-center shrink-0",
            styles.iconWrapper
          )}
        >
          <Icon className={cn("h-5 w-5", styles.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-base mb-2 text-white">{title}</h4>
          {children}
        </div>
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useInView } from "react-intersection-observer";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  span?: "1" | "2" | "3";
  rowSpan?: "1" | "2";
}

export function BentoCard({
  children,
  className,
  span = "1",
  rowSpan = "1",
}: BentoCardProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const spring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0px)" : "translateY(40px)",
    config: { tension: 280, friction: 60 },
  });

  const spanClasses = {
    "1": "md:col-span-1",
    "2": "md:col-span-2",
    "3": "md:col-span-3",
  };

  const rowSpanClasses = {
    "1": "md:row-span-1",
    "2": "md:row-span-2",
  };

  return (
    <animated.div
      ref={ref}
      style={spring}
      className={cn(
        "relative p-6 rounded-2xl border border-border",
        "bg-card backdrop-blur-sm",
        "transition-all duration-500",
        "hover:shadow-xl hover:shadow-primary/5",
        "hover:border-primary/20",
        "group overflow-hidden",
        spanClasses[span],
        rowSpanClasses[rowSpan],
        className
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-3/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </animated.div>
  );
}

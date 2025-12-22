"use client";

import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  container?: boolean;
  background?: "default" | "muted" | "gradient";
}

export function Section({
  children,
  className,
  id,
  container = true,
  background = "default",
}: SectionProps) {
  const bgClasses = {
    default: "bg-background",
    muted: "bg-muted/30",
    gradient: "bg-gradient-to-b from-background via-muted/20 to-background",
  };

  return (
    <section
      id={id}
      className={cn(
        "relative py-20 md:py-28 lg:py-32",
        bgClasses[background],
        className
      )}
    >
      {container ? (
        <div className="mx-auto max-w-6xl px-6">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

interface SectionHeaderProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

Section.Header = function SectionHeader({
  badge,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "mx-auto max-w-3xl text-center",
        align === "left" && "max-w-2xl",
        className
      )}
    >
      {badge && <div className="mb-4">{badge}</div>}
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-muted-foreground md:text-xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

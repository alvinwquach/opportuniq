"use client";

import Link from "next/link";
import { IoEllipse } from "react-icons/io5";
import { cn } from "@/lib/utils";

interface PipelineColumnProps {
  label: string;
  count: number;
  color: "orange" | "purple" | "blue" | "teal" | "green" | "gray";
  href: string;
}

const colorClasses = {
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  teal: { bg: "bg-[#00D4FF]/10", text: "text-[#00D4FF]", border: "border-[#00D4FF]/20" },
  green: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  gray: { bg: "bg-[#1f1f1f]", text: "text-[#666]", border: "border-[#2a2a2a]" },
};

export function PipelineColumn({ label, count, color, href }: PipelineColumnProps) {
  const colors = colorClasses[color];

  return (
    <Link
      href={href}
      className={cn(
        "flex-1 min-w-25 p-3 rounded-lg border hover:opacity-80 transition-opacity",
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={cn("text-lg font-semibold", colors.text)}>{count}</span>
        <IoEllipse className={cn("w-3 h-3", colors.text)} />
      </div>
      <p className="text-[10px] text-[#888] whitespace-nowrap">{label}</p>
    </Link>
  );
}

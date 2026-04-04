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
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-500/20" },
  teal: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  green: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  gray: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200" },
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
      <p className="text-[10px] text-gray-500 whitespace-nowrap">{label}</p>
    </Link>
  );
}

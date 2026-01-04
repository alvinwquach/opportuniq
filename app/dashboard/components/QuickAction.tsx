"use client";

import Link from "next/link";
import { IoArrowUp } from "react-icons/io5";
import amplitude from "@/amplitude";

interface QuickActionProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

export function QuickAction({ href, icon: Icon, label, description }: QuickActionProps) {
  const handleClick = () => {
    amplitude.track("Quick Action Clicked", {
      action: label,
      destination: href,
    });
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="flex items-center gap-3 p-2.5 -mx-1 rounded-lg hover:bg-[#1f1f1f] transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-[#1f1f1f] group-hover:bg-[#2a2a2a] flex items-center justify-center transition-colors">
        <Icon className="w-4 h-4 text-[#888] group-hover:text-white transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">{label}</p>
        <p className="text-[10px] text-[#555]">{description}</p>
      </div>
      <IoArrowUp className="w-3.5 h-3.5 text-[#333] group-hover:text-[#00D4FF] transition-colors rotate-45" />
    </Link>
  );
}

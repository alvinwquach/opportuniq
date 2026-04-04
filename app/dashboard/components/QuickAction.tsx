"use client";

import Link from "next/link";
import { IoArrowUp } from "react-icons/io5";
import { trackQuickActionClicked } from "@/lib/analytics";

interface QuickActionProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

export function QuickAction({ href, icon: Icon, label, description }: QuickActionProps) {
  const handleClick = () => {
    trackQuickActionClicked({
      action: label,
      destination: href,
    });
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="flex items-center gap-3 p-2.5 -mx-1 rounded-lg hover:bg-gray-100 transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
        <Icon className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">{label}</p>
        <p className="text-[10px] text-gray-400">{description}</p>
      </div>
      <IoArrowUp className="w-3.5 h-3.5 text-[#333] group-hover:text-blue-600 transition-colors rotate-45" />
    </Link>
  );
}

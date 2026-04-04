"use client";

import {
  IoWater,
  IoFlash,
  IoSnow,
  IoHome,
  IoLeaf,
  IoShieldCheckmark,
  IoConstruct,
} from "react-icons/io5";

interface IssueIconProps {
  iconName: string | null;
  className?: string;
}

export function IssueIcon({ iconName, className }: IssueIconProps) {
  const name = iconName ?? "construct";
  switch (name) {
    case "water":
      return <IoWater className={className} />;
    case "flash":
      return <IoFlash className={className} />;
    case "snow":
      return <IoSnow className={className} />;
    case "home":
      return <IoHome className={className} />;
    case "leaf":
      return <IoLeaf className={className} />;
    case "shield":
      return <IoShieldCheckmark className={className} />;
    case "construct":
    default:
      return <IoConstruct className={className} />;
  }
}

export function getIconBgColor(iconName: string | null): string {
  const name = iconName ?? "construct";
  switch (name) {
    case "water":
      return "bg-blue-100";
    case "flash":
      return "bg-yellow-500/20";
    case "snow":
      return "bg-cyan-500/20";
    case "home":
      return "bg-amber-500/20";
    case "leaf":
      return "bg-green-500/20";
    case "shield":
      return "bg-red-500/20";
    case "construct":
    default:
      return "bg-blue-100";
  }
}

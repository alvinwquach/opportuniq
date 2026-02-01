"use client";

import Link from "next/link";
import {
  IoAdd,
  IoPeople,
  IoMail,
  IoStatsChart,
  IoSettings,
} from "react-icons/io5";

interface QuickAction {
  label: string;
  href: string;
  icon: typeof IoAdd;
  color: string;
}

const quickActions: QuickAction[] = [
  { label: "Send Invite", href: "/admin/invites", icon: IoMail, color: "text-emerald-400" },
  { label: "View Users", href: "/admin/users", icon: IoPeople, color: "text-emerald-400" },
  { label: "Analytics", href: "/admin/analytics", icon: IoStatsChart, color: "text-emerald-400" },
  { label: "Settings", href: "/admin/settings", icon: IoSettings, color: "text-emerald-400" },
];

export function QuickActionsCard() {
  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-3">
      <h3 className="text-xs font-medium text-white mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-2 p-2 rounded-lg bg-[#111111] border border-white/[0.06] hover:border-white/[0.1] transition-colors"
            >
              <Icon className={`w-3.5 h-3.5 ${action.color}`} />
              <span className="text-[10px] text-[#888]">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import {
  IoTrendingUp,
  IoTrendingDown,
  IoPeople,
  IoMail,
  IoShare,
  IoTime,
} from "react-icons/io5";

interface QuickStat {
  label: string;
  value: number;
  change?: number;
  icon: "users" | "invites" | "referrals" | "waitlist";
}

interface QuickStatsCardProps {
  stats: QuickStat[];
}

const icons = {
  users: IoPeople,
  invites: IoMail,
  referrals: IoShare,
  waitlist: IoTime,
};

const colors = {
  users: { bg: "bg-emerald-500/10", icon: "bg-emerald-500/20", text: "text-emerald-400" },
  invites: { bg: "bg-emerald-500/10", icon: "bg-emerald-500/20", text: "text-emerald-400" },
  referrals: { bg: "bg-emerald-500/10", icon: "bg-emerald-500/20", text: "text-emerald-400" },
  waitlist: { bg: "bg-emerald-500/10", icon: "bg-emerald-500/20", text: "text-emerald-400" },
};

export function QuickStatsCard({ stats }: QuickStatsCardProps) {
  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-3">
      <h3 className="text-xs font-medium text-white mb-3">Quick Stats</h3>
      <div className="space-y-2">
        {stats.map((stat) => {
          const Icon = icons[stat.icon];
          const color = colors[stat.icon];
          return (
            <div
              key={stat.label}
              className={`flex items-center justify-between p-2 rounded-lg ${color.bg}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded ${color.icon} flex items-center justify-center`}>
                  <Icon className={`w-3 h-3 ${color.text}`} />
                </div>
                <span className="text-[11px] text-[#888]">{stat.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white">{stat.value}</span>
                {stat.change !== undefined && stat.change !== 0 && (
                  <div
                    className={`flex items-center gap-0.5 text-[9px] font-medium ${
                      stat.change > 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {stat.change > 0 ? (
                      <IoTrendingUp className="w-2.5 h-2.5" />
                    ) : (
                      <IoTrendingDown className="w-2.5 h-2.5" />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { IoShield, IoWarning, IoChevronForward } from "react-icons/io5";
import type { SafetyAlert } from "@/app/dashboard/types";

interface SafetyAlertsSectionProps {
  alerts: SafetyAlert[];
}

export function SafetyAlertsSection({ alerts }: SafetyAlertsSectionProps) {
  if (alerts.length === 0) return null;

  return (
    <section className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
          <IoShield className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-red-400">Safety Alerts</h2>
          <p className="text-[10px] text-red-400/60">
            {alerts.length} issue{alerts.length !== 1 ? "s" : ""} requiring attention
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <Link
            key={alert.id}
            href={`/dashboard/projects/${alert.id}`}
            className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition-colors group"
          >
            <IoWarning className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 group-hover:text-red-300 transition-colors truncate">
                {alert.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 uppercase">
                  {alert.severity}
                </span>
                <span className="text-[10px] text-gray-400">{alert.groupName}</span>
              </div>
              {alert.emergencyInstructions && (
                <p className="text-[10px] text-red-400/80 mt-1.5 line-clamp-2">
                  {alert.emergencyInstructions}
                </p>
              )}
            </div>
            <IoChevronForward className="w-4 h-4 text-red-400/40 group-hover:text-red-400 transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
}

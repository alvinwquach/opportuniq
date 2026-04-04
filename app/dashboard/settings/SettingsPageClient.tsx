"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IoPersonOutline,
  IoCashOutline,
  IoWalletOutline,
  IoReceiptOutline,
  IoLocationOutline,
  IoLinkOutline,
  IoChevronForward,
  IoTimeOutline,
} from "react-icons/io5";
import { cn } from "@/lib/utils";

const settingsSections = [
  {
    id: "profile",
    title: "Profile",
    description: "Your personal information and preferences",
    href: "/dashboard/settings/profile",
    icon: IoPersonOutline,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "income",
    title: "Income",
    description: "Manage your income streams and hourly rate",
    href: "/dashboard/settings/income",
    icon: IoCashOutline,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "budget",
    title: "Budget & Risk",
    description: "Set spending limits and DIY comfort level",
    href: "/dashboard/settings/budget",
    icon: IoWalletOutline,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "expenses",
    title: "Expenses",
    description: "Track recurring and one-time expenses",
    href: "/dashboard/settings/expenses",
    icon: IoReceiptOutline,
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    id: "location",
    title: "Location",
    description: "Set your ZIP code for local searches",
    href: "/dashboard/settings/location",
    icon: IoLocationOutline,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect Gmail and other services",
    href: "/dashboard/settings/integrations",
    icon: IoLinkOutline,
    iconBg: "bg-pink-500/20",
    iconColor: "text-pink-400",
  },
];

interface SettingsPageClientProps {
  monthlyIncome: number;
  annualIncome: number;
  hourlyRate: number;
  postalCode: string | null;
}

export function SettingsPageClient({
  monthlyIncome,
  annualIncome,
  hourlyRate,
  postalCode,
}: SettingsPageClientProps) {
  const pathname = usePathname();

  // Calculate opportunity cost for a 4-hour DIY project
  const fourHourOpportunityCost = hourlyRate * 4;

  return (
    <div className="p-5 min-h-[calc(100vh-48px)] bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <p className="text-sm text-gray-500">
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        {/* Main Content */}
        <div className="space-y-4 min-w-0">
          {/* Opportunity Cost Card - Only show if income is set */}
          {monthlyIncome > 0 && (
            <div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <IoTimeOutline className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">
                    Your Time Value
                  </h3>
                  <p className="text-xs text-gray-500">
                    Based on your income settings
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Hourly Rate
                  </p>
                  <p className="text-xl font-semibold text-blue-600">
                    ${Math.round(hourlyRate)}/hr
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Monthly
                  </p>
                  <p className="text-xl font-semibold text-white">
                    ${monthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Annual
                  </p>
                  <p className="text-xl font-semibold text-white">
                    ${annualIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-500/20">
                <p className="text-xs text-blue-600">
                  <span className="font-medium">Opportunity Cost:</span> A
                  4-hour DIY project needs to save you at least{" "}
                  <span className="font-semibold">
                    ${Math.round(fourHourOpportunityCost)}
                  </span>{" "}
                  to be worth your time
                </p>
              </div>
            </div>
          )}

          {/* Settings List */}
          <div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              All Settings
            </h3>
            <div className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = pathname === section.href;
                return (
                  <Link
                    key={section.id}
                    href={section.href}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                      isActive
                        ? "bg-blue-50 border border-blue-500/20"
                        : "hover:bg-gray-100"
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        section.iconBg
                      )}
                    >
                      <Icon className={cn("w-4 h-4", section.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          isActive ? "text-blue-600" : "text-gray-900"
                        )}
                      >
                        {section.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {section.description}
                      </p>
                    </div>
                    <IoChevronForward
                      className={cn(
                        "w-4 h-4",
                        isActive ? "text-blue-600" : "text-gray-500"
                      )}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 min-w-0">
          {/* Quick Setup Status */}
          <div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Setup Progress
            </h3>
            <div className="space-y-3">
              <SetupItem
                label="Income"
                isComplete={monthlyIncome > 0}
                href="/dashboard/settings/income"
              />
              <SetupItem
                label="Location"
                isComplete={!!postalCode}
                href="/dashboard/settings/location"
              />
              <SetupItem
                label="Profile"
                isComplete={true}
                href="/dashboard/settings/profile"
              />
            </div>
          </div>

          {/* Location Preview */}
          {postalCode && (
            <div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">Location</h3>
                <Link
                  href="/dashboard/settings/location"
                  className="text-xs text-blue-600 font-medium hover:text-blue-500"
                >
                  Edit
                </Link>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <IoLocationOutline className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-500">{postalCode}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Search radius:{" "}
                  <span className="font-medium text-gray-500">25 miles</span>
                </p>
              </div>
            </div>
          )}

          {/* Help Card */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-xs text-gray-500 mb-3">
              Check out our guides on how to get the most out of OpportunIQ.
            </p>
            <Link
              href="/help-center"
              className="text-xs text-blue-600 font-medium hover:text-blue-500"
            >
              Visit Help Center →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SetupItem({
  label,
  isComplete,
  href,
}: {
  label: string;
  isComplete: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <span className="text-xs text-gray-500">{label}</span>
      {isComplete ? (
        <span className="flex items-center gap-1 text-xs text-blue-600">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Done
        </span>
      ) : (
        <span className="text-xs text-amber-400">Set up →</span>
      )}
    </Link>
  );
}

"use client";

import { useState } from "react";
import {
  IoPersonOutline,
  IoCashOutline,
  IoWalletOutline,
  IoReceiptOutline,
  IoLocationOutline,
  IoLinkOutline,
  IoChevronForward,
  IoCheckmarkCircle,
  IoCalendarOutline,
  IoMailOutline,
  IoSpeedometerOutline,
  IoTimeOutline,
  IoTrendingUp,
  IoShieldCheckmark,
  IoToggle,
} from "react-icons/io5";
import { Slider } from "@/components/ui/slider";

const settingsSections = [
  {
    id: "profile",
    title: "Profile",
    description: "Your personal information and preferences",
    icon: IoPersonOutline,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "income",
    title: "Income",
    description: "Manage your income streams and hourly rate",
    icon: IoCashOutline,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "budget",
    title: "Budget & Risk",
    description: "Set spending limits and DIY comfort level",
    icon: IoWalletOutline,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "expenses",
    title: "Expenses",
    description: "Track recurring and one-time expenses",
    icon: IoReceiptOutline,
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    id: "location",
    title: "Location",
    description: "Set your ZIP code for local searches",
    icon: IoLocationOutline,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect Gmail and other services",
    icon: IoLinkOutline,
    iconBg: "bg-pink-500/20",
    iconColor: "text-pink-400",
  },
];

const riskLevels = ["None", "Very Low", "Low", "Moderate", "High", "Very High"];

export function SettingsView() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [riskLevel, setRiskLevel] = useState(3); // Moderate

  return (
    <div className="p-5 min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <p className="text-sm text-[#666]">Manage your account and preferences</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        {/* Main Content */}
        <div className="space-y-4 min-w-0">
          {/* Opportunity Cost Card */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <IoTimeOutline className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Your Time Value</h3>
                <p className="text-xs text-[#666]">Based on your income settings</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-[#0f0f0f]">
                <p className="text-[10px] uppercase tracking-wider text-[#666] mb-1">Hourly Rate</p>
                <p className="text-xl font-semibold text-emerald-400">$47/hr</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0f0f0f]">
                <p className="text-[10px] uppercase tracking-wider text-[#666] mb-1">Monthly</p>
                <p className="text-xl font-semibold text-white">$8,125</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0f0f0f]">
                <p className="text-[10px] uppercase tracking-wider text-[#666] mb-1">Annual</p>
                <p className="text-xl font-semibold text-white">$97,500</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-400">
                <span className="font-medium">Opportunity Cost:</span> A 4-hour DIY project needs to save you at least{" "}
                <span className="font-semibold">$188</span> to be worth your time
              </p>
            </div>
          </div>

          {/* Settings List */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
            <h3 className="text-sm font-medium text-white mb-3">All Settings</h3>
            <div className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#333] transition-colors text-left"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${section.iconBg} flex items-center justify-center`}
                    >
                      <Icon className={`w-4 h-4 ${section.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {section.title}
                      </p>
                      <p className="text-xs text-[#666]">
                        {section.description}
                      </p>
                    </div>
                    <IoChevronForward className="w-4 h-4 text-[#666]" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* DIY Risk Tolerance */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <IoSpeedometerOutline className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">DIY Comfort Level</h3>
                <p className="text-xs text-[#666]">How we tailor recommendations for you</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <p className="text-lg font-medium text-emerald-400 mb-1">{riskLevels[riskLevel]}</p>
              <p className="text-xs text-emerald-300/70">
                {riskLevel === 0 && "Always hire professionals for repairs"}
                {riskLevel === 1 && "Prefer professionals for most tasks"}
                {riskLevel === 2 && "Comfortable with only basic repairs"}
                {riskLevel === 3 && "Balanced approach to DIY vs hiring"}
                {riskLevel === 4 && "Comfortable with most DIY tasks"}
                {riskLevel === 5 && "Prefer DIY for almost everything"}
              </p>
            </div>

            <div className="px-2">
              <Slider
                value={[riskLevel]}
                onValueChange={(values) => setRiskLevel(values[0])}
                min={0}
                max={5}
                step={1}
                className="[&_[data-slot=slider-track]]:bg-[#333] [&_[data-slot=slider-range]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:border-emerald-500 [&_[data-slot=slider-thumb]]:bg-[#1a1a1a]"
              />
              <div className="flex justify-between mt-2 text-[10px] text-[#666]">
                <span>Always Hire</span>
                <span>Always DIY</span>
              </div>
            </div>
          </div>

          {/* Budget Settings Preview */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <IoWalletOutline className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Budget Limits</h3>
                  <p className="text-xs text-[#666]">Monthly spending controls</p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-medium cursor-pointer hover:text-emerald-300">Edit</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a]">
                <p className="text-xs text-[#666] mb-1">Monthly Budget</p>
                <p className="text-lg font-semibold text-white">$800</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "60%" }} />
                  </div>
                  <span className="text-[10px] text-[#666]">60%</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a]">
                <p className="text-xs text-[#666] mb-1">Emergency Buffer</p>
                <p className="text-lg font-semibold text-white">$2,000</p>
                <div className="flex items-center gap-1 mt-1">
                  <IoShieldCheckmark className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400">Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 min-w-0">
          {/* Connected Services */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
            <h3 className="text-sm font-medium text-white mb-3">
              Connected Services
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <IoMailOutline className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">Gmail</p>
                    <p className="text-[10px] text-[#666]">Send emails to contractors</p>
                  </div>
                </div>
                <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <IoCalendarOutline className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">Google Calendar</p>
                    <p className="text-[10px] text-[#666]">Schedule appointments</p>
                  </div>
                </div>
                <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
            <h3 className="text-sm font-medium text-white mb-3">
              Quick Settings
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#888]">Email notifications</span>
                <div className="w-9 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#888]">Weekly digest</span>
                <div className="w-9 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#888]">DIY reminders</span>
                <div className="w-9 h-5 bg-[#333] rounded-full relative cursor-pointer">
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Your Impact */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/10 rounded-lg border border-emerald-500/20 p-4">
            <h3 className="text-sm font-medium text-white mb-3">
              Your Impact
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#888]">Issues Resolved</span>
                <span className="text-sm font-semibold text-white">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#888]">DIY Projects</span>
                <span className="text-sm font-semibold text-white">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#888]">Total Saved</span>
                <span className="text-sm font-semibold text-emerald-400">$2,847</span>
              </div>
              <div className="pt-2 mt-2 border-t border-emerald-500/20">
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <IoTrendingUp className="w-3 h-3" />
                  <span>+23% vs last quarter</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Preview */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Location</h3>
              <span className="text-xs text-emerald-400 font-medium cursor-pointer hover:text-emerald-300">Edit</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IoLocationOutline className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-[#888]">90210</span>
              </div>
              <p className="text-xs text-[#666]">
                Search radius: <span className="font-medium text-[#888]">25 miles</span>
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
            <h3 className="text-sm font-medium text-white mb-3">Account</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#666]">Member since</span>
                <span className="text-[#888] font-medium">Jan 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#666]">Plan</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-medium">Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

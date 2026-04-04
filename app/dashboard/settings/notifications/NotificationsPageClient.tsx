"use client";

import { useState } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";

function Toggle({ label, description, defaultOn }: { label: string; description: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between px-3 py-3 rounded-lg border border-gray-200">
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`w-9 h-5 rounded-full relative flex-shrink-0 transition-colors ${on ? "bg-blue-500" : "bg-gray-200"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? "right-0.5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export function NotificationsPageClient() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-400 mt-0.5">Choose what you get notified about.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Projects & Contractors</p>
          <Toggle label="Quote received" description="A contractor responded to your request" defaultOn={true} />
          <Toggle label="Repair reminders" description="Scheduled DIY or contractor visits coming up" defaultOn={true} />
          <Toggle label="Recall alerts" description="CPSC or NHTSA recall matches your product or vehicle" defaultOn={true} />
          <Toggle label="Price drops" description="A part you need went on sale at a nearby store" defaultOn={false} />

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Delivery</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-500">Email digest</span>
                <span className="text-sm font-medium text-gray-800">Daily summary</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-500">Quiet hours</span>
                <span className="text-sm font-medium text-gray-800">10:00 PM - 7:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Budget & Household</p>
          <Toggle label="Budget alerts" description="Notify when approaching your monthly limit" defaultOn={false} />
          <Toggle label="Weather warnings" description="Outdoor project scheduled but bad weather forecast" defaultOn={true} />
          <Toggle label="Household activity" description="When group members resolve issues or contribute" defaultOn={true} />

          {/* Safety alerts — always on */}
          <div className="flex items-center justify-between px-3 py-3 rounded-lg border border-green-100 bg-green-50/50">
            <div className="flex-1 min-w-0 mr-3">
              <p className="text-sm font-medium text-gray-800">Safety alerts</p>
              <p className="text-xs text-gray-400 mt-0.5">CO detectors, gas leaks, electrical hazards</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-green-600">Always on</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

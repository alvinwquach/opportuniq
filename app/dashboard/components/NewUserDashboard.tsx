"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IoAdd, IoCamera, IoFlash, IoCash, IoThumbsUp, IoLocation, IoNavigate, IoMic, IoVideocam } from "react-icons/io5";
import { LocationMap } from "./LocationMap";
import { cn } from "@/lib/utils";
import amplitude from "@/amplitude";

interface NewUserDashboardProps {
  userProfile?: {
    id: string;
    latitude?: number | null;
    longitude?: number | null;
    postalCode?: string | null;
    defaultSearchRadius?: number | null;
  } | null;
}

export function NewUserDashboard({ userProfile }: NewUserDashboardProps) {
  const [searchRadius, setSearchRadius] = useState(userProfile?.defaultSearchRadius || 25);
  const radiusOptions = [5, 10, 25, 50];

  const hasLocation = userProfile?.latitude && userProfile?.longitude;

  // Track new user dashboard view
  useEffect(() => {
    amplitude.track("New User Dashboard Viewed", {
      hasLocation: !!hasLocation,
    });
  }, [hasLocation]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-linear-to-br from-[#00D4FF]/5 via-[#161616] to-[#00B4D8]/5 border border-[#1f1f1f]">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <IoFlash className="h-4 w-4 text-[#00D4FF]" />
              <span className="text-[10px] font-medium text-[#00D4FF] normal-case tracking-wider">
                Get Started
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Create your first group
            </h2>
            <p className="text-sm text-[#888] mb-4 max-w-md">
              Groups help you organize decisions by property or project.
              Start solo or invite family members to decide together.
            </p>
            <Link
              href="/dashboard/groups"
              onClick={() => amplitude.track("Create Group Clicked", { source: "new_user_dashboard" })}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#0c0c0c] bg-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/90 transition-colors"
            >
              <IoAdd className="h-4 w-4" />
              Create a Group
            </Link>
          </div>
        </div>
      </div>
      <section className="rounded-xl bg-[#161616] border border-[#1f1f1f] overflow-hidden">
        <div className="p-4 border-b border-[#1f1f1f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center">
                <IoNavigate className="w-4 h-4 text-[#00D4FF]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Your Service Area</h3>
                <p className="text-[11px] text-[#666]">
                  {hasLocation
                    ? `Contractors and stores within ${searchRadius} miles`
                    : "Set your location to find local services"
                  }
                </p>
              </div>
            </div>
            {hasLocation && (
              <div className="flex items-center gap-1">
                {radiusOptions.map((radius) => (
                  <button
                    key={radius}
                    onClick={() => setSearchRadius(radius)}
                    className={cn(
                      "px-2 py-1 text-[10px] rounded-md transition-colors",
                      searchRadius === radius
                        ? "bg-[#00D4FF] text-[#0c0c0c] font-medium"
                        : "bg-[#1f1f1f] text-[#888] hover:text-white hover:bg-[#2a2a2a]"
                    )}
                  >
                    {radius} mi
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="h-64 md:h-80">
          {hasLocation ? (
            <LocationMap
              latitude={userProfile.latitude}
              longitude={userProfile.longitude}
              postalCode={userProfile.postalCode}
              className="h-full"
              showSearchRadius
              searchRadius={searchRadius}
              isNewUser
              interactive
              emptyStateMessage="Report an issue to discover nearby contractors & stores"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-[#0c0c0c] text-center p-6">
              <div className="w-12 h-12 rounded-full bg-[#1f1f1f] flex items-center justify-center mb-3">
                <IoLocation className="w-6 h-6 text-[#444]" />
              </div>
              <p className="text-sm text-[#888] mb-1">No location set</p>
              <p className="text-xs text-[#555] max-w-62.5 mb-4">
                Add your location in settings to see nearby contractors and stores
              </p>
              <Link
                href="/dashboard/settings"
                onClick={() => amplitude.track("Set Location Clicked", { source: "new_user_dashboard" })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#1f1f1f] text-[#888] hover:text-white hover:bg-[#2a2a2a] transition-colors"
              >
                <IoLocation className="w-3 h-3" />
                Set Location
              </Link>
            </div>
          )}
        </div>
      </section>
      <section>
        <h2 className="text-sm font-medium text-white mb-4">How OpportunIQ Works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              step: 1,
              title: "Capture the Issue",
              description: "Photo, voice, or video - your choice",
              icon: IoCamera,
              bgClass: "bg-[#00D4FF]/10",
              textClass: "text-[#00D4FF]",
              additionalIcons: [IoMic, IoVideocam]
            },
            { step: 2, title: "Analyzes", description: "Get instant diagnosis and options", icon: IoFlash, bgClass: "bg-[#00B4D8]/10", textClass: "text-[#00B4D8]" },
            { step: 3, title: "See Costs", description: "DIY time cost vs hiring cost", icon: IoCash, bgClass: "bg-[#48CAE4]/10", textClass: "text-[#48CAE4]" },
            { step: 4, title: "Decide & Track", description: "Make the call, track outcomes", icon: IoThumbsUp, bgClass: "bg-[#90E0EF]/10", textClass: "text-[#90E0EF]" },
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg ${item.bgClass} flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 ${item.textClass}`} />
                </div>
                <span className="text-[10px] font-medium text-[#555]">Step {item.step}</span>
              </div>
              <h3 className="text-sm font-medium text-white mb-1">{item.title}</h3>
              <p className="text-xs text-[#666]">{item.description}</p>
              {item.additionalIcons && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#1f1f1f]">
                  <IoCamera className="w-3 h-3 text-[#555]" />
                  {item.additionalIcons.map((Icon, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <Icon className="w-3 h-3 text-[#555]" />
                      <span className="text-[8px] px-1 py-0.5 rounded bg-[#00D4FF]/10 text-[#00D4FF]">Soon</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

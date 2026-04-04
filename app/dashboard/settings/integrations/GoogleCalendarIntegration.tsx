"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  trackGoogleCalendarConnected,
  trackGoogleCalendarConnectionFailed,
} from "@/lib/analytics";

// Google Calendar logo SVG
function GoogleCalendarLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" fill="#FFFFFF" />
      <rect x="3" y="4" width="18" height="5" fill="#4285F4" />
      <path d="M7 2V6" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M17 2V6"
        stroke="#4285F4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="6" y="11" width="3" height="3" fill="#EA4335" />
      <rect x="10.5" y="11" width="3" height="3" fill="#FBBC05" />
      <rect x="15" y="11" width="3" height="3" fill="#34A853" />
      <rect x="6" y="15.5" width="3" height="3" fill="#4285F4" />
      <rect x="10.5" y="15.5" width="3" height="3" fill="#EA4335" />
      <rect x="15" y="15.5" width="3" height="3" fill="#FBBC05" />
    </svg>
  );
}

interface GoogleCalendarIntegrationProps {
  connection: {
    email: string;
    isActive: boolean;
    connectedAt: string;
  } | null;
}

export function GoogleCalendarIntegration({
  connection,
}: GoogleCalendarIntegrationProps) {
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [localConnection, setLocalConnection] = useState(connection);

  // Handle URL params for success/error states
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);

      if (urlParams.get("calendar_connected") === "true") {
        trackGoogleCalendarConnected({ source: "settings" });
        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete("calendar_connected");
        window.history.replaceState({}, "", url.toString());
        // Refresh to get updated connection
        router.refresh();
      }

      const calendarError = urlParams.get("calendar_error");
      if (calendarError) {
        trackGoogleCalendarConnectionFailed({
          errorCode: calendarError,
          source: "settings",
        });
        const url = new URL(window.location.href);
        url.searchParams.delete("calendar_error");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [router]);

  const handleConnect = () => {
    window.location.href =
      "/api/google-calendar/connect?redirect=/dashboard/settings/integrations";
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect Google Calendar? Your scheduled events will no longer sync."
      )
    ) {
      return;
    }

    setIsDisconnecting(true);

    try {
      const response = await fetch("/api/google-calendar/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        setLocalConnection(null);
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to disconnect Google Calendar");
      }
    } catch (error) {
      alert("Failed to disconnect Google Calendar");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <GoogleCalendarLogo className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-white">
                Google Calendar
              </h3>
              {localConnection?.isActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Connected
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Sync contractor appointments and maintenance reminders
            </p>
          </div>
        </div>

        {localConnection ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnect}
              className="text-xs"
            >
              Reconnect
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        ) : (
          <Button onClick={handleConnect} size="sm">
            Connect
          </Button>
        )}
      </div>

      {/* Connection Details */}
      {localConnection && (
        <div className="px-6 pb-6">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                  {localConnection.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white">{localConnection.email}</p>
                  <p className="text-xs text-gray-400">
                    Connected {formatDate(localConnection.connectedAt)}
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Info */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-start gap-3">
          <svg
            className="w-4 h-4 text-[#444] mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
          <div>
            <p className="text-xs text-gray-500">
              <span className="text-gray-500 font-medium">Privacy:</span> We only
              create and manage events related to your home maintenance. We
              cannot access your other calendar events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  trackGmailConnected,
  trackGmailConnectionFailed,
} from "@/lib/analytics";

// Gmail logo SVG
function GmailLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6Z"
        fill="#EA4335"
      />
      <path
        d="M22 6L12 13L2 6"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2 6L12 13L22 6V18H2V6Z" fill="#FBBC05" fillOpacity="0.3" />
      <path
        d="M4 4H20C21.1 4 22 4.9 22 6L12 13L2 6C2 4.9 2.9 4 4 4Z"
        fill="#EA4335"
      />
      <path
        d="M2 6V18C2 19.1 2.9 20 4 20H6V9.5L12 13L2 6Z"
        fill="#C5221F"
      />
      <path
        d="M22 6V18C22 19.1 21.1 20 20 20H18V9.5L12 13L22 6Z"
        fill="#C5221F"
      />
    </svg>
  );
}

interface GmailIntegrationProps {
  connection: {
    gmailAddress: string;
    isActive: boolean;
    connectedAt: string;
  } | null;
}

export function GmailIntegration({ connection }: GmailIntegrationProps) {
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [localConnection, setLocalConnection] = useState(connection);

  // Handle URL params for success/error states
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);

      if (urlParams.get("gmail_connected") === "true") {
        trackGmailConnected({ source: "settings" });
        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete("gmail_connected");
        window.history.replaceState({}, "", url.toString());
        // Refresh to get updated connection
        router.refresh();
      }

      const gmailError = urlParams.get("gmail_error");
      if (gmailError) {
        trackGmailConnectionFailed({ errorCode: gmailError, source: "settings" });
        const url = new URL(window.location.href);
        url.searchParams.delete("gmail_error");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [router]);

  const handleConnect = () => {
    window.location.href =
      "/api/gmail/connect?redirect=/dashboard/settings/integrations";
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect Gmail? You won't be able to send emails directly from the app."
      )
    ) {
      return;
    }

    setIsDisconnecting(true);

    try {
      const response = await fetch("/api/gmail/disconnect", { method: "POST" });

      if (response.ok) {
        setLocalConnection(null);
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to disconnect Gmail");
      }
    } catch (error) {
      console.error("Failed to disconnect Gmail:", error);
      alert("Failed to disconnect Gmail");
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
    <div className="rounded-xl bg-[#111] border border-[#1f1f1f] overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <GmailLogo className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-white">Gmail</h3>
              {localConnection?.isActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Connected
                </span>
              )}
            </div>
            <p className="text-sm text-[#666] mt-0.5">
              Send emails to contractors directly from chat
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
          <div className="p-4 rounded-lg bg-[#0c0c0c] border border-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1f1f1f] flex items-center justify-center text-xs font-medium text-[#888]">
                  {localConnection.gmailAddress.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white">
                    {localConnection.gmailAddress}
                  </p>
                  <p className="text-xs text-[#555]">
                    Connected {formatDate(localConnection.connectedAt)}
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-emerald-400"
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
      <div className="px-6 py-4 bg-[#0a0a0a] border-t border-[#1a1a1a]">
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
            <p className="text-xs text-[#666]">
              <span className="text-[#888] font-medium">Privacy:</span> We only
              request permission to send emails on your behalf. We cannot read
              your inbox or access your contacts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

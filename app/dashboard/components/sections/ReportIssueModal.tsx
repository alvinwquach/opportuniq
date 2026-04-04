"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IoCamera,
  IoMic,
  IoVideocam,
  IoCloudUpload,
  IoClose,
  IoChevronForward,
} from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { trackReportIssueModalOpened, trackInputMethodSelected } from "@/lib/analytics";

interface InputMethod {
  id: "photo" | "voice" | "video" | "upload";
  icon: typeof IoCamera;
  label: string;
  description: string;
  available: boolean;
  comingSoon?: boolean;
  href?: string;
}

const INPUT_METHODS: InputMethod[] = [
  {
    id: "photo",
    icon: IoCamera,
    label: "Take a Photo",
    description: "Snap a picture of the issue",
    available: true,
    href: "/dashboard/projects/new?mode=photo",
  },
  {
    id: "voice",
    icon: IoMic,
    label: "Voice Note",
    description: "Describe the problem verbally",
    available: true,
    href: "/dashboard/projects/new?mode=voice",
  },
  {
    id: "video",
    icon: IoVideocam,
    label: "Record Video",
    description: "Show the issue in motion",
    available: true,
    href: "/dashboard/projects/new?mode=video",
  },
  {
    id: "upload",
    icon: IoCloudUpload,
    label: "Upload File",
    description: "Add existing photos or videos",
    available: true,
    href: "/dashboard/projects/new?mode=upload",
  },
];

interface ReportIssueModalProps {
  trigger?: React.ReactNode;
  variant?: "default" | "empty-state" | "sidebar" | "quick-action" | "topbar";
}

export function ReportIssueModal({ trigger, variant = "default" }: ReportIssueModalProps) {
  const [open, setOpen] = useState(false);
  // Track when modal opens
  useEffect(() => {
    if (open) {
      const source = variant === "sidebar" ? "sidebar"
        : variant === "empty-state" ? "empty_state"
        : variant === "quick-action" ? "quick_action"
        : variant === "topbar" ? "topbar"
        : "dashboard";
      trackReportIssueModalOpened({ source });
    }
  }, [open, variant]);

  const defaultTrigger = (
    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors">
      <IoCamera className="w-4 h-4" />
      Report an Issue
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Report an Issue</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            How would you like to document this issue?
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {INPUT_METHODS.map((method) => {
            const Icon = method.icon;

            if (method.available && method.href) {
              return (
                <Link
                  key={method.id}
                  href={method.href}
                  onClick={() => {
                    trackInputMethodSelected({ method: method.id });
                    setOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-xl border transition-all group",
                    "bg-gray-50 border-gray-200 hover:border-blue-500/50 hover:bg-blue-50"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 mb-0.5">{method.label}</span>
                  <span className="text-[11px] text-gray-500 text-center">{method.description}</span>
                </Link>
              );
            }

            return (
              <div
                key={method.id}
                className={cn(
                  "flex flex-col items-center p-4 rounded-xl border relative",
                  "bg-gray-50/50 border-gray-200 opacity-60 cursor-not-allowed"
                )}
              >
                {method.comingSoon && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-600">
                    Soon
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-sm font-medium text-gray-500 mb-0.5">{method.label}</span>
                <span className="text-[11px] text-gray-400 text-center">{method.description}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/dashboard/projects/new"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors group"
          >
            <div>
              <span className="text-sm font-medium text-white">Quick Report</span>
              <p className="text-[11px] text-gray-500">Just describe the issue with text</p>
            </div>
            <IoChevronForward className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compact version for sidebar
export function ReportIssueButton({ className }: { className?: string }) {
  return (
    <ReportIssueModal
      variant="sidebar"
      trigger={
        <button
          className={cn(
            "flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors w-full",
            className
          )}
        >
          <IoCamera className="h-4 w-4 shrink-0" />
          <span className="font-medium">New Issue</span>
        </button>
      }
    />
  );
}

// Icon-only version for collapsed sidebar
export function ReportIssueIconButton({ className }: { className?: string }) {
  return (
    <ReportIssueModal
      variant="sidebar"
      trigger={
        <button
          className={cn(
            "flex items-center justify-center w-9 h-9 mx-auto rounded-md bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors",
            className
          )}
        >
          <IoCamera className="h-4 w-4 shrink-0" />
        </button>
      }
    />
  );
}

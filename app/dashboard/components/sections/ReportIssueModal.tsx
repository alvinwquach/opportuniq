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
    href: "/issues/new?mode=photo",
  },
  {
    id: "voice",
    icon: IoMic,
    label: "Voice Note",
    description: "Describe the problem verbally",
    available: true,
    href: "/issues/new?mode=voice",
  },
  {
    id: "video",
    icon: IoVideocam,
    label: "Record Video",
    description: "Show the issue in motion",
    available: true,
    href: "/issues/new?mode=video",
  },
  {
    id: "upload",
    icon: IoCloudUpload,
    label: "Upload File",
    description: "Add existing photos or videos",
    available: true,
    href: "/issues/new?mode=upload",
  },
];

interface ReportIssueModalProps {
  trigger?: React.ReactNode;
  variant?: "default" | "empty-state" | "sidebar" | "quick-action";
}

export function ReportIssueModal({ trigger, variant = "default" }: ReportIssueModalProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only render on client to avoid hydration mismatch with Radix IDs
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track when modal opens
  useEffect(() => {
    if (open) {
      const source = variant === "sidebar" ? "sidebar"
        : variant === "empty-state" ? "empty_state"
        : variant === "quick-action" ? "quick_action"
        : "dashboard";
      trackReportIssueModalOpened({ source });
    }
  }, [open, variant]);

  if (!mounted) {
    // Return just the trigger without dialog functionality during SSR
    return <>{trigger || null}</>;
  }

  const defaultTrigger = (
    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] text-sm font-medium hover:bg-[#00D4FF]/20 transition-colors">
      <IoCamera className="w-4 h-4" />
      Report an Issue
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="bg-[#111] border-[#1f1f1f] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Report an Issue</DialogTitle>
          <p className="text-sm text-[#888] mt-1">
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
                    "bg-[#161616] border-[#1f1f1f] hover:border-[#00D4FF]/50 hover:bg-[#00D4FF]/5"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center mb-3 group-hover:bg-[#00D4FF]/20 transition-colors">
                    <Icon className="w-6 h-6 text-[#00D4FF]" />
                  </div>
                  <span className="text-sm font-medium text-white mb-0.5">{method.label}</span>
                  <span className="text-[11px] text-[#666] text-center">{method.description}</span>
                </Link>
              );
            }

            return (
              <div
                key={method.id}
                className={cn(
                  "flex flex-col items-center p-4 rounded-xl border relative",
                  "bg-[#161616]/50 border-[#1f1f1f] opacity-60 cursor-not-allowed"
                )}
              >
                {method.comingSoon && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#00D4FF]/10 text-[#00D4FF]">
                    Soon
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-[#1f1f1f] flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-[#555]" />
                </div>
                <span className="text-sm font-medium text-[#666] mb-0.5">{method.label}</span>
                <span className="text-[11px] text-[#555] text-center">{method.description}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-[#1f1f1f]">
          <Link
            href="/issues/new"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between p-3 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-colors group"
          >
            <div>
              <span className="text-sm font-medium text-white">Quick Report</span>
              <p className="text-[11px] text-[#666]">Just describe the issue with text</p>
            </div>
            <IoChevronForward className="w-4 h-4 text-[#666] group-hover:text-white transition-colors" />
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
            "flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 hover:bg-[#00D4FF]/20 transition-colors w-full",
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
            "flex items-center justify-center w-9 h-9 mx-auto rounded-md bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 hover:bg-[#00D4FF]/20 transition-colors",
            className
          )}
        >
          <IoCamera className="h-4 w-4 shrink-0" />
        </button>
      }
    />
  );
}

"use client";

import { cn } from "@/lib/utils";

// Base shimmer animation component
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]",
        className
      )}
      style={{
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

// Add shimmer keyframes via style tag (or add to globals.css)
export function ShimmerStyles() {
  return (
    <style jsx global>{`
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `}</style>
  );
}

// Cost summary skeleton
export function CostSummarySkeleton() {
  return (
    <div className="p-3 bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div>
          <Shimmer className="h-3 w-16 rounded mb-2" />
          <Shimmer className="h-7 w-24 rounded" />
        </div>
        <div className="text-right">
          <Shimmer className="h-3 w-12 rounded mb-2 ml-auto" />
          <Shimmer className="h-6 w-16 rounded ml-auto" />
        </div>
      </div>
    </div>
  );
}

// Guide item skeleton
export function GuideSkeleton() {
  return (
    <div className="p-3 bg-white rounded-xl border border-gray-200">
      <div className="flex items-start gap-3">
        <Shimmer className="w-9 h-9 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Shimmer className="h-4 w-3/4 rounded mb-2" />
          <Shimmer className="h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}

// Part item skeleton
export function PartSkeleton() {
  return (
    <div className="p-3 bg-white rounded-xl border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <Shimmer className="h-4 w-32 rounded" />
        <Shimmer className="h-4 w-16 rounded" />
      </div>
      <div className="flex gap-2 mt-2">
        <Shimmer className="h-6 w-20 rounded-md" />
        <Shimmer className="h-6 w-20 rounded-md" />
      </div>
    </div>
  );
}

// Tool checklist skeleton
export function ToolChecklistSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <div className="flex items-center gap-2">
        <Shimmer className="w-8 h-8 rounded-lg" />
        <div>
          <Shimmer className="h-4 w-24 rounded mb-1" />
          <Shimmer className="h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

// Pro card skeleton
export function ProSkeleton() {
  return (
    <div className="p-3 bg-white rounded-xl border border-gray-200">
      <div className="flex items-start gap-3 mb-3">
        <Shimmer className="w-5 h-5 rounded flex-shrink-0" />
        <div className="flex-1">
          <Shimmer className="h-4 w-32 rounded mb-2" />
          <Shimmer className="h-3 w-24 rounded" />
        </div>
        <Shimmer className="h-6 w-12 rounded" />
      </div>
      <div className="flex items-center gap-4 mb-3">
        <Shimmer className="h-3 w-16 rounded" />
        <Shimmer className="h-3 w-20 rounded" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <Shimmer className="h-5 w-12 rounded" />
        <div className="flex gap-2">
          <Shimmer className="h-8 w-16 rounded-lg" />
          <Shimmer className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Full resource panel skeleton (initial state)
export function ResourcePanelSkeleton({ message }: { message?: string }) {
  return (
    <div className="space-y-4">
      {message && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <span>{message}</span>
        </div>
      )}
      <CostSummarySkeleton />
      <div>
        <Shimmer className="h-3 w-32 rounded mb-2" />
        <div className="space-y-2">
          <GuideSkeleton />
          <GuideSkeleton />
        </div>
      </div>
      <div>
        <Shimmer className="h-3 w-28 rounded mb-2" />
        <div className="space-y-2">
          <PartSkeleton />
          <PartSkeleton />
        </div>
      </div>
    </div>
  );
}

// Analyzing indicator
export function AnalyzingIndicator({ message = "Analyzing..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-blue-200" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
      </div>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

// Researching indicator with progress
export function ResearchingIndicator({
  message = "Researching solutions...",
  subMessage,
}: {
  message?: string;
  subMessage?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
      <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin flex-shrink-0" />
      <div>
        <p className="text-sm text-blue-600">{message}</p>
        {subMessage && <p className="text-xs text-gray-500 mt-0.5">{subMessage}</p>}
      </div>
    </div>
  );
}

"use client";

import { IoImage, IoVideocam } from "react-icons/io5";
import { isVideoFeatureEnabled } from "@/lib/video/constants";

interface DragDropOverlayProps {
  isDragging: boolean;
}

export function DragDropOverlay({ isDragging }: DragDropOverlayProps) {
  if (!isDragging) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0c0c0c]/90 border-2 border-dashed border-[#5eead4] rounded-lg m-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <IoImage className="w-10 h-10 text-[#5eead4]" />
          {isVideoFeatureEnabled() && <IoVideocam className="w-10 h-10 text-[#5eead4]" />}
        </div>
        <p className="text-[#5eead4] font-medium">
          Drop {isVideoFeatureEnabled() ? "image or video" : "image"} here
        </p>
        <p className="text-[#888888] text-sm">to get started</p>
      </div>
    </div>
  );
}

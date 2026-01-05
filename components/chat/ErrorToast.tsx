"use client";

import { useEffect, useRef } from "react";
import { IoClose, IoWarning } from "react-icons/io5";

interface ErrorToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function ErrorToast({ message, isVisible, onClose, duration = 5000 }: ErrorToastProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      timerRef.current = setTimeout(onClose, duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-100 max-w-sm animate-in slide-in-from-top-2 fade-in duration-200">
      <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-[#1a1a1a] p-4 shadow-lg">
        <div className="shrink-0">
          <IoWarning className="h-5 w-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-[#888888] hover:text-white transition-colors"
        >
          <IoClose className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

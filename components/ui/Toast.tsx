"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  const [mounted, setMounted] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(false);
    }
  }, [isVisible, duration, onClose]);

  useEffect(() => {
    if (mounted && toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        { opacity: 0, y: -20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [mounted]);

  if (!isVisible) return null;

  return (
    <div
      ref={toastRef}
      className="fixed top-4 right-4 z-[100] px-6 py-4 bg-black/90 backdrop-blur-xl border-2 border-[#00FF88]/50 rounded-lg shadow-[0_0_30px_rgba(0,255,136,0.4)] flex items-center gap-3 min-w-[300px]"
    >
      <div className="w-6 h-6 rounded-full bg-[#00FF88]/20 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-4 h-4 text-[#00FF88]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <p className="text-white font-mono text-sm flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}


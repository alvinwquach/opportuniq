"use client";

import { useEffect, useRef } from "react";

interface MarqueeProps {
  items: string[];
  /** pixels per second */
  speed?: number;
  /** reverse the base direction */
  reverse?: boolean;
  className?: string;
}

/**
 * CSS-only infinite marquee. Duplicates items to fill the viewport,
 * then uses a CSS translate animation for smooth scrolling.
 */
export function Marquee({ items, speed = 60, reverse = false, className = "" }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Measure the natural width of one set of items
    const children = Array.from(track.children) as HTMLElement[];
    let setWidth = 0;
    children.forEach((el) => {
      setWidth += el.getBoundingClientRect().width + 24; // 24 = gap-6
    });

    // How many copies to fill viewport × 2
    const copies = Math.ceil((window.innerWidth * 2) / setWidth) + 1;
    for (let i = 0; i < copies; i++) {
      children.forEach((el) => {
        track.appendChild(el.cloneNode(true));
      });
    }

    // Set animation duration based on speed
    const duration = setWidth / speed;
    track.style.animationDuration = `${duration}s`;
  }, [speed, items]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        ref={trackRef}
        className={`flex gap-6 will-change-transform ${reverse ? "animate-scroll-right" : "animate-scroll-left"}`}
        style={{ width: "max-content" }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="flex-shrink-0 inline-flex items-center px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

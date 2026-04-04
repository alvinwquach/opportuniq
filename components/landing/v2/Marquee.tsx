"use client";

import { useEffect, useRef } from "react";
import { gsap, Observer } from "@/lib/gsap";

interface MarqueeProps {
  items: string[];
  /** pixels per second */
  speed?: number;
  /** reverse the base direction */
  reverse?: boolean;
  className?: string;
}

/**
 * Directional marquee — infinite loop that reverses on scroll direction.
 * Uses Observer to detect scroll/pointer direction, gsap.quickTo for smooth
 * speed transitions.
 */
export function Marquee({ items, speed = 60, reverse = false, className = "" }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Duplicate items until we have enough to fill 2× the viewport
    const children = Array.from(track.children) as HTMLElement[];
    const totalItems = children.length;

    // Measure total natural width of one set
    let setWidth = 0;
    children.forEach((el) => {
      setWidth += el.getBoundingClientRect().width + 24; // 24 = gap
    });

    // How many copies do we need to fill viewport × 2?
    const copies = Math.ceil((window.innerWidth * 2) / setWidth) + 1;
    for (let i = 0; i < copies; i++) {
      children.forEach((el) => {
        track.appendChild(el.cloneNode(true));
      });
    }

    const allItems = Array.from(track.children) as HTMLElement[];
    const fullWidth = allItems.reduce((acc, el) => acc + el.getBoundingClientRect().width + 24, 0);
    const singleSetWidth = fullWidth / (copies + 1);

    const dirMultiplier = reverse ? 1 : -1;
    const currentSpeed = speed;
    let targetSpeed = speed;
    const duration = singleSetWidth / currentSpeed;

    // Seamless loop: tween xPercent from 0 to -(singleSetWidth/fullWidth * 100)
    const pct = (singleSetWidth / fullWidth) * 100;

    const tl = gsap.timeline({ repeat: -1 });
    tl.fromTo(
      track,
      { xPercent: reverse ? -pct : 0 },
      {
        xPercent: reverse ? 0 : -pct,
        duration,
        ease: "none",
        modifiers: {
          xPercent: gsap.utils.unitize((v: string) => parseFloat(v) % pct),
        },
      }
    );

    // Observer: on scroll direction change, reverse the marquee
    const obs = Observer.create({
      type: "wheel,touch,pointer",
      onChangeY(self) {
        const goingDown = self.deltaY > 0;
        // When scrolling down → speed up in natural direction
        // When scrolling up → reverse direction briefly
        targetSpeed = goingDown ? speed * 2.5 : -speed * 1.5;
        gsap.to(tl, {
          timeScale: (dirMultiplier * targetSpeed) / speed,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(tl, {
              timeScale: dirMultiplier,
              duration: 1.2,
              ease: "power2.inOut",
            });
          },
        });
      },
    });

    // Start playing
    tl.timeScale(dirMultiplier);

    return () => {
      tl.kill();
      obs.kill();
    };
  }, [speed, reverse, items]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        ref={trackRef}
        className="flex gap-6 will-change-transform"
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

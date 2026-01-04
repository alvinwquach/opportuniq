"use client";

import { useEffect, useRef } from "react";
import { useSpring, animated } from "@react-spring/web";

export function GradientMesh() {
  const meshRef = useRef<HTMLDivElement>(null);

  const [springs, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: { tension: 100, friction: 40 },
  }));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      api.start({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [api]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <animated.div
        ref={meshRef}
        className="absolute inset-0 opacity-30 blur-3xl"
        style={{
          background: springs.x.to(
            (x) =>
              `radial-gradient(circle at ${x}% ${springs.y.get()}%, var(--primary) 0%, transparent 50%),
               radial-gradient(circle at ${100 - x}% ${100 - springs.y.get()}%, var(--chart-3) 0%, transparent 50%),
               radial-gradient(circle at 50% 50%, var(--chart-5) 0%, transparent 50%)`
          ),
        }}
      />

      {/* Static gradient mesh layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-3/5" />
      <div className="absolute inset-0 bg-gradient-to-tl from-chart-5/5 via-transparent to-primary/5" />
    </div>
  );
}

"use client";

import { useRef, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxSection({
  children,
  speed = 0.5,
  className = "",
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [spring, api] = useSpring(() => ({
    y: 0,
    config: { tension: 280, friction: 60 },
  }));

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const scrollProgress = -rect.top * speed;

      api.start({ y: scrollProgress });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, [api, speed]);

  return (
    <div ref={ref} className={className}>
      <animated.div
        style={{
          transform: spring.y.to((y) => `translate3d(0, ${y}px, 0)`),
        }}
      >
        {children}
      </animated.div>
    </div>
  );
}

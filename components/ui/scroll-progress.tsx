"use client";

import { useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";

export function ScrollProgress() {
  const [spring, api] = useSpring(() => ({
    width: 0,
    config: { tension: 280, friction: 60 },
  }));

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.scrollY / scrollHeight) * 100;

      api.start({ width: scrollProgress });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [api]);

  return (
    <animated.div
      className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-chart-3 to-chart-5 z-50 pointer-events-none"
      style={{
        width: spring.width.to((w) => `${w}%`),
      }}
    />
  );
}

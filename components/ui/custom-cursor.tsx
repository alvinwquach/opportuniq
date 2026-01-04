"use client";

import { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const cursorSpring = useSpring({
    x: mousePosition.x,
    y: mousePosition.y,
    scale: isHovering ? 1.5 : 1,
    config: { tension: 300, friction: 30 },
  });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.classList.contains("magnetic")
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    window.addEventListener("mousemove", updateMousePosition);

    // Add hover listeners to interactive elements
    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("mouseleave", handleMouseLeave, true);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("mouseleave", handleMouseLeave, true);
    };
  }, []);

  return (
    <>
      <animated.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full border-2 border-primary pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        style={{
          transform: cursorSpring.x.to(
            (x) => `translate3d(${x - 8}px, ${cursorSpring.y.get() - 8}px, 0)`
          ),
          scale: cursorSpring.scale,
        }}
      />
      <animated.div
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-primary pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        style={{
          transform: cursorSpring.x.to(
            (x) => `translate3d(${x - 3}px, ${cursorSpring.y.get() - 3}px, 0)`
          ),
        }}
      />
    </>
  );
}

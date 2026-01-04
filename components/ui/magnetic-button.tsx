"use client";

import { useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends React.ComponentProps<typeof Button> {
  magneticStrength?: number;
}

export function MagneticButton({
  children,
  className,
  magneticStrength = 0.3,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const [spring, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    config: { tension: 300, friction: 20 },
  }));

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * magneticStrength;
    const deltaY = (e.clientY - centerY) * magneticStrength;

    api.start({ x: deltaX, y: deltaY, scale: 1.05 });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    api.start({ x: 0, y: 0, scale: 1 });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  return (
    <animated.div
      style={{
        transform: spring.x.to(
          (x) => `translate3d(${x}px, ${spring.y.get()}px, 0) scale(${spring.scale.get()})`
        ),
      }}
      className="inline-block"
    >
      <Button
        ref={ref}
        className={cn("magnetic transition-all", className)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {children}
      </Button>
    </animated.div>
  );
}

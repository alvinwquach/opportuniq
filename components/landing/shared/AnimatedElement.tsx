"use client";

import { useInView } from "react-intersection-observer";
import { animated, useSpring, useTrail, config } from "@react-spring/web";
import { cn } from "@/lib/utils";

interface AnimatedElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: "fade-up" | "fade-in" | "scale-in";
}

export function useAnimatedElement(delay = 0) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const spring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0px)" : "translateY(24px)",
    delay,
    config: config.gentle,
  });
  return { ref, spring, inView };
}

export function useStaggeredElements(count: number) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const trail = useTrail(count, {
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0px)" : "translateY(16px)",
    config: config.gentle,
  });
  return { ref, trail, inView };
}

export function AnimatedElement({
  children,
  className,
  delay = 0,
  animation = "fade-up",
}: AnimatedElementProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const animations = {
    "fade-up": {
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0px)" : "translateY(24px)",
    },
    "fade-in": {
      opacity: inView ? 1 : 0,
    },
    "scale-in": {
      opacity: inView ? 1 : 0,
      transform: inView ? "scale(1)" : "scale(0.95)",
    },
  };

  const spring = useSpring({
    ...animations[animation],
    delay,
    config: config.gentle,
  });

  return (
    <animated.div ref={ref} style={spring} className={cn(className)}>
      {children}
    </animated.div>
  );
}

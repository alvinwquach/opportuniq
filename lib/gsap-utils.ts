"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hook for fade-in animation on scroll
 */
export function useFadeIn(options: {
  delay?: number;
  duration?: number;
  y?: number;
  stagger?: number;
} = {}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y: options.y ?? 40,
        duration: options.duration ?? 1,
        delay: options.delay ?? 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, [options.delay, options.duration, options.y]);

  return ref;
}

/**
 * Hook for stagger animation on scroll
 */
export function useStagger(options: {
  delay?: number;
  stagger?: number;
  y?: number;
} = {}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const children = ref.current?.children;
      if (!children) return;

      gsap.from(children, {
        opacity: 0,
        y: options.y ?? 40,
        duration: 0.8,
        stagger: options.stagger ?? 0.15,
        delay: options.delay ?? 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, [options.delay, options.stagger, options.y]);

  return ref;
}

/**
 * Hook for parallax effect
 */
export function useParallax(options: { speed?: number } = {}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        y: () => window.innerHeight * (options.speed ?? 0.3),
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [options.speed]);

  return ref;
}

/**
 * Hook for scale animation on scroll
 */
export function useScale(options: {
  from?: number;
  to?: number;
  duration?: number;
} = {}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        {
          scale: options.from ?? 0.8,
          opacity: 0,
        },
        {
          scale: options.to ?? 1,
          opacity: 1,
          duration: options.duration ?? 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [options.from, options.to, options.duration]);

  return ref;
}

/**
 * Hook for slide-in animation
 */
export function useSlideIn(options: {
  direction?: "left" | "right" | "up" | "down";
  distance?: number;
  duration?: number;
} = {}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const distance = options.distance ?? 100;
      const directionProps = {
        left: { x: -distance },
        right: { x: distance },
        up: { y: -distance },
        down: { y: distance },
      };

      gsap.from(ref.current, {
        ...directionProps[options.direction ?? "left"],
        opacity: 0,
        duration: options.duration ?? 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, [options.direction, options.distance, options.duration]);

  return ref;
}

/**
 * Hook for pinned section
 */
export function usePin(options: {
  start?: string;
  end?: string;
  pinSpacing?: boolean;
} = {}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: options.start ?? "top top",
        end: options.end ?? "bottom bottom",
        pin: true,
        pinSpacing: options.pinSpacing ?? true,
      });
    });

    return () => ctx.revert();
  }, [options.start, options.end, options.pinSpacing]);

  return ref;
}

/**
 * Hook for reveal animation (mask effect)
 */
export function useReveal(options: { duration?: number; delay?: number } = {}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
        duration: options.duration ?? 1.2,
        delay: options.delay ?? 0,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, [options.duration, options.delay]);

  return ref;
}

/**
 * Counter animation
 */
export function animateCounter(
  element: HTMLElement,
  endValue: number,
  duration: number = 2
) {
  const obj = { value: 0 };
  gsap.to(obj, {
    value: endValue,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toString();
    },
    scrollTrigger: {
      trigger: element,
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });
}

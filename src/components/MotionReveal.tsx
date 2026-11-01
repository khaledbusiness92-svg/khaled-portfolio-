"use client";

import React, { useEffect, useRef, useState } from "react";

interface MotionRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "scale" | "fade";
  delayMs?: number;
  durationMs?: number;
  threshold?: number;
  as?: React.ElementType;
}

export default function MotionReveal({
  children,
  className = "",
  direction = "up",
  delayMs = 0,
  durationMs = 700,
  threshold = 0.12,
  as: Component = "div",
}: MotionRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      requestAnimationFrame(() => setIsVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  // Determine initial off-screen transform
  let initialTransform = "none";
  if (!isVisible) {
    switch (direction) {
      case "up":
        initialTransform = "translate3d(0, 26px, 0)";
        break;
      case "down":
        initialTransform = "translate3d(0, -20px, 0)";
        break;
      case "scale":
        initialTransform = "scale(0.96)";
        break;
      case "fade":
      default:
        initialTransform = "none";
        break;
    }
  }

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "none" : initialTransform,
    transitionProperty: "opacity, transform",
    transitionDuration: `${durationMs}ms`,
    transitionDelay: `${delayMs}ms`,
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    willChange: isVisible ? "auto" : "opacity, transform",
  };

  return (
    <Component ref={ref} className={className} style={style}>
      {children}
    </Component>
  );
}

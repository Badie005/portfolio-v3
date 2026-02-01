"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import logoData from "@/assets/Logo-w.json";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  isScrolled?: boolean;
  loopPingPong?: boolean;
  className?: string;
}

export function AnimatedLogo({
  isScrolled = false,
  loopPingPong = false,
  className = "",
}: AnimatedLogoProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [direction, setDirection] = useState(1);
  const lastScrolledRef = useRef(isScrolled);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!lottieRef.current || prefersReducedMotion) return;

    if (loopPingPong) {
      lottieRef.current.setDirection(direction as 1 | -1);
      lottieRef.current.play();
    } else {
      // Only trigger animation if scroll state actually changed
      if (lastScrolledRef.current !== isScrolled) {
        lastScrolledRef.current = isScrolled;

        if (isScrolled) {
          // Scroll Down -> Play Forward
          lottieRef.current.setDirection(1);
          lottieRef.current.play();
        } else {
          // Scroll Up -> Play Reverse
          lottieRef.current.setDirection(-1);
          lottieRef.current.play();
        }
      }
    }
  }, [isScrolled, loopPingPong, direction, prefersReducedMotion]);

  const handleComplete = useCallback(() => {
    if (loopPingPong) {
      setDirection((prev) => prev * -1);
    }
  }, [loopPingPong]);

  // Memoize lottie style for GPU optimization
  const lottieStyle = useMemo(() => ({
    height: '100%',
    width: 'auto',
    willChange: 'transform',
    transform: 'translateZ(0)', // Force GPU layer
  }), []);

  return (
    <div
      className={cn(
        "relative h-10 w-auto flex items-center justify-start overflow-hidden",
        className
      )}
      style={{ willChange: 'contents' }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={logoData}
        loop={false}
        autoplay={false}
        onComplete={handleComplete}
        className="h-full w-auto"
        style={lottieStyle}
        renderer="svg"
      />
    </div>
  );
}

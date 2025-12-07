"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import logoData from "@/assets/Logo-w.json";

interface AnimatedLogoProps {
  isScrolled?: boolean;
  loopPingPong?: boolean;
}

export function AnimatedLogo({ isScrolled = false, loopPingPong = false }: AnimatedLogoProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!lottieRef.current) return;

    if (loopPingPong) {
      lottieRef.current.setDirection(direction as 1 | -1);
      lottieRef.current.play();
    } else {
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
  }, [isScrolled, loopPingPong, direction]);

  const handleComplete = useCallback(() => {
    if (loopPingPong) {
      setDirection((prev) => prev * -1);
    }
  }, [loopPingPong]);

  return (
    <div className="relative h-10 w-auto flex items-center justify-start overflow-hidden">
      <Lottie
        lottieRef={lottieRef}
        animationData={logoData}
        loop={false}
        autoplay={false}
        onComplete={handleComplete}
        className="h-full w-auto"
        style={{ height: '100%', width: 'auto' }}
      />
    </div>
  );
}

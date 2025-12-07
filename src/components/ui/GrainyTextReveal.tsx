"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

// Version avec lignes séparées - Blur Reveal + Fade Word by Word
interface BlurFadeTextProps {
  lines: Array<{
    text: string;
    highlightWords?: string[];
  }>;
  className?: string;
  baseDelay?: number;
  wordStagger?: number;
  blurAmount?: number;
  duration?: number;
}

export function GrainyTextLines({
  lines,
  className = "",
  baseDelay = 1.0,
  blurAmount = 12,
  duration = 1.2,
}: BlurFadeTextProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={className}>
        {lines.map((line, i) => (
          <div key={i}>{line.text}</div>
        ))}
      </div>
    );
  }



  return (
    <div className={className}>
      {lines.map((line, lineIndex) => {
        const lineDelay = baseDelay + lineIndex * 0.3; // Stagger between lines only

        return (
          <motion.div
            key={lineIndex}
            initial={{
              opacity: 0,
              filter: `blur(${blurAmount}px)`,
              y: 8,
            }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
            }}
            transition={{
              duration: duration,
              delay: lineDelay,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <span className="inline-flex flex-wrap gap-x-[0.25em]">
              {line.text.split(" ").map((word, wordIndex) => {
                const isHighlighted = line.highlightWords?.includes(word);

                return (
                  <span key={wordIndex} className="relative inline-block">
                    {isHighlighted ? (
                      <span className="bg-gradient-to-r from-ide-accent via-[#D4956F] via-[#B8846A] via-[#C9785E] to-ide-accent bg-clip-text text-transparent animate-gradient-text">
                        {word}
                      </span>
                    ) : (
                      word
                    )}
                  </span>
                );
              })}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

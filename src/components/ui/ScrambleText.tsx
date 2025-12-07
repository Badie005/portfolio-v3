"use client";

import { useState, useRef, useEffect } from 'react';
import type React from 'react';

interface ScrambleTextProps {
  initial: string;
  hover: string;
  className?: string;
  duration?: number;
  speed?: number;
  style?: React.CSSProperties;
}

export function ScrambleText({ 
  initial, 
  hover, 
  className = '',
  duration = 800,
  speed = 30,
  style
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(initial);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetRef = useRef(initial);

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const runScramble = (target: string) => {
    targetRef.current = target;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const iterations = Math.ceil(duration / speed);
    let currentIteration = 0;

    intervalRef.current = setInterval(() => {
      currentIteration++;
      const progress = currentIteration / iterations;
      
      const newText = target
        .split('')
        .map((char, index) => {
          if (char === ' ' || char === '.') {
            return char;
          }
          
          const revealThreshold = index / target.length;
          
          if (progress > revealThreshold) {
            return char;
          } else {
            return characters[Math.floor(Math.random() * characters.length)];
          }
        })
        .join('');

      setDisplayText(newText);

      if (currentIteration >= iterations) {
        setDisplayText(target);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, speed);
  };

  const handleMouseEnter = () => {
    runScramble(hover);
  };

  const handleMouseLeave = () => {
    runScramble(initial);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={style}
    >
      {displayText}
    </span>
  );
}

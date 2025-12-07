"use client";

import { useState, useEffect } from "react";

interface TerminalStatusProps {
  text?: string;
  texts?: string[];
  className?: string;
}

const spinnerFrames = ["◇", "✱", "◈", "✦", "◆", "✴", "⟡", "✸"];

export function TerminalStatus({ text, texts, className = "" }: TerminalStatusProps) {
  const textList = texts || (text ? [text] : []);
  const [frameIndex, setFrameIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Animation de l'icône
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % spinnerFrames.length);
    }, 1250);
    return () => clearInterval(interval);
  }, []);

  // Animation de typing du texte
  useEffect(() => {
    if (textList.length === 0) return;
    const currentText = textList[textIndex];

    if (isTyping) {
      if (displayedText.length < currentText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 30);
        return () => clearTimeout(timeout);
      } else {
        // Use setTimeout to avoid calling setState directly in render
        const timeout = setTimeout(() => {
          setTextIndex((prev) => (prev + 1) % textList.length);
          setIsTyping(true);
        }, 0);
        return () => clearTimeout(timeout);
      }
    }
  }, [displayedText, isTyping, textIndex, textList]);

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 shadow-sm rounded-lg ${className}`}
    >
      <span className="w-4 text-center text-ide-accent font-mono text-sm flex-shrink-0">
        {spinnerFrames[frameIndex]}
      </span>
      <span className="font-mono text-sm text-ide-accent">
        {displayedText}
        <span className="animate-pulse">|</span>
      </span>
    </div>
  );
}

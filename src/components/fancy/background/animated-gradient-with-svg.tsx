"use client"

import React, { useRef, useMemo } from "react"

import { cn } from "@/lib/utils"

interface AnimatedGradientProps {
  colors: string[]
  speed?: number
  blur?: "light" | "medium" | "heavy"
}

const AnimatedGradient: React.FC<AnimatedGradientProps> = ({
  colors,
  speed = 5,
  blur = "light",
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const randomValues = useMemo<Array<{
    top: string
    left: string
    size: number
    tx1: number
    ty1: number
    tx2: number
    ty2: number
    tx3: number
    ty3: number
    tx4: number
    ty4: number
  }>>(
    () => {
      const hashString = (s: string) => {
        let h = 2166136261
        for (let i = 0; i < s.length; i++) {
          h ^= s.charCodeAt(i)
          h = Math.imul(h, 16777619)
        }
        return h >>> 0
      }
      const prng = (seed: number) => {
        let t = seed >>> 0
        return () => {
          t += 0x6D2B79F5
          let r = Math.imul(t ^ (t >>> 15), 1 | t)
          r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
          return ((r ^ (r >>> 14)) >>> 0) / 4294967296
        }
      }
      const baseSeed = hashString(colors.join("|"))
      const randBetween = (rand: () => number, min: number, max: number) => rand() * (max - min) + min
      return colors.map((_, idx) => {
        const rand = prng(baseSeed + idx * 1013904223)
        const size = randBetween(rand, 70, 110)
        const min = size / 2
        const max = 100 - size / 2
        const top = `${randBetween(rand, min, max)}%`
        const left = `${randBetween(rand, min, max)}%`

        return {
          top,
          left,
          size,
          tx1: randBetween(rand, -0.5, 0.5),
          ty1: randBetween(rand, -0.5, 0.5),
          tx2: randBetween(rand, -0.5, 0.5),
          ty2: randBetween(rand, -0.5, 0.5),
          tx3: randBetween(rand, -0.5, 0.5),
          ty3: randBetween(rand, -0.5, 0.5),
          tx4: randBetween(rand, -0.5, 0.5),
          ty4: randBetween(rand, -0.5, 0.5),
        }
      })
    },
    [colors]
  )

  const blurClass =
    blur === "light"
      ? "blur-2xl"
      : blur === "medium"
        ? "blur-3xl"
        : "blur-[100px]"

  return (
    <div ref={containerRef} className="absolute overflow-hidden" style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}>
      <div className={cn(`absolute`, blurClass)} style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}>
        {colors.map((color, index) => {
          const random = randomValues[index]
          if (!random) return null

          // Wrapper absolutely positioned by center with controlled size in %
          const wrapperStyle = {
            top: random.top,
            left: random.left,
            width: `${random.size}%`,
            height: `${random.size}%`,
            transform: "translate(-50%, -50%)",
          } as React.CSSProperties

          // Animated layer uses transform via keyframes; keep it separate
          const animStyle = {
            animation: `background-gradient ${speed}s infinite ease-in-out`,
            animationDuration: `${speed}s`,
            "--tx-1": random.tx1,
            "--ty-1": random.ty1,
            "--tx-2": random.tx2,
            "--ty-2": random.ty2,
            "--tx-3": random.tx3,
            "--ty-3": random.ty3,
            "--tx-4": random.tx4,
            "--ty-4": random.ty4,
          } as React.CSSProperties

          return (
            <div key={index} className={cn("absolute")} style={wrapperStyle}>
              <div className={cn("absolute inset-0", "animate-background-gradient")} style={animStyle}>
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <circle cx="50" cy="50" r="50" fill={color} />
                </svg>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AnimatedGradient

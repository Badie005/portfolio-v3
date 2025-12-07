"use client"

import { ElementType, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  motion,
  useAnimationControls,
  ValueAnimationTransition,
} from "motion/react"

interface GoesOutComesInUnderlineProps {
  /**
   * The content to be displayed and animated
   */
  children: React.ReactNode

  /**
   * HTML Tag to render the component as
   * @default span
   */
  as?: ElementType

  /**
   * Direction of the animation
   * @default "left"
   */
  direction?: "left" | "right"

  /**
   * Optional class name for styling
   */
  className?: string

  /**
   * Height of the underline as a ratio of font size
   * @default 0.1
   */
  underlineHeightRatio?: number

  /**
   * Padding of the underline as a ratio of font size
   * @default 0.01
   */
  underlinePaddingRatio?: number

  /**
   * Animation transition configuration
   * @default { duration: 0.5, ease: "easeOut" }
   */
  transition?: ValueAnimationTransition
}

const GoesOutComesInUnderline = ({
  children,
  direction = "left",
  className,
  underlineHeightRatio = 0.1,
  underlinePaddingRatio = 0.01,
  transition = {
    duration: 0.5,
    ease: "easeOut",
  },
  ...props
}: GoesOutComesInUnderlineProps) => {
  const controls = useAnimationControls()
  const [blocked, setBlocked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const updateUnderlineStyles = () => {
      if (textRef.current) {
        const fontSize = parseFloat(getComputedStyle(textRef.current).fontSize)
        const underlineHeight = fontSize * underlineHeightRatio
        const underlinePadding = fontSize * underlinePaddingRatio
        textRef.current.style.setProperty(
          "--underline-height",
          `${underlineHeight}px`
        )
        textRef.current.style.setProperty(
          "--underline-padding",
          `${underlinePadding}px`
        )
      }
    }

    updateUnderlineStyles()
    window.addEventListener("resize", updateUnderlineStyles)

    return () => window.removeEventListener("resize", updateUnderlineStyles)
  }, [underlineHeightRatio, underlinePaddingRatio])

  const handleInteraction = async () => {
    if (blocked) return

    setIsHovered(true)
    setBlocked(true)

    await controls.start({
      width: 0,
      transition,
      transitionEnd: {
        left: direction === "left" ? "auto" : 0,
        right: direction === "left" ? 0 : "auto",
      },
    })

    await controls.start({
      width: "100%",
      transition,
      transitionEnd: {
        left: direction === "left" ? 0 : "",
        right: direction === "left" ? "" : 0,
      },
    })

    setBlocked(false)
    setIsHovered(false)
  }

  return (
    <motion.span
      className={cn("relative inline-block cursor-pointer", className)}
      onMouseEnter={handleInteraction}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleInteraction}
      ref={textRef}
      {...props}
    >
      <motion.span
        animate={{
          y: isHovered ? -1 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.span>
      <motion.span
        className={cn("absolute", {
          "left-0": direction === "left",
          "right-0": direction === "right",
        })}
        style={{
          height: "var(--underline-height)",
          bottom: "calc(-1 * var(--underline-padding))",
          width: "100%",
          backgroundColor: "currentColor",
        }}
        animate={controls}
        aria-hidden="true"
      />
    </motion.span>
  )
}

GoesOutComesInUnderline.displayName = "GoesOutComesInUnderline"

export default GoesOutComesInUnderline

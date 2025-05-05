"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlowingTextProps {
  text: string
  className?: string
  glowColor?: string
  textColor?: string
  delay?: number
  duration?: number
  fontSize?: string
  fontWeight?: string
}

export function GlowingText({
  text,
  className,
  glowColor = "#3b82f6",
  textColor = "white",
  delay = 0,
  duration = 0.5,
  fontSize = "4rem",
  fontWeight = "bold",
}: GlowingTextProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className={className} style={{ fontSize, fontWeight, color: textColor }}>
        {text}
      </div>
    )
  }

  const letters = text.split("")

  return (
    <motion.div
      className={cn("relative", className)}
      style={{ fontSize, fontWeight }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="relative inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration,
            delay: delay + index * 0.05,
            ease: [0.215, 0.61, 0.355, 1],
          }}
        >
          <span className="absolute inset-0 blur-md" style={{ color: glowColor, zIndex: -1 }}>
            {letter === " " ? "\u00A0" : letter}
          </span>
          <span style={{ color: textColor }}>{letter === " " ? "\u00A0" : letter}</span>
        </motion.span>
      ))}
    </motion.div>
  )
}

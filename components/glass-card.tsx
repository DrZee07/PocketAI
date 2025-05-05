"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number // Controls the intensity of the effect (0-100)
  color?: "blue" | "purple" | "red" | "cyan" | "multi"
  interactive?: boolean // Whether the card responds to mouse movement
}

export function GlassCard({ children, className, intensity = 50, color = "blue", interactive = true }: GlassCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Normalize intensity to a 0-1 scale
  const normalizedIntensity = intensity / 100

  // Set up color variables
  const getGlowColor = () => {
    switch (color) {
      case "purple":
        return "rgba(139, 92, 246, 0.3)"
      case "red":
        return "rgba(239, 68, 68, 0.3)"
      case "cyan":
        return "rgba(6, 182, 212, 0.3)"
      case "multi":
        return "conic-gradient(from 225deg, rgba(239, 68, 68, 0.2), rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2), rgba(239, 68, 68, 0.2))"
      default:
        return "rgba(59, 130, 246, 0.3)"
    }
  }

  // Update dimensions on mount and resize
  useEffect(() => {
    if (!cardRef.current) return

    const updateDimensions = () => {
      if (!cardRef.current) return
      const { width, height } = cardRef.current.getBoundingClientRect()
      setDimensions({ width, height })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return

    const { left, top } = cardRef.current.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top

    setMousePosition({ x, y })
  }

  // Reset mouse position when mouse leaves
  const handleMouseLeave = () => {
    setMousePosition({ x: dimensions.width / 2, y: dimensions.height / 2 })
  }

  // Calculate the position of the highlight based on mouse position
  const highlightX = mousePosition.x / dimensions.width
  const highlightY = mousePosition.y / dimensions.height

  // Calculate the rotation based on mouse position
  const rotateX = interactive ? (highlightY - 0.5) * 10 * normalizedIntensity : 0
  const rotateY = interactive ? (0.5 - highlightX) * 10 * normalizedIntensity : 0

  // Background styles
  const backgroundStyle = {
    background: `
      linear-gradient(
        135deg,
        rgba(255, 255, 255, ${0.1 * normalizedIntensity}) 0%,
        rgba(255, 255, 255, ${0.05 * normalizedIntensity}) 100%
      )
    `,
    boxShadow: `
      0 4px 30px rgba(0, 0, 0, ${0.1 * normalizedIntensity}),
      inset 0 0 1px 1px rgba(255, 255, 255, ${0.1 * normalizedIntensity})
    `,
    backdropFilter: `blur(${10 * normalizedIntensity}px)`,
  }

  // Highlight styles
  const highlightStyle = {
    background: getGlowColor(),
    left: `${highlightX * 100}%`,
    top: `${highlightY * 100}%`,
    opacity: interactive ? 0.7 * normalizedIntensity : 0.3 * normalizedIntensity,
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative overflow-hidden rounded-2xl border border-white/10 p-6", className)}
      style={backgroundStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: interactive ? 1.02 : 1 }}
      whileTap={{ scale: interactive ? 0.98 : 1 }}
    >
      <motion.div
        className="absolute -inset-0.5 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(
            800px circle at ${mousePosition.x}px ${mousePosition.y}px,
            ${getGlowColor()},
            transparent 40%
          )`,
        }}
      />

      <motion.div
        className="absolute h-40 w-40 rounded-full blur-3xl"
        style={highlightStyle}
        animate={{
          x: mousePosition.x - 80,
          y: mousePosition.y - 80,
        }}
        transition={{ type: "spring", bounce: 0.2, damping: 10 }}
      />

      <motion.div
        className="relative z-10"
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
        transition={{ type: "spring", bounce: 0.2, damping: 10 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

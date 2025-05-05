"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Create color gradient
        const gradientH = ctx.createLinearGradient(0, 0, canvas.width, 0)
        gradientH.addColorStop(0, "#FF0000") // Red
        gradientH.addColorStop(1 / 6, "#FFFF00") // Yellow
        gradientH.addColorStop(2 / 6, "#00FF00") // Green
        gradientH.addColorStop(3 / 6, "#00FFFF") // Cyan
        gradientH.addColorStop(4 / 6, "#0000FF") // Blue
        gradientH.addColorStop(5 / 6, "#FF00FF") // Magenta
        gradientH.addColorStop(1, "#FF0000") // Red

        ctx.fillStyle = gradientH
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add white to black vertical gradient
        const gradientV = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradientV.addColorStop(0, "rgba(255, 255, 255, 1)")
        gradientV.addColorStop(0.5, "rgba(255, 255, 255, 0)")
        gradientV.addColorStop(0.5, "rgba(0, 0, 0, 0)")
        gradientV.addColorStop(1, "rgba(0, 0, 0, 1)")

        ctx.fillStyle = gradientV
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [isOpen])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const ctx = canvas.getContext("2d")
      if (ctx) {
        const imageData = ctx.getImageData(x, y, 1, 1).data
        const selectedColor = `#${imageData[0].toString(16).padStart(2, "0")}${imageData[1].toString(16).padStart(2, "0")}${imageData[2].toString(16).padStart(2, "0")}`
        onChange(selectedColor)
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    handleCanvasClick(e)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      handleCanvasClick(e)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-10 h-10 rounded-md border border-slate-200 dark:border-slate-700"
          style={{ backgroundColor: color }}
          aria-label="Pick a color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            width={240}
            height={160}
            className="w-full rounded-md cursor-crosshair"
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <div className="flex items-center justify-between">
            <div
              className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700"
              style={{ backgroundColor: color }}
            />
            <div className="text-sm font-mono">{color}</div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

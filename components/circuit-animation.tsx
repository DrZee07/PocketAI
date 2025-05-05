"use client"

import { useEffect, useRef } from "react"

interface CircuitAnimationProps {
  className?: string
  color?: string
  density?: number
  speed?: number
}

export function CircuitAnimation({
  className = "",
  color = "#3b82f6",
  density = 30,
  speed = 1,
}: CircuitAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match parent
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return

      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Circuit node class
    class Node {
      x: number
      y: number
      connections: Node[]
      size: number
      pulseTime: number
      pulseSpeed: number
      active: boolean

      constructor(x: number, y: number, size: number) {
        this.x = x
        this.y = y
        this.connections = []
        this.size = size
        this.pulseTime = Math.random() * 100
        this.pulseSpeed = 0.02 + Math.random() * 0.03 * speed
        this.active = Math.random() > 0.7
      }

      connect(node: Node) {
        if (!this.connections.includes(node)) {
          this.connections.push(node)
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw node
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        // Draw connections
        this.connections.forEach((node) => {
          ctx.beginPath()
          ctx.moveTo(this.x, this.y)
          ctx.lineTo(node.x, node.y)
          ctx.strokeStyle = color
          ctx.lineWidth = 1
          ctx.stroke()

          // Draw pulse animation
          if (this.active) {
            this.pulseTime += this.pulseSpeed
            if (this.pulseTime > 1) {
              this.pulseTime = 0
              this.active = Math.random() > 0.3
            }

            const pulsePosition = this.pulseTime
            const pulseX = this.x + (node.x - this.x) * pulsePosition
            const pulseY = this.y + (node.y - this.y) * pulsePosition

            ctx.beginPath()
            ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
            ctx.fill()
          }
        })
      }
    }

    // Create nodes
    const nodes: Node[] = []
    const nodeCount = density

    for (let i = 0; i < nodeCount; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const size = 1 + Math.random() * 2

      nodes.push(new Node(x, y, size))
    }

    // Connect nodes
    nodes.forEach((node) => {
      const closestNodes = [...nodes]
        .filter((n) => n !== node)
        .sort((a, b) => {
          const distA = Math.hypot(a.x - node.x, a.y - node.y)
          const distB = Math.hypot(b.x - node.x, b.y - node.y)
          return distA - distB
        })
        .slice(0, 2 + Math.floor(Math.random() * 2))

      closestNodes.forEach((closestNode) => {
        node.connect(closestNode)
      })
    })

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw nodes and connections
      nodes.forEach((node) => {
        node.draw(ctx)
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [color, density, speed])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  )
}

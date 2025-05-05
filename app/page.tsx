"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Download, MessageSquare, Shield, History, Settings, User } from "lucide-react"
import Link from "next/link"
import { InstallPrompt } from "@/components/install-prompt"
import { GlassCard } from "@/components/glass-card"
import { CircuitAnimation } from "@/components/circuit-animation"
import { GlowingText } from "@/components/glowing-text"
import { motion, useScroll, useTransform } from "framer-motion"

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  // Parallax effect values
  const y1 = useTransform(scrollY, [0, 500], [0, -100])
  const y2 = useTransform(scrollY, [0, 500], [0, -50])
  const opacity1 = useTransform(scrollY, [0, 300], [1, 0])
  const scale1 = useTransform(scrollY, [0, 300], [1, 0.9])

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const { left, top, width, height } = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - left) / width - 0.5
      const y = (e.clientY - top) / height - 0.5

      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 overflow-hidden"
    >
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <CircuitAnimation color="#0ea5e9" density={40} speed={0.8} />

        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px]"
          animate={{
            x: mousePosition.x * -30,
            y: mousePosition.y * -30,
          }}
          transition={{ type: "spring", damping: 15 }}
        />

        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/20 blur-[100px]"
          animate={{
            x: mousePosition.x * 30,
            y: mousePosition.y * 30,
          }}
          transition={{ type: "spring", damping: 15 }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-red-500/10 blur-[80px]"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8 relative z-10">
        <motion.div
          className="flex flex-col items-center justify-center space-y-8 text-center pt-12 pb-8"
          style={{ y: y1, opacity: opacity1, scale: scale1 }}
        >
          <div className="space-y-4">
            <div className="relative">
              <GlowingText
                text="PocketAI"
                glowColor="#ef4444"
                textColor="white"
                fontSize="5rem"
                className="tracking-tighter sm:text-6xl md:text-7xl"
              />

              <motion.div
                className="absolute -top-6 -right-6 w-12 h-12 bg-yellow-300 dark:bg-yellow-500 rounded-full blur-xl opacity-70"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              />

              <motion.div
                className="absolute -bottom-4 -left-4 w-10 h-10 bg-pink-400 dark:bg-pink-600 rounded-full blur-xl opacity-70"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 4, delay: 1, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>

            <motion.p
              className="text-slate-300 md:text-xl max-w-[700px] mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Your personal AI assistant that runs entirely on your device. Download small language models and chat with
              them offline.
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Button
              asChild
              size="lg"
              className="gap-2 bg-gradient-to-r from-red-500 to-blue-600 hover:from-red-600 hover:to-blue-700 dark:from-red-500 dark:to-blue-600 dark:hover:from-red-400 dark:hover:to-blue-500 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/chat">
                Start Chatting <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-blue-400/30 dark:border-blue-400/20 bg-blue-950/30 backdrop-blur-sm hover:bg-blue-900/40 dark:hover:bg-blue-800/30 transition-all duration-300"
            >
              <Link href="/models">Manage Models</Link>
            </Button>
          </motion.div>

          <InstallPrompt />

          <motion.div
            className="relative w-full max-w-3xl mx-auto mt-8"
            style={{ y: y2 }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <GlassCard className="p-0 overflow-hidden transition-all duration-500" intensity={70} color="multi">
              <div className="relative">
                <div className="w-full h-[300px] bg-gradient-to-br from-slate-900 to-blue-900 flex flex-col items-center justify-center p-6">
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-grid-pattern opacity-10"></div>

                  <motion.div
                    className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-4 mb-4 border border-white/20"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                        AI
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-100 text-sm">
                          Hello! I'm your personal AI assistant running locally on your device. How can I help you
                          today?
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="w-full max-w-md bg-red-500/80 backdrop-blur-md rounded-lg shadow-lg p-4 self-end border border-red-400/30"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                  >
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-red-600 text-xs">
                        You
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">Tell me about the benefits of running AI models locally.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
              </div>
            </GlassCard>

            {/* Decorative elements */}
            <motion.div
              className="absolute -top-6 -left-6 w-12 h-12 bg-blue-400 rounded-full blur-xl opacity-70"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
            />

            <motion.div
              className="absolute -bottom-4 -right-4 w-10 h-10 bg-violet-500 rounded-full blur-xl opacity-70"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{ duration: 4, delay: 1, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <GlassCard className="h-full" color="blue">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium text-white">Offline Access</h3>
                <p className="text-slate-300">
                  Chat with AI models without an internet connection. Your data stays on your device.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <GlassCard className="h-full" color="purple">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-violet-500/20 text-violet-400">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium text-white">Multiple Models</h3>
                <p className="text-slate-300">
                  Download and switch between different small language models optimized for mobile.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <GlassCard className="h-full" color="red">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium text-white">Privacy First</h3>
                <p className="text-slate-300">
                  All processing happens on your device. Your conversations never leave your phone.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Quick Access Menu */}
        <motion.div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 backdrop-blur-md rounded-full shadow-xl border border-white/10 p-2 z-50"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5, type: "spring" }}
        >
          <div className="flex items-center gap-2 bg-slate-900/50">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="rounded-full h-12 w-12 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
            >
              <Link href="/chat">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="rounded-full h-12 w-12 text-violet-400 hover:text-violet-300 hover:bg-violet-900/30"
            >
              <Link href="/history">
                <History className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="rounded-full h-12 w-12 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30"
            >
              <Link href="/models">
                <Download className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="rounded-full h-12 w-12 text-green-400 hover:text-green-300 hover:bg-green-900/30"
            >
              <Link href="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="rounded-full h-12 w-12 text-amber-400 hover:text-amber-300 hover:bg-amber-900/30"
            >
              <Link href="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-white/10 py-6 bg-slate-950/50 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2025 PocketAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

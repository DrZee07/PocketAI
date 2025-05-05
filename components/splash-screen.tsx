"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`splash-screen ${isVisible ? "" : "hidden"}`}>
      <motion.div
        className="splash-logo"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img src="/icons/ai-icon.png" alt="PocketAI Logo" width={120} height={120} className="rounded-lg shadow-lg" />
      </motion.div>
      <motion.div
        className="splash-logo-text"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        PocketAI
      </motion.div>
      <motion.p
        className="text-white mt-4 opacity-80"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Your AI, in your pocket
      </motion.p>
    </div>
  )
}

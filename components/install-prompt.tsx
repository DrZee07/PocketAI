"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Update UI to notify the user they can install the PWA
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      // Hide the install prompt
      setIsInstallable(false)
      setIsInstalled(true)
      // Clear the deferredPrompt
      setDeferredPrompt(null)
      // Log the installation to analytics
      console.log("PWA was installed")
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  if (!isInstallable || isInstalled) return null

  return (
    <div className="w-full max-w-sm mx-auto mt-4 p-4 bg-violet-100 dark:bg-violet-900/30 rounded-lg shadow-md animate-fade-in-up delay-700">
      <div className="flex items-center gap-3">
        <Download className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-violet-800 dark:text-violet-200">Install PocketAI on your device</p>
          <p className="text-xs text-violet-600 dark:text-violet-300 mt-1">Use it like a native app, even offline!</p>
        </div>
        <Button size="sm" onClick={handleInstallClick} className="bg-violet-600 hover:bg-violet-700 text-white">
          Install
        </Button>
      </div>
    </div>
  )
}

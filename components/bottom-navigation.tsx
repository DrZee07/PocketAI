"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, History, Download, Settings, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function BottomNavigation() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Hide navigation when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // Don't show on auth pages
  if (pathname.startsWith("/auth/")) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-900 rounded-full shadow-xl border border-violet-200 dark:border-slate-800 p-2 z-50 transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0",
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          variant={pathname === "/chat" ? "default" : "ghost"}
          size="icon"
          asChild
          className={cn(
            "rounded-full h-12 w-12",
            pathname === "/chat" && "bg-violet-600 hover:bg-violet-700 text-white",
          )}
        >
          <Link href="/chat">
            <MessageSquare className="h-5 w-5" />
          </Link>
        </Button>
        <Button
          variant={pathname === "/history" ? "default" : "ghost"}
          size="icon"
          asChild
          className={cn(
            "rounded-full h-12 w-12",
            pathname === "/history" && "bg-violet-600 hover:bg-violet-700 text-white",
          )}
        >
          <Link href="/history">
            <History className="h-5 w-5" />
          </Link>
        </Button>
        <Button
          variant={pathname === "/models" ? "default" : "ghost"}
          size="icon"
          asChild
          className={cn(
            "rounded-full h-12 w-12",
            pathname === "/models" && "bg-violet-600 hover:bg-violet-700 text-white",
          )}
        >
          <Link href="/models">
            <Download className="h-5 w-5" />
          </Link>
        </Button>
        <Button
          variant={pathname === "/settings" ? "default" : "ghost"}
          size="icon"
          asChild
          className={cn(
            "rounded-full h-12 w-12",
            pathname === "/settings" && "bg-violet-600 hover:bg-violet-700 text-white",
          )}
        >
          <Link href="/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
        <Button
          variant={pathname === "/profile" ? "default" : "ghost"}
          size="icon"
          asChild
          className={cn(
            "rounded-full h-12 w-12",
            pathname === "/profile" && "bg-violet-600 hover:bg-violet-700 text-white",
          )}
        >
          <Link href="/profile">
            <User className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

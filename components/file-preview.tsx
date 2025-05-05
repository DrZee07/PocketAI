"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileHandler } from "@/lib/file-handler"
import { Download, Maximize2, Minimize2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface FilePreviewProps {
  file: {
    id: string
    name: string
    type: string
    size: number
    data?: string
    thumbnail?: string
  }
  onClose?: () => void
  className?: string
}

export function FilePreview({ file, onClose, className }: FilePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleDownload = () => {
    if (file.data) {
      const link = document.createElement("a")
      link.href = file.data
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      )
    }

    if (!file.data && !file.thumbnail) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-500"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Preview not available for this file type</p>
        </div>
      )
    }

    if (file.type.startsWith("image/")) {
      return <img src={file.data || file.thumbnail} alt={file.name} className="max-w-full max-h-full object-contain" />
    } else if (file.type.startsWith("video/")) {
      return (
        <video src={file.data} controls className="max-w-full max-h-full" controlsList="nodownload">
          Your browser does not support the video tag.
        </video>
      )
    } else if (file.type.startsWith("audio/")) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-500"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <p className="text-sm font-medium mb-4">{file.name}</p>
          <audio src={file.data} controls className="w-full max-w-md" controlsList="nodownload">
            Your browser does not support the audio tag.
          </audio>
        </div>
      )
    } else if (file.type === "application/pdf") {
      return <iframe src={`${file.data}#toolbar=0`} className="w-full h-full border-0" title={file.name} />
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-500"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-sm font-medium mb-2">{file.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{FileHandler.formatFileSize(file.size)}</p>
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      )
    }
  }

  const content = (
    <div className={cn("relative", className)}>
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {!isFullscreen && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0">
              <div className="relative w-full h-full flex items-center justify-center p-4">{renderPreview()}</div>
            </DialogContent>
          </Dialog>
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </Button>

        {onClose && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="w-full h-full flex items-center justify-center">{renderPreview()}</div>
    </div>
  )

  return isFullscreen ? (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 h-8 w-8 bg-white/10 backdrop-blur-sm"
        onClick={() => setIsFullscreen(false)}
      >
        <Minimize2 className="h-4 w-4" />
      </Button>
      {content}
    </div>
  ) : (
    <Card className="overflow-hidden">{content}</Card>
  )
}

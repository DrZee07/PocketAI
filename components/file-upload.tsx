"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileHandler } from "@/lib/file-handler"
import { Paperclip, X, File, ImageIcon, FileText, Video, Music } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onCancel: () => void
  className?: string
  accept?: string
  maxSize?: number
}

export function FileUpload({
  onFileSelect,
  onCancel,
  className,
  accept = "*",
  maxSize = 50 * 1024 * 1024, // 50MB default
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    validateAndProcessFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const file = files[0]
    validateAndProcessFile(file)
  }

  const validateAndProcessFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${FileHandler.formatFileSize(maxSize)}`,
        variant: "destructive",
      })
      return
    }

    // Validate file type if accept is specified
    if (accept !== "*") {
      const acceptTypes = accept.split(",").map((type) => type.trim())
      const isAccepted = acceptTypes.some((type) => {
        if (type.startsWith(".")) {
          // Check file extension
          return file.name.toLowerCase().endsWith(type.toLowerCase())
        } else if (type.includes("/*")) {
          // Check MIME type category (e.g., "image/*")
          const category = type.split("/")[0]
          return file.type.startsWith(`${category}/`)
        } else {
          // Check exact MIME type
          return file.type === type
        }
      })

      if (!isAccepted) {
        toast({
          title: "Invalid file type",
          description: `Please select a file of type: ${accept}`,
          variant: "destructive",
        })
        return
      }
    }

    setSelectedFile(file)

    // Generate preview for images
    if (file.type.startsWith("image/")) {
      try {
        const previewUrl = URL.createObjectURL(file)
        setPreview(previewUrl)
      } catch (error) {
        console.error("Failed to generate preview:", error)
      }
    } else {
      setPreview(null)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onCancel()
  }

  const handleConfirm = () => {
    if (selectedFile) {
      onFileSelect(selectedFile)
      setSelectedFile(null)
      if (preview) {
        URL.revokeObjectURL(preview)
        setPreview(null)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const getFileIcon = () => {
    if (!selectedFile) return <Paperclip className="h-6 w-6" />

    if (selectedFile.type.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />
    } else if (selectedFile.type.startsWith("video/")) {
      return <Video className="h-6 w-6 text-red-500" />
    } else if (selectedFile.type.startsWith("audio/")) {
      return <Music className="h-6 w-6 text-green-500" />
    } else if (selectedFile.type.includes("pdf") || selectedFile.type.includes("text")) {
      return <FileText className="h-6 w-6 text-orange-500" />
    } else {
      return <File className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {!selectedFile ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
              : "border-slate-300 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600",
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Paperclip className="h-8 w-8 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Drag and drop a file here, or click to select</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            Maximum file size: {FileHandler.formatFileSize(maxSize)}
          </p>
          <input type="file" ref={fileInputRef} className="hidden" accept={accept} onChange={handleFileChange} />
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3">
            {preview ? (
              <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                {getFileIcon()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {FileHandler.formatFileSize(selectedFile.size)}
              </p>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleConfirm}>
              Attach
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

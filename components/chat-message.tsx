"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, WifiOff, Shield, File } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, ThumbsUp, ThumbsDown, Reply } from "lucide-react"
import { MessageReaction } from "@/components/message-reaction"
import { ReadReceipt } from "@/components/read-receipt"
import { VoiceMessagePlayer } from "@/components/voice-message-player"
import { FilePreview } from "@/components/file-preview"
import { db } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

interface ChatMessageProps {
  message: {
    id: string
    content: string
    role: "user" | "assistant" | "system"
    timestamp: number
    status?: string
    encrypted?: boolean
    voiceMessage?: {
      id: string
      duration: number
      url: string
    }
    file?: {
      id: string
      name: string
      type: string
      size: number
      thumbnail?: string
    }
  }
  isUser: boolean
  timestamp: string
  userId: string
  onReply?: (messageId: string) => void
  className?: string
}

export function ChatMessage({ message, isUser, timestamp, userId, onReply, className }: ChatMessageProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [feedback, setFeedback] = useState<"liked" | "disliked" | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [showFilePreview, setShowFilePreview] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = () => {
    // Create a temporary element to strip HTML tags if present
    const tempElement = document.createElement("div")
    tempElement.innerHTML = message.content
    const textToCopy = tempElement.textContent || tempElement.innerText || message.content

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    })
  }

  const handleFeedback = async (type: "liked" | "disliked") => {
    setFeedback(type)

    // In a real app, you would send this feedback to your backend
    toast({
      title: type === "liked" ? "Marked as helpful" : "Marked as not helpful",
      description: "Thank you for your feedback",
    })
  }

  const handleReply = () => {
    if (onReply) {
      onReply(message.id)
    }
  }

  const handleReaction = async (emoji: string) => {
    if (!emoji) return

    // Save reaction to database
    if (db) {
      try {
        await db.saveReaction({
          messageId: message.id,
          userId,
          emoji,
        })
      } catch (error) {
        console.error("Failed to save reaction:", error)
      }
    }
  }

  const renderContent = () => {
    // If message is encrypted and couldn't be decrypted
    if (message.encrypted && message.content.startsWith("⚠️")) {
      return (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Shield className="h-4 w-4" />
          <span>{message.content}</span>
        </div>
      )
    }

    // If message has a voice message
    if (message.voiceMessage) {
      return (
        <VoiceMessagePlayer
          src={message.voiceMessage.url}
          duration={message.voiceMessage.duration}
          className="w-full max-w-[300px]"
        />
      )
    }

    // If message has a file
    if (message.file) {
      return (
        <div>
          {showFilePreview ? (
            <FilePreview
              file={message.file}
              onClose={() => setShowFilePreview(false)}
              className="w-full max-w-[300px] h-[200px]"
            />
          ) : (
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-start p-3 h-auto"
              onClick={() => setShowFilePreview(true)}
            >
              <File className="h-5 w-5 text-slate-500" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate">{message.file.name}</p>
                <p className="text-xs text-slate-500">{(message.file.size / 1024).toFixed(1)} KB</p>
              </div>
            </Button>
          )}
        </div>
      )
    }

    // Regular message content
    return <div dangerouslySetInnerHTML={{ __html: message.content }} />
  }

  return (
    <div
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn("flex gap-3 max-w-[80%]", isUser && "flex-row-reverse")}>
        <Avatar className="h-8 w-8">
          {isUser ? (
            <>
              <AvatarFallback className="bg-violet-600 text-white">U</AvatarFallback>
              <AvatarImage src="/placeholder.svg" alt="User" />
            </>
          ) : (
            <>
              <AvatarFallback className="bg-slate-200 text-violet-600 dark:bg-slate-700 dark:text-violet-400">
                AI
              </AvatarFallback>
              <AvatarImage src="/placeholder.svg" alt="AI" />
            </>
          )}
        </Avatar>

        <div className="space-y-1">
          <Card
            className={cn(
              "rounded-3xl shadow-sm transition-all duration-200",
              isUser
                ? "bg-violet-600 text-white dark:bg-violet-700"
                : "bg-white dark:bg-slate-800 border-violet-100 dark:border-slate-700",
            )}
          >
            <CardContent className="p-3 text-sm">{renderContent()}</CardContent>
          </Card>

          <div className="flex items-center gap-1 px-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">{timestamp}</p>
            {message.status && (
              <>
                {message.status === "sent" && <CheckCircle className="h-3 w-3 text-green-500" />}
                {message.status === "pending" && <Clock className="h-3 w-3 text-amber-500" />}
                {message.status === "offline" && <WifiOff className="h-3 w-3 text-red-500" />}
              </>
            )}

            {message.encrypted && <Shield className="h-3 w-3 text-blue-500" title="End-to-end encrypted" />}

            {/* Read receipts */}
            {!isUser && <ReadReceipt messageId={message.id} />}

            {/* Message reactions */}
            <MessageReaction
              messageId={message.id}
              userId={userId}
              className="ml-2"
              onReactionChange={handleReaction}
            />

            {/* Message actions that appear on hover */}
            {isHovered && (
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={handleReply}
                  title="Reply"
                >
                  <Reply className="h-3 w-3" />
                </Button>

                {!isUser && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 rounded-full",
                        feedback === "liked" && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                      )}
                      onClick={() => handleFeedback("liked")}
                      title="Helpful"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 rounded-full",
                        feedback === "disliked" && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                      )}
                      onClick={() => handleFeedback("disliked")}
                      title="Not helpful"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

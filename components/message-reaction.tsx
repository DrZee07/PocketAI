"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SmilePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { db } from "@/lib/db"

interface MessageReactionProps {
  messageId: string
  userId: string
  className?: string
  onReactionChange?: (emoji: string) => void
}

export function MessageReaction({ messageId, userId, className, onReactionChange }: MessageReactionProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({})
  const [isOpen, setIsOpen] = useState(false)

  // Common emoji set
  const emojis = ["👍", "❤️", "😂", "😮", "😢", "👏", "🔥", "🎉"]

  // Load existing reactions
  useEffect(() => {
    const loadReactions = async () => {
      if (db) {
        try {
          const reactions = await db.getReactionsByMessage(messageId)

          // Find user's reaction
          const userReaction = reactions.find((r) => r.userId === userId)
          if (userReaction) {
            setSelectedEmoji(userReaction.emoji)
          }

          // Count reactions by emoji
          const counts: Record<string, number> = {}
          reactions.forEach((reaction) => {
            counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1
          })

          setReactionCounts(counts)
        } catch (error) {
          console.error("Failed to load reactions:", error)
        }
      }
    }

    loadReactions()
  }, [messageId, userId])

  const handleEmojiSelect = async (emoji: string) => {
    setIsOpen(false)

    // Toggle emoji if already selected
    if (emoji === selectedEmoji) {
      setSelectedEmoji(null)

      // Update counts
      setReactionCounts((prev) => {
        const newCounts = { ...prev }
        if (newCounts[emoji] && newCounts[emoji] > 0) {
          newCounts[emoji] -= 1
          if (newCounts[emoji] === 0) {
            delete newCounts[emoji]
          }
        }
        return newCounts
      })

      // Notify parent
      if (onReactionChange) {
        onReactionChange("")
      }

      // Remove from database
      if (db) {
        try {
          const reactions = await db.getReactionsByMessage(messageId)
          const userReaction = reactions.find((r) => r.userId === userId)
          if (userReaction) {
            // In a real app, we would delete the reaction
            // For now, we'll just update it with an empty emoji
            await db.saveReaction({
              ...userReaction,
              emoji: "",
            })
          }
        } catch (error) {
          console.error("Failed to remove reaction:", error)
        }
      }
    } else {
      setSelectedEmoji(emoji)

      // Update counts
      setReactionCounts((prev) => {
        const newCounts = { ...prev }

        // Remove previous emoji count if exists
        if (selectedEmoji && newCounts[selectedEmoji] && newCounts[selectedEmoji] > 0) {
          newCounts[selectedEmoji] -= 1
          if (newCounts[selectedEmoji] === 0) {
            delete newCounts[selectedEmoji]
          }
        }

        // Add new emoji count
        newCounts[emoji] = (newCounts[emoji] || 0) + 1

        return newCounts
      })

      // Notify parent
      if (onReactionChange) {
        onReactionChange(emoji)
      }

      // Save to database
      if (db) {
        try {
          await db.saveReaction({
            messageId,
            userId,
            emoji,
          })
        } catch (error) {
          console.error("Failed to save reaction:", error)
        }
      }
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Display reaction counts */}
      {Object.entries(reactionCounts).map(
        ([emoji, count]) =>
          count > 0 && (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2 text-xs rounded-full",
                selectedEmoji === emoji
                  ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400"
                  : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400",
              )}
              onClick={() => handleEmojiSelect(emoji)}
            >
              {emoji} {count}
            </Button>
          ),
      )}

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <SmilePlus className="h-4 w-4 text-slate-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {emojis.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

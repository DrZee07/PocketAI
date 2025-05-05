"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Settings, ArrowLeft, Wifi, WifiOff, Send } from "lucide-react"
import Link from "next/link"
import { ModelSelector } from "@/components/model-selector"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  status?: string
  timestamp: number
}

export default function RichTextChatPage() {
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isListening, setIsListening] = useState(false)
  const [selectedModel, setSelectedModel] = useState("tinyllama-1.1b")
  const [messages, setMessages] = useState<Message[]>([])
  const [richTextContent, setRichTextContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "You're back online",
        description: "Messages will be sent immediately.",
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "You're offline",
        description: "Messages will be queued and sent when you're back online.",
        variant: "destructive",
      })
    }

    // Set initial status
    setIsOnline(navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!richTextContent.trim() || isLoading) return

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: richTextContent,
      role: "user",
      timestamp: Date.now(),
    }

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage])
    setRichTextContent("")
    setIsLoading(true)

    try {
      // Simulate AI response
      setTimeout(() => {
        let response = ""

        if (
          richTextContent.toLowerCase().includes("<b>hello</b>") ||
          richTextContent.toLowerCase().includes("<b>hi</b>")
        ) {
          response = `<p>Hello! I'm running on the <b>${selectedModel}</b> model. How can I help you today?</p>`
        } else if (richTextContent.toLowerCase().includes("list")) {
          response = `
            <p>Here's a list of features in this rich text chat:</p>
            <ul>
              <li><b>Bold text</b> formatting</li>
              <li><i>Italic text</i> formatting</li>
              <li>Bullet lists and numbered lists</li>
              <li>Text alignment options</li>
              <li>Link insertion</li>
              <li>Code blocks</li>
              <li>Emoji support 😊</li>
            </ul>
          `
        } else {
          response = `
            <p>I'm processing your message using the <b>${selectedModel}</b> model running locally on your device.</p>
            <p>This rich text interface allows for <i>formatted messages</i> with various styling options.</p>
            <p>What else would you like to know?</p>
          `
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          role: "assistant",
          status: "sent",
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. It will be retried when you're back online.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const toggleVoiceInput = () => {
    if (!isListening) {
      // Check if SpeechRecognition is supported
      if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.lang = "en-US"
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onstart = () => {
          setIsListening(true)
          toast({
            title: "Listening...",
            description: "Speak now",
          })
        }

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setRichTextContent(transcript)
        }

        recognition.onerror = (event) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
          toast({
            title: "Error",
            description: "Failed to recognize speech",
            variant: "destructive",
          })
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.start()
      } else {
        setIsListening(false)
        toast({
          title: "Voice Input",
          description: "Speech recognition is not supported in your browser",
          variant: "destructive",
        })
      }
    } else {
      setIsListening(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-violet-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Rich Text Chat</h1>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            <ModelSelector value={selectedModel} onValueChange={setSelectedModel} />
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 text-slate-500 dark:text-slate-400">
              <div className="rounded-full bg-violet-100 dark:bg-violet-900/30 p-4 animate-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-violet-600 dark:text-violet-400"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="animate-fade-in-up">
                <h3 className="text-lg font-medium">Start a rich text conversation</h3>
                <p className="max-w-sm">Use formatting options to enhance your messages with the AI assistant.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[80%] ${message.role === "user" && "flex-row-reverse"}`}>
                  <Avatar className="h-8 w-8">
                    {message.role === "user" ? (
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
                      className={`rounded-3xl shadow-sm ${
                        message.role === "user"
                          ? "bg-violet-600 text-white dark:bg-violet-700"
                          : "bg-white dark:bg-slate-800 border-violet-100 dark:border-slate-700"
                      }`}
                    >
                      <CardContent className="p-3 text-sm">
                        <div dangerouslySetInnerHTML={{ __html: message.content }} />
                      </CardContent>
                    </Card>
                    <div className="flex items-center gap-1 px-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                      </p>
                      {message.status === "sent" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-500"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-violet-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-3xl mx-auto">
          <RichTextEditor
            value={richTextContent}
            onChange={setRichTextContent}
            placeholder="Type a message with formatting..."
            minHeight="100px"
            maxHeight="200px"
          />
          <div className="flex justify-between">
            <Button type="button" variant="outline" size="sm" className="flex gap-2" onClick={toggleVoiceInput}>
              {isListening ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  Stop Listening
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  Voice Input
                </>
              )}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !richTextContent.trim()}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

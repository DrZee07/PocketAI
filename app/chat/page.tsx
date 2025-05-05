"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/db"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { initializeEncryption, EncryptionService } from "@/lib/encryption"

export default function ChatPage() {
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isListening, setIsListening] = useState(false)
  const [selectedModel, setSelectedModel] = useState("tinyllama-1.1b")
  const [messages, setMessages] = useState<
    Array<{
      id: string
      content: string
      role: "user" | "assistant" | "system"
      status?: string
      formattedContent?: React.ReactNode
      timestamp: number
      encrypted?: boolean
      senderId?: string
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
    }>
  >([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [conversationTitle, setConversationTitle] = useState("")
  const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false)
  const [useRichText, setUseRichText] = useState(false)
  const [richTextContent, setRichTextContent] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [isGroupChat, setIsGroupChat] = useState(false)
  const [groupMembers, setGroupMembers] = useState<any[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const conversationId = searchParams.get("conversation")
  const groupId = searchParams.get("group")
  const inputRef = useRef<HTMLInputElement>(null)
  const encryptionService = useRef<EncryptionService | null>(null)

  // Initialize encryption
  useEffect(() => {
    const setupEncryption = async () => {
      try {
        await initializeEncryption()
        encryptionService.current = EncryptionService.getInstance()
        console.log("Encryption initialized successfully")
      } catch (error) {
        console.error("Failed to initialize encryption:", error)
        toast({
          title: "Encryption Error",
          description: "Failed to initialize end-to-end encryption",
          variant: "destructive",
        })
      }
    }

    setupEncryption()
  }, [toast])

  // Load messages from IndexedDB on component mount
  useEffect(() => {
    const loadMessages = async () => {
      if (db) {
        try {
          // If conversationId or groupId is provided, load that specific conversation
          const conversationToLoad = groupId || conversationId || "default"
          const savedMessages = await db.getMessages(conversationToLoad)

          if (savedMessages && savedMessages.length > 0) {
            setMessages(
              savedMessages.map((msg) => ({
                ...msg,
                timestamp: msg.timestamp || Date.now(),
              })),
            )

            // If it's a named conversation, set the title
            if (conversationId || groupId) {
              // In a real app, we would fetch the conversation title from the database
              // For now, we'll use a mock title based on the first message
              const firstUserMessage = savedMessages.find((msg) => msg.role === "user")
              if (firstUserMessage) {
                const title =
                  firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "")
                setConversationTitle(title)
              } else {
                setConversationTitle(groupId ? "Group Chat" : "Conversation")
              }
            }
          }

          // Check if this is a group chat
          if (groupId) {
            setIsGroupChat(true)

            // Load group members (mock data for now)
            setGroupMembers([
              {
                id: "user-1",
                name: "You",
                isAdmin: true,
                isOnline: true,
              },
              {
                id: "user-2",
                name: "Alice Smith",
                isOnline: true,
              },
              {
                id: "user-3",
                name: "Bob Johnson",
                isOnline: false,
              },
              {
                id: "user-4",
                name: "Carol Williams",
                isOnline: true,
              },
            ])
          }
        } catch (error) {
          console.error("Error loading messages:", error)
        }
      }
    }

    loadMessages()
  }, [conversationId, groupId])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const formatText = (format: string) => {
    if (!inputRef.current) return

    const input = inputRef.current
    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const selectedText = input.value.substring(start, end)

    let formattedText = ""
    let cursorOffset = 0

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        cursorOffset = 2
        break
      case "italic":
        formattedText = `*${selectedText}*`
        cursorOffset = 1
        break
      case "code":
        formattedText = `\`${selectedText}\``
        cursorOffset = 1
        break
      case "list":
        formattedText = `\n- ${selectedText}`
        cursorOffset = 3
        break
      case "ordered-list":
        formattedText = `\n1. ${selectedText}`
        cursorOffset = 4
        break
      default:
        return
    }

    const newValue = input.value.substring(0, start) + formattedText + input.value.substring(end)
    setInput(newValue)

    // Set cursor position after the formatting
    setTimeout(() => {
      input.focus()
      if (selectedText) {
        input.selectionStart = start + formattedText.length
        input.selectionEnd = start + formattedText.length
      } else {
        input.selectionStart = start + cursorOffset
        input.selectionEnd = start + cursorOffset
      }
    }, 0)

    setIsFormatMenuOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Get content from either rich text editor or plain input
    const messageContent = useRichText ? richTextContent : input

    if (!messageContent.trim() || isLoading) return

    // Create user message
    const userMessage = {
      id: Date.now().toString(),
      content: messageContent,
      role: "user" as const,
      timestamp: Date.now(),
      encrypted: isEncrypted,
      senderId: user?.id || "user-1",
    }

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setRichTextContent("")
    setIsLoading(true)
    setReplyingTo(null)

    try {
      // Save user message to IndexedDB
      if (db) {
        if (isEncrypted && encryptionService.current) {
          // For encrypted messages, we need to encrypt the content first
          // In a real app, we would encrypt for each recipient
          const recipientId = isGroupChat ? "group-1" : "assistant-1"
          await db.saveEncryptedMessage(
            {
              ...userMessage,
              conversationId: conversationId || groupId || "default",
              groupId: groupId,
            },
            recipientId,
          )
        } else {
          await db.saveMessage({
            ...userMessage,
            conversationId: conversationId || groupId || "default",
            groupId: groupId,
          })
        }
      }

      // Try to send message with offline support
      if (!isOnline) {
        // If offline, create a simulated response
        setTimeout(() => {
          const offlineResponse = {
            id: (Date.now() + 1).toString(),
            content:
              "I'm currently in offline mode. Your message has been saved and will be processed when you're back online.",
            role: "assistant" as const,
            status: "offline",
            timestamp: Date.now(),
            encrypted: isEncrypted,
            senderId: "assistant-1",
          }

          setMessages((prev) => [...prev, offlineResponse])
          setIsLoading(false)

          // Save offline response to IndexedDB
          if (db) {
            db.saveMessage({
              ...offlineResponse,
              conversationId: conversationId || groupId || "default",
              groupId: groupId,
            })
          }
        }, 1000)

        return
      }

      // Simulate AI response (in a real app, this would be a call to your API)
      setTimeout(() => {
        let response = ""

        if (messageContent.toLowerCase().includes("hello") || messageContent.toLowerCase().includes("hi")) {
          response = `Hello! I'm running on the ${selectedModel} model${isEncrypted ? " with end-to-end encryption" : ""}. How can I help you today?`
        } else if (messageContent.toLowerCase().includes("weather")) {
          response = `I don't have access to real-time weather data since I'm running locally on your device with the ${selectedModel} model. To get weather information, you would need to connect to an online service.`
        } else if (messageContent.toLowerCase().includes("model")) {
          response = `I'm currently using the ${selectedModel} model, which is a small language model optimized to run efficiently on mobile devices. It has a smaller parameter count than large cloud-based models, but can still be helpful for many tasks while preserving your privacy.`
        } else if (
          messageContent.toLowerCase().includes("markdown") ||
          messageContent.toLowerCase().includes("format")
        ) {
          response = `I support rich text formatting using Markdown! You can use:

**Bold text** with \`**double asterisks**\`
*Italic text* with \`*single asterisks*\`
\`Code\` with \`backticks\`

You can also create lists:
- Item 1
- Item 2

Or numbered lists:
1. First item
2. Second item`
        } else if (messageContent.toLowerCase().includes("encrypt")) {
          response = `End-to-end encryption is ${isEncrypted ? "enabled" : "disabled"} for this conversation. ${isEncrypted ? "Your messages are encrypted and can only be read by the intended recipients." : "You can enable encryption to secure your messages."}`
        } else if (isGroupChat) {
          response = `I'm processing your message in this group chat using the ${selectedModel} model. Group chats allow you to communicate with multiple people at once while still maintaining ${isEncrypted ? "end-to-end encryption" : "privacy"}.`
        } else {
          response = `I'm processing your message using the ${selectedModel} model running locally on your device. This ensures your data stays private${isEncrypted ? " and secure with end-to-end encryption" : ""}. What else would you like to know?`
        }

        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: response,
          role: "assistant" as const,
          status: "sent",
          timestamp: Date.now(),
          encrypted: isEncrypted,
          senderId: "assistant-1",
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)

        // Save assistant message to IndexedDB
        if (db) {
          if (isEncrypted && encryptionService.current) {
            // For encrypted messages, we would encrypt the content
            // In a real app, we would encrypt for each recipient
            const recipientId = user?.id || "user-1"
            db.saveEncryptedMessage(
              {
                ...assistantMessage,
                conversationId: conversationId || groupId || "default",
                groupId: groupId,
              },
              recipientId,
            )
          } else {
            db.saveMessage({
              ...assistantMessage,
              conversationId: conversationId || groupId || "default",
              groupId: groupId,
            })
          }
        }

        // If this is a new conversation and we don't have a title yet, create one
        if (!conversationId && !groupId && !conversationTitle && messages.length === 0) {
          // In a real app, we would use the AI to generate a title
          // For now, we'll use the first few words of the user message
          const newTitle = messageContent.substring(0, 30) + (messageContent.length > 30 ? "..." : "")
          setConversationTitle(newTitle)

          // In a real app, we would save this title to the database
          if (db) {
            db.saveConversation({
              id: "default",
              title: newTitle,
              lastUpdated: Date.now(),
              type: isGroupChat ? "group" : "individual",
              encrypted: isEncrypted,
            })
          }
        }

        // Simulate read receipts for group chats
        if (isGroupChat && db) {
          // In a real app, this would come from the server
          setTimeout(() => {
            // Add read receipts from other group members
            groupMembers.forEach((member) => {
              if (member.id !== user?.id && member.isOnline) {
                db.saveReadReceipt({
                  messageId: assistantMessage.id,
                  userId: member.id,
                  userName: member.name,
                  timestamp: Date.now() + Math.floor(Math.random() * 10000), // Random time within 10 seconds
                })
              }
            })
          }, 2000)
        }
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
          if (useRichText) {
            setRichTextContent(transcript)
          } else {
            setInput(transcript)
          }
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
        toast({
          title: "Not supported",
          description: "Speech recognition is not supported in your browser",
          variant: "destructive",
        })
      }
    } else {
      // Stop listening
      setIsListening(false)
      // In a real app, we would call recognition.stop()
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Toggle encryption
  const toggleEncryption = () => {
    if (!isEncrypted && encryptionService.current) {
      setIsEncrypted(true)
      toast({
        title: "Encryption enabled",
        description: "Your messages are now end-to-end encrypted",
      })
    } else if (isEncrypted) {
      setIsEncrypted(false)
      toast({
        title: "Encryption disabled",
        description: "Your messages are no longer encrypted",
      })
    } else {
      toast({
        title: "Encryption unavailable",
        description: "Failed to initialize encryption service",
        variant: "destructive",
      })
    }
  }

  // Save conversation
  const saveConversation = async () => {
    if (db && messages.length > 0) {
      try {
        // Generate a new conversation ID if we don't have one
        const newConversationId = conversationId || `conversation-${Date.now()}`

        // Save all messages with the new conversation ID
        for (const message of messages) {
          await db.saveMessage({
            ...message,
            conversationId: newConversationId,
          })
        }

        // Save the conversation metadata
        await db.saveConversation({
          id: newConversationId,
          title: conversationTitle || `Conversation ${new Date().toLocaleString()}`,
          lastUpdated: Date.now(),
          type: isGroupChat ? "group" : "individual",
          encrypted: isEncrypted,
        })

        toast({
          title: "Conversation saved",
          description: "You can access it from the history page",
        })

        // Redirect to the saved conversation
        router.push(`/chat?conversation=${newConversationId}`)
      } catch (error) {
        console.error("Error saving conversation:", error)
        toast({
          title: "Error",
          description: "Failed to save conversation",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Nothing to save",
        description: "Start a conversation first",
        variant: "destructive",
      })
    }
  }

  // Clear conversation
  const clearConversation = () => {
    setMessages([])
    setConversationTitle("")

    toast({
      title: "Conversation cleared",
      description: "Started a new conversation",
    })

    // If we're in a specific conversation, go back to the default chat
    if (conversationId || groupId) {
      router.push("/chat")
    }
  }

  // Handle emoji reaction
  const handleEmojiReaction = (messageId: string, emoji: string) => {
    // In a real app, we would save this to the database
    toast({
      title: "Reaction added",
      description: `You reacted with ${emoji}`,
    })
  }

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setIsUploading(true)

    // Simulate file upload
    setTimeout(() => {
      const fileId = `file-${Date.now()}`
      const fileMessage = {
        id: Date.now().toString(),
        content: `Sent a file: ${file.name}`,
        role: "user" as const,
        timestamp: Date.now(),
        encrypted: isEncrypted,
        senderId: user?.id || "user-1",
        file: {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          // In a real app, we would generate a thumbnail for images
          thumbnail: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        },
      }

      setMessages((prev) => [...prev, fileMessage])
      setIsUploading(false)

      // Save file message to IndexedDB
      if (db) {
        db.saveMessage({
          ...fileMessage,
          conversationId: conversationId || groupId || "default",
          groupId: groupId,
        })
      }

      toast({
        title: "File uploaded",
        description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
      })
    }, 1500)
  }

  // Handle voice recording
  const handleVoiceRecording = (audioBlob: Blob, duration: number) => {
    const audioUrl = URL.createObjectURL(audioBlob)
    const voiceId = `voice-${Date.now()}`

    const voiceMessage = {
      id: Date.now().toString(),
      content: "Sent a voice message",
      role: "user" as const,
      timestamp: Date.now(),
      encrypted: isEncrypted,
      senderId: user?.id || "user-1",
      voiceMessage: {
        id: voiceId,
        duration: duration,
        url: audioUrl,
      },
    }

    setMessages((prev) => [...prev, voiceMessage])

    // Save voice message to IndexedDB
    if (db) {
      db.saveMessage({
        ...voiceMessage,
        conversationId: conversationId || groupId || "default",
        groupId: groupId,
      })
    }

    toast({
      title: "Voice message sent",
      description: `${Math.round(duration / 1000)} seconds`,
    })
  }

  // Render the chat interface
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/")}
            className="mr-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold">{isGroupChat ? "Group Chat" : conversationTitle || "New Chat"}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isEncrypted ? "🔒 End-to-end encrypted" : "Using " + selectedModel}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleEncryption}
            className={`p-2 rounded-full ${
              isEncrypted
                ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            aria-label={isEncrypted ? "Disable encryption" : "Enable encryption"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={saveConversation}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Save conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={clearConversation}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Clear conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="max-w-sm mt-2">Start a conversation with the AI assistant using the input field below.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white dark:bg-blue-600"
                    : "bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700"
                } ${message.encrypted ? "border-green-500 dark:border-green-500" : ""}`}
              >
                {message.voiceMessage ? (
                  <div className="voice-message">
                    <p className="mb-2 text-sm">Voice Message ({Math.round(message.voiceMessage.duration / 1000)}s)</p>
                    <audio src={message.voiceMessage.url} controls className="w-full" />
                  </div>
                ) : message.file ? (
                  <div className="file-message">
                    <p className="mb-2 text-sm">
                      File: {message.file.name} ({(message.file.size / 1024).toFixed(2)} KB)
                    </p>
                    {message.file.thumbnail && (
                      <img
                        src={message.file.thumbnail || "/placeholder.svg"}
                        alt={message.file.name}
                        className="max-w-full rounded mb-2"
                      />
                    )}
                    <button className="text-xs underline">Download</button>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs opacity-70">{new Date(message.timestamp).toLocaleTimeString()}</span>
                  {message.status && <span className="text-xs opacity-70">{message.status}</span>}
                  {message.role === "assistant" && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEmojiReaction(message.id, "👍")}
                        className="text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1"
                      >
                        👍
                      </button>
                      <button
                        onClick={() => handleEmojiReaction(message.id, "❤️")}
                        className="text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1"
                      >
                        ❤️
                      </button>
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t bg-white dark:bg-gray-800 dark:border-gray-700 p-4">
        {replyingTo && (
          <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-between items-center">
            <span className="text-sm">
              Replying to: {messages.find((m) => m.id === replyingTo)?.content.substring(0, 50)}...
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              ref={inputRef}
              placeholder="Type a message..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || isRecording || isUploading}
            />
            <div className="absolute bottom-full mb-2 left-0">
              {isFormatMenuOpen && (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 flex space-x-2 border dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => formatText("bold")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText("italic")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText("code")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <code>{"<>"}</code>
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText("list")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText("ordered-list")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    1. List
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setIsFormatMenuOpen(!isFormatMenuOpen)}
              className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              aria-label="Formatting options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M7 7a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-3 rounded-full ${
                isListening
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              aria-label={isListening ? "Stop listening" : "Voice input"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !richTextContent.trim())}
              className={`p-3 rounded-full ${
                isLoading
                  ? "bg-gray-400 dark:bg-gray-600"
                  : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
              }`}
              aria-label="Send message"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

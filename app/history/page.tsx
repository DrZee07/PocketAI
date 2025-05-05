"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Search, Trash2, MessageSquare, Calendar, Download, Filter } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Conversation = {
  id: string
  title: string
  lastMessage: string
  timestamp: number
  modelId: string
  messageCount: number
  pinned?: boolean
}

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would fetch from IndexedDB or an API
        // For demo purposes, we'll use mock data
        const mockConversations: Conversation[] = [
          {
            id: "conv1",
            title: "Understanding Quantum Computing",
            lastMessage: "Can you explain quantum entanglement in simple terms?",
            timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
            modelId: "tinyllama-1.1b",
            messageCount: 12,
            pinned: true,
          },
          {
            id: "conv2",
            title: "Recipe Ideas",
            lastMessage: "What can I make with chicken, spinach, and feta cheese?",
            timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
            modelId: "mobilebert",
            messageCount: 8,
          },
          {
            id: "conv3",
            title: "Book Recommendations",
            lastMessage: "Can you suggest some science fiction books similar to Dune?",
            timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
            modelId: "squeezebert",
            messageCount: 15,
          },
          {
            id: "conv4",
            title: "Travel Planning",
            lastMessage: "What are some must-visit places in Japan?",
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
            modelId: "tinyllama-1.1b",
            messageCount: 20,
          },
          {
            id: "conv5",
            title: "Workout Routine",
            lastMessage: "Can you create a weekly workout plan for building muscle?",
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, // 1 week ago
            modelId: "distilgpt2",
            messageCount: 6,
          },
        ]

        setConversations(mockConversations)
      } catch (error) {
        console.error("Error loading conversations:", error)
        toast({
          title: "Error",
          description: "Failed to load conversation history.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [toast])

  const handleContinueConversation = (conversationId: string) => {
    router.push(`/chat?conversation=${conversationId}`)
  }

  const handleDeleteConversation = (conversationId: string) => {
    setConversations(conversations.filter((conv) => conv.id !== conversationId))
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed from your history.",
    })
  }

  const handleExportConversation = (conversationId: string) => {
    const conversation = conversations.find((conv) => conv.id === conversationId)
    if (!conversation) return

    // In a real app, this would generate and download a file
    // For demo purposes, we'll just show a toast
    toast({
      title: "Conversation exported",
      description: `"${conversation.title}" has been exported as JSON.`,
    })
  }

  const handlePinConversation = (conversationId: string) => {
    setConversations(
      conversations.map((conv) => (conv.id === conversationId ? { ...conv, pinned: !conv.pinned } : conv)),
    )

    const conversation = conversations.find((conv) => conv.id === conversationId)
    toast({
      title: conversation?.pinned ? "Conversation unpinned" : "Conversation pinned",
      description: conversation?.pinned
        ? "The conversation has been removed from your pinned items."
        : "The conversation has been added to your pinned items.",
    })
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const pinnedConversations = filteredConversations.filter((conv) => conv.pinned)
  const recentConversations = filteredConversations.filter((conv) => !conv.pinned)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-violet-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Chat History</h1>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All Conversations</DropdownMenuItem>
                <DropdownMenuItem>This Week</DropdownMenuItem>
                <DropdownMenuItem>This Month</DropdownMenuItem>
                <DropdownMenuItem>By Model</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="p-4 bg-white dark:bg-slate-950 border-b border-violet-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-violet-200 dark:border-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pinned">Pinned</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                  <h3 className="mt-4 text-lg font-medium">No conversations found</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">
                    {searchQuery
                      ? "Try a different search term"
                      : "Start a new chat to begin your conversation history"}
                  </p>
                  <Button asChild className="mt-4 bg-violet-600 hover:bg-violet-700">
                    <Link href="/chat">Start a New Chat</Link>
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-4">
                    {pinnedConversations.length > 0 && (
                      <div>
                        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">PINNED</h2>
                        <div className="space-y-3">
                          {pinnedConversations.map((conversation) => (
                            <ConversationCard
                              key={conversation.id}
                              conversation={conversation}
                              onContinue={handleContinueConversation}
                              onDelete={handleDeleteConversation}
                              onExport={handleExportConversation}
                              onPin={handlePinConversation}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {recentConversations.length > 0 && (
                      <div>
                        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">RECENT</h2>
                        <div className="space-y-3">
                          {recentConversations.map((conversation) => (
                            <ConversationCard
                              key={conversation.id}
                              conversation={conversation}
                              onContinue={handleContinueConversation}
                              onDelete={handleDeleteConversation}
                              onExport={handleExportConversation}
                              onPin={handlePinConversation}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="pinned">
              <ScrollArea className="h-[calc(100vh-220px)]">
                {pinnedConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <h3 className="mt-4 text-lg font-medium">No pinned conversations</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                      Pin important conversations to find them easily
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pinnedConversations.map((conversation) => (
                      <ConversationCard
                        key={conversation.id}
                        conversation={conversation}
                        onContinue={handleContinueConversation}
                        onDelete={handleDeleteConversation}
                        onExport={handleExportConversation}
                        onPin={handlePinConversation}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="recent">
              <ScrollArea className="h-[calc(100vh-220px)]">
                {recentConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <h3 className="mt-4 text-lg font-medium">No recent conversations</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                      Your recent conversations will appear here
                    </p>
                    <Button asChild className="mt-4 bg-violet-600 hover:bg-violet-700">
                      <Link href="/chat">Start a New Chat</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentConversations.map((conversation) => (
                      <ConversationCard
                        key={conversation.id}
                        conversation={conversation}
                        onContinue={handleContinueConversation}
                        onDelete={handleDeleteConversation}
                        onExport={handleExportConversation}
                        onPin={handlePinConversation}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

interface ConversationCardProps {
  conversation: Conversation
  onContinue: (id: string) => void
  onDelete: (id: string) => void
  onExport: (id: string) => void
  onPin: (id: string) => void
}

function ConversationCard({ conversation, onContinue, onDelete, onExport, onPin }: ConversationCardProps) {
  return (
    <Card
      className="border-violet-100 dark:border-slate-800 hover:border-violet-200 dark:hover:border-slate-700 transition-all duration-200 shadow-sm hover:shadow"
      onClick={() => onContinue(conversation.id)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{conversation.title}</h3>
              {conversation.pinned && (
                <Badge
                  variant="outline"
                  className="bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400"
                >
                  Pinned
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{conversation.lastMessage}</p>
            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(conversation.timestamp, { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{conversation.messageCount} messages</span>
              </div>
              <div>
                <Badge variant="secondary" className="text-xs py-0 px-1.5">
                  {conversation.modelId}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onPin(conversation.id)
              }}
            >
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
                className={conversation.pinned ? "text-violet-600 dark:text-violet-400" : ""}
              >
                <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7.05 11.5 7.35 11.76a1 1 0 0 0 1.3 0C13 21.5 20 15.4 20 10a8 8 0 0 0-8-8z" />
              </svg>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onExport(conversation.id)
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(conversation.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

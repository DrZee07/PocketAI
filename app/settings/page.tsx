"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Moon, Sun, Laptop, Trash2, Download, LogOut, Palette } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ColorPicker } from "@/components/color-picker"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  // Model settings
  const [modelCacheSize, setModelCacheSize] = useState(2)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1024)
  const [defaultModel, setDefaultModel] = useState("tinyllama-1.1b")

  // Interface settings
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [offlineMode, setOfflineMode] = useState(false)
  const [autoDownload, setAutoDownload] = useState(true)
  const [fontSize, setFontSize] = useState("medium")
  const [highContrastMode, setHighContrastMode] = useState(false)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [updateNotifications, setUpdateNotifications] = useState(true)

  // Theme settings
  const [primaryColor, setPrimaryColor] = useState("#8b5cf6") // Violet-600
  const [accentColor, setAccentColor] = useState("#3b82f6") // Blue-500
  const [customTheme, setCustomTheme] = useState("default")

  // User settings
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")

  // Prompt templates
  const [defaultPrompt, setDefaultPrompt] = useState("You are a helpful AI assistant running locally on my device.")
  const [customPrompts, setCustomPrompts] = useState([
    { id: "1", name: "Helpful Assistant", content: "You are a helpful AI assistant running locally on my device." },
    { id: "2", name: "Code Expert", content: "You are a coding expert. Help me write clean, efficient code." },
    {
      id: "3",
      name: "Creative Writer",
      content: "You are a creative writing assistant. Help me craft engaging stories.",
    },
  ])

  useEffect(() => {
    // In a real app, this would load from IndexedDB or an API
    if (user) {
      setDisplayName(user.name || "")
      setEmail(user.email || "")
      setBio(user.bio || "")
    }
  }, [user])

  const handleClearCache = () => {
    toast({
      title: "Cache Cleared",
      description: "All cached model data has been cleared.",
    })
  }

  const handleExportChats = () => {
    toast({
      title: "Chats Exported",
      description: "Your chat history has been exported successfully.",
    })
  }

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    })
  }

  const handleChangePassword = () => {
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    })
  }

  const handleSavePrompt = () => {
    toast({
      title: "Prompt Saved",
      description: "Your custom prompt template has been saved.",
    })
  }

  const handleApplyTheme = () => {
    document.documentElement.style.setProperty("--primary-color", primaryColor)
    document.documentElement.style.setProperty("--accent-color", accentColor)

    toast({
      title: "Theme Applied",
      description: "Your custom theme has been applied.",
    })
  }

  const handleLogout = async () => {
    await logout()
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    })
  }

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
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
          {user && (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 dark:text-red-400">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <main className="container max-w-4xl mx-auto px-4 py-8">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="interface">Interface</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account">
              <div className="space-y-6">
                {user ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your account details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="border-violet-200 dark:border-slate-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-violet-200 dark:border-slate-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="border-violet-200 dark:border-slate-700"
                            placeholder="Tell us a little about yourself"
                          />
                        </div>
                        <Button onClick={handleSaveProfile} className="bg-violet-600 hover:bg-violet-700 text-white">
                          Save Profile
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Manage your account security</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            className="border-violet-200 dark:border-slate-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input id="newPassword" type="password" className="border-violet-200 dark:border-slate-700" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            className="border-violet-200 dark:border-slate-700"
                          />
                        </div>
                        <Button onClick={handleChangePassword} className="bg-violet-600 hover:bg-violet-700 text-white">
                          Change Password
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Account</CardTitle>
                      <CardDescription>Sign in to access all features</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-slate-600 dark:text-slate-400">
                        You are not currently signed in. Create an account or sign in to sync your settings and chat
                        history across devices.
                      </p>
                      <div className="flex gap-4">
                        <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white">
                          <Link href="/auth/login">Sign In</Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link href="/auth/register">Create Account</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Manage your data and chat history</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button variant="outline" className="w-full" onClick={handleClearCache}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Model Cache
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleExportChats}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Chat History
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="data-sync">Sync Data Across Devices</Label>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Requires an account</p>
                        </div>
                        <Switch id="data-sync" disabled={!user} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Model Settings */}
            <TabsContent value="models">
              <Card>
                <CardHeader>
                  <CardTitle>Model Settings</CardTitle>
                  <CardDescription>Configure how models work on your device</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="default-model">Default Model</Label>
                    <Select value={defaultModel} onValueChange={setDefaultModel}>
                      <SelectTrigger id="default-model" className="border-violet-200 dark:border-slate-700">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tinyllama-1.1b">TinyLlama 1.1B</SelectItem>
                        <SelectItem value="mobilebert">MobileBERT</SelectItem>
                        <SelectItem value="squeezebert">SqueezeBERT</SelectItem>
                        <SelectItem value="distilgpt2">DistilGPT2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
                    </div>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[temperature]}
                      onValueChange={(value) => setTemperature(value[0])}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Lower values make responses more focused and deterministic. Higher values make responses more
                      creative and varied.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="max-tokens">Max Tokens: {maxTokens}</Label>
                    </div>
                    <Slider
                      id="max-tokens"
                      min={256}
                      max={2048}
                      step={128}
                      value={[maxTokens]}
                      onValueChange={(value) => setMaxTokens(value[0])}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Maximum number of tokens to generate in the response.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model-cache">Model Cache Size: {modelCacheSize} GB</Label>
                    <Slider
                      id="model-cache"
                      min={1}
                      max={8}
                      step={1}
                      value={[modelCacheSize]}
                      onValueChange={(value) => setModelCacheSize(value[0])}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Maximum storage space to use for downloaded models.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="offline-mode">Offline Mode</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Use only downloaded models, no network requests
                      </p>
                    </div>
                    <Switch id="offline-mode" checked={offlineMode} onCheckedChange={setOfflineMode} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-download">Auto-Download Updates</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Automatically download model updates when available
                      </p>
                    </div>
                    <Switch id="auto-download" checked={autoDownload} onCheckedChange={setAutoDownload} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model-precision">Model Precision</Label>
                    <Select defaultValue="fp16">
                      <SelectTrigger id="model-precision" className="border-violet-200 dark:border-slate-700">
                        <SelectValue placeholder="Select precision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fp32">FP32 (Higher accuracy, more memory)</SelectItem>
                        <SelectItem value="fp16">FP16 (Balanced)</SelectItem>
                        <SelectItem value="int8">INT8 (Faster, less memory)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Lower precision uses less memory but may reduce accuracy.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interface Settings */}
            <TabsContent value="interface">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how the app looks and feels</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <RadioGroup defaultValue={theme || "system"} onValueChange={setTheme} className="flex space-x-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="light" />
                          <Label htmlFor="light" className="flex items-center gap-1 cursor-pointer">
                            <Sun className="h-4 w-4" /> Light
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="dark" />
                          <Label htmlFor="dark" className="flex items-center gap-1 cursor-pointer">
                            <Moon className="h-4 w-4" /> Dark
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="system" id="system" />
                          <Label htmlFor="system" className="flex items-center gap-1 cursor-pointer">
                            <Laptop className="h-4 w-4" /> System
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="font-size">Font Size</Label>
                      <Select value={fontSize} onValueChange={setFontSize}>
                        <SelectTrigger id="font-size" className="border-violet-200 dark:border-slate-700">
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="x-large">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="high-contrast">High Contrast Mode</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Increase contrast for better visibility
                        </p>
                      </div>
                      <Switch id="high-contrast" checked={highContrastMode} onCheckedChange={setHighContrastMode} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="animations">Animations</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Enable or disable UI animations</p>
                      </div>
                      <Switch id="animations" checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Accessibility</CardTitle>
                    <CardDescription>Make the app more accessible</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="screen-reader">Screen Reader Optimization</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Optimize UI for screen readers</p>
                      </div>
                      <Switch id="screen-reader" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="reduced-motion">Reduced Motion</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Minimize animations and motion effects
                        </p>
                      </div>
                      <Switch id="reduced-motion" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="keyboard-navigation">Enhanced Keyboard Navigation</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Improve keyboard-only navigation</p>
                      </div>
                      <Switch id="keyboard-navigation" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Configure notification settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Receive notifications from the app</p>
                      </div>
                      <Switch
                        id="notifications-enabled"
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sound-enabled">Notification Sounds</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Play sounds for notifications</p>
                      </div>
                      <Switch
                        id="sound-enabled"
                        checked={soundEnabled}
                        onCheckedChange={setSoundEnabled}
                        disabled={!notificationsEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="update-notifications">Model Update Notifications</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Get notified when model updates are available
                        </p>
                      </div>
                      <Switch
                        id="update-notifications"
                        checked={updateNotifications}
                        onCheckedChange={setUpdateNotifications}
                        disabled={!notificationsEnabled}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Input & Output</CardTitle>
                    <CardDescription>Configure input and output settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="voice-enabled">Voice Input/Output</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Enable voice commands and text-to-speech responses
                        </p>
                      </div>
                      <Switch id="voice-enabled" checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="voice-type">Voice Type</Label>
                      <Select defaultValue="neutral" disabled={!voiceEnabled}>
                        <SelectTrigger id="voice-type" className="border-violet-200 dark:border-slate-700">
                          <SelectValue placeholder="Select voice type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="rich-formatting">Rich Text Formatting</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Enable markdown and rich text in messages
                        </p>
                      </div>
                      <Switch id="rich-formatting" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="code-highlighting">Code Syntax Highlighting</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Highlight syntax in code blocks for better readability
                        </p>
                      </div>
                      <Switch id="code-highlighting" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Prompts Settings */}
            <TabsContent value="prompts">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Default System Prompt</CardTitle>
                    <CardDescription>Set the default system prompt for all conversations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="default-prompt">System Prompt</Label>
                      <Textarea
                        id="default-prompt"
                        value={defaultPrompt}
                        onChange={(e) => setDefaultPrompt(e.target.value)}
                        className="min-h-[100px] border-violet-200 dark:border-slate-700"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        This prompt sets the behavior and context for the AI in all conversations.
                      </p>
                    </div>
                    <Button onClick={handleSavePrompt} className="bg-violet-600 hover:bg-violet-700 text-white">
                      Save Default Prompt
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Custom Prompt Templates</CardTitle>
                    <CardDescription>Create and manage custom prompt templates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {customPrompts.map((prompt) => (
                        <div key={prompt.id} className="p-4 border rounded-md border-violet-200 dark:border-slate-700">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{prompt.name}</h4>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400">
                                Delete
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{prompt.content}</p>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h4 className="font-medium">Add New Template</h4>
                      <div className="space-y-2">
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                          id="template-name"
                          placeholder="E.g., Technical Expert"
                          className="border-violet-200 dark:border-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-content">Template Content</Label>
                        <Textarea
                          id="template-content"
                          placeholder="You are a technical expert who specializes in..."
                          className="min-h-[100px] border-violet-200 dark:border-slate-700"
                        />
                      </div>
                      <Button className="bg-violet-600 hover:bg-violet-700 text-white">Add Template</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Context Settings</CardTitle>
                    <CardDescription>Configure how context is handled in conversations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="context-window">Context Window Size</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger id="context-window" className="border-violet-200 dark:border-slate-700">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (Last 5 messages)</SelectItem>
                          <SelectItem value="medium">Medium (Last 10 messages)</SelectItem>
                          <SelectItem value="large">Large (Last 20 messages)</SelectItem>
                          <SelectItem value="xl">Extra Large (Last 50 messages)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Determines how many previous messages are included for context.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="memory-enabled">Long-term Memory</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Allow the AI to remember information across separate conversations
                        </p>
                      </div>
                      <Switch id="memory-enabled" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="summarize-context">Summarize Long Contexts</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Automatically summarize long conversations to save tokens
                        </p>
                      </div>
                      <Switch id="summarize-context" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Theme Settings */}
            <TabsContent value="theme">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Customization</CardTitle>
                    <CardDescription>Personalize the app's appearance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Theme Style</Label>
                      <RadioGroup value={customTheme} onValueChange={setCustomTheme} className="grid grid-cols-3 gap-4">
                        <div>
                          <RadioGroupItem value="default" id="default" className="sr-only" />
                          <Label
                            htmlFor="default"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-violet-600 [&:has([data-state=checked])]:border-violet-600 cursor-pointer"
                          >
                            <Palette className="mb-2 h-6 w-6" />
                            <span className="text-sm font-medium">Default</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="minimal" id="minimal" className="sr-only" />
                          <Label
                            htmlFor="minimal"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-violet-600 [&:has([data-state=checked])]:border-violet-600 cursor-pointer"
                          >
                            <Palette className="mb-2 h-6 w-6" />
                            <span className="text-sm font-medium">Minimal</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="custom" id="custom" className="sr-only" />
                          <Label
                            htmlFor="custom"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-violet-600 [&:has([data-state=checked])]:border-violet-600 cursor-pointer"
                          >
                            <Palette className="mb-2 h-6 w-6" />
                            <span className="text-sm font-medium">Custom</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {customTheme === "custom" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Primary Color</Label>
                          <div className="flex items-center gap-4">
                            <ColorPicker color={primaryColor} onChange={setPrimaryColor} />
                            <Input
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="w-32 border-violet-200 dark:border-slate-700"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Accent Color</Label>
                          <div className="flex items-center gap-4">
                            <ColorPicker color={accentColor} onChange={setAccentColor} />
                            <Input
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="w-32 border-violet-200 dark:border-slate-700"
                            />
                          </div>
                        </div>

                        <Button onClick={handleApplyTheme} className="bg-violet-600 hover:bg-violet-700 text-white">
                          Apply Custom Theme
                        </Button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Preset Themes</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Button
                          variant="outline"
                          className="h-auto flex flex-col p-4 border-violet-200 dark:border-slate-700"
                          onClick={() => {
                            setPrimaryColor("#8b5cf6")
                            setAccentColor("#3b82f6")
                            setCustomTheme("custom")
                          }}
                        >
                          <div className="w-full h-8 bg-violet-600 rounded-md mb-2"></div>
                          <span className="text-sm">Violet</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-auto flex flex-col p-4 border-violet-200 dark:border-slate-700"
                          onClick={() => {
                            setPrimaryColor("#10b981")
                            setAccentColor("#3b82f6")
                            setCustomTheme("custom")
                          }}
                        >
                          <div className="w-full h-8 bg-emerald-600 rounded-md mb-2"></div>
                          <span className="text-sm">Emerald</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-auto flex flex-col p-4 border-violet-200 dark:border-slate-700"
                          onClick={() => {
                            setPrimaryColor("#f43f5e")
                            setAccentColor("#8b5cf6")
                            setCustomTheme("custom")
                          }}
                        >
                          <div className="w-full h-8 bg-rose-600 rounded-md mb-2"></div>
                          <span className="text-sm">Rose</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-auto flex flex-col p-4 border-violet-200 dark:border-slate-700"
                          onClick={() => {
                            setPrimaryColor("#0ea5e9")
                            setAccentColor("#8b5cf6")
                            setCustomTheme("custom")
                          }}
                        >
                          <div className="w-full h-8 bg-sky-600 rounded-md mb-2"></div>
                          <span className="text-sm">Sky</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Chat Interface</CardTitle>
                    <CardDescription>Customize the chat interface appearance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="message-style">Message Style</Label>
                      <Select defaultValue="bubbles">
                        <SelectTrigger id="message-style" className="border-violet-200 dark:border-slate-700">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bubbles">Bubbles</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="chat-density">Chat Density</Label>
                      <Select defaultValue="comfortable">
                        <SelectTrigger id="chat-density" className="border-violet-200 dark:border-slate-700">
                          <SelectValue placeholder="Select density" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="comfortable">Comfortable</SelectItem>
                          <SelectItem value="spacious">Spacious</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-timestamps">Show Timestamps</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Display timestamps for each message
                        </p>
                      </div>
                      <Switch id="show-timestamps" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-avatars">Show Avatars</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Display avatars next to messages</p>
                      </div>
                      <Switch id="show-avatars" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </ScrollArea>
    </div>
  )
}

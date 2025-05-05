"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Download, Trash2, Check, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Mock data for available models
const AVAILABLE_MODELS = [
  {
    id: "tinyllama-1.1b",
    name: "TinyLlama 1.1B",
    description: "A compact language model optimized for mobile devices",
    size: "560 MB",
    downloaded: true,
    active: true,
    version: "1.0.0",
  },
  {
    id: "mobilebert",
    name: "MobileBERT",
    description: "BERT model optimized for mobile devices",
    size: "100 MB",
    downloaded: false,
    active: false,
    version: "1.2.0",
  },
  {
    id: "squeezebert",
    name: "SqueezeBERT",
    description: "Compressed BERT model for efficient inference",
    size: "120 MB",
    downloaded: true,
    active: false,
    version: "0.9.0",
  },
  {
    id: "distilgpt2",
    name: "DistilGPT2",
    description: "Distilled version of GPT-2 for mobile devices",
    size: "350 MB",
    downloaded: false,
    active: false,
    version: "1.0.0",
  },
]

export default function ModelsPage() {
  const { toast } = useToast()
  const [models, setModels] = useState(AVAILABLE_MODELS)
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({})

  const handleDownload = (modelId: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${models.find((m) => m.id === modelId)?.name}...`,
    })

    // Simulate download progress with a simple counter instead of interval
    let progress = 0
    const simulateProgress = () => {
      progress += 10
      setDownloadProgress((prev) => ({ ...prev, [modelId]: progress }))

      if (progress < 100) {
        setTimeout(simulateProgress, 300)
      } else {
        // Update model status after download completes
        setTimeout(() => {
          setModels((prev) => prev.map((model) => (model.id === modelId ? { ...model, downloaded: true } : model)))

          setDownloadProgress((prev) => {
            const newState = { ...prev }
            delete newState[modelId]
            return newState
          })

          toast({
            title: "Download Complete",
            description: `${models.find((m) => m.id === modelId)?.name} has been downloaded successfully.`,
          })
        }, 500)
      }
    }

    simulateProgress()
  }

  const handleDelete = (modelId: string) => {
    toast({
      title: "Model Deleted",
      description: `${models.find((m) => m.id === modelId)?.name} has been removed from your device.`,
    })

    setModels((prev) =>
      prev.map((model) => (model.id === modelId ? { ...model, downloaded: false, active: false } : model)),
    )
  }

  const handleSetActive = (modelId: string) => {
    setModels((prev) =>
      prev.map((model) => ({
        ...model,
        active: model.id === modelId && model.downloaded,
      })),
    )

    toast({
      title: "Model Activated",
      description: `${models.find((m) => m.id === modelId)?.name} is now your active model.`,
    })
  }

  const handleUpdate = (modelId: string) => {
    toast({
      title: "Update Started",
      description: `Updating ${models.find((m) => m.id === modelId)?.name}...`,
    })

    // Simulate update progress
    handleDownload(modelId)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Model Management</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Available Models</h2>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-update" className="text-sm">
                Auto-update
              </Label>
              <Switch id="auto-update" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((model) => (
              <Card key={model.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {model.name}
                        {model.active && (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          >
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{model.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-1">
                    <span>Size: {model.size}</span>
                    <span>Version: {model.version}</span>
                  </div>

                  {downloadProgress[model.id] !== undefined && (
                    <div className="space-y-1">
                      <Progress value={downloadProgress[model.id]} className="h-2" />
                      <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                        {downloadProgress[model.id]}% downloaded
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex gap-2 w-full">
                    {model.downloaded ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDelete(model.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                        {model.active ? (
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleUpdate(model.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Update
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleSetActive(model.id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Set Active
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDownload(model.id)}
                        disabled={downloadProgress[model.id] !== undefined}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

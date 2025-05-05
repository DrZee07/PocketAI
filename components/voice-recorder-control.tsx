"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Pause, Play, Send, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { VoiceRecorder } from "@/lib/voice-recorder"
import { cn } from "@/lib/utils"

interface VoiceRecorderControlProps {
  onRecordingComplete: (blob: Blob, duration: number) => void
  onCancel: () => void
  className?: string
}

export function VoiceRecorderControl({ onRecordingComplete, onCancel, className }: VoiceRecorderControlProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const recorderRef = useRef<VoiceRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize recorder
  useEffect(() => {
    if (typeof window !== "undefined") {
      recorderRef.current = new VoiceRecorder(
        // onDataAvailable
        (data) => {
          // This is called periodically during recording
          // We could use this to show a waveform visualization
        },
        // onRecordingComplete
        (blob, duration) => {
          setAudioBlob(blob)
          setAudioUrl(URL.createObjectURL(blob))
          setIsRecording(false)
          setIsPaused(false)
        },
        // onError
        (error) => {
          console.error("Recording error:", error)
          setIsRecording(false)
          setIsPaused(false)
        },
      )
    }

    return () => {
      if (recorderRef.current) {
        if (recorderRef.current.isRecording()) {
          recorderRef.current.stop()
        }
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Update timer during recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, isPaused])

  const startRecording = async () => {
    if (!recorderRef.current) return

    try {
      setAudioBlob(null)
      setAudioUrl(null)
      setRecordingTime(0)

      await recorderRef.current.start()
      setIsRecording(true)
      setIsPaused(false)
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }

  const stopRecording = () => {
    if (!recorderRef.current || !recorderRef.current.isRecording()) return

    recorderRef.current.stop()
  }

  const pauseRecording = () => {
    if (!recorderRef.current || !recorderRef.current.isRecording() || recorderRef.current.isPaused()) return

    recorderRef.current.pause()
    setIsPaused(true)
  }

  const resumeRecording = () => {
    if (!recorderRef.current || !recorderRef.current.isPaused()) return

    recorderRef.current.resume()
    setIsPaused(false)
  }

  const cancelRecording = () => {
    if (recorderRef.current && recorderRef.current.isRecording()) {
      recorderRef.current.stop()
    }

    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
    setAudioBlob(null)

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }

    onCancel()
  }

  const sendRecording = () => {
    if (!audioBlob) return

    onRecordingComplete(audioBlob, recordingTime)

    // Reset state
    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
    setAudioBlob(null)

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
  }

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <Card className={cn("p-3 bg-slate-100 dark:bg-slate-800 border-none", className)}>
      <div className="flex items-center gap-2">
        {!isRecording && !audioBlob ? (
          <>
            <Button
              variant="default"
              size="icon"
              className="h-10 w-10 rounded-full bg-violet-600 hover:bg-violet-700"
              onClick={startRecording}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <div className="text-sm text-slate-500 dark:text-slate-400">Tap to start recording</div>
          </>
        ) : isRecording ? (
          <>
            <div className="flex items-center gap-2">
              {isPaused ? (
                <Button
                  variant="default"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-violet-600 hover:bg-violet-700"
                  onClick={resumeRecording}
                >
                  <Play className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-violet-600 hover:bg-violet-700"
                  onClick={pauseRecording}
                >
                  <Pause className="h-5 w-5" />
                </Button>
              )}

              <Button
                variant="default"
                size="icon"
                className="h-10 w-10 rounded-full bg-red-600 hover:bg-red-700"
                onClick={stopRecording}
              >
                <MicOff className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 flex items-center">
              <div className="text-sm font-medium">{formatTime(recordingTime)}</div>
              <div className="ml-3 flex-1">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full bg-violet-600 dark:bg-violet-500 transition-all",
                      isPaused ? "" : "animate-pulse",
                    )}
                    style={{ width: `${Math.min((recordingTime / 120) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
              onClick={cancelRecording}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : audioBlob ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => {
                if (audioUrl) {
                  const audio = new Audio(audioUrl)
                  audio.play()
                }
              }}
            >
              <Play className="h-4 w-4" />
              Preview ({formatTime(recordingTime)})
            </Button>

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
              onClick={cancelRecording}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-10 w-10 rounded-full bg-violet-600 hover:bg-violet-700"
              onClick={sendRecording}
            >
              <Send className="h-5 w-5" />
            </Button>
          </>
        ) : null}
      </div>
    </Card>
  )
}

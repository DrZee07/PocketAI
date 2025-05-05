// Voice recording utilities
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private startTime = 0
  private onDataAvailable: (data: Blob) => void
  private onRecordingComplete: (blob: Blob, duration: number) => void
  private onError: (error: Error) => void

  constructor(
    onDataAvailable: (data: Blob) => void,
    onRecordingComplete: (blob: Blob, duration: number) => void,
    onError: (error: Error) => void,
  ) {
    this.onDataAvailable = onDataAvailable
    this.onRecordingComplete = onRecordingComplete
    this.onError = onError
  }

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(this.stream)
      this.audioChunks = []
      this.startTime = Date.now()

      this.mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
          this.onDataAvailable(event.data)
        }
      })

      this.mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" })
        const duration = (Date.now() - this.startTime) / 1000 // Duration in seconds
        this.onRecordingComplete(audioBlob, duration)
        this.releaseMediaStream()
      })

      this.mediaRecorder.start(100) // Collect data every 100ms
    } catch (error) {
      this.onError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop()
    }
  }

  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.pause()
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
      this.mediaRecorder.resume()
    }
  }

  private releaseMediaStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
  }

  isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === "recording"
  }

  isPaused(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === "paused"
  }

  getDuration(): number {
    if (!this.startTime) return 0
    return (Date.now() - this.startTime) / 1000
  }
}

// Helper function to create a voice recorder
export function createVoiceRecorder(
  onDataAvailable: (data: Blob) => void,
  onRecordingComplete: (blob: Blob, duration: number) => void,
  onError: (error: Error) => void,
): VoiceRecorder {
  return new VoiceRecorder(onDataAvailable, onRecordingComplete, onError)
}

// Helper function to create an audio URL from a blob
export function createAudioUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

// Helper function to release an audio URL
export function releaseAudioUrl(url: string): void {
  URL.revokeObjectURL(url)
}

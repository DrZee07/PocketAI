// File handling utilities
export class FileHandler {
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  private static readonly ALLOWED_TYPES = [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
    // Video
    "video/mp4",
    "video/webm",
    "video/ogg",
    // Archives
    "application/zip",
    "application/x-rar-compressed",
  ]

  // Validate file before upload
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds the maximum limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      }
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: "File type not supported",
      }
    }

    return { valid: true }
  }

  // Get file icon based on MIME type
  static getFileIcon(mimeType: string): string {
    if (mimeType.startsWith("image/")) {
      return "image"
    } else if (mimeType.startsWith("audio/")) {
      return "audio"
    } else if (mimeType.startsWith("video/")) {
      return "video"
    } else if (mimeType === "application/pdf") {
      return "file-text"
    } else if (
      mimeType === "application/msword" ||
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "file-text"
    } else if (
      mimeType === "application/vnd.ms-excel" ||
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return "file-spreadsheet"
    } else if (
      mimeType === "application/vnd.ms-powerpoint" ||
      mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return "file-presentation"
    } else if (mimeType.startsWith("text/")) {
      return "file-text"
    } else if (mimeType === "application/zip" || mimeType === "application/x-rar-compressed") {
      return "archive"
    } else {
      return "file"
    }
  }

  // Convert file size to human-readable format
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Read file as data URL
  static readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        resolve(reader.result as string)
      }

      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }

      reader.readAsDataURL(file)
    })
  }

  // Read file as text
  static readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        resolve(reader.result as string)
      }

      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }

      reader.readAsText(file)
    })
  }

  // Generate thumbnail for image file
  static async generateThumbnail(file: File, maxWidth = 200, maxHeight = 200): Promise<string> {
    if (!file.type.startsWith("image/")) {
      throw new Error("Not an image file")
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        // Calculate dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width))
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height))
            height = maxHeight
          }
        }

        // Create canvas and draw image
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Get data URL
        resolve(canvas.toDataURL("image/jpeg", 0.7))
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Store file in IndexedDB
  static async storeFile(file: File, messageId: string, conversationId: string): Promise<string> {
    // Generate a unique ID for the file
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Read file as data URL
    const dataUrl = await this.readAsDataURL(file)

    // Generate thumbnail if it's an image
    let thumbnail = ""
    if (file.type.startsWith("image/")) {
      try {
        thumbnail = await this.generateThumbnail(file)
      } catch (error) {
        console.error("Failed to generate thumbnail:", error)
      }
    }

    // Create file object
    const fileObject = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      data: dataUrl,
      thumbnail,
      messageId,
      conversationId,
      uploadedAt: Date.now(),
    }

    // Store in IndexedDB
    if (typeof window !== "undefined" && window.indexedDB) {
      const db = await this.openDatabase()
      const transaction = db.transaction(["files"], "readwrite")
      const store = transaction.objectStore("files")
      await new Promise<void>((resolve, reject) => {
        const request = store.add(fileObject)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error("Failed to store file"))
      })
    }

    return fileId
  }

  // Retrieve file from IndexedDB
  static async getFile(fileId: string): Promise<any> {
    if (typeof window !== "undefined" && window.indexedDB) {
      const db = await this.openDatabase()
      const transaction = db.transaction(["files"], "readonly")
      const store = transaction.objectStore("files")

      return new Promise((resolve, reject) => {
        const request = store.get(fileId)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(new Error("Failed to retrieve file"))
      })
    }

    throw new Error("IndexedDB not supported")
  }

  // Open IndexedDB database
  private static openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("pocketai-db", 2)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains("files")) {
          const store = db.createObjectStore("files", { keyPath: "id" })
          store.createIndex("messageId", "messageId", { unique: false })
          store.createIndex("conversationId", "conversationId", { unique: false })
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error("Failed to open database"))
    })
  }
}

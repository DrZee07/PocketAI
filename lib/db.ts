// Enhanced IndexedDB wrapper for offline data storage with encryption support
import { EncryptionService } from "./encryption"

export class AppDB {
  private db: IDBDatabase | null = null
  private dbName = "pocketai-db"
  private version = 2 // Increased version for schema updates
  private encryptionService: EncryptionService

  constructor() {
    this.encryptionService = EncryptionService.getInstance()
    this.init()
  }

  private init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db)
        return
      }

      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = (event) => {
        console.error("IndexedDB error:", event)
        reject("Error opening database")
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const oldVersion = event.oldVersion

        // Create or update object stores
        if (oldVersion < 1) {
          // Initial schema
          if (!db.objectStoreNames.contains("messages")) {
            const messagesStore = db.createObjectStore("messages", { keyPath: "id" })
            messagesStore.createIndex("conversationId", "conversationId", { unique: false })
            messagesStore.createIndex("timestamp", "timestamp", { unique: false })
            messagesStore.createIndex("status", "status", { unique: false })
          }

          if (!db.objectStoreNames.contains("models")) {
            const modelsStore = db.createObjectStore("models", { keyPath: "id" })
            modelsStore.createIndex("active", "active", { unique: false })
            modelsStore.createIndex("downloaded", "downloaded", { unique: false })
          }

          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings", { keyPath: "key" })
          }
        }

        if (oldVersion < 2) {
          // Schema updates for version 2
          if (!db.objectStoreNames.contains("conversations")) {
            const conversationsStore = db.createObjectStore("conversations", { keyPath: "id" })
            conversationsStore.createIndex("type", "type", { unique: false })
            conversationsStore.createIndex("lastUpdated", "lastUpdated", { unique: false })
          }

          if (!db.objectStoreNames.contains("groups")) {
            const groupsStore = db.createObjectStore("groups", { keyPath: "id" })
            groupsStore.createIndex("name", "name", { unique: false })
            groupsStore.createIndex("createdAt", "createdAt", { unique: false })
          }

          if (!db.objectStoreNames.contains("files")) {
            const filesStore = db.createObjectStore("files", { keyPath: "id" })
            filesStore.createIndex("conversationId", "conversationId", { unique: false })
            filesStore.createIndex("messageId", "messageId", { unique: false })
            filesStore.createIndex("type", "type", { unique: false })
          }

          if (!db.objectStoreNames.contains("voiceMessages")) {
            const voiceStore = db.createObjectStore("voiceMessages", { keyPath: "id" })
            voiceStore.createIndex("conversationId", "conversationId", { unique: false })
            voiceStore.createIndex("messageId", "messageId", { unique: false })
            voiceStore.createIndex("duration", "duration", { unique: false })
          }

          if (!db.objectStoreNames.contains("reactions")) {
            const reactionsStore = db.createObjectStore("reactions", { keyPath: "id" })
            reactionsStore.createIndex("messageId", "messageId", { unique: false })
            reactionsStore.createIndex("userId", "userId", { unique: false })
          }

          if (!db.objectStoreNames.contains("readReceipts")) {
            const receiptsStore = db.createObjectStore("readReceipts", { keyPath: "id" })
            receiptsStore.createIndex("messageId", "messageId", { unique: false })
            receiptsStore.createIndex("userId", "userId", { unique: false })
            receiptsStore.createIndex("timestamp", "timestamp", { unique: false })
          }

          // Update existing stores if needed
          const transaction = event.target?.transaction
          if (transaction) {
            const messagesStore = transaction.objectStore("messages")
            if (!messagesStore.indexNames.contains("encrypted")) {
              messagesStore.createIndex("encrypted", "encrypted", { unique: false })
            }
            if (!messagesStore.indexNames.contains("groupId")) {
              messagesStore.createIndex("groupId", "groupId", { unique: false })
            }
          }
        }
      }
    })
  }

  // Messages methods
  async getMessages(conversationId: string): Promise<any[]> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["messages"], "readonly")
      const store = transaction.objectStore("messages")
      const index = store.index("conversationId")
      const request = index.getAll(conversationId)

      request.onsuccess = async () => {
        const messages = request.result

        // Decrypt messages if they are encrypted
        const decryptedMessages = await Promise.all(
          messages.map(async (message) => {
            if (message.encrypted && message.senderId) {
              try {
                const decryptedContent = await this.encryptionService.decryptMessage(message.content, message.senderId)
                return { ...message, content: decryptedContent }
              } catch (error) {
                console.error("Failed to decrypt message:", error)
                return { ...message, content: "⚠️ Encrypted message (unable to decrypt)" }
              }
            }
            return message
          }),
        )

        resolve(decryptedMessages)
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  async saveMessage(message: any): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["messages"], "readwrite")
      const store = transaction.objectStore("messages")

      // Prepare message for storage
      const messageToStore = {
        ...message,
        timestamp: message.timestamp || Date.now(),
        status: message.status || "sent",
      }

      const request = store.put(messageToStore)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  async saveEncryptedMessage(message: any, recipientId: string): Promise<void> {
    const db = await this.init()
    return new Promise(async (resolve, reject) => {
      try {
        // Encrypt the message content
        const encryptedContent = await this.encryptionService.encryptMessage(message.content, recipientId)

        const transaction = db.transaction(["messages"], "readwrite")
        const store = transaction.objectStore("messages")

        // Prepare encrypted message for storage
        const encryptedMessage = {
          ...message,
          content: encryptedContent,
          encrypted: true,
          timestamp: message.timestamp || Date.now(),
          status: message.status || "sent",
        }

        const request = store.put(encryptedMessage)

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = (event) => {
          reject(event)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  async getPendingMessages(): Promise<any[]> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["messages"], "readonly")
      const store = transaction.objectStore("messages")
      const index = store.index("status")
      const request = index.getAll("pending")

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  async updateMessageStatus(id: string, status: string): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["messages"], "readwrite")
      const store = transaction.objectStore("messages")
      const request = store.get(id)

      request.onsuccess = () => {
        const data = request.result
        if (data) {
          data.status = status
          store.put(data)
          resolve()
        } else {
          reject(new Error("Message not found"))
        }
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  // Conversations methods
  async getConversations(): Promise<any[]> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["conversations"], "readonly")
      const store = transaction.objectStore("conversations")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  async saveConversation(conversation: any): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["conversations"], "readwrite")
      const store = transaction.objectStore("conversations")

      // Ensure lastUpdated is set
      const conversationToStore = {
        ...conversation,
        lastUpdated: conversation.lastUpdated || Date.now(),
      }

      const request = store.put(conversationToStore)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  async deleteConversation(id: string): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["conversations", "messages"], "readwrite")

      // Delete the conversation
      const conversationsStore = transaction.objectStore("conversations")
      const deleteConversationRequest = conversationsStore.delete(id)

      // Delete all messages in the conversation
      const messagesStore = transaction.objectStore("messages")
      const index = messagesStore.index("conversationId")
      const getMessagesRequest = index.getAll(id)

      getMessagesRequest.onsuccess = () => {
        const messages = getMessagesRequest.result
        messages.forEach((message) => {
          messagesStore.delete(message.id)
        })
      }

      transaction.oncomplete = () => {
        resolve()
      }

      transaction.onerror = (event) => {
        reject(event)
      }
    })
  }

  // Group methods
  async getGroups(): Promise<any[]> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["groups"], "readonly")
      const store = transaction.objectStore("groups")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  async saveGroup(group: any): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["groups"], "readwrite")
      const store = transaction.objectStore("groups")

      // Ensure createdAt is set
      const groupToStore = {
        ...group,
        createdAt: group.createdAt || Date.now(),
      }

      const request = store.put(groupToStore)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  // File methods
  async saveFile(file: any): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["files"], "readwrite")
      const store = transaction.objectStore("files")
      const request = store.put(file)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  async getFile(id: string): Promise<any> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["files"], "readonly")
      const store = transaction.objectStore("files")
      const request = store.get(id)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  async getFilesByConversation(conversationId: string): Promise<any[]> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["files"], "readonly")
      const store = transaction.objectStore("files")
      const index = store.index("conversationId")
      const request = index.getAll(conversationId)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  // Voice message methods
  async saveVoiceMessage(voiceMessage: any): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["voiceMessages"], "readwrite")
      const store = transaction.objectStore("voiceMessages")
      const request = store.put(voiceMessage)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  async getVoiceMessage(id: string): Promise<any> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["voiceMessages"], "readonly")
      const store = transaction.objectStore("voiceMessages")
      const request = store.get(id)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  // Reaction methods
  async saveReaction(reaction: any): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["reactions"], "readwrite")
      const store = transaction.objectStore("reactions")

      // Check if reaction already exists
      const index = store.index("messageId")
      const getRequest = index.getAll(reaction.messageId)

      getRequest.onsuccess = () => {
        const existingReactions = getRequest.result
        const userReaction = existingReactions.find((r) => r.userId === reaction.userId)

        if (userReaction) {
          // Update existing reaction
          userReaction.emoji = reaction.emoji
          userReaction.timestamp = Date.now()
          store.put(userReaction)
        } else {
          // Add new reaction
          const newReaction = {
            ...reaction,
            id: `${reaction.messageId}-${reaction.userId}-${Date.now()}`,
            timestamp: Date.now(),
          }
          store.put(newReaction)
        }

        resolve()
      }

      getRequest.onerror = (event) => {
        reject(event)
      }
    })
  }

  async getReactionsByMessage(messageId: string): Promise<any[]> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["reactions"], "readonly")
      const store = transaction.objectStore("reactions")
      const index = store.index("messageId")
      const request = index.getAll(messageId)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  // Read receipt methods
  async saveReadReceipt(receipt: any): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["readReceipts"], "readwrite")
      const store = transaction.objectStore("readReceipts")

      // Ensure id and timestamp are set
      const receiptToStore = {
        ...receipt,
        id: receipt.id || `${receipt.messageId}-${receipt.userId}`,
        timestamp: receipt.timestamp || Date.now(),
      }

      const request = store.put(receiptToStore)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  async getReadReceiptsByMessage(messageId: string): Promise<any[]> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["readReceipts"], "readonly")
      const store = transaction.objectStore("readReceipts")
      const index = store.index("messageId")
      const request = index.getAll(messageId)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  // Models methods
  async getModels(): Promise<any[]> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["models"], "readonly")
      const store = transaction.objectStore("models")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  async saveModel(model: any): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["models"], "readwrite")
      const store = transaction.objectStore("models")
      const request = store.put(model)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  async getActiveModel(): Promise<any> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["models"], "readonly")
      const store = transaction.objectStore("models")
      const index = store.index("active")
      const request = index.get(true)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  // Settings methods
  async getSetting(key: string): Promise<any> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["settings"], "readonly")
      const store = transaction.objectStore("settings")
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null)
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  async saveSetting(key: string, value: any): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["settings"], "readwrite")
      const store = transaction.objectStore("settings")
      const request = store.put({ key, value })

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        reject(event)
      }
    })
  }

  // Utility methods
  async clearDatabase(): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const storeNames = Array.from(db.objectStoreNames)
      const transaction = db.transaction(storeNames, "readwrite")

      let completed = 0
      let errors = 0

      storeNames.forEach((storeName) => {
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onsuccess = () => {
          completed++
          if (completed + errors === storeNames.length) {
            if (errors === 0) {
              resolve()
            } else {
              reject(new Error(`Failed to clear ${errors} stores`))
            }
          }
        }

        request.onerror = () => {
          errors++
          if (completed + errors === storeNames.length) {
            reject(new Error(`Failed to clear ${errors} stores`))
          }
        }
      })
    })
  }

  async exportData(): Promise<any> {
    const db = await this.init()
    return new Promise(async (resolve, reject) => {
      try {
        const data: Record<string, any[]> = {}
        const storeNames = Array.from(db.objectStoreNames)

        for (const storeName of storeNames) {
          const transaction = db.transaction([storeName], "readonly")
          const store = transaction.objectStore(storeName)
          const items = await new Promise<any[]>((res, rej) => {
            const request = store.getAll()
            request.onsuccess = () => res(request.result)
            request.onerror = (event) => rej(event)
          })

          data[storeName] = items
        }

        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  async importData(data: Record<string, any[]>): Promise<void> {
    const db = await this.init()
    return new Promise(async (resolve, reject) => {
      try {
        const storeNames = Object.keys(data).filter((name) => Array.from(db.objectStoreNames).includes(name))

        for (const storeName of storeNames) {
          const transaction = db.transaction([storeName], "readwrite")
          const store = transaction.objectStore(storeName)

          // Clear existing data
          await new Promise<void>((res, rej) => {
            const clearRequest = store.clear()
            clearRequest.onsuccess = () => res()
            clearRequest.onerror = (event) => rej(event)
          })

          // Import new data
          for (const item of data[storeName]) {
            store.put(item)
          }
        }

        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
}

// Create a singleton instance
export const db = typeof window !== "undefined" ? new AppDB() : null

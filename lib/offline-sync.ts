import { db } from "./db"

// Register background sync
export async function registerBackgroundSync() {
  try {
    if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
      console.warn("Background Sync not supported")
      return false
    }

    const registration = await navigator.serviceWorker.ready
    await registration.sync.register("sync-messages")
    return true
  } catch (error) {
    console.error("Error registering background sync:", error)
    return false
  }
}

// Save message for offline sending
export async function saveMessageForSync(message: any) {
  if (!db) return false

  try {
    // Save message with pending status
    await db.saveMessage({
      ...message,
      status: "pending",
      timestamp: Date.now(),
    })

    // Try to register background sync
    await registerBackgroundSync()

    return true
  } catch (error) {
    console.error("Error saving message for sync:", error)
    return false
  }
}

// Send message with offline support
export async function sendMessageWithOfflineSupport(message: any, endpoint: string) {
  // Check if online
  if (navigator.onLine) {
    try {
      // Try to send message
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })

      if (response.ok) {
        // If successful, save message as sent
        if (db) {
          await db.saveMessage({
            ...message,
            status: "sent",
            timestamp: Date.now(),
          })
        }
        return await response.json()
      } else {
        // If server error, save for later sync
        await saveMessageForSync(message)
        throw new Error("Server error, message queued for sync")
      }
    } catch (error) {
      // If network error, save for later sync
      await saveMessageForSync(message)
      throw error
    }
  } else {
    // If offline, save for later sync
    await saveMessageForSync(message)
    throw new Error("Offline, message queued for sync")
  }
}

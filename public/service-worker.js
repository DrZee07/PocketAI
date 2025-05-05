// Service Worker for PocketAI PWA
const CACHE_NAME = "pocketai-v1"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/chat",
  "/models",
  "/settings",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting()), // Force activation on all clients
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME
            })
            .map((cacheName) => {
              console.log("Deleting outdated cache:", cacheName)
              return caches.delete(cacheName)
            }),
        )
      })
      .then(() => self.clients.claim()), // Take control of all clients
  )
})

// Fetch event - serve from cache, fall back to network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Handle API requests differently (network first, then cache)
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response to store in cache
          const clonedResponse = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            // Only cache successful responses
            if (clonedResponse.status === 200) {
              cache.put(event.request, clonedResponse)
            }
          })

          return response
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
        }),
    )
    return
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      // Not in cache, get from network
      return fetch(event.request).then((response) => {
        // Clone the response to store in cache
        const clonedResponse = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          // Only cache successful responses
          if (clonedResponse.status === 200) {
            cache.put(event.request, clonedResponse)
          }
        })

        return response
      })
    }),
  )
})

// Background sync for offline message sending
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-messages") {
    event.waitUntil(syncMessages())
  }
})

// Function to sync messages when back online
async function syncMessages() {
  try {
    // Get all pending messages from IndexedDB
    const pendingMessages = await getPendingMessagesFromDB()

    // Send each message
    for (const message of pendingMessages) {
      await sendMessage(message)
      await markMessageAsSent(message.id)
    }

    return true
  } catch (error) {
    console.error("Error syncing messages:", error)
    return false
  }
}

// Push notification event handler
self.addEventListener("push", (event) => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Notification click event handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus()
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url)
      }
    }),
  )
})

// Helper functions for IndexedDB operations would be implemented here
// These are placeholders for the actual implementation
async function getPendingMessagesFromDB() {
  // This would retrieve pending messages from IndexedDB
  return []
}

async function sendMessage(message) {
  // This would send the message to the server
  return fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  })
}

async function markMessageAsSent(messageId) {
  // This would mark the message as sent in IndexedDB
  return true
}

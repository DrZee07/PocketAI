// Push notification helper functions
export async function subscribeToPushNotifications() {
  try {
    // Check if service worker is registered
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service Worker not supported")
    }

    // Check if Push API is supported
    if (!("PushManager" in window)) {
      throw new Error("Push API not supported")
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready

    // Get existing subscription
    let subscription = await registration.pushManager.getSubscription()

    // If no subscription, create one
    if (!subscription) {
      // Get public VAPID key from server
      // In a real app, this would be fetched from your server
      const publicVapidKey = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"

      // Create subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      })

      // Send subscription to server
      // In a real app, you would send this to your server
      console.log("Push subscription created:", subscription)
    }

    return subscription
  } catch (error) {
    console.error("Error subscribing to push notifications:", error)
    throw error
  }
}

export async function unsubscribeFromPushNotifications() {
  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready

    // Get existing subscription
    const subscription = await registration.pushManager.getSubscription()

    // If subscription exists, unsubscribe
    if (subscription) {
      await subscription.unsubscribe()

      // Notify server about unsubscription
      // In a real app, you would notify your server
      console.log("Push subscription removed")
    }

    return true
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error)
    throw error
  }
}

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
